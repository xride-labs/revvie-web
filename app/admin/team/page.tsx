'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  UserCog,
  Shield,
  Users,
  Eye,
  Loader2,
  RefreshCw,
  UserPlus,
  Trash2,
} from 'lucide-react'
import { adminApi, type AdminUserRecord } from '@/lib/server/admin'
import { toast } from 'sonner'

const TEAM_ROLES = ['ADMIN', 'CO_ADMIN', 'MODERATOR'] as const
type TeamRole = typeof TEAM_ROLES[number]

const ROLE_META: Record<TeamRole, { label: string; description: string; color: string; icon: React.ElementType }> = {
  ADMIN:     { label: 'Admin',         description: 'Full platform access including settings and destructive actions', color: 'bg-red-100 text-red-700', icon: Shield },
  CO_ADMIN:  { label: 'Co-Admin',      description: 'Full access except settings and monitoring', color: 'bg-orange-100 text-orange-700', icon: UserCog },
  MODERATOR: { label: 'Moderator',     description: 'Can manage approvals, reports and user flags', color: 'bg-blue-100 text-blue-700', icon: Eye },
}

export default function AdminTeamPage() {
  const [members, setMembers]     = useState<AdminUserRecord[]>([])
  const [loading, setLoading]     = useState(true)
  const [actionId, setActionId]   = useState<string | null>(null)
  const [addOpen, setAddOpen]     = useState(false)
  const [search, setSearch]       = useState('')
  const [addEmail, setAddEmail]   = useState('')
  const [addRole, setAddRole]     = useState<TeamRole>('CO_ADMIN')
  const [addName, setAddName]     = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.getUsers({ limit: 200 })
      setMembers(res.items.filter((u) =>
        u.roles?.some((r) => TEAM_ROLES.includes(r as TeamRole))
      ))
    } catch {
      toast.error('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = members.filter((m) =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase())
  )

  const removeRole = async (userId: string, role: string) => {
    if (!confirm(`Remove ${role} role from this user?`)) return
    setActionId(userId)
    try {
      await adminApi.updateUserRole(userId, 'RIDER')
      toast.success('Role removed — user downgraded to Rider')
      await load()
    } catch {
      toast.error('Failed to remove role')
    } finally {
      setActionId(null)
    }
  }

  const handleAdd = async () => {
    if (!addEmail.trim()) return
    setActionId('add')
    try {
      // Find existing user by email via getUsers, then update role
      const res = await adminApi.getUsers({ search: addEmail.trim(), limit: 5 })
      const existing = res.items.find((u: AdminUserRecord) => u.email?.toLowerCase() === addEmail.trim().toLowerCase())
      if (!existing) {
        toast.error('No user found with that email address')
        return
      }
      await adminApi.updateUserRole(existing.id, addRole)
      toast.success(`${existing.name ?? existing.email} granted ${ROLE_META[addRole].label} access`)
      setAddOpen(false)
      setAddEmail('')
      setAddName('')
      await load()
    } catch {
      toast.error('Failed to add team member')
    } finally {
      setActionId(null)
    }
  }

  const totalByRole = (role: TeamRole) => members.filter((m) => m.roles?.includes(role)).length

  return (
    <div className="space-y-6">
      {/* Role summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {TEAM_ROLES.map((role) => {
          const meta = ROLE_META[role]
          const Icon = meta.icon
          return (
            <Card key={role}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${meta.color.replace('text-', 'bg-').replace('-700', '-100').replace('-800', '-100')}`}>
                    <Icon className={`w-5 h-5 ${meta.color.split(' ')[1]}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalByRole(role)}</p>
                    <p className="text-sm text-muted-foreground">{meta.label}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Admin Team</CardTitle>
              <CardDescription>Manage who can access the admin panel and their permission level</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
                <UserPlus className="w-4 h-4" /> Add Member
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-4"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{search ? 'No members match your search' : 'No admin team members yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((member) => {
                const teamRoles = (member.roles ?? []).filter((r): r is TeamRole => TEAM_ROLES.includes(r as TeamRole))
                const highestRole = teamRoles.find((r) => r === 'ADMIN') ?? teamRoles.find((r) => r === 'CO_ADMIN') ?? teamRoles[0]
                const meta = highestRole ? ROLE_META[highestRole] : null
                return (
                  <div key={member.id} className="flex items-center gap-4 p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-red-600 text-white text-sm">
                        {(member.name ?? member.email ?? 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{member.name ?? 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.email ?? '—'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {teamRoles.map((role) => (
                        <Badge key={role} className={ROLE_META[role].color}>{ROLE_META[role].label}</Badge>
                      ))}
                    </div>
                    {highestRole && highestRole !== 'ADMIN' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        disabled={!!actionId}
                        onClick={() => removeRole(member.id, highestRole)}
                      >
                        {actionId === member.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role descriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permission Levels</CardTitle>
          <CardDescription>What each role can do in the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TEAM_ROLES.map((role) => {
              const meta = ROLE_META[role]
              const Icon = meta.icon
              return (
                <div key={role} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Badge className={`${meta.color} shrink-0 mt-0.5`}>{meta.label}</Badge>
                  <p className="text-sm text-muted-foreground">{meta.description}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add member dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Grant admin portal access to an existing user by their email address.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-email">User Email</Label>
              <Input
                id="add-email"
                placeholder="user@example.com"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Must already have an account on Zoomies</p>
            </div>
            <div className="space-y-1.5">
              <Label>Permission Level</Label>
              <Select value={addRole} onValueChange={(v) => setAddRole(v as TeamRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_ROLES.filter((r) => r !== 'ADMIN').map((role) => (
                    <SelectItem key={role} value={role}>
                      <div>
                        <p className="font-medium">{ROLE_META[role].label}</p>
                        <p className="text-xs text-muted-foreground">{ROLE_META[role].description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!addEmail.trim() || actionId === 'add'} className="gap-1.5">
              {actionId === 'add' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
