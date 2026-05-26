'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { clubsApi } from '@/lib/services'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MapPin,
  Users,
  Calendar,
  Shield,
  ShieldCheck,
  Settings,
  MessageCircle,
  ChevronLeft,
  Crown,
  UserPlus,
  Share2,
  MoreHorizontal,
  Trophy,
  Star,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mediaApi, userApi } from '@/lib/services'
import { fileToDataUrl } from '@/lib/media-utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { PhantomLoader } from '@/components/loading/phantom-loader'

interface ClubOwner {
  id: string
  name: string
  username: string
  avatar: string | null
}

interface ClubMember {
  id: string
  name: string
  username?: string
  role: string
  joinedAt?: string
  ridesCount?: number
  user?: {
    id: string
    name: string
    image: string | null
  }
}

interface ClubRide {
  id: string
  title: string
  scheduledAt: string
  participantCount?: number
  status: string
}

interface GalleryItem {
  id: string
  url: string | null
}

interface Club {
  id: string
  name: string
  description: string
  location: string
  establishedAt?: string
  verified?: boolean
  image?: string | null
  coverImage?: string | null
  clubType?: string
  isPublic?: boolean
  memberCount?: number
  ridesCount?: number
  trophyCount?: number
  reputation?: number
  owner?: ClubOwner
  members?: ClubMember[]
  rides?: ClubRide[]
  gallery?: GalleryItem[]
}

const roleColors = {
  FOUNDER: 'bg-amber-100 text-amber-700',
  ADMIN: 'bg-red-100 text-red-700',
  OFFICER: 'bg-blue-100 text-blue-700',
  MEMBER: 'bg-gray-100 text-gray-700',
}

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
  const [isMember, setIsMember] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('about')
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [isGalleryUploading, setIsGalleryUploading] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editData, setEditData] = useState({ name: '', description: '', location: '' })

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        setLoading(true)
        const clubId = params.id as string

        const [clubResponse, ridesResponse] = await Promise.all([
          clubsApi.getClub(clubId),
          clubsApi.getClubRides(clubId),
        ])

        const clubData = clubResponse.club as Club

        const fullClub = {
          ...clubData,
          rides: ridesResponse?.items || [],
        }
        setClub(fullClub)
        setGalleryItems(clubData.gallery || [])
        setEditData({
          name: clubData.name || '',
          description: clubData.description || '',
          location: clubData.location || '',
        })
      } catch (err) {
        setError('Failed to load club details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchClubData()
    }
  }, [params.id])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await userApi.getProfile()
        setCurrentUserId(response.user?.id || null)
      } catch (err) {
        console.error('Failed to fetch current user:', err)
      }
    }

    fetchCurrentUser()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleJoinRequest = async () => {
    if (!club) return
    const loadingToastId = loadingToast('Joining club...', {
      description: club.isPublic ? 'Adding you to the club.' : 'Submitting your join request.',
    })
    try {
      await clubsApi.requestToJoin(club.id)
      setIsPending(true)
      setIsJoinDialogOpen(false)
      successToast(
        club.isPublic ? 'Welcome to the crew!' : 'Request sent!',
        { description: club.isPublic ? `You're now a member of ${club.name}` : 'The club admins will review your request.' }
      )
    } catch (err) {
      console.error('Failed to join club:', err)
      errorToast('Failed to join club', { description: err instanceof Error ? err.message : 'Something went wrong. Try again.' })
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
      await clubsApi.leaveClub(club.id)
      setIsMember(false)
      infoToast('You left the club', { description: `You are no longer a member of ${club.name}.` })
    } catch (err) {
      console.error('Failed to leave club:', err)
      errorToast('Failed to leave club', { description: err instanceof Error ? err.message : 'Something went wrong.' })
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
      const { club: updatedClub } = await clubsApi.updateClub(club.id, {
        name: editData.name,
        description: editData.description || undefined,
        location: editData.location || undefined,
      })
      setClub((prev) => (prev ? { ...prev, ...updatedClub } : prev))
      setIsEditDialogOpen(false)
      successToast('Club updated!', { description: 'Your changes have been saved.' })
    } catch (err) {
      console.error('Failed to update club:', err)
      errorToast('Failed to update club', { description: err instanceof Error ? err.message : 'Something went wrong.' })
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
      await clubsApi.deleteClub(club.id)
      successToast('Club deleted', { description: `${club.name} has been permanently removed.` })
      router.push('/clubs')
    } catch (err) {
      console.error('Failed to delete club:', err)
      errorToast('Failed to delete club', { description: err instanceof Error ? err.message : 'Something went wrong.' })
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
      setIsGalleryUploading(true)
      const uploads = [] as GalleryItem[]
      for (const file of galleryFiles) {
        const dataUrl = await fileToDataUrl(file)
        const response = await mediaApi.uploadClubGallery(club.id, dataUrl)
        uploads.push({
          id: response.media?.publicId?.toString() || `${Date.now()}-${file.name}`,
          url: response.imageUrl || response.media?.secureUrl || dataUrl,
        })
      }
      setGalleryItems((prev) => [...uploads, ...prev])
      setGalleryFiles([])
      setIsGalleryDialogOpen(false)
      successToast('Photos uploaded!', { description: `${uploads.length} photo(s) added to the gallery.` })
    } catch (err) {
      console.error('Failed to upload club gallery:', err)
      errorToast('Upload failed', { description: 'Could not upload photos. Please try again.' })
    } finally {
      dismissToast(loadingToastId)
      setIsGalleryUploading(false)
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
  const gallery = galleryItems
  const isOwner = currentUserId && club.owner?.id === currentUserId

  return (
    <div className="min-h-screen">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-linear-to-br from-primary/20 to-amber-100">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 backdrop-blur-sm"
          >
            <Share2 className="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 backdrop-blur-sm"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    Edit Club
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Delete Club
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem>Report Club</DropdownMenuItem>
              {isMember && !isOwner && (
                <DropdownMenuItem className="text-red-600" onClick={handleLeaveClub}>
                  Leave Club
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Club Info Header */}
      <div className="px-4 lg:px-6 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <Avatar className="w-32 h-32 border-4 border-background">
            <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
              {club.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold">{club.name}</h1>
              {club.verified && <ShieldCheck className="w-6 h-6 text-blue-500" />}
              {!club.isPublic && <Badge variant="outline">Private</Badge>}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {club.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {club.memberCount || 0} members
              </span>
              {club.establishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Est. {formatDate(club.establishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {club.reputation || 0}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {isMember ? (
              <>
                <Button variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4" />
                </Button>
              </>
            ) : isPending ? (
              <Button disabled>Request Pending</Button>
            ) : (
              <Button onClick={() => setIsJoinDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Join Club
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-4 lg:px-6 mt-6">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{club.memberCount}</p>
              <p className="text-sm text-muted-foreground">Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{club.ridesCount}</p>
              <p className="text-sm text-muted-foreground">Rides</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{club.trophyCount}</p>
              <p className="text-sm text-muted-foreground">Trophies</p>
            </CardContent>
          </Card>
          <Card className="hidden md:block">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                {club.reputation}
              </p>
              <p className="text-sm text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="px-4 lg:px-6 mt-6 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="rides">Rides</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Gallery</CardTitle>
                    {isOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsGalleryDialogOpen(true)}
                      >
                        Add Photos
                      </Button>
                    )}
                  </div>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{club.description}</p>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{club.isPublic ? 'Public club — anyone can join' : 'Private club — invite or approval required'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{club.trophyCount} trophies earned</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leadership</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {members
                      .filter((m) => ['FOUNDER', 'ADMIN', 'OFFICER'].includes(m.role))
                      .map((member) => (
                        <Link
                          key={member.id}
                          href={`/profile/${member.username}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Avatar>
                            <AvatarFallback>
                              {member.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">
                              @{member.username}
                            </p>
                          </div>
                          <Badge
                            className={roleColors[member.role as keyof typeof roleColors]}
                          >
                            {member.role === 'FOUNDER' && (
                              <Crown className="w-3 h-3 mr-1" />
                            )}
                            {member.role}
                          </Badge>
                        </Link>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Members ({members.length})</CardTitle>
                  {isMember && (
                    <Button variant="outline" size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-100">
                  <div className="space-y-2">
                    {members.map((member) => (
                      <Link
                        key={member.id}
                        href={`/profile/${member.username}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Avatar>
                          <AvatarFallback>
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            @{member.username} • {member.ridesCount} rides
                          </p>
                        </div>
                        <Badge
                          className={roleColors[member.role as keyof typeof roleColors]}
                        >
                          {member.role}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rides" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Club Rides</CardTitle>
                  {isMember && <Button size="sm">Create Ride</Button>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rides.map((ride) => (
                    <Link
                      key={ride.id}
                      href={`/rides/${ride.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{ride.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(ride.scheduledAt)} • {ride.participantCount} riders
                        </p>
                      </div>
                      <Badge
                        variant={ride.status === 'PLANNED' ? 'default' : 'secondary'}
                      >
                        {ride.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden"
                    >
                      {item.url ? (
                        <img
                          src={item.url}
                          alt="Club gallery"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Join Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join {club.name}</DialogTitle>
            <DialogDescription>
              {club.isPublic
                ? 'You will be added as a member immediately.'
                : 'Your request will be reviewed by the club admins.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoinRequest}>
              {club.isPublic ? 'Join Now' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGalleryDialogOpen} onOpenChange={setIsGalleryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Club Photos</DialogTitle>
            <DialogDescription>Add photos to the club gallery.</DialogDescription>
          </DialogHeader>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
          />
          {galleryFiles.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {galleryFiles.length} file(s) selected
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGalleryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGalleryUpload}
              disabled={isGalleryUploading || galleryFiles.length === 0}
            >
              {isGalleryUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Club Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Club</DialogTitle>
            <DialogDescription>Update your club details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={editData.location}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateClub}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Club Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Club</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All members will be removed and club data will
              be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteClub}>Delete Club</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
