'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import {
  Crown,
  MoreHorizontal,
  UserMinus,
  ShieldAlert,
  VolumeX,
  Volume2,
  Ban,
  PauseCircle,
  PlayCircle,
  Shield,
} from 'lucide-react'
import type { ClubMember } from '@/entities/club/model'
import { formatDate, roleColors, roleOptions } from '../_lib/constants'
import {
  useGetClubRolesQuery,
  useAssignClubMemberRoleMutation,
  useModerateClubMemberMutation,
} from '@/features/clubs/api'
import type { ModerationAction } from '@/features/clubs/schemas'
import { useToast } from '@/hooks/use-toast'

interface MembersTabProps {
  clubId: string
  members: ClubMember[]
  onRoleChange: (memberId: string, newRole: string) => void
  onSelectForRemoval: (member: ClubMember) => void
}

const EXPIRATION_OPTIONS = [
  { label: '1 Hour', value: 3600000 },
  { label: '24 Hours', value: 86400000 },
  { label: '7 Days', value: 604800000 },
  { label: '30 Days', value: 2592000000 },
  { label: 'Permanent', value: 0 },
]

export function MembersTab({
  clubId,
  members,
  onRoleChange,
  onSelectForRemoval,
}: MembersTabProps) {
  const { data: rolesData } = useGetClubRolesQuery(clubId)
  const [assignRole] = useAssignClubMemberRoleMutation()
  const [moderateMember, { isLoading: isModerating }] = useModerateClubMemberMutation()
  const { success: successToast, error: errorToast } = useToast()

  const customRoles = rolesData?.roles?.filter((r) => !r.isSystem) || []

  // Moderation Dialog State
  const [modTargetMember, setModTargetMember] = useState<ClubMember | null>(null)
  const [modAction, setModAction] = useState<ModerationAction>('MUTE')
  const [modDurationMs, setModDurationMs] = useState<number>(86400000)
  const [modReason, setModReason] = useState('')
  const [isModDialogOpen, setIsModDialogOpen] = useState(false)

  // Custom Role Assignment State
  const [roleTargetMember, setRoleTargetMember] = useState<ClubMember | null>(null)
  const [selectedCustomRoleId, setSelectedCustomRoleId] = useState<string>('none')
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)

  const handleOpenModeration = (member: ClubMember) => {
    setModTargetMember(member)
    setModReason('')
    // Default action based on current status
    if (member.status === 'MUTED') setModAction('UNMUTE')
    else if (member.status === 'SUSPENDED') setModAction('UNSUSPEND')
    else if (member.status === 'BANNED') setModAction('UNBAN')
    else setModAction('MUTE')
    setIsModDialogOpen(true)
  }

  const handleApplyModeration = async () => {
    if (!modTargetMember) return
    const userId = modTargetMember.userId || modTargetMember.id
    try {
      await moderateMember({
        clubId,
        userId,
        data: {
          action: modAction,
          expiresInMs: modDurationMs > 0 ? modDurationMs : undefined,
          reason: modReason.trim() || undefined,
        },
      }).unwrap()
      successToast(`Moderation applied: ${modAction} on ${modTargetMember.user.name}`)
      setIsModDialogOpen(false)
    } catch (err) {
      errorToast('Failed to apply moderation', {
        description: err instanceof Error ? err.message : 'Please try again',
      })
    }
  }

  const handleOpenAssignCustomRole = (member: ClubMember) => {
    setRoleTargetMember(member)
    setSelectedCustomRoleId('none')
    setIsRoleDialogOpen(true)
  }

  const handleSaveCustomRole = async () => {
    if (!roleTargetMember) return
    const userId = roleTargetMember.userId || roleTargetMember.id
    try {
      await assignRole({
        clubId,
        userId,
        roleId: selectedCustomRoleId === 'none' ? null : selectedCustomRoleId,
      }).unwrap()
      successToast('Custom role assigned successfully')
      setIsRoleDialogOpen(false)
    } catch (err) {
      errorToast('Failed to assign custom role', {
        description: err instanceof Error ? err.message : 'Please try again',
      })
    }
  }

  const renderStatusBadge = (member: ClubMember) => {
    switch (member.status) {
      case 'MUTED':
        return (
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
            <VolumeX className="w-3 h-3 mr-1" />
            Muted
          </Badge>
        )
      case 'SUSPENDED':
        return (
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
            <PauseCircle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        )
      case 'BANNED':
        return (
          <Badge variant="destructive" className="bg-red-500/15 text-red-400 border-red-500/30">
            <Ban className="w-3 h-3 mr-1" />
            Banned
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
            Active
          </Badge>
        )
    }
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-md">
      <CardHeader>
        <CardTitle>Club Members ({members.length})</CardTitle>
        <CardDescription>
          Manage member status, assign system & custom roles, and enforce moderation policies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Base Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border/40">
                      <AvatarImage src={member.user.avatar || undefined} />
                      <AvatarFallback>
                        {member.user.name
                          ? member.user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                          : 'R'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{member.user.name || 'Rider'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {member.role === 'FOUNDER' ? (
                    <Badge className={roleColors.FOUNDER}>
                      <Crown className="w-3 h-3 mr-1" />
                      FOUNDER
                    </Badge>
                  ) : (
                    <Select
                      defaultValue={member.role}
                      onValueChange={(val) => onRoleChange(member.id, val)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(member.joinedAt)}
                </TableCell>
                <TableCell>{renderStatusBadge(member)}</TableCell>
                <TableCell className="text-right">
                  {member.role !== 'FOUNDER' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {customRoles.length > 0 && (
                          <DropdownMenuItem
                            onClick={() => handleOpenAssignCustomRole(member)}
                            className="gap-2"
                          >
                            <Shield className="w-4 h-4 text-primary" />
                            Assign Custom Role
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleOpenModeration(member)}
                          className="gap-2"
                        >
                          <ShieldAlert className="w-4 h-4 text-primary" />
                          Moderate Member
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive gap-2 focus:text-destructive"
                          onClick={() => onSelectForRemoval(member)}
                        >
                          <UserMinus className="w-4 h-4" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Moderation Dialog */}
      <Dialog open={isModDialogOpen} onOpenChange={setIsModDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <DialogTitle>Moderate Member</DialogTitle>
            </div>
            <DialogDescription>
              Apply disciplinary action to {modTargetMember?.user?.name || 'this member'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Disciplinary Action</Label>
              <Select
                value={modAction}
                onValueChange={(val: ModerationAction) => setModAction(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MUTE">
                    <div className="flex items-center gap-2">
                      <VolumeX className="w-4 h-4 text-primary" />
                      <span>Mute (Cannot post in club chat)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="UNMUTE">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span>Unmute</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="SUSPEND">
                    <div className="flex items-center gap-2">
                      <PauseCircle className="w-4 h-4 text-primary" />
                      <span>Suspend (Cannot RSVP or join club rides)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="UNSUSPEND">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-emerald-400" />
                      <span>Unsuspend</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="BAN">
                    <div className="flex items-center gap-2">
                      <Ban className="w-4 h-4 text-destructive" />
                      <span>Ban (Revoke all club access)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="UNBAN">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Unban</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {['MUTE', 'SUSPEND', 'BAN'].includes(modAction) && (
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={String(modDurationMs)}
                  onValueChange={(val) => setModDurationMs(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="mod-reason">Reason (for club audit log)</Label>
              <Input
                id="mod-reason"
                placeholder="e.g., Unsafe riding conduct on group ride"
                value={modReason}
                onChange={(e) => setModReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={modAction.startsWith('UN') ? 'default' : 'destructive'}
              onClick={handleApplyModeration}
              disabled={isModerating}
            >
              {isModerating ? 'Applying...' : `Confirm ${modAction}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Custom Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <DialogTitle>Assign Custom Role</DialogTitle>
            </div>
            <DialogDescription>
              Select a custom club role for {roleTargetMember?.user?.name || 'this member'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Custom Role</Label>
              <Select
                value={selectedCustomRoleId}
                onValueChange={setSelectedCustomRoleId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a custom role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Standard Member (No custom role)</SelectItem>
                  {customRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <span>{role.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCustomRole}>
              Save Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
