'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  useGetListingQuery,
  useGetPublicListingQuery,
  useContactSellerMutation,
} from '@/features/marketplace/api'
import { useAuth } from '@/lib/use-auth'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ChevronLeft,
  Heart,
  Share2,
  MapPin,
  Calendar,
  MessageCircle,
  Flag,
  MoreHorizontal,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { PhantomLoader } from '@/components/loading/phantom-loader'
import { initials } from '@/shared/lib/initials'
import type { ListingDetails } from '@/entities/listing/model'
import type { PublicListingDetail } from '@/features/marketplace/schemas'

/** Prisma stores `specifications` as a JSON-encoded string, not an object. */
function parseSpecifications(
  raw: string | null | undefined,
): Record<string, string> | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

/** Both the authenticated and public detail shapes carry these — the fields that
 *  differ (`sellerId` vs `seller.id`, `offerSummary.interestCount` vs `interestCount`)
 *  are normalized once below instead of branching throughout the JSX. */
type AnyListing = ListingDetails | PublicListingDetail

function interestCountOf(listing: AnyListing): number {
  const asAuthed = listing as Partial<ListingDetails>
  const asPublic = listing as Partial<PublicListingDetail>
  return asAuthed.offerSummary?.interestCount ?? asPublic.interestCount ?? 0
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { success: successToast, error: errorToast } = useToast()
  const { user, isAuthenticated, isPending: authPending } = useAuth()
  const [isSaved, setIsSaved] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactMessage, setContactMessage] = useState('')

  const listingId = params.id as string

  const {
    data: authedData,
    isLoading: authedLoading,
    isError: authedError,
  } = useGetListingQuery(listingId, { skip: !listingId || authPending || !isAuthenticated })
  const {
    data: publicData,
    isLoading: publicLoading,
    isError: publicError,
  } = useGetPublicListingQuery(listingId, {
    skip: !listingId || authPending || isAuthenticated,
  })
  const [contactSeller, { isLoading: isSendingContact }] = useContactSellerMutation()

  const listing: AnyListing | null = isAuthenticated
    ? (authedData?.listing ?? null)
    : (publicData ?? null)
  const loading = authPending || (isAuthenticated ? authedLoading : publicLoading)
  const error = isAuthenticated ? authedError : publicError

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
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

  const openContactDialog = () => {
    if (user?.name) setContactName(user.name)
    if (user?.email) setContactEmail(user.email)
    setIsContactDialogOpen(true)
  }

  const handleSendMessage = async () => {
    if (isSendingContact || !listing) return
    try {
      await contactSeller({
        listingId,
        name: contactName.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim() || undefined,
        message: contactMessage.trim(),
      }).unwrap()
      successToast('Message sent', {
        description: 'The seller will reply straight to your email.',
      })
      setIsContactDialogOpen(false)
      setContactMessage('')
    } catch (err) {
      errorToast('Could not send your message', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    }
  }

  if (loading) {
    return (
      <PhantomLoader loading>
        <div className="min-h-screen pb-24">
          <div className="h-14 bg-muted border-b" />
          <div className="aspect-4/3 bg-muted" />
          <div className="px-4 py-4 space-y-4">
            <div className="h-7 w-3/4 bg-muted rounded" />
            <div className="h-9 w-32 bg-muted rounded" />
            <div className="flex gap-3">
              <div className="h-5 w-20 bg-muted rounded" />
              <div className="h-5 w-24 bg-muted rounded" />
            </div>
            <div className="h-px bg-muted" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
            <div className="h-4 w-4/5 bg-muted rounded" />
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PhantomLoader>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          {error ? 'Failed to load listing details' : 'Listing not found'}
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const images = listing.images || []
  const specifications = parseSpecifications(listing.specifications)
  const interestCount = interestCountOf(listing)

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
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
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
            className={`w-16 h-16 shrink-0 rounded-lg bg-muted flex items-center justify-center border-2 transition-colors ${
              index === selectedImageIndex ? 'border-primary' : 'border-transparent'
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
            {formatPrice(listing.price, listing.currency)}
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            {listing.locationLabel && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {listing.locationLabel}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(listing.createdAt)}
            </span>
          </div>
          <div className="flex gap-2 mt-3">
            {listing.category && <Badge variant="secondary">{listing.category}</Badge>}
            {listing.condition && <Badge variant="outline">{listing.condition}</Badge>}
          </div>
        </div>

        <Separator />

        {/* Specifications */}
        {specifications && Object.keys(specifications).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(specifications).map(([key, value]) => (
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
        <Card>
          <CardContent className="p-4">
            <Link href={`/profile/${listing.seller.id}`}>
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback>{initials(listing.seller.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{listing.seller.name}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {interestCount > 0 && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <span>
              {interestCount} rider{interestCount === 1 ? '' : 's'} interested
            </span>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={openContactDialog}>
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact Seller
        </Button>
        {isAuthenticated ? (
          <Button className="flex-1">Make an Offer</Button>
        ) : (
          <Button className="flex-1" asChild>
            <Link href={`/login?next=/marketplace/${listingId}`}>Sign in to Offer</Link>
          </Button>
        )}
      </div>

      {/* Contact Dialog — an anonymous email relay, no account needed on either side. */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Seller</DialogTitle>
            <DialogDescription>
              Your message goes straight to {listing.seller?.name || 'the seller'}&apos;s
              email — they can reply directly to you.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="contact-name">Your Name</Label>
                <Input
                  id="contact-name"
                  className="mt-1.5"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Jane Rider"
                />
              </div>
              <div>
                <Label htmlFor="contact-email">Your Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  className="mt-1.5"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="jane@example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="contact-phone">Phone (optional)</Label>
              <Input
                id="contact-phone"
                className="mt-1.5"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <Label htmlFor="contact-message">Your Message</Label>
              <Textarea
                id="contact-message"
                className="mt-1.5"
                placeholder={`Hi, I'm interested in your ${listing.title}...`}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={
                isSendingContact ||
                !contactName.trim() ||
                !contactEmail.trim() ||
                contactMessage.trim().length < 10
              }
            >
              {isSendingContact ? 'Sending…' : 'Send Message'}
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
