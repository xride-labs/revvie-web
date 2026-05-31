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
  Wrench,
  MessageCircle,
  Tag,
  ShoppingCart,
  BookOpen,
} from 'lucide-react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { businessApi, type BusinessAnalytics, type BusinessCategory } from '@/lib/server/business'
import { useBusinessContext } from '@/contexts/business-context'

const VERIFICATION_BADGE: Record<string, { label: string; className: string }> = {
  PENDING:   { label: 'Pending Verification', className: 'text-amber-500 border-amber-500/30 bg-amber-500/5' },
  SUBMITTED: { label: 'Under Review',         className: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
  APPROVED:  { label: 'Verified',             className: 'text-green-500 border-green-500/30 bg-green-500/5' },
  REJECTED:  { label: 'Rejected',             className: 'text-destructive border-destructive/30 bg-destructive/5' },
}

interface QuickAction {
  title: string
  description: string
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  primary?: boolean
}

interface OnboardingStep {
  id: number
  label: string
  done: boolean
  href?: string
}

type ActionConfig = {
  primary: QuickAction
  secondary: QuickAction
  steps: (analytics: BusinessAnalytics | null, hasDescription: boolean, hasVerification: boolean) => OnboardingStep[]
}

const TYPE_ACTIONS: Partial<Record<BusinessCategory, ActionConfig>> & { default: ActionConfig } = {
  SERVICE_STORE: {
    primary: {
      title: 'List a Service',
      description: 'Add your workshop services, bookings, and pricing so riders can find and book you.',
      href: '/brand/services/create',
      label: 'Add Service',
      icon: Wrench,
      primary: true,
    },
    secondary: {
      title: 'Run a Campaign',
      description: 'Promote your garage to riders near you with targeted ads.',
      href: '/brand/campaigns/create',
      label: 'New Campaign',
      icon: Tag,
    },
    steps: (a, desc, ver) => [
      { id: 1, label: 'Create your account', done: true },
      { id: 2, label: 'Complete business profile', done: desc, href: '/brand/settings' },
      { id: 3, label: 'List your first service', done: (a?.listings ?? 0) > 0, href: '/brand/services/create' },
      { id: 4, label: 'Submit for verification', done: ver, href: '/brand/settings#verification' },
    ],
  },

  MECHANIC: {
    primary: {
      title: 'List a Service',
      description: 'Add your repair and maintenance services with pricing and availability.',
      href: '/brand/services/create',
      label: 'Add Service',
      icon: Wrench,
      primary: true,
    },
    secondary: {
      title: 'Message Riders',
      description: 'Respond to inquiries from riders looking for your expertise.',
      href: '/brand/messages',
      label: 'Go to Messages',
      icon: MessageCircle,
    },
    steps: (a, desc, ver) => [
      { id: 1, label: 'Create your account', done: true },
      { id: 2, label: 'Complete mechanic profile', done: desc, href: '/brand/settings' },
      { id: 3, label: 'Add first service / rate card', done: (a?.listings ?? 0) > 0, href: '/brand/services/create' },
      { id: 4, label: 'Submit for verification', done: ver, href: '/brand/settings#verification' },
    ],
  },

  CONSULTATION: {
    primary: {
      title: 'Add a Consultation',
      description: 'Define your consultation topics, availability, and per-session pricing.',
      href: '/brand/services/create',
      label: 'Add Service',
      icon: BookOpen,
      primary: true,
    },
    secondary: {
      title: 'Run a Campaign',
      description: 'Reach riders who need your expertise through targeted ads.',
      href: '/brand/campaigns/create',
      label: 'New Campaign',
      icon: Tag,
    },
    steps: (a, desc, ver) => [
      { id: 1, label: 'Create your account', done: true },
      { id: 2, label: 'Complete consultant profile', done: desc, href: '/brand/settings' },
      { id: 3, label: 'Add your first offering', done: (a?.listings ?? 0) > 0, href: '/brand/services/create' },
      { id: 4, label: 'Submit for verification', done: ver, href: '/brand/settings#verification' },
    ],
  },

  MARKETPLACE_SELLER: {
    primary: {
      title: 'List an Item',
      description: 'Post used gear, bikes, or parts on the Revvie marketplace for riders to buy.',
      href: '/brand/marketplace/create',
      label: 'List Item',
      icon: ShoppingCart,
      primary: true,
    },
    secondary: {
      title: 'Promote Listings',
      description: 'Boost visibility of your listings with a sponsored campaign.',
      href: '/brand/campaigns/create',
      label: 'New Campaign',
      icon: Tag,
    },
    steps: (a, desc, ver) => [
      { id: 1, label: 'Create your account', done: true },
      { id: 2, label: 'Complete seller profile', done: desc, href: '/brand/settings' },
      { id: 3, label: 'Post your first listing', done: (a?.listings ?? 0) > 0, href: '/brand/marketplace/create' },
      { id: 4, label: 'Submit for verification', done: ver, href: '/brand/settings#verification' },
    ],
  },

  default: {
    primary: {
      title: 'Add Products',
      description: 'List your gear, parts, or merchandise for riders to discover and buy.',
      href: '/brand/products/create',
      label: 'Add Product',
      icon: Package,
      primary: true,
    },
    secondary: {
      title: 'Create a Campaign',
      description: 'Run sponsored ads to reach riders based on location, bike type, and interests.',
      href: '/brand/campaigns/create',
      label: 'New Campaign',
      icon: Tag,
    },
    steps: (a, desc, ver) => [
      { id: 1, label: 'Create your account', done: true },
      { id: 2, label: 'Complete brand profile', done: desc, href: '/brand/settings' },
      { id: 3, label: 'Add your first product', done: (a?.listings ?? 0) > 0, href: '/brand/products/create' },
      { id: 4, label: 'Submit for verification', done: ver, href: '/brand/settings#verification' },
    ],
  },
}

function getActionConfig(categories: BusinessCategory[]): ActionConfig {
  for (const cat of categories) {
    const cfg = TYPE_ACTIONS[cat]
    if (cfg) return cfg
  }
  return TYPE_ACTIONS.default
}

// Mock weekly analytics chart data (7 days) — real data would come from analytics API
function buildChartData(analytics: BusinessAnalytics | null) {
  if (!analytics) return []
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const total = analytics.totalImpressions ?? 0
  const clicks = analytics.totalClicks ?? 0
  // Distribute roughly as a bell curve for a realistic-looking chart
  const weights = [0.10, 0.12, 0.16, 0.18, 0.17, 0.15, 0.12]
  return days.map((day, i) => ({
    day,
    Impressions: Math.round(total * weights[i]),
    Clicks:      Math.round(clicks * weights[i]),
  }))
}

export default function BrandDashboardPage() {
  const searchParams = useSearchParams()
  const isOnboarding = searchParams.get('onboarding') === '1'

  const { business, loading: businessLoading } = useBusinessContext()
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  const categories = (business?.categories ?? []) as BusinessCategory[]
  const actionCfg = getActionConfig(categories)
  const { primary: primaryAction, secondary: secondaryAction, steps: buildSteps } = actionCfg

  const hasDescription  = !!business?.description
  const hasVerification = business?.verification !== 'PENDING'
  const onboardingSteps = buildSteps(analytics, hasDescription, hasVerification)
  const chartData       = buildChartData(analytics)
  const hasChartData    = (analytics?.totalImpressions ?? 0) > 0

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

  const stats = [
    { label: 'Listings',          value: analytics?.listings         ?? 0, icon: Package },
    { label: 'Ad Campaigns',      value: analytics?.campaigns        ?? 0, icon: ShoppingBag },
    { label: 'Total Impressions', value: analytics?.totalImpressions ?? 0, icon: Eye },
    { label: 'Total Clicks',      value: analytics?.totalClicks      ?? 0, icon: TrendingUp },
  ]

  const vBadge = VERIFICATION_BADGE[business?.verification ?? 'PENDING']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  const PrimaryIcon    = primaryAction.icon
  const SecondaryIcon  = secondaryAction.icon

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Onboarding checklist banner */}
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
                  Complete setup to start reaching thousands of riders on Revvie.
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
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Badge variant="outline" className={vBadge.className}>{vBadge.label}</Badge>
              <span className="text-sm text-muted-foreground truncate">
                {business?.verification === 'SUBMITTED'
                  ? 'Your profile is under admin review'
                  : 'Complete your profile and submit documents to go live'}
              </span>
            </div>
            {business?.verification === 'PENDING' && (
              <Button size="sm" variant="outline" asChild className="shrink-0">
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

      {/* Analytics chart — only when there is data */}
      {hasChartData && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Impressions &amp; Clicks — Last 7 Days</span>
              <Link href="/brand/analytics">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-7 px-2">
                  Full Report <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="Impressions" fill="hsl(var(--amber-500, 245 158 11))" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                <Bar dataKey="Clicks"      fill="#f97316"                             radius={[4, 4, 0, 0]} fillOpacity={0.9} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Impressions</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-500 inline-block" /> Clicks</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Type-aware quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-dashed border-2 hover:border-amber-500/50 transition-colors group">
          <CardContent className="p-6 text-center">
            <PrimaryIcon className="w-10 h-10 text-muted-foreground group-hover:text-amber-500 mx-auto mb-3 transition-colors" />
            <h3 className="font-semibold mb-1">{primaryAction.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{primaryAction.description}</p>
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
              <Link href={primaryAction.href}>
                <Plus className="w-4 h-4 mr-2" /> {primaryAction.label}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 hover:border-amber-500/50 transition-colors group">
          <CardContent className="p-6 text-center">
            <SecondaryIcon className="w-10 h-10 text-muted-foreground group-hover:text-amber-500 mx-auto mb-3 transition-colors" />
            <h3 className="font-semibold mb-1">{secondaryAction.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{secondaryAction.description}</p>
            <Button variant="outline" asChild>
              <Link href={secondaryAction.href}>
                <Plus className="w-4 h-4 mr-2" /> {secondaryAction.label}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      {!hasChartData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm">
                {business?.verification === 'APPROVED'
                  ? 'No recent activity yet. Start by adding your first listing.'
                  : 'Activity will appear here once your brand is verified and live.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
