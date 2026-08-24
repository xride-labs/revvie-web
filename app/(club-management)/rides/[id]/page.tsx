'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUploadRideMediaMutation } from '@/features/media/api'
import { useGetMyProfileQuery } from '@/features/user/api'
import {
  useDeleteRideMutation,
  useGetRideQuery,
  useJoinRideMutation,
  useLeaveRideMutation,
  useUpdateRideMutation,
} from '@/features/rides/api'
import type { RideParticipant } from '@/entities/ride/model'
import { Button } from '@/components/ui/button'
import { Route, Loader2 } from 'lucide-react'
import { fileToDataUrl } from '@/lib/media-utils'
import { useToast } from '@/hooks/use-toast'

import { RideHeader } from './_components/ride-header'
import { RideSummary } from './_components/ride-summary'
import { RideGallery } from './_components/ride-gallery'
import { OrganizerCard } from './_components/organizer-card'
import { ParticipantsCard } from './_components/participants-card'
import { BottomActionBar } from './_components/bottom-action-bar'
import { LeaveRideDialog } from './_components/leave-ride-dialog'
import { EditRideDialog, type EditRideData } from './_components/edit-ride-dialog'
import { DeleteRideDialog } from './_components/delete-ride-dialog'
import { RideGalleryUploadDialog } from './_components/ride-gallery-upload-dialog'

export default function RideDetailPage() {
  const params = useParams()
  const router = useRouter()
  const {
    success: successToast,
    error: errorToast,
    info: infoToast,
    loading: loadingToast,
    dismiss: dismissToast,
  } = useToast()
  const rideId = params.id as string

  const [isJoined, setIsJoined] = useState(false)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [galleryItems, setGalleryItems] = useState<string[]>([])
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [isGalleryUploading, setIsGalleryUploading] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editData, setEditData] = useState<EditRideData>({
    title: '',
    description: '',
    startLocation: '',
    endLocation: '',
    scheduledAt: '',
    distance: '',
    duration: '',
  })

  const {
    data: rideResponse,
    isLoading: loading,
    isError,
  } = useGetRideQuery(rideId, { skip: !rideId })
  const [updateRideMutation] = useUpdateRideMutation()
  const [deleteRideMutation] = useDeleteRideMutation()
  const [joinRideMutation] = useJoinRideMutation()
  const [leaveRideMutation] = useLeaveRideMutation()
  const [uploadRideMedia] = useUploadRideMediaMutation()
  const { data: meData } = useGetMyProfileQuery()

  // `GET /rides/:id` wraps the ride: `{ ride, participantStatus, pendingRequestCount }`.
  const ride = rideResponse?.ride
  const participantStatus = rideResponse?.participantStatus ?? null

  const error = isError ? 'Failed to load ride details' : null

  useEffect(() => {
    if (!ride) return
    setGalleryItems(ride.images ?? [])
    setIsJoined(participantStatus === 'ACCEPTED')
  }, [ride, participantStatus])

  useEffect(() => {
    setCurrentUserId(meData?.user?.id || null)
  }, [meData])

  useEffect(() => {
    if (!ride) return
    setEditData({
      title: ride.title,
      description: ride.description,
      startLocation: ride.startLocation,
      endLocation: ride.endLocation ?? '',
      scheduledAt: new Date(ride.scheduledAt).toISOString().slice(0, 16),
      distance: ride.distance ? String(ride.distance) : '',
      duration: ride.duration ? String(ride.duration) : '',
    })
  }, [ride])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || 'Ride not found'}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const participants: RideParticipant[] = ride.participants
  const confirmedCount = participants.filter((p) => p.status === 'ACCEPTED').length
  const isOrganizer = !!(currentUserId && ride.creator.id === currentUserId)

  const handleJoinRide = async () => {
    if (!ride) return
    const loadingToastId = loadingToast('Joining ride...', {
      description: 'Sending your participation request.',
    })
    try {
      await joinRideMutation(ride.id).unwrap()
      setIsJoined(true)
      successToast("You're in! 🏍️", {
        description: `You joined "${ride.title}". See you on the road!`,
      })
    } catch (err) {
      console.error('Failed to join ride:', err)
      errorToast('Failed to join ride', {
        description:
          err instanceof Error ? err.message : 'Something went wrong. Try again.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const handleLeaveRide = async () => {
    if (!ride) return
    const loadingToastId = loadingToast('Leaving ride...', {
      description: 'Updating your participation status.',
    })
    try {
      await leaveRideMutation(ride.id).unwrap()
      setIsJoined(false)
      setIsLeaveDialogOpen(false)
      infoToast('You left the ride', {
        description: `You are no longer part of "${ride.title}".`,
      })
    } catch (err) {
      console.error('Failed to leave ride:', err)
      errorToast('Failed to leave ride', {
        description: err instanceof Error ? err.message : 'Something went wrong.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const handleGalleryUpload = async () => {
    if (!ride || galleryFiles.length === 0) return
    const loadingToastId = loadingToast('Uploading photos...', {
      description: `Uploading ${galleryFiles.length} image(s) to the gallery.`,
    })
    try {
      setIsGalleryUploading(true)
      const uploadedUrls: string[] = []
      for (const file of galleryFiles) {
        const dataUrl = await fileToDataUrl(file)
        const response = await uploadRideMedia({
          rideId: ride.id,
          file: dataUrl,
          type: 'image',
        }).unwrap()
        uploadedUrls.push(response.imageUrl || response.media?.secureUrl || dataUrl)
      }
      setGalleryItems((prev) => [...uploadedUrls, ...prev])
      setGalleryFiles([])
      setIsGalleryDialogOpen(false)
      successToast('Photos uploaded!', {
        description: `${uploadedUrls.length} photo(s) added to the gallery.`,
      })
    } catch (err) {
      console.error('Failed to upload ride media:', err)
      errorToast('Upload failed', {
        description: 'Could not upload photos. Please try again.',
      })
    } finally {
      dismissToast(loadingToastId)
      setIsGalleryUploading(false)
    }
  }

  const handleUpdateRide = async () => {
    if (!ride) return
    const loadingToastId = loadingToast('Updating ride...', {
      description: 'Saving your latest ride changes.',
    })
    try {
      const payload = {
        title: editData.title,
        description: editData.description || undefined,
        startLocation: editData.startLocation,
        endLocation: editData.endLocation || undefined,
        distance: editData.distance ? Number(editData.distance) : undefined,
        duration: editData.duration ? Number(editData.duration) : undefined,
        scheduledAt: editData.scheduledAt
          ? new Date(editData.scheduledAt).toISOString()
          : undefined,
      }
      await updateRideMutation({ rideId: ride.id, data: payload }).unwrap()
      setIsEditDialogOpen(false)
      successToast('Ride updated!', { description: 'Your changes have been saved.' })
    } catch (err) {
      console.error('Failed to update ride:', err)
      errorToast('Failed to update ride', {
        description: err instanceof Error ? err.message : 'Something went wrong.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const handleDeleteRide = async () => {
    if (!ride) return
    const loadingToastId = loadingToast('Deleting ride...', {
      description: 'Removing ride and associated metadata.',
    })
    try {
      await deleteRideMutation(ride.id).unwrap()
      successToast('Ride deleted', {
        description: 'The ride has been permanently removed.',
      })
      router.push('/rides')
    } catch (err) {
      console.error('Failed to delete ride:', err)
      errorToast('Failed to delete ride', {
        description: err instanceof Error ? err.message : 'Something went wrong.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <RideHeader
        isOrganizer={isOrganizer}
        isJoined={isJoined}
        onEdit={() => setIsEditDialogOpen(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onLeave={() => setIsLeaveDialogOpen(true)}
      />

      {/* Map Preview */}
      <div className="aspect-video bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Route className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>Route Map Preview</p>
        </div>
      </div>

      <div className="px-4 space-y-6 pt-4">
        <RideSummary ride={ride} />

        {/*
          A "Route Itinerary" card lived here, reading `ride.waypoints[].{name,time,type}`.
          The backend's `waypoints` field is an opaque route-geometry blob (see
          entities/ride/model.ts) — there is no list of named stops to render. Removed
          rather than rendering unverified shape; revisit once the backend documents it.
        */}

        <RideGallery
          images={galleryItems}
          isOrganizer={isOrganizer}
          onAddPhotos={() => setIsGalleryDialogOpen(true)}
        />

        <OrganizerCard creator={ride.creator} />

        <ParticipantsCard participants={participants} confirmedCount={confirmedCount} />

        {/* Description */}
        <div>
          <h2 className="font-semibold mb-3">About This Ride</h2>
          <div className="text-muted-foreground whitespace-pre-line text-sm">
            {ride.description}
          </div>
        </div>
      </div>

      <BottomActionBar isJoined={isJoined} onJoin={handleJoinRide} />

      <LeaveRideDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        onConfirm={handleLeaveRide}
      />

      <EditRideDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        data={editData}
        onChange={setEditData}
        onSave={handleUpdateRide}
      />

      <DeleteRideDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteRide}
      />

      <RideGalleryUploadDialog
        open={isGalleryDialogOpen}
        onOpenChange={setIsGalleryDialogOpen}
        files={galleryFiles}
        onFilesChange={setGalleryFiles}
        uploading={isGalleryUploading}
        onUpload={handleGalleryUpload}
      />
    </div>
  )
}
