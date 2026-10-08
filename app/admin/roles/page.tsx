'use client'

import { useMemo, useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
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
  Shield,
  Plus,
  Trash2,
  Pencil,
  Lock,
  Loader2,
  RefreshCw,
  UserPlus,
  Crown,
  Eye,
  User,
  Star,
  KeyRound,
  AlertTriangle,
} from 'lucide-react'
import {
  useGetAdminRolesQuery,
  useGetAdminPermissionsQuery,
  useCreateAdminRoleMutation,
  useUpdateAdminRoleMutation,
  useDeleteAdminRoleMutation,
  useAssignUserRolesMutation,
  useLazyGetUsersQuery,
} from '@/features/admin/api'
import type { AdminRole, AdminUserRecord } from '@/entities/admin/model'
import { toast } from 'sonner'

// Red + neutrals only — the platform palette constraint.
const ROLE_COLORS = [
  '#ff1d2d', // primary red
  '#b3151f', // deep red
  '#EF4444', // red
  '#171717', // near-black
  '#525252', // neutral-600
  '#A3A3A3', // neutral-400
] as const

const ROLE_ICONS = [
  { value: 'shield', label: 'Shield', Icon: Shield },
  { value: 'crown', label: 'Crown', Icon: Crown },
  { value: 'key', label: 'Key', Icon: KeyRound },
  { value: 'eye', label: 'Eye', Icon: Eye },
  { value: 'star', label: 'Star', Icon: Star },
  { value: 'user', label: 'User', Icon: User },
] as const

const ROLE_SCOPES = ['GLOBAL', 'BUSINESS'] as const

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export default function AdminRolesPage() {
  const {
    data: rolesData,
    isLoading: rolesLoading,
    isFetching: rolesFetching,
    refetch: refetchRoles,
  } = useGetAdminRolesQuery()
  const { data: permissionsData, isLoading: permsLoading } =
    useGetAdminPermissionsQuery()
  const [createRole, { isLoading: isCreating }] = useCreateAdminRoleMutation()
  const [updateRole, { isLoading: isUpdating }] = useUpdateAdminRoleMutation()
  const [deleteRole, { isLoading: isDeleting }] = useDeleteAdminRoleMutation()
  const [assignRoles, { isLoading: isAssigning }] = useAssignUserRolesMutation()
  const [triggerFindByEmail] = useLazyGetUsersQuery()

  const roles = useMemo(() => rolesData?.roles ?? [], [rolesData])
  const permissions = useMemo(
    () => permissionsData?.permissions ?? [],
    [permissionsData],
  )

  const [search, setSearch] = useState('')

  // Create / edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [scope, setScope] = useState<string>('GLOBAL')
  const [color, setColor] = useState<string>(ROLE_COLORS[0])
  const [icon, setIcon] = useState<string>('shield')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<AdminRole | null>(null)

  // Assign-to-user drawer state
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignEmail, setAssignEmail] = useState('')
  const [foundUser, setFoundUser] = useState<AdminUserRecord | null>(null)
  const [lookingUp, setLookingUp] = useState(false)
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([])

  const filtered = useMemo(
    () =>
      roles.filter(
        (r) =>
          !search ||
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.slug.toLowerCase().includes(search.toLowerCase()),
      ),
    [roles, search],
  )

  const permissionsByCategory = useMemo(() => {
    const grouped: Record<string, typeof permissions> = {}
    for (const perm of permissions) {
      const cat = perm.category || 'General'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(perm)
    }
    return grouped
  }, [permissions])

  const systemCount = roles.filter((r) => r.isSystem).length
  const customCount = roles.length - systemCount

  const openCreate = () => {
    setEditingRole(null)
    setName('')
    setDescription('')
    setScope('GLOBAL')
    setColor(ROLE_COLORS[0])
    setIcon('shield')
    setSelectedPermissions([])
    setDialogOpen(true)
  }

  const openEdit = (role: AdminRole) => {
    setEditingRole(role)
    setName(role.name)
    setDescription(role.description ?? '')
    setScope(role.scope)
    setColor(role.color ?? ROLE_COLORS[0])
    setIcon(role.icon ?? 'shield')
    setSelectedPermissions(role.permissions.map((p) => p.code))
    setDialogOpen(true)
  }

  const togglePermission = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )
  }

  const toggleSlug = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Role name cannot be empty')
      return
    }
    try {
      if (editingRole) {
        await updateRole({
          roleId: editingRole.id,
          data: {
            name: name.trim(),
            description: description.trim(),
            color,
            icon,
            permissionCodes: selectedPermissions,
          },
        }).unwrap()
        toast.success('Role updated successfully')
      } else {
        const slug = slugify(name)
        if (!slug) {
          toast.error('Role name must contain at least one letter or number')
          return
        }
        await createRole({
          name: name.trim(),
          slug,
          description: description.trim() || undefined,
          scope,
          color,
          icon,
          permissionCodes: selectedPermissions,
        }).unwrap()
        toast.success('Role created successfully')
      }
      setDialogOpen(false)
    } catch {
      toast.error('Failed to save role')
    }
  }

  const confirmDelete = (role: AdminRole) => {
    if (role.isSystem) {
      toast.error('System roles cannot be deleted', {
        description: `"${role.name}" is a protected system role.`,
      })
      return
    }
    setRoleToDelete(role)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!roleToDelete) return
    if (roleToDelete.isSystem) {
      toast.error('System roles cannot be deleted')
      setDeleteOpen(false)
      return
    }
    try {
      await deleteRole(roleToDelete.id).unwrap()
      toast.success('Role deleted successfully')
      setDeleteOpen(false)
      setRoleToDelete(null)
    } catch {
      toast.error('Failed to delete role')
    }
  }

  const openAssign = () => {
    setAssignEmail('')
    setFoundUser(null)
    setSelectedSlugs([])
    setAssignOpen(true)
  }

  const handleLookup = async () => {
    if (!assignEmail.trim()) return
    setLookingUp(true)
    try {
      const res = await triggerFindByEmail({
        search: assignEmail.trim(),
        limit: 5,
      }).unwrap()
      const existing =
        res.items.find(
          (u: AdminUserRecord) =>
            u.email?.toLowerCase() === assignEmail.trim().toLowerCase(),
        ) ?? null
      if (!existing) {
        toast.error('No user found with that email address')
        setFoundUser(null)
        return
      }
      setFoundUser(existing)
    } catch {
      toast.error('Failed to look up user')
    } finally {
      setLookingUp(false)
    }
  }

  const handleAssign = async () => {
    if (!foundUser) return
    try {
      await assignRoles({
        userId: foundUser.id,
        roleSlugs: selectedSlugs,
      }).unwrap()
      toast.success(
        `Roles updated for ${foundUser.name ?? foundUser.email ?? 'user'}`,
      )
      setAssignOpen(false)
    } catch {
      toast.error('Failed to assign roles')
    }
  }

  const isSaving = isCreating || isUpdating
  const loading = rolesLoading || permsLoading
  const ActiveIcon =
    ROLE_ICONS.find((o) => o.value === icon)?.Icon ?? Shield

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <Shield className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roles.length}</p>
                <p className="text-sm text-muted-foreground">Total roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-100">
                <Lock className="w-5 h-5 text-neutral-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{systemCount}</p>
                <p className="text-sm text-muted-foreground">System roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{customCount}</p>
                <p className="text-sm text-muted-foreground">Custom roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <KeyRound className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{permissions.length}</p>
                <p className="text-sm text-muted-foreground">Permissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Manage global platform roles and assign them to users. System
                roles are protected and cannot be deleted.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchRoles()}
                disabled={rolesFetching}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${rolesFetching ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={openAssign} className="gap-1.5">
                <UserPlus className="w-4 h-4" /> Assign to user
              </Button>
              <Button size="sm" onClick={openCreate} className="gap-1.5">
                <Plus className="w-4 h-4" /> Create Role
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Input
              placeholder="Search by role name or slug…"
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
              <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                {search ? 'No roles match your search' : 'No roles yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Column headers */}
              <div className="hidden md:grid grid-cols-[1fr_110px_90px_220px_110px] gap-4 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Name</span>
                <span>Scope</span>
                <span>Users</span>
                <span>Permissions</span>
                <span className="text-right">Actions</span>
              </div>
              {filtered.map((role) => (
                <div
                  key={role.id}
                  className="grid gap-2 md:grid-cols-[1fr_110px_90px_220px_110px] md:gap-4 md:items-center p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: role.color ?? '#ff1d2d' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {role.name}
                        </p>
                        <Badge
                          variant={role.isSystem ? 'secondary' : 'outline'}
                          className="text-[10px] shrink-0"
                        >
                          {role.isSystem ? 'System' : 'Custom'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {role.slug}
                        {role.description ? ` — ${role.description}` : ''}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Badge variant="outline" className="text-[11px]">
                      {role.scope}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {role.userCount}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((p) => (
                      <Badge
                        key={p.code}
                        variant="outline"
                        className="text-[10px] bg-muted/30 font-normal truncate max-w-[130px]"
                      >
                        {p.name}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        +{role.permissions.length - 3} more
                      </Badge>
                    )}
                    {role.permissions.length === 0 && (
                      <span className="text-[11px] text-muted-foreground/60 italic">
                        No permissions
                      </span>
                    )}
                  </div>
                  <div className="flex items-center md:justify-end gap-1">
                    {role.isSystem ? (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Protected
                      </span>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(role)}
                          className="gap-1 h-8 px-2 text-xs"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(role)}
                          className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? `Edit Role: ${editingRole.name}` : 'Create Role'}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Update the role details and granted permissions.'
                : 'Define a new global role and grant it granular permissions.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  placeholder="e.g., Support Agent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {!editingRole && name.trim() && (
                  <p className="text-xs text-muted-foreground">
                    Slug: <span className="font-mono">{slugify(name)}</span>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Scope</Label>
                <Select
                  value={scope}
                  onValueChange={setScope}
                  disabled={!!editingRole}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_SCOPES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-desc">Description</Label>
              <Input
                id="role-desc"
                placeholder="What is this role for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Badge Color</Label>
                <div className="flex items-center gap-2 pt-1">
                  {ROLE_COLORS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setColor(preset)}
                      aria-label={`Color ${preset}`}
                      className="h-7 w-7 rounded-full border border-border transition-transform hover:scale-110"
                      style={{ backgroundColor: preset }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <ActiveIcon className="w-4 h-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_ICONS.map(({ value, label, Icon }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Granted Permissions
                </Label>
                <span className="text-xs text-muted-foreground">
                  {selectedPermissions.length} selected
                </span>
              </div>
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <div
                  key={category}
                  className="rounded-lg border border-border/40 bg-background/40 p-3 space-y-2.5"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    {category}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {perms.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.code)
                      return (
                        <div
                          key={perm.id}
                          className="flex items-start gap-2.5 p-1.5 rounded hover:bg-muted/30 cursor-pointer"
                          onClick={() => togglePermission(perm.code)}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => togglePermission(perm.code)}
                            className="mt-0.5"
                          />
                          <div className="space-y-0.5">
                            <p className="text-xs font-medium text-foreground">
                              {perm.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {perm.code}
                            </p>
                            {perm.description && (
                              <p className="text-[11px] text-muted-foreground">
                                {perm.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? 'Saving...'
                : editingRole
                  ? 'Update Role'
                  : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Delete Role</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete &quot;{roleToDelete?.name}&quot;?
              Users assigned to this role will lose its permissions. System
              roles cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign-to-user dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Roles to User</DialogTitle>
            <DialogDescription>
              Look up a user by email, then select the roles to grant. Saving
              replaces all of the user&apos;s current role assignments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="assign-email">User Email</Label>
              <div className="flex gap-2">
                <Input
                  id="assign-email"
                  placeholder="user@example.com"
                  value={assignEmail}
                  onChange={(e) => setAssignEmail(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={handleLookup}
                  disabled={!assignEmail.trim() || lookingUp}
                >
                  {lookingUp ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Find'
                  )}
                </Button>
              </div>
            </div>
            {foundUser && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg border">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-red-600 text-white text-xs">
                      {(foundUser.name ?? foundUser.email ?? 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {foundUser.name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {foundUser.email ?? '—'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {roles.map((role) => {
                    const checked = selectedSlugs.includes(role.slug)
                    return (
                      <div
                        key={role.id}
                        className="flex items-center gap-2.5 p-2 rounded hover:bg-muted/30 cursor-pointer"
                        onClick={() => toggleSlug(role.slug)}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleSlug(role.slug)}
                        />
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: role.color ?? '#ff1d2d',
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {role.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono truncate">
                            {role.slug} · {role.scope}
                          </p>
                        </div>
                        {role.isSystem && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-[10px] shrink-0"
                          >
                            System
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!foundUser || isAssigning}
              className="gap-1.5"
            >
              {isAssigning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Save Roles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
