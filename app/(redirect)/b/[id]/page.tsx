import { getBusiness } from '@/features/business/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Globe, Mail, MapPin, Phone, Store } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

/** Server Component: fetched before any HTML ships, no client-side loading flash. */
export default async function PublicBusinessPage({ params }: PageProps) {
  const { id: businessId } = await params
  const business = await getBusiness(businessId).catch(() => null)

  if (!business) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-muted-foreground">
        Business not found.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
              {business.logoUrl ? (
                <img
                  src={business.logoUrl}
                  alt={business.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{business.displayName}</h1>
              {business.tagline ? (
                <p className="text-muted-foreground mt-2">{business.tagline}</p>
              ) : null}
              <div className="mt-3">
                <Badge variant="outline">{business.categories.join(', ')}</Badge>
              </div>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/business">Manage in portal</Link>
          </Button>
        </div>

        {business.bannerUrl ? (
          <div className="mt-6 overflow-hidden rounded-2xl border">
            <img
              src={business.bannerUrl}
              alt={`${business.displayName} banner`}
              className="w-full h-64 object-cover"
            />
          </div>
        ) : null}

        {business.description ? (
          <Card className="mt-6">
            <CardContent className="p-6 text-muted-foreground">
              {business.description}
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {business.phone ? (
            <ContactRow
              icon={<Phone className="w-4 h-4" />}
              label="Phone"
              value={business.phone}
            />
          ) : null}
          {business.email ? (
            <ContactRow
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              value={business.email}
            />
          ) : null}
          {business.websiteUrl ? (
            <ContactRow
              icon={<Globe className="w-4 h-4" />}
              label="Website"
              value={business.websiteUrl}
            />
          ) : null}
          {business.city || business.region || business.country ? (
            <ContactRow
              icon={<MapPin className="w-4 h-4" />}
              label="Location"
              value={[business.city, business.region, business.country]
                .filter(Boolean)
                .join(', ')}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3 text-sm text-muted-foreground">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="text-foreground mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
