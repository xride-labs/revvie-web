'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ImagePlus } from 'lucide-react'
import { useCreateClubMutation, useUpdateClubMutation } from '@/features/clubs/api'
import { useUploadClubImageMutation } from '@/features/media/api'
import { fileToDataUrl } from '@/lib/media-utils'
import { useToast } from '@/hooks/use-toast'
import { ImageUrlInput } from '@/components/ui/image-url-input'
import { LocationPicker } from '@/components/ui/location-picker'
import type { LocationValue } from '@/components/ui/location-picker'

const clubTypes = [
  'Riding Club',
  'Racing Team',
  'Touring Group',
  'Adventure Club',
  'Vintage/Classic',
  'Sport Bikes',
  'Cruisers',
  'Off-Road/Dirt',
  'Women Riders',
  'Other',
]

export default function CreateClubPage() {
  const router = useRouter()
  const {
    success: successToast,
    error: errorToast,
    loading: loadingToast,
    dismiss: dismissToast,
  } = useToast()
  const [step, setStep] = useState(1)
  const [createClub, { isLoading: isSubmitting }] = useCreateClubMutation()
  const [updateClub] = useUpdateClubMutation()
  const [uploadClubImage] = useUploadClubImageMutation()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  // Direct URL state — when set, bypasses Cloudinary upload
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [homeBase, setHomeBase] = useState<LocationValue | null>(null)
  const [clubData, setClubData] = useState({
    name: '',
    description: '',
    clubType: '',
    isPublic: true,
    requireApproval: true,
  })

  const handleLogoChange = async (file: File | null) => {
    setLogoFile(file)
    if (file) {
      const preview = await fileToDataUrl(file)
      setLogoPreview(preview)
    } else {
      setLogoPreview(null)
    }
  }

  const handleCoverChange = async (file: File | null) => {
    setCoverFile(file)
    if (file) {
      const preview = await fileToDataUrl(file)
      setCoverPreview(preview)
    } else {
      setCoverPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const loadingToastId = loadingToast('Creating club...', {
      description: 'Saving details and uploading media assets.',
    })

    try {
      const { club } = await createClub({
        name: clubData.name,
        description: clubData.description,
        location: homeBase?.name ?? '',
        latitude: homeBase?.lat,
        longitude: homeBase?.lng,
        clubType: clubData.clubType || undefined,
        isPublic: clubData.isPublic,
        requiresLicense: false,
      }).unwrap()

      if (logoUrl) {
        await updateClub({ clubId: club.id, data: { image: logoUrl } }).unwrap()
      } else if (logoFile) {
        const logoDataUrl = await fileToDataUrl(logoFile)
        await uploadClubImage({ clubId: club.id, file: logoDataUrl, type: 'logo' }).unwrap()
      }

      if (coverUrl) {
        await updateClub({ clubId: club.id, data: { coverImage: coverUrl } }).unwrap()
      } else if (coverFile) {
        const coverDataUrl = await fileToDataUrl(coverFile)
        await uploadClubImage({
          clubId: club.id,
          file: coverDataUrl,
          type: 'cover',
        }).unwrap()
      }

      successToast('Club created! 🎉', {
        description: `${clubData.name} is live! Rally your crew.`,
      })
      router.push(`/clubs/${club.id}`)
    } catch (error) {
      console.error('Failed to create club:', error)
      errorToast('Failed to create club', {
        description:
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Step {step} of 3 —{' '}
              {step === 1 ? 'Identity' : step === 2 ? 'Details' : 'Launch'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Identity */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <ImagePlus className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Give your club an identity
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  A great logo and name makes your crew instantly recognizable on the
                  road.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ImageUrlInput
                  label="Club Logo"
                  hint="Square, at least 256×256px"
                  value={logoUrl}
                  onChange={(url) => {
                    setLogoUrl(url)
                    if (url) setLogoFile(null)
                  }}
                  filePreview={logoPreview}
                  onFileChange={async (f) => {
                    setLogoFile(f)
                    setLogoUrl(null)
                    setLogoPreview(await fileToDataUrl(f))
                  }}
                  searchQuery="motorcycle club logo"
                  aspectClass="aspect-square"
                />
                <ImageUrlInput
                  label="Cover Banner"
                  hint="Wide, at least 1200×400px"
                  value={coverUrl}
                  onChange={(url) => {
                    setCoverUrl(url)
                    if (url) setCoverFile(null)
                  }}
                  filePreview={coverPreview}
                  onFileChange={async (f) => {
                    setCoverFile(f)
                    setCoverUrl(null)
                    setCoverPreview(await fileToDataUrl(f))
                  }}
                  searchQuery="motorcycle club cover banner"
                  aspectClass="aspect-[3/1]"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold">
                    What&apos;s your crew called?
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Desert Eagles MC"
                    value={clubData.name}
                    onChange={(e) => setClubData({ ...clubData, name: e.target.value })}
                    className="h-12 text-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clubType" className="text-base font-semibold">
                    What kind of crew?
                  </Label>
                  <Select
                    value={clubData.clubType}
                    onValueChange={(value) =>
                      setClubData({ ...clubData, clubType: value })
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Pick your riding style" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="button"
                className="w-full h-12 text-base"
                disabled={!clubData.name}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <span className="text-3xl">📍</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Set the scene</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Tell riders what your club is about and where you ride from.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-semibold">
                    Your club&apos;s story
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="What drives your crew? What kind of riders fit in? Paint the picture..."
                    value={clubData.description}
                    onChange={(e) =>
                      setClubData({ ...clubData, description: e.target.value })
                    }
                    rows={5}
                    className="text-base"
                    required
                  />
                </div>
                <LocationPicker
                  label="Home Base"
                  placeholder="Search your city or meeting spot…"
                  value={homeBase}
                  onChange={setHomeBase}
                  pinColor="blue"
                  required
                />
              </div>

              <Button
                type="button"
                className="w-full h-12 text-base"
                disabled={!clubData.description || !homeBase}
                onClick={() => setStep(3)}
              >
                Almost there...
              </Button>
            </div>
          )}

          {/* Step 3: Launch */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <span className="text-3xl">🚀</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Ready for liftoff</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Fine-tune privacy, then launch your club into the wild.
                </p>
              </div>

              {/* Preview Card */}
              <Card className="overflow-hidden border-2">
                <div className="h-24 bg-linear-to-br from-primary/20 to-primary/5 relative">
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <CardContent className="p-4 -mt-8 relative">
                  <div className="flex items-end gap-3">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 border-4 border-background overflow-hidden flex items-center justify-center">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-primary">
                          {clubData.name?.[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div className="pb-1">
                      <p className="font-bold text-lg leading-tight">
                        {clubData.name || 'Your Club'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {homeBase?.name || 'Everywhere'} ·{' '}
                        {clubData.clubType || 'Riding Club'}
                      </p>
                    </div>
                  </div>
                  {clubData.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {clubData.description}
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20">
                  <div>
                    <p className="font-semibold">Public Club</p>
                    <p className="text-sm text-muted-foreground">
                      Anyone can find your club
                    </p>
                  </div>
                  <Switch
                    checked={clubData.isPublic}
                    onCheckedChange={(checked) =>
                      setClubData({ ...clubData, isPublic: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20">
                  <div>
                    <p className="font-semibold">Require Approval</p>
                    <p className="text-sm text-muted-foreground">
                      Review join requests first
                    </p>
                  </div>
                  <Switch
                    checked={clubData.requireApproval}
                    onCheckedChange={(checked) =>
                      setClubData({ ...clubData, requireApproval: checked })
                    }
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg font-bold"
                disabled={
                  isSubmitting || !clubData.name || !clubData.description || !homeBase
                }
              >
                {isSubmitting ? 'Launching...' : '🔥 Launch Your Club'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
