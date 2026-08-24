import Link from 'next/link'
import { getMyBusinesses } from '@/features/business/server'
import type { BusinessProfile } from '@/entities/business/model'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Plus, Store, ExternalLink } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  BRAND: 'Motorcycle Brand',
  GEAR_SELLER: 'Riding Gear',
  HELMET_SELLER: 'Helmets',
  PARTS_SELLER: 'Parts & Accessories',
  MARKETPLACE_SELLER: 'Marketplace Seller',
  CLUB: 'Riding Club',
  SERVICE_STORE: 'Service Store',
  MECHANIC: 'Independent Mechanic',
  CONSULTATION: 'Consultation',
}

function statusBadge(status: BusinessProfile['verification']) {
  switch (status) {
    case 'APPROVED':
      return <Badge className="bg-emerald-500/20 text-emerald-200">Approved</Badge>
    case 'REJECTED':
      return <Badge className="bg-red-500/20 text-red-200">Rejected</Badge>
    case 'SUBMITTED':
      return <Badge className="bg-amber-500/20 text-amber-200">Submitted</Badge>
    default:
      return <Badge className="bg-muted text-muted-foreground">Pending</Badge>
  }
}

/**
 * Server Component: the business list is fetched here, once, before any HTML ships —
 * no client-side loading skeleton for the initial paint. This page has zero
 * interactivity of its own (just links), so unlike the clubs/rides/marketplace list
 * pages it needs no client leaf at all.
 */
export default async function BusinessPortalPage() {
  const businesses = await getMyBusinesses()

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Business Portal</h1>
          <p className="text-muted-foreground">
            Manage your brand profiles and keep your rider-facing page updated.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/business/create">
            <Plus className="w-4 h-4" />
            Create business
          </Link>
        </Button>
      </div>

      {businesses.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No businesses yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Start onboarding to create a public brand page and get discovered in nearby
            results.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {businesses.map((business) => (
            <Card key={business.id} className="transition-shadow hover:shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={business.logoUrl ?? undefined} />
                      <AvatarFallback className="bg-muted text-sm">
                        <Store className="w-5 h-5 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{business.displayName}</h3>
                        {statusBadge(business.verification)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {business.categories
                          .map((c) => CATEGORY_LABELS[c] ?? c)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/b/${business.id}`}>
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/business/${business.id}`}>Manage</Link>
                    </Button>
                  </div>
                </div>
                {business.tagline ? (
                  <p className="text-sm text-muted-foreground mt-3">{business.tagline}</p>
                ) : null}
                <Separator className="my-4" />
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {business.city ? <span>{business.city}</span> : null}
                  {business.region ? <span>{business.region}</span> : null}
                  {business.country ? <span>{business.country}</span> : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
