'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Eye,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Store,
  Loader2,
  Star,
  CreditCard,
} from 'lucide-react'
import Link from 'next/link'
import { businessApi, type BusinessAnalytics } from '@/lib/server/business'
import { useBusinessContext } from '@/contexts/business-context'

const VERIFICATION_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending Verification', className: 'text-amber-500 border-amber-500/30 bg-amber-500/5' },
  SUBMITTED: { label: 'Under Review', className: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
  APPROVED: { label: 'Verified', className: 'text-green-500 border-green-500/30 bg-green-500/5' },
  REJECTED: { label: 'Rejected', className: 'text-destructive border-destructive/30 bg-destructive/5' },
}

export default function BrandDashboardPage() {
  const searchParams = useSearchParams()
  const isOnboarding = searchParams.get('onboarding') === '1'

  const { business, loading: businessLoading } = useBusinessContext()
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (businessLoading) return
    if (!business) { setLoading(false); return }
    async function load() {
      try {
        const a = await businessApi.getBusinessAnalytics(business!.id)
        setAnalytics(a)
      } catch {
        // analytics may not exist yet for new businesses
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [business, businessLoading])

  const onboardingSteps = [
    { id: 1, label: 'Create your account', done: true },
    { id: 2, label: 'Complete brand profile', done: !!business?.description, href: '/brand/settings' },
    { id: 3, label: 'Add your first product', done: (analytics?.listings ?? 0) > 0, href: '/brand/products/create' },
    { id: 4, label: 'Submit for verification', done: business?.verification !== 'PENDING', href: '/brand/settings#verification' },
  ]

  const stats = [
    { label: 'Total Products', value: analytics?.listings ?? 0, icon: Package },
    { label: 'Ad Campaigns', value: analytics?.campaigns ?? 0, icon: ShoppingBag },
    { label: 'Total Impressions', value: analytics?.totalImpressions ?? 0, icon: Eye },
    { label: 'Total Clicks', value: analytics?.totalClicks ?? 0, icon: TrendingUp },
  ]

  const vBadge = VERIFICATION_BADGE[business?.verification ?? 'PENDING']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Onboarding banner */}
      {isOnboarding && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg mb-1">Welcome to your Brand Portal</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete setup to start selling on Zoomies marketplace and reach thousands of riders.
                </p>
                <div className="space-y-2">
                  {onboardingSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3">
                      {step.done ? (
                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                      ) : (
                        <Clock className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                      )}
                      <span className={`text-sm ${step.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {step.label}
                      </span>
                      {!step.done && step.href && (
                        <Link href={step.href} className="ml-auto text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1">
                          Start <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business header */}
      {business && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{business.displayName}</h1>
              {business.brandTier === 'PRO' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-xs font-bold text-amber-400 uppercase tracking-wide">
                  <Star className="w-3 h-3 fill-amber-400" /> Brand Pro
                </span>
              )}
            </div>
            {business.tagline && <p className="text-sm text-muted-foreground mt-0.5">{business.tagline}</p>}
          </div>
          <div className="flex items-center gap-2">
            {business.brandTier !== 'PRO' && (
              <Link href="/brand/billing">
                <Button variant="outline" size="sm" className="gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
                  <CreditCard className="w-4 h-4" /> Upgrade to Pro
                </Button>
              </Link>
            )}
            <Badge variant="outline" className={vBadge.className}>{vBadge.label}</Badge>
          </div>
        </div>
      )}

      {/* Verification status bar */}
      {business?.verification !== 'APPROVED' && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={vBadge.className}>{vBadge.label}</Badge>
              <span className="text-sm text-muted-foreground">
                {business?.verification === 'SUBMITTED'
                  ? 'Your profile is under admin review'
                  : 'Complete your profile and submit documents to go live'}
              </span>
            </div>
            {business?.verification === 'PENDING' && (
              <Button size="sm" variant="outline" asChild>
                <Link href="/brand/settings#verification">
                  Submit docs <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
                <stat.icon className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-dashed border-2 hover:border-amber-500/50 transition-colors group">
          <CardContent className="p-6 text-center">
            <Package className="w-10 h-10 text-muted-foreground group-hover:text-amber-500 mx-auto mb-3 transition-colors" />
            <h3 className="font-semibold mb-1">Add Products</h3>
            <p className="text-sm text-muted-foreground mb-4">
              List your gear, parts, or merchandise for riders to discover and buy.
            </p>
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
              <Link href="/brand/products/create">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 hover:border-amber-500/50 transition-colors group">
          <CardContent className="p-6 text-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground group-hover:text-amber-500 mx-auto mb-3 transition-colors" />
            <h3 className="font-semibold mb-1">Create a Campaign</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Run sponsored ads to reach riders based on location, bike type, and interests.
            </p>
            <Button variant="outline" asChild>
              <Link href="/brand/campaigns/create">
                <Plus className="w-4 h-4 mr-2" /> New Campaign
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm">
              {business?.verification === 'APPROVED'
                ? 'No recent activity yet.'
                : 'Activity will appear here once your brand is verified and live.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
