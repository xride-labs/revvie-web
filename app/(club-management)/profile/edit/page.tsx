'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGetMyProfileQuery, useUpdateProfileMutation } from '@/features/user/api'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronLeft, Camera } from 'lucide-react'
import { useUploadProfileImageMutation, useUploadProfileCoverMutation } from '@/features/media/api'
import { fileToDataUrl } from '@/lib/media-utils'
import { useToast } from '@/hooks/use-toast'
import { PhantomLoader } from '@/components/loading/phantom-loader'

interface ProfileData {
  name: string
  username: string
  bio: string
  location: string
  email: string
  phone: string
}

export default function EditProfilePage() {
  const router = useRouter()
  const {
    success: successToast,
    error: errorToast,
    loading: loadingToast,
    dismiss: dismissToast,
  } = useToast()
  const { data: meData, isLoading: loading, isError: error } = useGetMyProfileQuery()
  const [updateProfile, { isLoading: isSubmitting }] = useUpdateProfileMutation()
  const [uploadProfileImage, { isLoading: isUploadingAvatar }] =
    useUploadProfileImageMutation()
  const [uploadProfileCover, { isLoading: isUploadingCover }] =
    useUploadProfileCoverMutation()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    username: '',
    bio: '',
    location: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    if (!meData) return
    const userData = meData.user
    setProfileData({
      name: userData.name || '',
      username: userData.username || '',
      bio: userData.bio || '',
      location: userData.location || '',
      email: userData.email || '',
      // The profile response has no `phone` field — this input has never had a real
      // value to load (the old code's `(userData as {phone?:string})` cast masked it).
      phone: '',
    })
    setAvatarUrl(userData.avatar || null)
    setCoverUrl(userData.coverImage || null)
  }, [meData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const loadingToastId = loadingToast('Saving profile...', {
      description: 'Updating your account details.',
    })

    try {
      await updateProfile({
        name: profileData.name,
        username: profileData.username,
        bio: profileData.bio,
        location: profileData.location,
      }).unwrap()
      successToast('Profile updated', {
        description: 'Your profile changes have been saved.',
      })
      router.push('/profile/me')
    } catch (err) {
      console.error('Failed to update profile:', err)
      errorToast('Failed to update profile', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const handleAvatarUpload = async (file: File | null) => {
    if (!file) return
    const loadingToastId = loadingToast('Uploading avatar...', {
      description: 'Processing and saving your profile image.',
    })
    try {
      const dataUrl = await fileToDataUrl(file)
      const response = await uploadProfileImage(dataUrl).unwrap()
      setAvatarUrl(response.imageUrl || response.media?.secureUrl || dataUrl)
      successToast('Avatar updated')
    } catch (err) {
      console.error('Failed to upload avatar:', err)
      errorToast('Avatar upload failed', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const handleCoverUpload = async (file: File | null) => {
    if (!file) return
    const loadingToastId = loadingToast('Uploading cover...', {
      description: 'Processing and saving your cover image.',
    })
    try {
      const dataUrl = await fileToDataUrl(file)
      const response = await uploadProfileCover(dataUrl).unwrap()
      setCoverUrl(response.imageUrl || response.media?.secureUrl || dataUrl)
      successToast('Cover image updated')
    } catch (err) {
      console.error('Failed to upload cover:', err)
      errorToast('Cover upload failed', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  if (loading) {
    return (
      <PhantomLoader loading>
        <div className="min-h-screen p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-muted rounded-lg" />
            <div className="space-y-1">
              <div className="h-7 w-36 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
            </div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 space-y-4">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      </PhantomLoader>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Failed to load profile</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 lg:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-sm text-muted-foreground">Update your profile information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Profile avatar" />
                  ) : null}
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {profileData.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1">
                <label className="inline-flex">
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAvatarUpload(e.target.files?.[0] || null)}
                    disabled={isUploadingAvatar}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: Square image, at least 256x256px
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Image */}
        <Card>
          <CardHeader>
            <CardTitle>Cover Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-28 w-full overflow-hidden rounded-lg border bg-muted">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <label className="inline-flex">
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleCoverUpload(e.target.files?.[0] || null)}
                disabled={isUploadingCover}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingCover}
              >
                {isUploadingCover ? 'Uploading...' : 'Upload Cover'}
              </Button>
            </label>
            <p className="text-xs text-muted-foreground">
              Recommended: 1200x400px wide image
            </p>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 rounded-l-md">
                  @
                </span>
                <Input
                  id="username"
                  className="rounded-l-none"
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData({ ...profileData, username: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">
                {profileData.bio.length}/160
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, State"
                value={profileData.location}
                onChange={(e) =>
                  setProfileData({ ...profileData, location: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Your contact info is private and only visible to you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
