'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircle,
  XCircle,
  Zap,
  Shield,
  BarChart3,
  Megaphone,
  Star,
  Loader2,
  CreditCard,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import {
  useGetBillingStatusQuery,
  useCreateBillingCheckoutMutation,
} from '@/features/business/api'
import { useBusinessContext } from '@/contexts/business-context'
import { Button } from '@/components/ui/button'

const PRO_FEATURES = [
  {
    icon: Megaphone,
    label: 'Run Ad Campaigns',
    desc: 'Boost visibility in rider feeds and discovery',
  },
  {
    icon: BarChart3,
    label: 'Advanced Analytics',
    desc: 'Click-through rates, impressions, conversion tracking',
  },
  {
    icon: Star,
    label: 'Featured Listings',
    desc: 'Products appear at the top of Marketplace search',
  },
  {
    icon: Shield,
    label: 'Verified Brand Badge',
    desc: 'Priority verification review and badge in discovery',
  },
  {
    icon: Zap,
    label: 'Priority Support',
    desc: 'Dedicated support channel for brand queries',
  },
]

function StatusBanner({ status }: { status: string | null }) {
  if (status === 'success') {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4">
        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
        <div>
          <p className="font-semibold text-green-400">Payment successful!</p>
          <p className="text-sm text-muted-foreground">
            Your Brand Pro subscription is now active. Welcome aboard!
          </p>
        </div>
      </div>
    )
  }
  if (status === 'cancelled') {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
        <XCircle className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-sm text-amber-300">
          Payment was cancelled. You can try again whenever you&apos;re ready.
        </p>
      </div>
    )
  }
  return null
}

export default function BrandBillingPage() {
  const searchParams = useSearchParams()
  const paymentStatus = searchParams.get('status')

  const { business, loading: businessLoading } = useBusinessContext()
  const { data: billing, isLoading: billingLoading } = useGetBillingStatusQuery(
    business?.id ?? '',
    { skip: !business?.id },
  )
  const [createBillingCheckout, { isLoading: upgrading }] =
    useCreateBillingCheckoutMutation()
  const [error, setError] = useState<string | null>(null)

  const loading = businessLoading || (!!business && billingLoading)

  async function handleUpgrade() {
    if (!business) return
    setError(null)
    try {
      const { checkoutUrl } = await createBillingCheckout({
        businessId: business.id,
      }).unwrap()
      window.location.href = checkoutUrl
    } catch (e: any) {
      setError(
        e?.response?.data?.message || 'Failed to start checkout. Please try again.',
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!business) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No business profile found. Create one in Settings first.
          </p>
        </div>
      </div>
    )
  }

  const isPro = billing?.tier === 'PRO'
  const expiresAt = billing?.expiresAt ? new Date(billing.expiresAt) : null

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-8">
      <StatusBanner status={paymentStatus} />

      {/* Current Plan */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium mb-1">
              Current Plan
            </p>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold">{isPro ? 'Brand Pro' : 'Free'}</h2>
              {isPro && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-400 uppercase tracking-wide">
                  <Star className="w-3 h-3 fill-amber-400" />
                  Active
                </span>
              )}
            </div>
            {isPro && expiresAt && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Renews{' '}
                  {expiresAt.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
            {!isPro && (
              <p className="text-sm text-muted-foreground mt-1">
                Upgrade to unlock campaigns, analytics, and featured listings.
              </p>
            )}
          </div>
          {isPro ? (
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-400">
                ₹999<span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
            </div>
          ) : (
            <div className="text-right">
              <p className="text-2xl font-bold">Free</p>
            </div>
          )}
        </div>
      </div>

      {/* Pro Features */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-lg">Brand Pro — ₹999/month</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {PRO_FEATURES.map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <div
                className={`mt-0.5 rounded-lg p-1.5 ${isPro ? 'bg-amber-500/20' : 'bg-muted'}`}
              >
                <f.icon
                  className={`w-4 h-4 ${isPro ? 'text-amber-400' : 'text-muted-foreground'}`}
                />
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${isPro ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {f.label}
                </p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
              {isPro && (
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 ml-auto mt-0.5" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* CTA */}
      {!isPro && (
        <Button
          onClick={handleUpgrade}
          disabled={upgrading}
          className="w-full h-12 text-base font-bold bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)]"
        >
          {upgrading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Redirecting to checkout…
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Upgrade to Brand Pro — ₹999/month
            </>
          )}
        </Button>
      )}

      {isPro && (
        <p className="text-center text-sm text-muted-foreground">
          To cancel or manage your subscription, contact{' '}
          <a href="mailto:support@revvie.app" className="text-amber-400 hover:underline">
            support@revvie.app
          </a>
        </p>
      )}
    </div>
  )
}
