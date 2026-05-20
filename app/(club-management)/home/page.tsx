'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Calendar,
  Users,
  Image as ImageIcon,
  Loader2,
  Zap,
  Pin,
  Megaphone,
  Clock,
  Plus,
  Send,
} from 'lucide-react'
import Link from 'next/link'
import { feedApi } from '@/lib/services'
import { useClubContext } from '@/contexts/club-context'
import { useAuth, hasAnyRole } from '@/lib/use-auth'
import { BoneyardLoadingState } from '@/components/loading/boneyard-loading-state'
import { cn } from '@/lib/utils'

interface FeedPost {
  id: string
  type: 'ride' | 'content' | 'listing' | 'club-activity'
  isAnnouncement?: boolean
  isPinned?: boolean
  expiresAt?: string | null
  author: {
    id: string
    name: string
    username: string
    avatar: string | null
    clubs: Array<{ id: string; name: string; avatar: string | null }>
  }
  content: string
  images: string[]
  ride?: {
    id: string
    title: string
    scheduledAt: string
    participantsCount: number
  }
  listing?: {
    id: string
    title: string
    price: number
    currency: string
    isSold: boolean
  }
  club?: { id: string; name: string; avatar: string | null }
  likesCount: number
  commentsCount: number
  isLiked: boolean
  isSaved: boolean
  createdAt: string
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  return date.toLocaleDateString()
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatExpiry(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'Expired'
  const hours = Math.floor(ms / (1000 * 60 * 60))
  if (hours < 1) return 'Expires soon'
  if (hours < 24) return `Expires in ${hours}h`
  return `Expires in ${Math.floor(hours / 24)}d`
}

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clubId: string | undefined
  isClubAdmin: boolean
  onCreated: (post: FeedPost) => void
}

function CreatePostDialog({ open, onOpenChange, clubId, isClubAdmin, onCreated }: CreatePostDialogProps) {
  const [content, setContent] = useState('')
  const [isAnnouncement, setIsAnnouncement] = useState(isClubAdmin)
  const [isPinned, setIsPinned] = useState(false)
  const [expiresIn, setExpiresIn] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setContent('')
    setIsAnnouncement(isClubAdmin)
    setIsPinned(false)
    setExpiresIn('')
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      let expiresAt: string | undefined
      if (expiresIn) {
        const hours = parseFloat(expiresIn)
        if (!isNaN(hours) && hours > 0) {
          expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
        }
      }
      const post = await feedApi.createPost({
        content: content.trim(),
        type: 'content',
        clubId,
        isAnnouncement: isClubAdmin && isAnnouncement,
        isPinned: isClubAdmin && isPinned,
        expiresAt: expiresAt ?? null,
      })
      onCreated(post as unknown as FeedPost)
      reset()
      onOpenChange(false)
    } catch {
      // creation failed silently
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAnnouncement ? <Megaphone className="w-5 h-5 text-amber-500" /> : <Send className="w-5 h-5" />}
            {isAnnouncement ? 'New Announcement' : 'Create Post'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isAnnouncement ? (
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your club announcement…"
              minHeight="120px"
            />
          ) : (
            <textarea
              placeholder="What's happening in the club?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          )}

          {isClubAdmin && (
            <div className="space-y-3 p-3 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Club Admin Options</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Announcement</p>
                    <p className="text-xs text-muted-foreground">Highlights post for all members</p>
                  </div>
                </div>
                <Switch checked={isAnnouncement} onCheckedChange={setIsAnnouncement} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pin className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Pin post</p>
                    <p className="text-xs text-muted-foreground">Show at top of feed</p>
                  </div>
                </div>
                <Switch checked={isPinned} onCheckedChange={setIsPinned} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Disappear after (hours, optional)
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 24"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); onOpenChange(false) }}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!content.trim() || submitting} className="gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isAnnouncement ? 'Post Announcement' : 'Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function FeedPage() {
  const { club: activeClub } = useClubContext()
  const { user } = useAuth()

  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  const isClubAdmin = hasAnyRole(user, 'CLUB_OWNER', 'CLUB_ADMIN', 'ADMIN', 'CO_ADMIN')

  const fetchFeed = useCallback(async () => {
    setLoading(true)
    try {
      const response = await feedApi.getFeed({ clubId: activeClub?.id, page: 1 })
      const raw = response?.posts || []
      // Pinned posts float to the top
      const pinned = raw.filter((p: FeedPost) => p.isPinned)
      const rest = raw.filter((p: FeedPost) => !p.isPinned)
      setPosts([...pinned, ...rest])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [activeClub?.id])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1 }
          : post,
      ),
    )
  }

  const handleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, isSaved: !post.isSaved } : post)),
    )
  }

  const handleCreated = (post: FeedPost) => {
    setPosts((prev) => {
      const withNew = [post, ...prev]
      const pinned = withNew.filter((p) => p.isPinned)
      const rest = withNew.filter((p) => !p.isPinned)
      return [...pinned, ...rest]
    })
  }

  const activeRidePosts = posts
    .filter((p): p is FeedPost & { ride: NonNullable<FeedPost['ride']> } => p.type === 'ride' && !!p.ride)
    .slice(0, 8)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Club header + create button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-lg">{activeClub?.name ?? 'Club Feed'}</h2>
          <p className="text-xs text-muted-foreground">
            {activeClub ? `${activeClub.membersCount ?? 0} members` : 'Select a club'}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 rounded-full" size="sm">
          <Plus className="w-4 h-4" />
          {isClubAdmin ? 'Post' : 'Post'}
        </Button>
      </div>

      {/* Stories / Active Rides */}
      {activeRidePosts.length > 0 && (
        <>
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">ACTIVE RIDES</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {activeRidePosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/rides/${post.ride.id}`}
                  className="shrink-0 w-20 flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-amber-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <Avatar className="w-14 h-14">
                        <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                          {post.ride.title.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <span className="text-xs text-center truncate w-full">{post.ride.title}</span>
                </Link>
              ))}
            </div>
          </div>
          <Separator className="mb-6" />
        </>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {loading ? (
          <BoneyardLoadingState
            name="club-feed-loading"
            fallback={
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            }
          />
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Nothing here yet</h3>
            <p className="text-sm max-w-xs mx-auto">
              {activeClub
                ? `No posts in ${activeClub.name} yet. Be the first to post!`
                : 'Select a club to see its feed.'}
            </p>
            <Button onClick={() => setCreateOpen(true)} className="mt-4 rounded-full gap-2">
              <Plus className="w-4 h-4" /> Create First Post
            </Button>
          </div>
        ) : (
          posts.map((post) => (
            <Card
              key={post.id}
              className={cn(
                'overflow-hidden',
                post.isAnnouncement && 'border-amber-500/40 bg-amber-500/5',
                post.isPinned && 'ring-1 ring-primary/30',
              )}
            >
              <CardContent className="p-4">
                {/* Announcement / Pinned banners */}
                {(post.isAnnouncement || post.isPinned) && (
                  <div className="flex items-center gap-3 mb-3 -mt-0.5">
                    {post.isPinned && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-primary uppercase tracking-wide">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    {post.isAnnouncement && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-500 uppercase tracking-wide">
                        <Megaphone className="w-3 h-3" /> Announcement
                      </span>
                    )}
                    {post.expiresAt && new Date(post.expiresAt) > new Date() && (
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" /> {formatExpiry(post.expiresAt)}
                      </span>
                    )}
                  </div>
                )}

                {/* Author Header */}
                <div className="flex items-start justify-between mb-3">
                  <Link href={`/profile/${post.author.username}`} className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-linear-to-br from-primary to-amber-500 text-white font-semibold">
                        {(post.author.name ?? post.author.username ?? '?').split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{post.author.name}</span>
                        {post.type === 'club-activity' && (
                          <Badge variant="secondary" className="text-[10px] px-1.5">Club</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>@{post.author.username}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                      {(post.author.clubs?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {post.author.clubs.slice(0, 2).map((club) => (
                            <Badge key={club.id} variant="outline" className="text-[10px] px-1.5 py-0">
                              {club.name}
                            </Badge>
                          ))}
                          {post.author.clubs.length > 2 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              +{post.author.clubs.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                {post.isAnnouncement && post.content.startsWith('<') ? (
                  <div
                    className="text-sm mb-3 prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                ) : (
                  <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
                )}

                {/* Image placeholder */}
                {post.images?.length === 0 && post.type === 'content' && (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}

                {/* Ride Card */}
                {post.type === 'ride' && post.ride && (
                  <Link href={`/rides/${post.ride.id}`}>
                    <div className="bg-linear-to-r from-primary/10 to-amber-100/50 rounded-xl p-4 mb-3 border border-primary/20">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-sm">{post.ride.title}</h3>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {formatDate(post.ride.scheduledAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {post.ride.participantsCount} riders
                            </span>
                          </div>
                        </div>
                        <Button size="sm" className="rounded-full">Join</Button>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Listing Card */}
                {post.type === 'listing' && post.listing && (
                  <Link href={`/marketplace/${post.listing.id}`}>
                    <div className="bg-muted rounded-xl p-4 mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-background rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{post.listing.title}</h3>
                          <p className="text-lg font-bold text-primary">${post.listing.price.toLocaleString()}</p>
                          {post.listing.isSold && <Badge variant="secondary">Sold</Badge>}
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="gap-1.5 h-8" onClick={() => handleLike(post.id)}>
                      <Heart className={cn('w-4 h-4', post.isLiked && 'fill-red-500 text-red-500')} />
                      <span className="text-xs">{post.likesCount}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5 h-8">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">{post.commentsCount}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8" onClick={() => handleSave(post.id)}>
                    <Bookmark className={cn('w-4 h-4', post.isSaved && 'fill-foreground')} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {posts.length > 0 && (
        <div className="mt-8 text-center">
          <Button variant="outline" className="rounded-full">Load More</Button>
        </div>
      )}

      <CreatePostDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        clubId={activeClub?.id}
        isClubAdmin={isClubAdmin}
        onCreated={handleCreated}
      />
    </div>
  )
}
