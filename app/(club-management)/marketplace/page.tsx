'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MapPin,
  Star,
  Search,
  Filter,
  Plus,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useMarketplace } from '@/store/features/marketplace'
import { PhantomLoader } from '@/components/loading/phantom-loader'

interface _Listing {
  id: string
  title: string
  price: number
  condition: string
  location: string
  category: string
  images: string[]
  seller: {
    id: string
    name: string
    username: string
    avatar: string | null
    rating: number
    reviewsCount: number
    clubs: Array<{ id: string; name: string }>
  }
  createdAt: string
}

const categories = [
  { id: 'all', label: 'All' },
  { id: 'bikes', label: 'Bikes' },
  { id: 'parts', label: 'Parts' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'gear', label: 'Gear' },
  { id: 'apparel', label: 'Apparel' },
  { id: 'tools', label: 'Tools' },
]

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { listings, isLoading, fetchListings } = useMarketplace()

  useEffect(() => {
    const params: Record<string, string> = {}
    if (activeCategory !== 'all') {
      params.category = activeCategory
    }
    fetchListings(params)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory])

  const filteredListings = listings?.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Search and Filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 mb-4">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? 'default' : 'outline'}
            onClick={() => setActiveCategory(category.id)}
            className="rounded-full whitespace-nowrap shrink-0"
            size="sm"
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        {filteredListings?.length} listings found
      </p>

      {/* Listings Grid */}
      {isLoading ? (
        <PhantomLoader loading>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border bg-card overflow-hidden">
                <div className="aspect-square bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-5 w-20 bg-muted rounded" />
                  <div className="h-3 w-28 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </PhantomLoader>
      ) : filteredListings?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No listings found. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((listing) => (
            <Link key={listing.id} href={`/marketplace/${listing.id}`}>
              <Card className="overflow-hidden hover:border-primary/50 transition-colors h-full">
                {/* Image placeholder */}
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0] || ''}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                  )}
                  <Badge className="absolute top-2 left-2 bg-white/90 text-foreground border-0 shadow-sm text-[10px]">
                    {listing.condition}
                  </Badge>
                </div>

                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1 leading-tight">
                    {listing.title}
                  </h3>

                  <div className="text-lg font-bold text-primary mb-2">
                    ${listing.price.toLocaleString()}
                  </div>

                  {/* Seller info */}
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="bg-linear-to-br from-primary to-amber-500 text-white text-[8px]">
                        {listing.seller.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground truncate">
                      {listing.seller.name}
                    </span>
                    {typeof listing.seller?.rating === 'number' && (
                      <div className="flex items-center gap-0.5 ml-auto shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium">{listing.seller.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {listing.location || 'Location unavailable'}
                  </div>

                  {/* Club badges */}
                  {Array.isArray(listing.seller?.clubs) && listing.seller.clubs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {listing.seller.clubs.slice(0, 1).map((club) => (
                        <Badge
                          key={club.id}
                          variant="secondary"
                          className="text-[9px] px-1.5 py-0"
                        >
                          {club.name}
                        </Badge>
                      ))}
                      {listing.seller.clubs.length > 1 && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                          +{listing.seller.clubs.length - 1}
                        </Badge>
                      )}
                    </div>
                  )}
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
