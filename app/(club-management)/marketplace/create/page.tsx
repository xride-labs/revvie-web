'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateListingMutation, useUpdateListingMutation } from '@/features/marketplace/api'
import { useUploadListingImageMutation } from '@/features/media/api'
import { fileToDataUrl } from '@/lib/media-utils'
import { useToast } from '@/hooks/use-toast'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, X, Plus, DollarSign, Loader2 } from 'lucide-react'

// `category`/`condition` are a strict enum on the backend's create validator
// (`createListingSchema` in `src/validators/schemas.ts`) even though the persisted/
// response field is a free string (Prisma `String?`) — see entities/listing/model.ts.
// The values below used to be 'Bikes'/'Apparel'/'Tools'/'Excellent'/'For Parts', none of
// which the backend accepts; every listing created through this form 400'd. Fixed to
// the real enum: Motorcycle|Gear|Accessories|Parts|Other and New|Like New|Good|Fair|Poor.
import type { ListingCategory, ListingCondition } from '@/features/marketplace/schemas'

const categories: Array<{ label: string; value: ListingCategory }> = [
  { label: 'Motorcycle', value: 'Motorcycle' },
  { label: 'Parts', value: 'Parts' },
  { label: 'Accessories', value: 'Accessories' },
  { label: 'Gear', value: 'Gear' },
  { label: 'Other', value: 'Other' },
]

const conditions: Array<{ label: string; value: ListingCondition }> = [
  { label: 'New', value: 'New' },
  { label: 'Like New', value: 'Like New' },
  { label: 'Good', value: 'Good' },
  { label: 'Fair', value: 'Fair' },
  { label: 'Poor', value: 'Poor' },
]

interface ListingFormData {
  title: string
  description: string
  price: string
  category: ListingCategory | ''
  condition: ListingCondition | ''
  location: string
  year: string
  make: string
  model: string
  mileage: string
}

const initialListingData: ListingFormData = {
  title: '',
  description: '',
  price: '',
  category: '',
  condition: '',
  location: '',
  year: '',
  make: '',
  model: '',
  mileage: '',
}

export default function CreateListingPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const {
    success: successToast,
    error: errorToast,
    loading: loadingToast,
    dismiss: dismissToast,
  } = useToast()
  const [createListing, { isLoading: isSubmitting }] = useCreateListingMutation()
  const [updateListing] = useUpdateListingMutation()
  const [uploadListingImage] = useUploadListingImageMutation()
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [listingData, setListingData] = useState<ListingFormData>(initialListingData)

  const showMotorcycleFields = listingData.category === 'Motorcycle'

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (!selectedFiles.length) return

    const remainingSlots = Math.max(10 - imageFiles.length, 0)
    if (remainingSlots === 0) {
      event.target.value = ''
      return
    }

    const acceptedFiles = selectedFiles.slice(0, remainingSlots)
    const previewUrls = acceptedFiles.map((file) => URL.createObjectURL(file))

    setImageFiles((prev) => [...prev, ...acceptedFiles])
    setImagePreviews((prev) => [...prev, ...previewUrls])
    event.target.value = ''
  }

  const handleRemoveImage = (index: number) => {
    const previewUrl = imagePreviews[index]
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!listingData.category || !listingData.condition) return

    const parsedPrice = Number(listingData.price)
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      errorToast('Invalid price', {
        description: 'Please enter a valid amount greater than zero.',
      })
      return
    }

    const loadingToastId = loadingToast('Publishing listing...', {
      description: 'Creating your listing and uploading images.',
    })

    const bikeDetails = showMotorcycleFields
      ? [
          listingData.year ? `Year: ${listingData.year}` : null,
          listingData.make ? `Make: ${listingData.make}` : null,
          listingData.model ? `Model: ${listingData.model}` : null,
          listingData.mileage ? `Mileage: ${listingData.mileage}` : null,
        ].filter(Boolean)
      : []

    const descriptionWithDetails =
      bikeDetails.length > 0
        ? `${listingData.description.trim()}\n\nMotorcycle Details\n${bikeDetails.join('\n')}`
        : listingData.description.trim()

    try {
      const { listing } = await createListing({
        title: listingData.title.trim(),
        description: descriptionWithDetails,
        price: parsedPrice,
        category: listingData.category || undefined,
        condition: listingData.condition || undefined,
        locationLabel: listingData.location.trim() || undefined,
        currency: 'USD',
        visibility: 'PUBLIC',
      }).unwrap()

      const uploadedImages: string[] = []
      for (const file of imageFiles) {
        const dataUrl = await fileToDataUrl(file)
        const uploadResponse = await uploadListingImage({
          listingId: listing.id,
          file: dataUrl,
        }).unwrap()
        const imageUrl = uploadResponse.imageUrl || uploadResponse.media?.secureUrl
        if (imageUrl) {
          uploadedImages.push(imageUrl)
        }
      }

      if (uploadedImages.length > 0) {
        await updateListing({
          listingId: listing.id,
          data: { images: uploadedImages },
        }).unwrap()
      }

      successToast('Listing published', {
        description: 'Your listing is now live in the marketplace.',
      })
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview))
      router.push(`/marketplace/${listing.id}`)
    } catch (err) {
      console.error('Failed to create listing:', err)
      errorToast('Failed to publish listing', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const handleCancel = () => {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview))
    router.back()
  }

  return (
    <div className="min-h-screen p-4 lg:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Listing</h1>
          <p className="text-sm text-muted-foreground">Sell your bike or gear</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
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
              onChange={handleImageUpload}
            />
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-muted rounded-lg overflow-hidden"
                >
                  <img
                    src={preview}
                    alt={`Listing image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground px-1 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
              {imagePreviews.length < 10 && (
                <button
                  type="button"
                  className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
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

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., 2021 Ducati Panigale V4S"
                value={listingData.title}
                onChange={(e) =>
                  setListingData({ ...listingData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={listingData.category}
                  onValueChange={(value) =>
                    setListingData({
                      ...listingData,
                      category: value as ListingCategory,
                    })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">
                  Condition <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={listingData.condition}
                  onValueChange={(value) =>
                    setListingData({
                      ...listingData,
                      condition: value as ListingCondition,
                    })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                Price <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  className="pl-9"
                  placeholder="0"
                  value={listingData.price}
                  onChange={(e) =>
                    setListingData({ ...listingData, price: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                placeholder="City, State"
                value={listingData.location}
                onChange={(e) =>
                  setListingData({ ...listingData, location: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your item in detail..."
                value={listingData.description}
                onChange={(e) =>
                  setListingData({ ...listingData, description: e.target.value })
                }
                rows={6}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Motorcycle Specific Fields */}
        {showMotorcycleFields && (
          <Card>
            <CardHeader>
              <CardTitle>Motorcycle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="e.g., 2021"
                    value={listingData.year}
                    onChange={(e) =>
                      setListingData({ ...listingData, year: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    placeholder="e.g., Ducati"
                    value={listingData.make}
                    onChange={(e) =>
                      setListingData({ ...listingData, make: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="e.g., Panigale V4S"
                    value={listingData.model}
                    onChange={(e) =>
                      setListingData({ ...listingData, model: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage</Label>
                  <Input
                    id="mileage"
                    placeholder="e.g., 3200"
                    value={listingData.mileage}
                    onChange={(e) =>
                      setListingData({ ...listingData, mileage: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={
              isSubmitting ||
              !listingData.title ||
              !listingData.category ||
              !listingData.condition ||
              !listingData.price ||
              !listingData.location ||
              !listingData.description
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Listing'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
