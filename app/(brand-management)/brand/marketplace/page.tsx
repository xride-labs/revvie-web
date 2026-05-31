'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Plus, Loader2, Tag, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { marketplaceApi } from '@/lib/services'
import type { Listing } from '@/store/slices/marketplaceSlice'

export default function BrandMarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { listings: myListings } = await marketplaceApi.getMyListings()
        setListings(myListings)
      } catch {
        // no-op — show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Marketplace Listings</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your active listings on the Revvie marketplace</p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
          <Link href="/brand/products/create">
            <Plus className="w-4 h-4 mr-2" /> New Listing
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : listings.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-20 text-center">
            <ShoppingBag className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No active listings</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
              Create a product listing to appear on the Revvie marketplace and reach riders across India.
            </p>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
              <Link href="/brand/products/create">
                <Plus className="w-4 h-4 mr-2" /> Create your first listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => (
            <Card key={l.id} className="overflow-hidden">
              {l.images?.[0] ? (
                <img src={l.images[0]} alt={l.title} className="w-full h-44 object-cover" />
              ) : (
                <div className="w-full h-44 bg-muted flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
                </div>
              )}
              <CardContent className="p-4 space-y-2">
                <p className="font-medium truncate">{l.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-500">₹{l.price.toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    {l.isSold && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Sold</span>
                    )}
                    {l.condition && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {l.condition}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/marketplace/${l.id}`}
                  className="flex items-center gap-1 text-xs text-amber-500 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> View public listing
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
