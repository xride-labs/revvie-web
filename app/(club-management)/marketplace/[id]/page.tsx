'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { marketplaceApi } from '@/lib/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  ChevronLeft,
  Heart,
  Share2,
  MapPin,
  Calendar,
  MessageCircle,
  Flag,
  Star,
  ShieldCheck,
  MoreHorizontal,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { BoneyardLoadingState } from '@/components/loading/boneyard-loading-state'

interface Seller {
  id: string
  name: string
  username: string
  avatar: string | null
  rating?: number
  reviewsCount?: number
  verified?: boolean
  memberSince?: string
  responseTime?: string
  clubs?: { id: string; name: string }[]
}

interface SellerListing {
  id: string
  title: string
  price: number
  image: string | null
}

interface Listing {
  id: string
  title: string
  description: string
  price: number
  images: (string | null)[]
  category: string
  condition: string
  location: string
  listedAt?: string
  views?: number
  saves?: number
  seller?: Seller
  specifications?: Record<string, string>
  sellerListings?: SellerListing[]
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { success: successToast, error: errorToast, loading: loadingToast, dismiss: dismissToast } = useToast()
  const [isContacting, setIsContacting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchListing = async () => {
      const loadingToastId = loadingToast('Loading listing details...', {
        description: 'Fetching seller details and item information.',
      })
      try {
        setLoading(true)
        const listingId = params.id as string
        const response = await marketplaceApi.getListing(listingId)
        setListing(response.listing)
      } catch (err) {
        setError('Failed to load listing details')
        console.error(err)
        errorToast('Failed to load listing', {
          description: err instanceof Error ? err.message : 'Please try again.',
        })
      } finally {
        dismissToast(loadingToastId)
        setLoading(false)
      }
    }

    if (params.id) {
      fetchListing()
    }
  }, [params.id, dismissToast, errorToast, loadingToast])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleSendMessage = async () => {
    if (isContacting) return
    setIsContacting(true)
    try {
      await marketplaceApi.expressInterest(params.id as string)
      successToast('Seller notified', {
        description: 'They can see your interest and will reach out.',
      })
      setIsContactDialogOpen(false)
      setMessage('')
    } catch (err) {
      errorToast('Could not contact the seller', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setIsContacting(false)
    }
  }

  if (loading) {
    return (
      <BoneyardLoadingState
        name="marketplace-listing-detail-loading"
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      />
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || 'Listing not found'}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const images = listing.images || []
  const sellerListings = listing.sellerListings || []

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSaved(!isSaved)}>
              <Heart
                className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`}
              />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsReportDialogOpen(true)}>
                  <Flag className="w-4 h-4 mr-2" />
                  Report Listing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-4/3 bg-muted flex items-center justify-center">
          {images[selectedImageIndex] ? (
            <img
              src={images[selectedImageIndex] || ''}
              alt={`${listing.title} image ${selectedImageIndex + 1}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
          )}
        </div>
        {images.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex gap-2 p-4 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={index}
            className={`w-16 h-16 shrink-0 rounded-lg bg-muted flex items-center justify-center border-2 transition-colors ${index === selectedImageIndex ? 'border-primary' : 'border-transparent'
              }`}
            onClick={() => setSelectedImageIndex(index)}
          >
            {image ? (
              <img
                src={image}
                alt={`${listing.title} thumbnail ${index + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
            )}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-6">
        {/* Title & Price */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold">{listing.title}</h1>
          </div>
          <p className="text-3xl font-bold text-primary mt-2">
            {formatPrice(listing.price)}
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {listing.location}
            </span>
            {listing.listedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(listing.listedAt)}
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary">{listing.category}</Badge>
            <Badge variant="outline">{listing.condition}</Badge>
          </div>
        </div>

        <Separator />

        {/* Specifications */}
        {listing.specifications && Object.keys(listing.specifications).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(listing.specifications).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        <div>
          <h2 className="font-semibold mb-3">Description</h2>
          <p className="text-muted-foreground whitespace-pre-line">
            {listing.description}
          </p>
        </div>

        <Separator />

        {/* Seller Info */}
        {listing.seller && (
          <Card>
            <CardContent className="p-4">
              <Link href={`/profile/${listing.seller.username}`}>
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback>
                      {listing.seller.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{listing.seller.name}</p>
                      {listing.seller.verified && (
                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {listing.seller.rating || 0}
                      </span>
                      <span>({listing.seller.reviewsCount || 0} reviews)</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {listing.seller.responseTime || ''}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* More from Seller */}
        {sellerListings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">More from this seller</h2>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {sellerListings.map((item) => (
                <Link key={item.id} href={`/marketplace/${item.id}`}>
                  <Card className="w-36 shrink-0">
                    <CardContent className="p-2">
                      <div className="aspect-square rounded-md bg-muted flex items-center justify-center mb-2">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full rounded-md object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-sm text-primary font-semibold">
                        {formatPrice(item.price)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 py-4 text-sm text-muted-foreground">
          <span>{listing.views} views</span>
          <span>•</span>
          <span>{listing.saves} saves</span>
        </div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setIsContactDialogOpen(true)}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Message Seller
        </Button>
        <Button className="flex-1">Make an Offer</Button>
      </div>

      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message Seller</DialogTitle>
            <DialogDescription>
              Send a message to {listing.seller?.name || 'the seller'} about this listing
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              className="mt-2"
              placeholder={`Hi, I'm interested in your ${listing.title}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!message.trim()}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Listing</DialogTitle>
            <DialogDescription>Why are you reporting this listing?</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            {[
              'Prohibited item',
              'Suspected fraud',
              'Incorrect category',
              'Spam or misleading',
              'Other',
            ].map((reason) => (
              <Button
                key={reason}
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsReportDialogOpen(false)}
              >
                {reason}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
