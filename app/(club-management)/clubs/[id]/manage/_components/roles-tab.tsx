'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  useGetClubRolesQuery,
  useGetClubPermissionsQuery,
  useCreateClubRoleMutation,
  useUpdateClubRoleMutation,
  useDeleteClubRoleMutation,
} from '@/features/clubs/api'
import type { ClubRole, ClubPermission } from '@/features/clubs/schemas'
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Check,
  AlertTriangle,
} from 'lucide-react'

interface RolesTabProps {
  clubId: string
}

const PRESET_COLORS = [
  '#EF4444', // Red
  '#ff1d2d', // Orange
  '#ff1d2d', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
]

export function RolesTab({ clubId }: RolesTabProps) {
  const { data: rolesData, isLoading: rolesLoading } = useGetClubRolesQuery(clubId)
  const { data: permissionsData, isLoading: permsLoading } = useGetClubPermissionsQuery(clubId)
  const [createRole, { isLoading: isCreating }] = useCreateClubRoleMutation()
  const [updateRole, { isLoading: isUpdating }] = useUpdateClubRoleMutation()
  const [deleteRole, { isLoading: isDeleting }] = useDeleteClubRoleMutation()
  const { success: successToast, error: errorToast } = useToast()

  const roles = rolesData?.roles || []
  const permissions = permissionsData?.permissions || []

  // Create / Edit Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<ClubRole | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#EF4444')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<ClubRole | null>(null)

  const handleOpenCreate = () => {
    setEditingRole(null)
    setName('')
    setDescription('')
    setColor('#EF4444')
    setSelectedPermissions([])
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (role: ClubRole) => {
    setEditingRole(role)
    setName(role.name)
    setDescription(role.description || '')
    setColor(role.color || '#EF4444')
    const activePermCodes = role.permissions
      .map((p) => p.permission?.code)
      .filter((c): c is string => Boolean(c))
    setSelectedPermissions(activePermCodes)
    setIsDialogOpen(true)
  }

  const togglePermission = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )
  }

  const handleSaveRole = async () => {
    if (!name.trim()) {
      errorToast('Role name cannot be empty')
      return
    }

    try {
      if (editingRole) {
        await updateRole({
          clubId,
          roleId: editingRole.id,
          data: {
            name: name.trim(),
            description: description.trim(),
            color,
            permissionCodes: selectedPermissions,
          },
        }).unwrap()
        successToast('Role updated successfully')
      } else {
        await createRole({
          clubId,
          data: {
            name: name.trim(),
            description: description.trim(),
            color,
            permissionCodes: selectedPermissions,
          },
        }).unwrap()
        successToast('Role created successfully')
      }
      setIsDialogOpen(false)
    } catch (err) {
      errorToast('Failed to save role', {
        description: err instanceof Error ? err.message : 'Please try again',
      })
    }
  }

  const handleDeleteRole = async () => {
    if (!roleToDelete) return
    try {
      await deleteRole({ clubId, roleId: roleToDelete.id }).unwrap()
      successToast('Role deleted successfully')
      setIsDeleteDialogOpen(false)
      setRoleToDelete(null)
    } catch (err) {
      errorToast('Failed to delete role', {
        description: err instanceof Error ? err.message : 'Please try again',
      })
    }
  }

  // Group available permissions by category
  const permissionsByCategory = permissions.reduce<Record<string, ClubPermission[]>>(
    (acc, perm) => {
      const cat = perm.category || 'General'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(perm)
      return acc
    },
    {},
  )

  const isSaving = isCreating || isUpdating

  if (rolesLoading || permsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Club Roles & Permissions</CardTitle>
              </div>
              <CardDescription>
                Define officer hierarchies, assign granular permissions, and customize role badges
              </CardDescription>
            </div>
            <Button onClick={handleOpenCreate} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create Custom Role
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => {
              const activePermCount = role.permissions.length
              return (
                <div
                  key={role.id}
                  className="flex flex-col justify-between rounded-xl border border-border/50 bg-background/50 p-4 transition-all hover:border-border/80"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: role.color }}
                        />
                        <span className="font-semibold text-sm truncate text-foreground">
                          {role.name}
                        </span>
                      </div>
                      <Badge
                        variant={role.isSystem ? 'secondary' : 'outline'}
                        className="text-[10px] shrink-0"
                      >
                        {role.isSystem ? 'System' : 'Custom'}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                      {role.description || 'No description configured for this role.'}
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-medium text-muted-foreground">
                        Permissions ({activePermCount}):
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {role.permissions.slice(0, 4).map((p, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-[10px] bg-muted/30 font-normal truncate max-w-[130px]"
                          >
                            {p.permission?.name || 'Permission'}
                          </Badge>
                        ))}
                        {activePermCount > 4 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            +{activePermCount - 4} more
                          </Badge>
                        )}
                        {activePermCount === 0 && (
                          <span className="text-[11px] text-muted-foreground/60 italic">
                            No active permissions
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-4 mt-2 border-t border-border/40">
                    {role.isSystem ? (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Protected
                      </span>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(role)}
                          className="gap-1 h-8 px-2 text-xs"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setRoleToDelete(role)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Role Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? `Edit Role: ${editingRole.name}` : 'Create Custom Role'}
            </DialogTitle>
            <DialogDescription>
              Assign permissions to grant members authority within this club
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  placeholder="e.g., Road Captain, Safety Officer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Badge Color</Label>
                <div className="flex items-center gap-2 pt-1">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setColor(preset)}
                      className="h-7 w-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{ backgroundColor: preset }}
                    >
                      {color === preset && (
                        <Check className="h-3.5 w-3.5 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-8 w-12 p-0.5 border-none cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-desc">Description</Label>
              <Input
                id="role-desc"
                placeholder="What responsibilities does this role carry?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Granted Permissions</Label>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole} disabled={isSaving}>
              {isSaving ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Delete Role</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete &quot;{roleToDelete?.name}&quot;? Any members
              assigned to this role will be demoted to standard member status.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRole}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
