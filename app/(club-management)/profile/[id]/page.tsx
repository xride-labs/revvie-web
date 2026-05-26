'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Settings,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  MessageCircle,
  Flag,
  Share2,
  ShieldCheck,
  Star,
  Route,
  Users,
  Trophy,
  Bike,
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
import { userApi, mediaApi } from '@/lib/services'
import { fileToDataUrl } from '@/lib/media-utils'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { PhantomLoader } from '@/components/loading/phantom-loader'

interface UserProfile {
  id: string
  name: string
  username: string
  bio?: string
  location?: string
  memberSince?: string
  avatar?: string | null
  image?: string | null
  coverImage?: string | null
  verified?: boolean
  role?: string
  stats?: {
    rides: number
    distance: number
    followers: number
    following: number
    clubs: number
    reviewsGiven: number
    reviewRating: number
  }
  badges?: Array<{ id: string; name: string; description: string; icon: string }>
  bikes?: Array<{
    id: string
    name: string
    make: string
    model: string
    year: number
    isPrimary: boolean
  }>
  clubs?: Array<{ id: string; name: string; role: string; memberCount: number }>
  recentRides?: Array<{
    id: string
    title: string
    date: string
    distance: number
    status: string
  }>
  gallery?: Array<{ id: string; url: string | null }>
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.id as string
  const {
    success: successToast,
    error: errorToast,
    loading: loadingToast,
    dismiss: dismissToast,
  } = useToast()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isUnfollowDialogOpen, setIsUnfollowDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [galleryItems, setGalleryItems] = useState<
    Array<{ id: string; url: string | null }>
  >([])
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [isGalleryUploading, setIsGalleryUploading] = useState(false)

  const isOwnProfile = username === 'me'

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  const fetchProfile = async () => {
    const loadingToastId = loadingToast('Loading profile...', {
      description: 'Fetching profile details and gallery.',
    })
    try {
      setLoading(true)
      const response =
        username === 'me'
          ? await userApi.getProfile()
          : await userApi.getPublicProfile(username)
      const userData = response.user
      setUser({
        id: userData.id,
        name: userData.name || '',
        username: userData.username || '',
        bio: userData.bio,
        location: userData.location,
        avatar: userData.avatar,
      })
      setGalleryItems(
        (userData as { gallery?: Array<{ id: string; url: string | null }> }).gallery ||
        [],
      )
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      errorToast('Failed to load profile', {
        description: err instanceof Error ? err.message : 'Please refresh and try again.',
      })
    } finally {
      dismissToast(loadingToastId)
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }

  const handleFollow = () => {
    if (isFollowing) {
      setIsUnfollowDialogOpen(true)
    } else {
      setIsFollowing(true)
    }
  }

  const handleUnfollow = () => {
    setIsFollowing(false)
    setIsUnfollowDialogOpen(false)
  }

  const handleGalleryUpload = async () => {
    if (galleryFiles.length === 0) return
    const loadingToastId = loadingToast('Uploading gallery photos...', {
      description: `Uploading ${galleryFiles.length} image(s).`,
    })
    try {
      setIsGalleryUploading(true)
      const uploads = [] as Array<{ id: string; url: string | null }>
      for (const file of galleryFiles) {
        const dataUrl = await fileToDataUrl(file)
        const response = await mediaApi.uploadProfileGallery(dataUrl)
        uploads.push({
          id: response.media?.publicId?.toString() || `${Date.now()}-${file.name}`,
          url: response.imageUrl || response.media?.secureUrl || dataUrl,
        })
      }
      setGalleryItems((prev) => [...uploads, ...prev])
      setGalleryFiles([])
      setIsGalleryDialogOpen(false)
      successToast('Gallery updated', {
        description: `${uploads.length} photo(s) uploaded successfully.`,
      })
    } catch (err) {
      console.error('Failed to upload gallery images:', err)
      errorToast('Gallery upload failed', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      dismissToast(loadingToastId)
      setIsGalleryUploading(false)
    }
  }

  if (loading) {
    return (
      <PhantomLoader loading>
        <div className="min-h-screen">
          <div className="h-32 md:h-48 bg-muted" />
          <div className="px-4 lg:px-6 -mt-16 relative z-10">
            <div className="w-28 h-28 rounded-full bg-muted border-4 border-background" />
            <div className="mt-4 space-y-2">
              <div className="h-7 w-40 bg-muted rounded" />
              <div className="h-4 w-28 bg-muted rounded" />
              <div className="flex gap-4 mt-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
            </div>
          </div>
          <div className="px-4 lg:px-6 mt-6 grid gap-6 md:grid-cols-2">
            <div className="h-48 bg-muted rounded-xl" />
            <div className="h-48 bg-muted rounded-xl" />
          </div>
        </div>
      </PhantomLoader>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">User not found</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Cover Image */}
      <div className="relative h-32 md:h-48 bg-linear-to-br from-primary/20 to-amber-100">
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
          {isOwnProfile ? (
            <Link href="/profile/settings">
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 backdrop-blur-sm"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
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
                <DropdownMenuItem>
                  <Flag className="w-4 h-4 mr-2" />
                  Report User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-4 lg:px-6 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <Avatar className="w-28 h-28 border-4 border-background">
            <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {user.verified && <ShieldCheck className="w-5 h-5 text-blue-500" />}
            </div>
            <p className="text-muted-foreground">@{user.username}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              {user.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {user.location}
                </span>
              )}
              {user.memberSince && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(user.memberSince)}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isOwnProfile ? (
              <Link href="/profile/edit">
                <Button variant="outline">Edit Profile</Button>
              </Link>
            ) : (
              <>
                <Button variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button
                  variant={isFollowing ? 'outline' : 'default'}
                  onClick={handleFollow}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && <p className="mt-4 text-muted-foreground">{user.bio}</p>}

        {/* Stats */}
        {user.stats && (
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-semibold">{user.stats.followers}</span>
              <span className="text-muted-foreground">followers</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{user.stats.following}</span>
              <span className="text-muted-foreground">following</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-semibold">{user.stats.reviewRating}</span>
              <span className="text-muted-foreground">({user.stats.reviewsGiven})</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Content */}
      <div className="px-4 lg:px-6 mt-6 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bikes">Bikes</TabsTrigger>
            <TabsTrigger value="rides">Rides</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Route className="w-6 h-6 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold">{user.stats?.rides || 0}</p>
                      <p className="text-sm text-muted-foreground">Rides</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Bike className="w-6 h-6 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold">
                        {(user.stats?.distance || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Miles</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Users className="w-6 h-6 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold">{user.stats?.clubs || 0}</p>
                      <p className="text-sm text-muted-foreground">Clubs</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Trophy className="w-6 h-6 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold">{user.badges?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Badges</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badges Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(user.badges || []).map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                      >
                        <div className="text-2xl">{badge.icon}</div>
                        <div>
                          <p className="font-medium">{badge.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Clubs Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Clubs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(user.clubs || []).map((club) => (
                      <Link key={club.id} href={`/clubs/${club.id}`}>
                        <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors">
                          <Avatar>
                            <AvatarFallback>
                              {club.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{club.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {club.memberCount} members
                            </p>
                          </div>
                          <Badge variant="outline">{club.role}</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bikes" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {(user.bikes || []).map((bike) => (
                <Card key={bike.id}>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                      <Bike className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{bike.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {bike.year} {bike.make} {bike.model}
                        </p>
                      </div>
                      {bike.isPrimary && <Badge>Primary</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {isOwnProfile && (
                <Card className="border-dashed">
                  <CardContent className="p-4 flex items-center justify-center h-full min-h-50">
                    <Button variant="ghost">
                      <Bike className="w-4 h-4 mr-2" />
                      Add a Bike
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rides" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Rides</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-100">
                  <div className="space-y-3">
                    {(user.recentRides || []).map((ride) => (
                      <Link key={ride.id} href={`/rides/${ride.id}`}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Route className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{ride.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(ride.date)} • {ride.distance} mi
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">{ride.status}</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gallery</CardTitle>
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsGalleryDialogOpen(true)}
                    >
                      Add Photos
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryItems.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-square bg-muted rounded-lg flex items-center justify-center"
                    >
                      {item.url ? (
                        <img
                          src={item.url}
                          alt="Gallery item"
                          className="h-full w-full rounded-lg object-cover"
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

      {/* Unfollow Dialog */}
      <Dialog open={isUnfollowDialogOpen} onOpenChange={setIsUnfollowDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unfollow {user.name}?</DialogTitle>
            <DialogDescription>
              You will no longer see their updates in your feed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnfollowDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUnfollow}>
              Unfollow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGalleryDialogOpen} onOpenChange={setIsGalleryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Gallery Photos</DialogTitle>
            <DialogDescription>Add photos to your profile gallery.</DialogDescription>
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
    </div>
  )
}
