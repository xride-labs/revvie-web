'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  ChevronLeft,
  MapPin,
  Users,
  Calendar,
  ShieldCheck,
  Settings,
  MessageCircle,
  UserPlus,
  Share2,
  MoreHorizontal,
  Star,
  Clock,
  Flag,
} from 'lucide-react'
import { formatDate } from '../_lib/constants'
import type { ClubWithRides } from '../_lib/types'
import { useToast } from '@/hooks/use-toast'
import { canManageClub } from '@/core/auth/use-can'

export function ClubHeader({
  club,
  isMember,
  isOwner,
  isPending,
  onJoin,
  onCancelJoin,
  onLeave,
  onEdit,
  onDelete,
}: {
  club: ClubWithRides
  isMember: boolean
  isOwner: boolean
  isPending: boolean
  onJoin: () => void
  onCancelJoin?: () => void
  onLeave: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const router = useRouter()
  const { success: successToast } = useToast()
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')

  const canManage = canManageClub(isOwner, club.viewerRole, club.viewerPermissions)

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: club.name,
          text: `Check out ${club.name} on Revvie!`,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        successToast('Link copied! 📋', { description: 'Club link copied to your clipboard.' })
      }
    } catch {
      await navigator.clipboard.writeText(url)
      successToast('Link copied! 📋', { description: 'Club link copied to your clipboard.' })
    }
  }

  const handleReportSubmit = () => {
    setIsReportDialogOpen(false)
    setReportReason('')
    successToast('Report submitted', {
      description: 'Thank you for keeping the community safe. Our team has received your report.',
    })
  }

  return (
    <>
      {/* Cover Image Banner */}
      <div className="relative h-48 md:h-64 bg-linear-to-br from-primary/20 via-neutral-900 to-primary/30 overflow-hidden">
        {club.coverImage ? (
          <img
            src={club.coverImage}
            alt={`${club.name} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/25 to-transparent pointer-events-none" />

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/80 backdrop-blur-md shadow-md z-10 hover:bg-background/95"
          onClick={() => router.back()}
          title="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 backdrop-blur-md shadow-md hover:bg-background/95 cursor-pointer"
            onClick={handleShare}
            title="Share club"
          >
            <Share2 className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 backdrop-blur-md shadow-md hover:bg-background/95 cursor-pointer"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canManage && (
                <>
                  <DropdownMenuItem onClick={() => router.push(`/clubs/${club.id}/manage`)}>
                    Manage Club
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`/clubs/${club.id}/analytics`)}
                  >
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>Edit Details</DropdownMenuItem>
                  {isOwner && (
                    <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                      Delete Club
                    </DropdownMenuItem>
                  )}
                </>
              )}
              <DropdownMenuItem onClick={() => setIsReportDialogOpen(true)}>
                <Flag className="w-4 h-4 mr-2 text-muted-foreground" />
                Report Club
              </DropdownMenuItem>
              {isMember && !isOwner && (
                <DropdownMenuItem className="text-red-600" onClick={onLeave}>
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
          <Avatar className="w-32 h-32 border-4 border-background rounded-2xl shadow-2xl bg-neutral-900 overflow-hidden">
            {club.image && (
              <AvatarImage
                src={club.image}
                alt={club.name}
                className="object-cover w-full h-full"
              />
            )}
            <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-bold rounded-2xl">
              {club.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{club.name}</h1>
              {club.verified && <ShieldCheck className="w-6 h-6 text-blue-500" />}
              {!club.isPublic ? (
                <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10">
                  Private
                </Badge>
              ) : (
                <Badge variant="outline" className="border-white/10 text-muted-foreground">
                  Public
                </Badge>
              )}
              {club.clubType && (
                <Badge variant="secondary" className="bg-white/5 border border-white/10">
                  {club.clubType}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              {club.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  {club.location}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                {club.memberCount || 0} members
              </span>
              {club.establishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  Est. {formatDate(club.establishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-primary fill-primary" />
                {club.reputation || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isMember ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/home?clubId=${club.id}`)}
                  title="Open club community feed & announcements"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Community Feed
                </Button>
                {canManage && (
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/clubs/${club.id}/manage`)}
                    title="Manage club settings"
                  >
                    <Settings className="w-4 h-4 mr-1.5" />
                    Manage
                  </Button>
                )}
              </>
            ) : isPending ? (
              <div className="flex items-center gap-2">
                <Button disabled variant="secondary" className="border border-primary/30 text-primary bg-primary/10">
                  <Clock className="w-4 h-4 mr-2 animate-pulse" />
                  Request Pending
                </Button>
                {onCancelJoin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancelJoin}
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    title="Cancel your application"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ) : (
              <Button onClick={onJoin} className="bg-primary hover:bg-brand-red/90 text-primary-foreground font-semibold">
                <UserPlus className="w-4 h-4 mr-2" />
                Join Club
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Report Club Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-md bg-[#1c1c1e] border-[#3a3a3c] text-white">
          <DialogHeader>
            <DialogTitle>Report {club.name}</DialogTitle>
            <DialogDescription className="text-neutral-400 text-xs">
              Tell our moderation team what issue you encountered with this club.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="report-reason" className="text-sm font-medium">
              Reason for report
            </Label>
            <Textarea
              id="report-reason"
              placeholder="Inappropriate content, misleading information, harassment, or code of conduct violation…"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              className="bg-black/40 border-[#3a3a3c] text-sm"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReportDialogOpen(false)}
              className="border-neutral-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReportSubmit}
              disabled={!reportReason.trim()}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

