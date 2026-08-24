'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Eye, MousePointer, Package, Tag, Loader2 } from 'lucide-react'
import { useGetBusinessAnalyticsQuery } from '@/features/business/api'
import { useBusinessContext } from '@/contexts/business-context'

export default function BrandAnalyticsPage() {
  const { business } = useBusinessContext()
  const { data: analytics, isLoading: loading } = useGetBusinessAnalyticsQuery(
    business?.id ?? '',
    { skip: !business?.id },
  )

  const stats = analytics
    ? [
        { label: 'Total Impressions', value: analytics.totalImpressions, icon: Eye },
        { label: 'Total Clicks', value: analytics.totalClicks, icon: MousePointer },
        { label: 'Active Listings', value: analytics.listings, icon: Package },
        { label: 'Campaigns', value: analytics.campaigns, icon: Tag },
      ]
    : []

  const ctr =
    analytics && analytics.totalImpressions > 0
      ? ((analytics.totalClicks / analytics.totalImpressions) * 100).toFixed(2)
      : '0.00'

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      {s.label}
                    </p>
                    <s.icon className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-3xl font-bold">{s.value.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Click-Through Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold">{ctr}%</span>
                <span className="text-muted-foreground text-sm mb-1.5">
                  across all campaigns
                </span>
              </div>
              {analytics?.campaigns === 0 && (
                <div className="mt-6 text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm">
                    Create campaigns to start seeing performance data here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
