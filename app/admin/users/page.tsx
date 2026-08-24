'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/features/admin/api'
import { useAuth, hasAnyRole } from '@/lib/use-auth'

import {
  EMPTY_FORM,
  NON_PRIVILEGED_ROLE_OPTIONS,
  ROLE_OPTIONS,
  hasPrivilegedAdminRole,
  normalizeRolesForForm,
  type RoleOption,
  type UserFormData,
} from './_lib/constants'
import { UserStats } from './_components/user-stats'
import { UserFilters } from './_components/user-filters'
import { UserTable } from './_components/user-table'
import { UserDetailDialog } from './_components/user-detail-dialog'
import { CreateUserDialog } from './_components/create-user-dialog'
import { EditUserDialog } from './_components/edit-user-dialog'

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const isSuperAdmin = hasAnyRole(currentUser, 'ADMIN')
  const assignableRoleOptions: readonly RoleOption[] = isSuperAdmin
    ? ROLE_OPTIONS
    : NON_PRIVILEGED_ROLE_OPTIONS

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  // Debounced so a search keystroke doesn't fire a request on every character.
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [form, setForm] = useState<UserFormData>(EMPTY_FORM)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, roleFilter, statusFilter])

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: 50,
      ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
      ...(statusFilter !== 'all' ? { status: statusFilter as 'active' | 'pending' } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [currentPage, roleFilter, statusFilter, debouncedSearch],
  )

  const { data, isLoading, isError } = useGetUsersQuery(queryParams)
  const [createUserMutation, { isLoading: creating }] = useCreateUserMutation()
  const [updateUserMutation, { isLoading: updating }] = useUpdateUserMutation()
  const [deleteUserMutation] = useDeleteUserMutation()

  const users = useMemo(() => data?.items ?? [], [data])
  const pagination = data?.pagination ?? { page: 1, limit: 50, total: 0, totalPages: 1 }
  const error = isError ? 'Failed to load users' : null
  const saving = creating || updating

  const {
    data: selectedUserDetails,
    isFetching: detailsLoading,
    isError: detailsIsError,
  } = useGetUserByIdQuery(selectedUserId ?? '', {
    skip: !isViewDialogOpen || !selectedUserId,
  })
  const detailsError = detailsIsError ? 'Failed to load user details' : null

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId],
  )

  const stats = {
    total: pagination.total || users.length,
    active: users.filter((u) => u.status === 'active').length,
    pending: users.filter((u) => u.status === 'pending').length,
  }

  function openCreateDialog() {
    setForm(EMPTY_FORM)
    setIsCreateDialogOpen(true)
  }

  function openEditDialog(userId: string) {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    if (!isSuperAdmin && hasPrivilegedAdminRole(user.roles)) {
      alert('Only super admins can edit admins and co-admins.')
      return
    }

    setSelectedUserId(user.id)
    setForm({
      email: user.email ?? '',
      password: '',
      name: user.name ?? '',
      username: user.username ?? '',
      phone: user.phone ?? '',
      bio: user.bio ?? '',
      location: user.location ?? '',
      roles: normalizeRolesForForm(user.roles),
    })
    setIsEditDialogOpen(true)
  }

  async function handleCreateUser() {
    if (!form.email || !form.password) return

    if (!isSuperAdmin && hasPrivilegedAdminRole(form.roles)) {
      alert('Only super admins can assign ADMIN or CO_ADMIN roles.')
      return
    }

    await createUserMutation({
      email: form.email,
      password: form.password,
      name: form.name || undefined,
      username: form.username || undefined,
      phone: form.phone || undefined,
      bio: form.bio || undefined,
      location: form.location || undefined,
      roles: form.roles,
    }).unwrap()
    setIsCreateDialogOpen(false)
    setForm(EMPTY_FORM)
  }

  async function handleEditUser() {
    if (!selectedUserId) return

    if (!isSuperAdmin && hasPrivilegedAdminRole(form.roles)) {
      alert('Only super admins can assign ADMIN or CO_ADMIN roles.')
      return
    }

    await updateUserMutation({
      userId: selectedUserId,
      data: {
        email: form.email || undefined,
        name: form.name || undefined,
        username: form.username || undefined,
        phone: form.phone || null,
        bio: form.bio || null,
        location: form.location || null,
        roles: form.roles,
      },
    }).unwrap()
    setIsEditDialogOpen(false)
  }

  async function handleDeleteUser(userId: string, name: string | null, roles: string[]) {
    if (!isSuperAdmin && hasPrivilegedAdminRole(roles)) {
      alert('Only super admins can delete admins and co-admins.')
      return
    }

    if (!confirm(`Delete ${name || 'this user'} permanently?`)) return
    await deleteUserMutation(userId)
  }

  return (
    <div className="space-y-6">
      <UserStats stats={stats} />

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Create, inspect, and fully edit user profiles
              </CardDescription>
              {!isSuperAdmin ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Super-admin roles (ADMIN / CO_ADMIN) are restricted.
                </p>
              ) : null}
            </div>
            <Button size="sm" onClick={openCreateDialog}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <UserFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          <UserTable
            users={users}
            isLoading={isLoading}
            error={error}
            isSuperAdmin={isSuperAdmin}
            pagination={pagination}
            onPageChange={setCurrentPage}
            onView={(userId) => {
              setSelectedUserId(userId)
              setIsViewDialogOpen(true)
            }}
            onEdit={openEditDialog}
            onDelete={handleDeleteUser}
          />
        </CardContent>
      </Card>

      <UserDetailDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        loading={detailsLoading}
        error={detailsError}
        details={selectedUserDetails}
        fallbackUser={selectedUser}
      />

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        form={form}
        setForm={setForm}
        roleOptions={assignableRoleOptions}
        saving={saving}
        onCreate={handleCreateUser}
      />

      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        form={form}
        setForm={setForm}
        roleOptions={assignableRoleOptions}
        saving={saving}
        onSave={handleEditUser}
      />
    </div>
  )
}
