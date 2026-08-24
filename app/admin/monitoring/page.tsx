'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Server,
  Bug,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || ''
const SENTRY_ORG = process.env.NEXT_PUBLIC_SENTRY_ORG || ''
const SENTRY_PROJECT = process.env.NEXT_PUBLIC_SENTRY_PROJECT || ''

type HealthStatus = 'checking' | 'up' | 'down' | 'degraded' | 'not_configured' | 'ok'

interface ServiceHealth {
  name: string
  description?: string
  status: HealthStatus
  latencyMs?: number | null
  error?: string | null
}

async function fetchHealth(url: string) {
  const start = Date.now()
  try {
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) })
    const data = await res.json().catch(() => null)
    return { ok: res.ok || res.status < 500, data, latencyMs: Date.now() - start }
  } catch {
    return { ok: false, data: null, latencyMs: Date.now() - start }
  }
}

export default function AdminMonitoringPage() {
  const [services, setServices] = useState<ServiceHealth[]>([
    { name: 'API Server', description: 'Core REST API', status: 'checking' },
  ])
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [checking, setChecking] = useState(false)

  const runChecks = async () => {
    setChecking(true)

    const newServices: ServiceHealth[] = []
    const apiHealth = await fetchHealth(`${API_URL}/health`)

    newServices.push({
      name: 'API Server',
      description: 'Core Express Server',
      status: apiHealth.ok ? apiHealth.data?.status || 'up' : 'down',
      latencyMs: apiHealth.latencyMs,
    })

    if (apiHealth.data?.checks) {
      const { postgres, mongodb, redis } = apiHealth.data.checks

      newServices.push({
        name: 'PostgreSQL',
        description: 'Primary Relational Database',
        status: postgres?.status || 'down',
        latencyMs: postgres?.latencyMs,
        error: postgres?.error,
      })

      newServices.push({
        name: 'MongoDB',
        description: 'Chat History Store',
        status: mongodb?.status || 'down',
        latencyMs: mongodb?.latencyMs,
        error: mongodb?.error,
      })

      newServices.push({
        name: 'Redis',
        description: 'Pub/Sub & Websocket Adapter',
        status: redis?.status || 'down',
        latencyMs: redis?.latencyMs,
        error: redis?.error,
      })
    } else if (!apiHealth.ok) {
      newServices.push({ name: 'PostgreSQL', status: 'down' })
      newServices.push({ name: 'MongoDB', status: 'down' })
      newServices.push({ name: 'Redis', status: 'down' })
    }

    setServices(newServices)
    setLastChecked(new Date())
    setChecking(false)
  }

  useEffect(() => {
    runChecks()
  }, [])

  const allUp = services.every((s) => s.status === 'up' || s.status === 'not_configured')
  const hasSentry = !!SENTRY_DSN

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Monitoring</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Service health · Error tracking · Observability
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastChecked && (
            <span className="text-xs text-muted-foreground">
              Last checked {lastChecked.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={runChecks} disabled={checking}>
            <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            Check now
          </Button>
        </div>
      </div>

      {/* Overall status banner */}
      <Card
        className={
          allUp
            ? 'border-green-200 bg-green-50/40 dark:bg-green-950/20'
            : 'border-red-200 bg-red-50/40 dark:bg-red-950/20'
        }
      >
        <CardContent className="p-4 flex items-center gap-3">
          {allUp ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <div>
            <p className="font-semibold text-sm">
              {checking
                ? 'Checking services…'
                : allUp
                  ? 'All monitored systems operational'
                  : 'One or more services degraded'}
            </p>
            <p className="text-xs text-muted-foreground">
              {
                services.filter(
                  (s) =>
                    s.status === 'up' ||
                    s.status === 'ok' ||
                    s.status === 'not_configured',
                ).length
              }
              /{services.length} services healthy
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Health checks */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Service Health
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {services.map((svc) => (
            <Card key={svc.name}>
              <CardContent className="p-4 flex items-center gap-3">
                <Server className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{svc.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {svc.description}
                  </p>
                  {svc.error && (
                    <p
                      className="text-xs text-red-500 mt-1 line-clamp-1"
                      title={svc.error}
                    >
                      {svc.error}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {svc.latencyMs != null && svc.status === 'up' && (
                    <span className="text-xs text-muted-foreground">
                      {svc.latencyMs}ms
                    </span>
                  )}
                  {svc.status === 'checking' && (
                    <Badge variant="secondary" className="gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Checking
                    </Badge>
                  )}
                  {(svc.status === 'up' || svc.status === 'ok') && (
                    <Badge className="gap-1 bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300">
                      <CheckCircle2 className="w-3 h-3" /> UP
                    </Badge>
                  )}
                  {svc.status === 'degraded' && (
                    <Badge className="gap-1 bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300">
                      <AlertCircle className="w-3 h-3" /> DEGRADED
                    </Badge>
                  )}
                  {svc.status === 'not_configured' && (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      N/A
                    </Badge>
                  )}
                  {svc.status === 'down' && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="w-3 h-3" /> DOWN
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sentry */}
      {hasSentry && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Error Tracking — Sentry
          </h3>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center shrink-0">
                <Bug className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Sentry is configured</p>
                <p className="text-xs text-muted-foreground">
                  DSN is set — errors are being captured.
                </p>
              </div>
              {SENTRY_ORG && SENTRY_PROJECT && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://sentry.io/organizations/${SENTRY_ORG}/projects/${SENTRY_PROJECT}/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Sentry
                    <ExternalLink className="ml-2 w-3.5 h-3.5" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
