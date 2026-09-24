'use client'

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
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Loader2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import type { ClubSettings } from '../_lib/constants'
import { ImageDropzone } from '@/components/ui/image-dropzone'

export function SettingsTab({
  clubSettings,
  onChange,
  fieldErrors,
  isSaving,
  onSave,
  onUploadLogo,
  onUploadCover,
  onUploadGallery,
  onRemoveGalleryPhoto,
}: {
  clubSettings: ClubSettings
  onChange: (next: ClubSettings) => void
  fieldErrors: Record<string, string>
  isSaving: boolean
  onSave: () => void
  onUploadLogo?: (dataUrl: string) => Promise<void>
  onUploadCover?: (dataUrl: string) => Promise<void>
  onUploadGallery?: (dataUrl: string) => Promise<void>
  onRemoveGalleryPhoto?: (url: string) => Promise<void>
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 1. Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Club Information</CardTitle>
          <CardDescription>Update your club&apos;s basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Club Name</Label>
            <Input
              id="name"
              value={clubSettings.name}
              onChange={(e) => onChange({ ...clubSettings, name: e.target.value })}
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name && (
              <p className="text-xs text-destructive">{fieldErrors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={clubSettings.description}
              onChange={(e) =>
                onChange({ ...clubSettings, description: e.target.value })
              }
              rows={4}
              aria-invalid={!!fieldErrors.description}
            />
            {fieldErrors.description && (
              <p className="text-xs text-destructive">{fieldErrors.description}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={clubSettings.location}
              onChange={(e) => onChange({ ...clubSettings, location: e.target.value })}
              aria-invalid={!!fieldErrors.location}
            />
            {fieldErrors.location && (
              <p className="text-xs text-destructive">{fieldErrors.location}</p>
            )}
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="font-medium text-sm">Requires Driving License</p>
              <p className="text-xs text-muted-foreground">
                Members must have a verified license
              </p>
            </div>
            <Switch
              checked={!!clubSettings.requiresLicense}
              onCheckedChange={(checked) =>
                onChange({ ...clubSettings, requiresLicense: checked })
              }
            />
          </div>
          <Button onClick={onSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving…
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 2. Media & Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Branding & Media</CardTitle>
          <CardDescription>Upload club logo, cover banner, and gallery photos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <ImageDropzone
              label="Club Logo"
              description="Square badge/icon (JPG, PNG, WebP up to 5MB)"
              aspectRatio="square"
              value={clubSettings.image}
              onUpload={async (dataUrl) => {
                if (onUploadLogo) await onUploadLogo(dataUrl)
              }}
              onRemove={() => onChange({ ...clubSettings, image: null })}
            />
          </div>

          <Separator />

          <div>
            <ImageDropzone
              label="Cover Banner"
              description="Wide banner for club header (JPG, PNG, WebP up to 5MB)"
              aspectRatio="banner"
              value={clubSettings.coverImage}
              onUpload={async (dataUrl) => {
                if (onUploadCover) await onUploadCover(dataUrl)
              }}
              onRemove={() => onChange({ ...clubSettings, coverImage: null })}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="block font-medium">Club Photo Gallery</Label>
            {clubSettings.gallery && clubSettings.gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {clubSettings.gallery.map((photoUrl, idx) => (
                  <div
                    key={photoUrl + idx}
                    className="relative aspect-video rounded-lg overflow-hidden border border-[#3a3a3c] bg-black group"
                  >
                    <Image
                      src={photoUrl}
                      alt={`Club photo ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {onRemoveGalleryPhoto && (
                      <button
                        type="button"
                        onClick={() => onRemoveGalleryPhoto(photoUrl)}
                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <ImageDropzone
              label="Add to Gallery"
              description="Upload ride photos to showcase your club"
              aspectRatio="video"
              onUpload={async (dataUrl) => {
                if (onUploadGallery) await onUploadGallery(dataUrl)
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Privacy & Access */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Privacy & Access</CardTitle>
          <CardDescription>Control who can see and join your club</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Public Club</p>
              <p className="text-sm text-muted-foreground">
                Anyone can find and view this club
              </p>
            </div>
            <Switch
              checked={clubSettings.isPublic}
              onCheckedChange={(checked) =>
                onChange({ ...clubSettings, isPublic: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Approval</p>
              <p className="text-sm text-muted-foreground">
                New members must be approved
              </p>
            </div>
            <Switch
              checked={clubSettings.requireApproval}
              onCheckedChange={(checked) =>
                onChange({ ...clubSettings, requireApproval: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Member Invites</p>
              <p className="text-sm text-muted-foreground">Members can invite others</p>
            </div>
            <Switch
              checked={clubSettings.allowMemberInvites}
              onCheckedChange={(checked) =>
                onChange({ ...clubSettings, allowMemberInvites: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Member List</p>
              <p className="text-sm text-muted-foreground">
                Non-members can see the member list
              </p>
            </div>
            <Switch
              checked={clubSettings.showMemberList}
              onCheckedChange={(checked) =>
                onChange({ ...clubSettings, showMemberList: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
