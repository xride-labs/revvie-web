'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Users, Plus, Loader2, MoreHorizontal, Trash2, ShieldCheck } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  useGetTeamMembersQuery,
  useInviteTeamMemberMutation,
  useUpdateTeamMemberRoleMutation,
  useRemoveTeamMemberMutation,
} from '@/features/business/api'
import { useBusinessContext } from '@/contexts/business-context'
import type { BrandTeamMember, BrandMemberRole } from '@/entities/business/model'

const ROLE_BADGE: Record<BrandMemberRole, { label: string; className: string }> = {
  OWNER: {
    label: 'Owner',
    className: 'text-amber-500 border-amber-500/30 bg-amber-500/5',
  },
  ADMIN: { label: 'Admin', className: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
  MODERATOR: {
    label: 'Moderator',
    className: 'text-purple-400 border-purple-400/30 bg-purple-400/5',
  },
  MEMBER: { label: 'Member', className: 'text-muted-foreground border-border' },
}

export default function BrandTeamPage() {
  const { success: successToast, error: errorToast } = useToast()
  const { business, loading: businessLoading } = useBusinessContext()
  const businessId = business?.id ?? null
  const { data: members = [], isLoading: membersLoading } = useGetTeamMembersQuery(
    businessId ?? '',
    { skip: !businessId },
  )
  const [inviteTeamMember, { isLoading: inviting }] = useInviteTeamMemberMutation()
  const [updateTeamMemberRole] = useUpdateTeamMemberRoleMutation()
  const [removeTeamMember, { isLoading: removing }] = useRemoveTeamMemberMutation()
  const loading = businessLoading || (!!businessId && membersLoading)

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] =
    useState<Exclude<BrandMemberRole, 'OWNER'>>('MEMBER')

  const [removeTarget, setRemoveTarget] = useState<BrandTeamMember | null>(null)

  const handleInvite = async () => {
    if (!businessId || !inviteEmail.trim()) return
    try {
      await inviteTeamMember({
        businessId,
        data: { email: inviteEmail.trim(), role: inviteRole },
      }).unwrap()
      successToast('Member added', {
        description: `${inviteEmail} joined as ${inviteRole.toLowerCase()}`,
      })
      setInviteOpen(false)
      setInviteEmail('')
      setInviteRole('MEMBER')
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Failed to add member')
    }
  }

  const handleRoleChange = async (
    member: BrandTeamMember,
    role: Exclude<BrandMemberRole, 'OWNER'>,
  ) => {
    if (!businessId) return
    try {
      await updateTeamMemberRole({
        businessId,
        userId: member.userId,
        data: { role },
      }).unwrap()
      successToast('Role updated')
    } catch {
      errorToast('Failed to update role')
    }
  }

  const handleRemove = async () => {
    if (!businessId || !removeTarget) return
    try {
      await removeTeamMember({ businessId, userId: removeTarget.userId }).unwrap()
      successToast('Member removed')
    } catch {
      errorToast('Failed to remove member')
    } finally {
      setRemoveTarget(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Team</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage who has access to your brand portal
          </p>
        </div>
        <Button
          className="bg-amber-500 hover:bg-amber-600 text-white"
          onClick={() => setInviteOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Invite Member
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : members.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-20 text-center">
            <Users className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Just you so far</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
              Invite team members to help manage your brand portal, campaigns, and
              customer messages.
            </p>
            <Button variant="outline" onClick={() => setInviteOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Invite someone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {members.map((m) => {
              const badge = ROLE_BADGE[m.role]
              const initials = (m.user.name ?? m.user.email ?? 'U')
                .charAt(0)
                .toUpperCase()
              return (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar>
                    <AvatarFallback className="bg-amber-500/20 text-amber-500 font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {m.user.name ?? 'Unknown'}
                      </p>
                      {m.role === 'OWNER' && (
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {m.user.email}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${badge.className}`}>
                    {badge.label}
                  </Badge>
                  {m.role !== 'OWNER' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(['ADMIN', 'MODERATOR', 'MEMBER'] as const)
                          .filter((r) => r !== m.role)
                          .map((r) => (
                            <DropdownMenuItem
                              key={r}
                              onClick={() => handleRoleChange(m, r)}
                            >
                              Make {r.toLowerCase()}
                            </DropdownMenuItem>
                          ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setRemoveTarget(m)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={(o) => !o && setInviteOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              They must already have a Revvie account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="teammate@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin — full portal access</SelectItem>
                  <SelectItem value="MODERATOR">
                    Moderator — manage messages & inquiries
                  </SelectItem>
                  <SelectItem value="MEMBER">Member — view-only access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteOpen(false)}
              disabled={inviting}
            >
              Cancel
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
            >
              {inviting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Inviting…
                </>
              ) : (
                'Add Member'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <Dialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove member?</DialogTitle>
            <DialogDescription>
              <span className="font-medium">
                {removeTarget?.user.name ?? removeTarget?.user.email}
              </span>{' '}
              will lose access to this brand portal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveTarget(null)}
              disabled={removing}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={removing}>
              {removing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Removing…
                </>
              ) : (
                'Remove'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
