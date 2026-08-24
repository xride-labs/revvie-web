'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useCreateListingMutation } from '@/features/marketplace/api'
import { useUploadListingImageMutation } from '@/features/media/api'
import { fileToDataUrl } from '@/lib/media-utils'
import type { ListingCategory, ListingCondition } from '@/features/marketplace/schemas'

// `category`/`condition` are a strict enum on the backend's create validator
// (`createListingSchema` in `src/validators/schemas.ts`) even though the persisted/
// response field is a free string (Prisma `String?`) — see entities/listing/model.ts.
// The values here used to be 'Bikes'/'Apparel'/'Tools'/'Excellent'/'For Parts' (and a
// lowercase 'new' default), none of which the backend accepts — every listing created
// through this form 400'd. Fixed to the real enum.
const CATEGORIES: Array<{ label: string; value: ListingCategory }> = [
  { label: 'Motorcycle', value: 'Motorcycle' },
  { label: 'Parts', value: 'Parts' },
  { label: 'Accessories', value: 'Accessories' },
  { label: 'Gear', value: 'Gear' },
  { label: 'Other', value: 'Other' },
]

const CONDITIONS: Array<{ label: string; value: ListingCondition }> = [
  { label: 'New', value: 'New' },
  { label: 'Like New', value: 'Like New' },
  { label: 'Good', value: 'Good' },
  { label: 'Fair', value: 'Fair' },
  { label: 'Poor', value: 'Poor' },
]

export default function CreateProductPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const {
    success: successToast,
    error: errorToast,
    loading: loadingToast,
    dismiss: dismissToast,
  } = useToast()
  const [createListing, { isLoading: loading }] = useCreateListingMutation()
  const [uploadListingImage] = useUploadListingImageMutation()
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '' as ListingCategory | '',
    condition: 'New' as ListingCondition,
    location: '',
  })

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const slots = Math.max(10 - imageFiles.length, 0)
    const accepted = files.slice(0, slots)
    setImageFiles((prev) => [...prev, ...accepted])
    setImagePreviews((prev) => [...prev, ...accepted.map((f) => URL.createObjectURL(f))])
    e.target.value = ''
  }

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.price || !form.category) {
      errorToast('Title, price, and category are required')
      return
    }
    const price = parseFloat(form.price)
    if (!Number.isFinite(price) || price <= 0) {
      errorToast('Enter a valid price')
      return
    }

    const toastId = loadingToast('Publishing product...', {
      description: 'Creating listing and uploading images.',
    })

    try {
      const { listing } = await createListing({
        title: form.title.trim(),
        description: form.description.trim() || ' ',
        price,
        category: form.category as ListingCategory,
        condition: form.condition,
        locationLabel: form.location.trim() || 'India',
        currency: 'INR',
        visibility: 'PUBLIC',
      }).unwrap()

      for (const file of imageFiles) {
        const dataUrl = await fileToDataUrl(file)
        await uploadListingImage({ listingId: listing.id, file: dataUrl }).unwrap()
      }

      imagePreviews.forEach((p) => URL.revokeObjectURL(p))
      successToast('Product listed!', {
        description: 'Your product is now live on the marketplace.',
      })
      router.push('/brand/products')
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Failed to create listing')
    } finally {
      dismissToast(toastId)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/brand/products">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Add Product</h2>
          <p className="text-sm text-muted-foreground">
            List a product on the Revvie marketplace
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Photos</CardTitle>
            <CardDescription>
              Add up to 10 photos. First photo will be the cover.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {imagePreviews.map((preview, i) => (
                <div
                  key={i}
                  className="relative aspect-square bg-muted rounded-lg overflow-hidden"
                >
                  <img
                    src={preview}
                    alt={`Product image ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    onClick={() => handleRemoveImage(i)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[10px] bg-amber-500 text-white px-1 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
              {imagePreviews.length < 10 && (
                <button
                  type="button"
                  className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-amber-500 hover:text-amber-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-xs">Add</span>
                </button>
              )}
            </div>
            {imagePreviews.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                {imagePreviews.length} / 10 image(s) selected
              </p>
            )}
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g. AGV K6 Helmet — Size M"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={3}
                placeholder="Describe your product..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Price (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 4999"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input
                  placeholder="e.g. Mumbai"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.value })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      form.category === cat.value
                        ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                        : 'border-border text-muted-foreground hover:border-amber-500/50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Condition</Label>
              <div className="flex gap-2 flex-wrap">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm({ ...form, condition: c.value })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      form.condition === c.value
                        ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                        : 'border-border text-muted-foreground hover:border-amber-500/50'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12"
          disabled={loading || !form.title || !form.price || !form.category}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Publishing...
            </>
          ) : (
            'List Product'
          )}
        </Button>
      </form>
    </div>
  )
}
