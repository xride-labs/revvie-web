'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ExternalLink,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react'
import { PhantomLoader } from '@/components/loading/phantom-loader'

interface LaunchInterestResponse {
  googleForm: {
    responsesUrl: string | null
  }
}

function toEmbeddableResponsesUrl(url: string): string {
  try {
    const parsed = new URL(url)

    // Convert Google Sheets edit URLs into preview URLs that are iframe-friendly.
    if (parsed.hostname === 'docs.google.com' && parsed.pathname.startsWith('/spreadsheets/d/')) {
      parsed.pathname = parsed.pathname.replace(/\/edit(?:\/.*)?$/, '/preview')
      return parsed.toString()
    }

    return parsed.toString()
  } catch {
    return url
  }
}

export default function AdminLaunchInterestPage() {
  const [data, setData] = useState<LaunchInterestResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    setError(null)

    try {
      const response = await fetch('/api/admin/launch-interest', {
        method: 'GET',
        cache: 'no-store',
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You are not authorized to view launch interest responses.')
        }

        throw new Error('Failed to load launch interest data')
      }

      const payload = (await response.json()) as LaunchInterestResponse
      setData(payload)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load launch interest data right now. Please retry.',
      )
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (isLoading) {
    return (
      <PhantomLoader loading>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-7 w-48 bg-muted rounded" />
              <div className="h-4 w-80 bg-muted rounded" />
            </div>
            <div className="h-9 w-28 bg-muted rounded-lg" />
          </div>
          <div className="rounded-xl border bg-card p-5">
            <div className="h-4 w-32 bg-muted rounded mb-4" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </PhantomLoader>
    )
  }

  const responsesUrl = data?.googleForm.responsesUrl || null
  const embeddableResponsesUrl = responsesUrl
    ? toEmbeddableResponsesUrl(responsesUrl)
    : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Launch Interest</h2>
          <p className="text-sm text-muted-foreground">
            Public interest intake is Google Form only. Admin view embeds the responses URL.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => loadData(true)}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50/60">
          <CardContent className="py-4">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Google Responses
          </CardTitle>
          <CardDescription>
            Embed of GOOGLE_FORM_RESPONSES_URL. Keep this URL set in environment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {responsesUrl ? (
            <>
              <Button variant="outline" asChild>
                <a href={responsesUrl} target="_blank" rel="noreferrer">
                  Open Responses URL
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>

              <div className="overflow-hidden rounded-xl border border-border bg-background">
                <iframe
                  title="Google form responses"
                  src={embeddableResponsesUrl || responsesUrl}
                  className="h-225 w-full border-0"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                >
                  Loading responses...
                </iframe>
              </div>

              <p className="text-xs text-muted-foreground">
                If the embedded view is blocked by Google, use Open Responses URL.
              </p>
            </>
          ) : (
            <Badge variant="secondary">Set GOOGLE_FORM_RESPONSES_URL to enable embedded admin responses</Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )
}