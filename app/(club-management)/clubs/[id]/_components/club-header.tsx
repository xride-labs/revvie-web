import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
} from 'lucide-react'
import { formatDate } from '../_lib/constants'
import type { ClubWithRides } from '../_lib/types'

export function ClubHeader({
  club,
  isMember,
  isOwner,
  isPending,
  onJoin,
  onLeave,
  onEdit,
  onDelete,
}: {
  club: ClubWithRides
  isMember: boolean
  isOwner: boolean
  isPending: boolean
  onJoin: () => void
  onLeave: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const router = useRouter()

  return (
    <>
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
          <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
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
                  <DropdownMenuItem onClick={() => router.push(`/clubs/${club.id}/manage`)}>
                    Manage Club
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`/clubs/${club.id}/analytics`)}
                  >
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>Edit Club</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                    Delete Club
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem>Report Club</DropdownMenuItem>
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
                {isOwner && (
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/clubs/${club.id}/manage`)}
                    title="Manage club"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                )}
              </>
            ) : isPending ? (
              <Button disabled>Request Pending</Button>
            ) : (
              <Button onClick={onJoin}>
                <UserPlus className="w-4 h-4 mr-2" />
                Join Club
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
