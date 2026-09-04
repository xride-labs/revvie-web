'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  useGetClubQuery,
  useGetClubRidesQuery,
  useJoinClubMutation,
  useLeaveClubMutation,
  useUpdateClubMutation,
  useDeleteClubMutation,
} from '@/features/clubs/api'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUploadClubGalleryMutation } from '@/features/media/api'
import { useGetMyProfileQuery } from '@/features/user/api'
import { fileToDataUrl } from '@/lib/media-utils'
import { useToast } from '@/hooks/use-toast'
import { PhantomLoader } from '@/components/loading/phantom-loader'

import type { GalleryItem } from './_lib/types'
import { ClubHeader } from './_components/club-header'
import { StatsRow } from './_components/stats-row'
import { AboutTab } from './_components/about-tab'
import { MembersTab } from './_components/members-tab'
import { RidesTab } from './_components/rides-tab'
import { EventsTab } from './_components/events-tab'
import { GalleryTab } from './_components/gallery-tab'
import { JoinDialog } from './_components/join-dialog'
import { GalleryUploadDialog } from './_components/gallery-upload-dialog'
import { EditClubDialog, type EditClubData } from './_components/edit-club-dialog'
import { DeleteClubDialog } from './_components/delete-club-dialog'

export default function ClubDetailPage() {
  const params = useParams()
  const router = useRouter()
  const {
    success: successToast,
    error: errorToast,
    info: infoToast,
    loading: loadingToast,
    dismiss: dismissToast,
  } = useToast()
  const clubId = params.id as string
  const [isMember, setIsMember] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('about')
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editData, setEditData] = useState<EditClubData>({
    name: '',
    description: '',
    location: '',
  })

  const {
    data: clubResponse,
    isLoading: clubLoading,
    isError: clubHadError,
  } = useGetClubQuery(clubId, { skip: !clubId })
  const { data: ridesResponse, isLoading: ridesLoading } = useGetClubRidesQuery(
    { clubId },
    { skip: !clubId },
  )
  const { data: meData } = useGetMyProfileQuery()
  const [joinClub] = useJoinClubMutation()
  const [leaveClub] = useLeaveClubMutation()
  const [updateClub] = useUpdateClubMutation()
  const [deleteClub] = useDeleteClubMutation()
  const [uploadClubGallery, { isLoading: isGalleryUploading }] =
    useUploadClubGalleryMutation()

  const loading = clubLoading || ridesLoading
  const error = clubHadError ? 'Failed to load club details' : null
  const currentUserId = meData?.user?.id ?? null

  const club = clubResponse
    ? { ...clubResponse.club, rides: ridesResponse?.items ?? [] }
    : null

  useEffect(() => {
    if (!clubResponse) return
    const clubData = clubResponse.club
    // `gallery` arrives as a plain string[] of URLs. It used to be assigned straight
    // into GalleryItem[] state, so every previously-uploaded photo rendered with
    // `item.url === undefined` — a blank tile.
    setGalleryItems(
      (clubData.gallery ?? []).map((url, index) => ({ id: `${index}-${url}`, url })),
    )
    setEditData({
      name: clubData.name || '',
      description: clubData.description || '',
      location: clubData.location || '',
    })
  }, [clubResponse])

  const handleJoinRequest = async () => {
    if (!club) return
    const loadingToastId = loadingToast('Joining club...', {
      description: club.isPublic
        ? 'Adding you to the club.'
        : 'Submitting your join request.',
    })
    try {
      await joinClub(club.id).unwrap()
      setIsPending(true)
      setIsJoinDialogOpen(false)
      successToast(club.isPublic ? 'Welcome to the crew!' : 'Request sent!', {
        description: club.isPublic
          ? `You're now a member of ${club.name}`
          : 'The club admins will review your request.',
      })
    } catch (err) {
      console.error('Failed to join club:', err)
      errorToast('Failed to join club', {
        description:
          err instanceof Error ? err.message : 'Something went wrong. Try again.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const handleLeaveClub = async () => {
    if (!club) return
    const loadingToastId = loadingToast('Leaving club...', {
      description: 'Updating your membership status.',
    })
    try {
      await leaveClub(club.id).unwrap()
      setIsMember(false)
      infoToast('You left the club', {
        description: `You are no longer a member of ${club.name}.`,
      })
    } catch (err) {
      console.error('Failed to leave club:', err)
      errorToast('Failed to leave club', {
        description: err instanceof Error ? err.message : 'Something went wrong.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const handleUpdateClub = async () => {
    if (!club) return
    const loadingToastId = loadingToast('Updating club...', {
      description: 'Saving your club profile changes.',
    })
    try {
      await updateClub({
        clubId: club.id,
        data: {
          name: editData.name,
          description: editData.description || undefined,
          location: editData.location || undefined,
        },
      }).unwrap()
      setIsEditDialogOpen(false)
      successToast('Club updated!', { description: 'Your changes have been saved.' })
    } catch (err) {
      console.error('Failed to update club:', err)
      errorToast('Failed to update club', {
        description: err instanceof Error ? err.message : 'Something went wrong.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const handleDeleteClub = async () => {
    if (!club) return
    const loadingToastId = loadingToast('Deleting club...', {
      description: 'Removing club and related content.',
    })
    try {
      await deleteClub(club.id).unwrap()
      successToast('Club deleted', {
        description: `${club.name} has been permanently removed.`,
      })
      router.push('/clubs')
    } catch (err) {
      console.error('Failed to delete club:', err)
      errorToast('Failed to delete club', {
        description: err instanceof Error ? err.message : 'Something went wrong.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const handleGalleryUpload = async () => {
    if (!club || galleryFiles.length === 0) return
    const loadingToastId = loadingToast('Uploading photos...', {
      description: `Uploading ${galleryFiles.length} image(s) to the club gallery.`,
    })
    try {
      const uploads = [] as GalleryItem[]
      for (const file of galleryFiles) {
        const dataUrl = await fileToDataUrl(file)
        const response = await uploadClubGallery({ clubId: club.id, file: dataUrl }).unwrap()
        uploads.push({
          id:
            response.media?.publicId?.toString() ||
            `${file.name}-${file.size}-${file.lastModified}`,
          url: response.imageUrl || response.media?.secureUrl || dataUrl,
        })
      }
      setGalleryItems((prev) => [...uploads, ...prev])
      setGalleryFiles([])
      setIsGalleryDialogOpen(false)
      successToast('Photos uploaded!', {
        description: `${uploads.length} photo(s) added to the gallery.`,
      })
    } catch (err) {
      console.error('Failed to upload club gallery:', err)
      errorToast('Upload failed', {
        description: 'Could not upload photos. Please try again.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  if (loading) {
    return (
      <PhantomLoader loading>
        <div className="min-h-screen">
          <div className="h-48 md:h-64 bg-muted" />
          <div className="px-4 lg:px-6 -mt-16 relative z-10">
            <div className="w-32 h-32 rounded-full bg-muted border-4 border-background" />
            <div className="mt-4 space-y-2">
              <div className="h-8 w-48 bg-muted rounded" />
              <div className="h-4 w-64 bg-muted rounded" />
            </div>
          </div>
          <div className="px-4 lg:px-6 mt-6 grid grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-4">
                <div className="h-8 w-12 bg-muted rounded mx-auto mb-1" />
                <div className="h-3 w-16 bg-muted rounded mx-auto" />
              </div>
            ))}
          </div>
          <div className="px-4 lg:px-6 mt-6">
            <div className="h-10 w-full bg-muted rounded" />
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="h-48 bg-muted rounded-xl" />
              <div className="h-48 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </PhantomLoader>
    )
  }

  if (error || !club) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || 'Club not found'}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const members = club.members || []
  const rides = club.rides || []
  const isOwner = !!(currentUserId && club.owner?.id === currentUserId)

  return (
    <div className="min-h-screen">
      <ClubHeader
        club={club}
        isMember={isMember}
        isOwner={isOwner}
        isPending={isPending}
        onJoin={() => setIsJoinDialogOpen(true)}
        onLeave={handleLeaveClub}
        onEdit={() => setIsEditDialogOpen(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
      />

      <StatsRow club={club} rideCount={rides.length} />

      {/* Tabs Content */}
      <div className="px-4 lg:px-6 mt-6 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="rides">Rides</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-6">
            <AboutTab
              club={club}
              members={members}
              isOwner={isOwner}
              onAddPhotos={() => setIsGalleryDialogOpen(true)}
            />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <MembersTab members={members} isMember={isMember} />
          </TabsContent>

          <TabsContent value="rides" className="mt-6">
            <RidesTab rides={rides} isMember={isMember} />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <EventsTab clubId={club.id} isOwner={isOwner} />
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <GalleryTab gallery={galleryItems} />
          </TabsContent>
        </Tabs>
      </div>

      <JoinDialog
        open={isJoinDialogOpen}
        onOpenChange={setIsJoinDialogOpen}
        clubName={club.name}
        isPublic={club.isPublic}
        onConfirm={handleJoinRequest}
      />

      <GalleryUploadDialog
        open={isGalleryDialogOpen}
        onOpenChange={setIsGalleryDialogOpen}
        files={galleryFiles}
        onFilesChange={setGalleryFiles}
        uploading={isGalleryUploading}
        onUpload={handleGalleryUpload}
      />

      <EditClubDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        data={editData}
        onChange={setEditData}
        onSave={handleUpdateClub}
      />

      <DeleteClubDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteClub}
      />
    </div>
  )
}
