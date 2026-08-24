'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Search, Filter, Plus, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import type { Listing } from '@/entities/listing/model'
import { initials } from '@/shared/lib/initials'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'Bikes', label: 'Bikes' },
  { id: 'Parts', label: 'Parts' },
  { id: 'Accessories', label: 'Accessories' },
  { id: 'Gear', label: 'Gear' },
  { id: 'Apparel', label: 'Apparel' },
  { id: 'Tools', label: 'Tools' },
]

/**
 * `listings` is already scoped to `activeCategory` — fetched server-side in `page.tsx`
 * from the `?category=` search param. Category buttons are plain links so switching one
 * is a real navigation (Next prefetches on hover, so it doesn't feel slower than the old
 * client-side re-fetch — and the category is now part of the URL, so a filtered view is
 * bookmarkable and shareable, which it never was before). Search stays client-side: it's
 * a substring filter over data already on the page, so a server round-trip would only
 * add latency for no benefit.
 */
export function MarketplaceBrowser({
  listings,
  activeCategory,
}: {
  listings: Listing[]
  activeCategory: string
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredListings = useMemo(
    () =>
      listings.filter((listing) =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [listings, searchQuery],
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Search and Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Search gear, parts, bikes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 rounded-2xl bg-[#111] border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 focus-visible:ring-0 transition-colors"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-2xl bg-[#111] border-white/10 text-white hover:bg-[#1a1a1a] hover:border-white/20 transition-all shrink-0"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 mb-4">
        {CATEGORIES.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? 'default' : 'outline'}
            className="rounded-full whitespace-nowrap shrink-0"
            size="sm"
            asChild
          >
            <Link
              href={
                category.id === 'all'
                  ? '/marketplace'
                  : `/marketplace?category=${category.id}`
              }
            >
              {category.label}
            </Link>
          </Button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        {filteredListings.length} listings found
      </p>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No listings found. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filteredListings.map((listing) => (
            <Link
              key={listing.id}
              href={`/marketplace/${listing.id}`}
              className="block break-inside-avoid"
            >
              <Card className="group overflow-hidden rounded-3xl border-white/[0.07] bg-[#111] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(245,158,11,0.15)] hover:border-amber-500/30 relative h-full">
                {/* Image placeholder */}
                <div className="relative overflow-hidden bg-[#1a1a1a]">
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0] || ''}
                      alt={listing.title}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="aspect-[4/5] flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-white/10" />
                    </div>
                  )}
                  {/* Overlay gradient for readability */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111] to-transparent" />

                  {listing.condition && (
                    <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-sm text-[10px] font-bold tracking-wider uppercase">
                      {listing.condition}
                    </Badge>
                  )}

                  {/* Price overlay on image */}
                  <div className="absolute bottom-3 left-4">
                    <div className="text-xl font-black text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      ₹{listing.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 pt-3">
                  <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug mb-3">
                    {listing.title}
                  </h3>

                  {/* Seller info */}
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="w-6 h-6 border border-white/10">
                      <AvatarFallback className="bg-linear-to-br from-amber-500 to-orange-600 text-white text-[10px] font-bold">
                        {initials(listing.seller.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-text-secondary truncate font-medium">
                      {listing.seller.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-text-secondary border-t border-white/5 pt-3 mt-auto">
                    {/* Location */}
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-white/30 shrink-0" />
                      <span className="truncate max-w-[100px]">
                        {listing.locationLabel || 'Location unavailable'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Floating Create Button */}
      <Link href="/marketplace/create">
        <Button
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 rounded-full w-14 h-14 shadow-lg"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  )
}
