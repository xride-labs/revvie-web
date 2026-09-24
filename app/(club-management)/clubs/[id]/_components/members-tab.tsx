'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserPlus, Search, Copy, Check, Share2, Users } from 'lucide-react'
import { formatDate, initials, roleColors } from '../_lib/constants'
import type { ClubMember } from '@/entities/club/model'
import { useToast } from '@/hooks/use-toast'

export function MembersTab({
  clubId,
  clubName,
  members,
  isMember,
}: {
  clubId?: string
  clubName?: string
  members: ClubMember[]
  isMember: boolean
}) {
  const { success: successToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)

  const filteredMembers = members.filter((m) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    const nameMatch = m.user.name?.toLowerCase().includes(query)
    const roleMatch = m.role.toLowerCase().includes(query)
    return nameMatch || roleMatch
  })

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/clubs/${clubId ?? ''}`
      : `/clubs/${clubId ?? ''}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setHasCopied(true)
      successToast('Invite link copied! 📋', {
        description: 'Share this link with fellow riders to join your club.',
      })
      setTimeout(() => setHasCopied(false), 2000)
    } catch {
      setHasCopied(true)
      successToast('Link ready', { description: inviteUrl })
    }
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Join ${clubName || 'our club'} on Revvie`,
          text: `Ride with us! Check out ${clubName || 'our club'} on Revvie:`,
          url: inviteUrl,
        })
      } catch {
        // Fallback to copy
        await handleCopyLink()
      }
    } else {
      await handleCopyLink()
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Members ({members.length})</CardTitle>
              <CardDescription>Riders and active crew in this club</CardDescription>
            </div>
            {isMember && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInviteDialogOpen(true)}
                className="gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-primary" />
                Invite Riders
              </Button>
            )}
          </div>
          {members.length > 5 && (
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name or role…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
              <Users className="w-8 h-8 mx-auto text-muted-foreground/40" />
              <p>
                {searchQuery ? `No members found matching "${searchQuery}".` : 'No members yet.'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-100">
              <div className="space-y-2 pr-2">
                {filteredMembers.map((member) => (
                  <Link
                    key={member.id}
                    href={`/profile/${member.userId}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/30 transition-colors"
                  >
                    <Avatar className="w-10 h-10 border border-white/10">
                      <AvatarImage src={member.user.avatar ?? undefined} alt={member.user.name ?? ''} />
                      <AvatarFallback>{initials(member.user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{member.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {formatDate(member.joinedAt)}
                      </p>
                    </div>
                    <Badge className={roleColors[member.role as keyof typeof roleColors]}>
                      {member.role}
                    </Badge>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="max-w-md bg-[#1c1c1e] border-[#3a3a3c] text-white">
          <DialogHeader>
            <DialogTitle>Invite Riders to {clubName || 'Club'}</DialogTitle>
            <DialogDescription className="text-neutral-400 text-xs">
              Anyone with this link can view the club and submit a join request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteUrl}
                className="bg-black/40 border-[#3a3a3c] text-xs font-mono text-neutral-300"
              />
              <Button
                size="sm"
                onClick={handleCopyLink}
                className="gap-1.5 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
              className="border-neutral-700 w-full sm:w-auto"
            >
              Done
            </Button>
            <Button
              onClick={handleNativeShare}
              className="gap-1.5 w-full sm:w-auto bg-neutral-800 hover:bg-neutral-700 text-white"
            >
              <Share2 className="w-4 h-4" />
              Share Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

