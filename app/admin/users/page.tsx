'use client'

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Search, UserPlus, Loader2, CheckCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react'
import { useAdminUsers } from '@/store/features/admin'
import { useAuth, hasAnyRole } from '@/lib/use-auth'
import { PhantomLoader } from '@/components/loading/phantom-loader'
import { adminApi, type AdminUserDetails } from '@/lib/server/admin'

const ROLE_OPTIONS = ['ADMIN', 'CO_ADMIN', 'CLUB_OWNER', 'RIDER'] as const

type RoleOption = (typeof ROLE_OPTIONS)[number]

const PROTECTED_ROLE_OPTIONS: RoleOption[] = ['ADMIN', 'CO_ADMIN']
const NON_PRIVILEGED_ROLE_OPTIONS: RoleOption[] = ['CLUB_OWNER', 'RIDER']

function hasPrivilegedAdminRole(roles: readonly string[]): boolean {
    return roles.some((role) => PROTECTED_ROLE_OPTIONS.includes(role as RoleOption))
}

function normalizeRolesForForm(roles: readonly string[]): RoleOption[] {
    const normalized = roles.filter((role): role is RoleOption =>
        ROLE_OPTIONS.includes(role as RoleOption),
    )
    return normalized.length ? normalized : ['RIDER']
}

type UserFormData = {
    email: string
    password: string
    name: string
    username: string
    phone: string
    bio: string
    location: string
    roles: RoleOption[]
}

const EMPTY_FORM: UserFormData = {
    email: '',
    password: '',
    name: '',
    username: '',
    phone: '',
    bio: '',
    location: '',
    roles: ['RIDER'],
}

export default function AdminUsersPage() {
    const {
        users,
        isLoading,
        error,
        pagination,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
    } = useAdminUsers()
    const { user: currentUser } = useAuth()
    const isSuperAdmin = hasAnyRole(currentUser, 'ADMIN')
    const assignableRoleOptions: readonly RoleOption[] = isSuperAdmin
        ? ROLE_OPTIONS
        : NON_PRIVILEGED_ROLE_OPTIONS

    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [currentPage, setCurrentPage] = useState(1)

    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [selectedUserDetails, setSelectedUserDetails] = useState<AdminUserDetails | null>(null)
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [detailsError, setDetailsError] = useState<string | null>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<UserFormData>(EMPTY_FORM)

    useEffect(() => {
        const params: Record<string, string | number> = { page: currentPage, limit: 50 }
        if (roleFilter !== 'all') params.role = roleFilter
        if (statusFilter !== 'all') params.status = statusFilter
        if (searchQuery.trim()) params.search = searchQuery.trim()
        fetchUsers(params)
    }, [roleFilter, statusFilter, currentPage, fetchUsers, searchQuery])

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (currentPage === 1) {
                const params: Record<string, string | number> = { page: 1, limit: 50 }
                if (roleFilter !== 'all') params.role = roleFilter
                if (statusFilter !== 'all') params.status = statusFilter
                if (searchQuery.trim()) params.search = searchQuery.trim()
                fetchUsers(params)
            } else {
                setCurrentPage(1)
            }
        }, 350)

        return () => clearTimeout(timeout)
    }, [searchQuery, roleFilter, statusFilter, currentPage, fetchUsers])

    const selectedUser = useMemo(
        () => users.find((user) => user.id === selectedUserId) ?? null,
        [users, selectedUserId],
    )

    useEffect(() => {
        if (!isViewDialogOpen || !selectedUserId) return
        let isMounted = true
        setDetailsLoading(true)
        setDetailsError(null)
        adminApi
            .getUserById(selectedUserId)
            .then((data) => {
                if (!isMounted) return
                setSelectedUserDetails(data)
            })
            .catch((err) => {
                if (!isMounted) return
                setDetailsError(err instanceof Error ? err.message : 'Failed to load user details')
            })
            .finally(() => {
                if (!isMounted) return
                setDetailsLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [isViewDialogOpen, selectedUserId])

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

        try {
            setSaving(true)
            await createUser({
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
        } finally {
            setSaving(false)
        }
    }

    async function handleEditUser() {
        if (!selectedUserId) return

        if (!isSuperAdmin && hasPrivilegedAdminRole(form.roles)) {
            alert('Only super admins can assign ADMIN or CO_ADMIN roles.')
            return
        }

        try {
            setSaving(true)
            await updateUser(selectedUserId, {
                email: form.email || undefined,
                name: form.name || undefined,
                username: form.username || undefined,
                phone: form.phone || null,
                bio: form.bio || null,
                location: form.location || null,
                roles: form.roles,
            }).unwrap()
            setIsEditDialogOpen(false)
        } finally {
            setSaving(false)
        }
    }

    async function handleDeleteUser(userId: string, name: string | null, roles: string[]) {
        if (!isSuperAdmin && hasPrivilegedAdminRole(roles)) {
            alert('Only super admins can delete admins and co-admins.')
            return
        }

        if (!confirm(`Delete ${name || 'this user'} permanently?`)) return
        await deleteUser(userId)
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                        <p className="text-sm text-muted-foreground">Active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                        <p className="text-sm text-muted-foreground">Pending Verification</p>
                    </CardContent>
                </Card>
            </div>

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
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users by name, username or email"
                                className="pl-9"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {ROLE_OPTIONS.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Rides</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="w-32">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-0">
                                            <PhantomLoader loading>
                                                <div className="divide-y">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className="flex items-center gap-4 px-4 py-3">
                                                            <div className="w-8 h-8 rounded-full bg-muted" />
                                                            <div className="flex-1 space-y-1">
                                                                <div className="h-4 w-32 bg-muted rounded" />
                                                                <div className="h-3 w-48 bg-muted rounded" />
                                                            </div>
                                                            <div className="h-5 w-16 bg-muted rounded" />
                                                            <div className="h-4 w-12 bg-muted rounded" />
                                                            <div className="h-4 w-20 bg-muted rounded" />
                                                            <div className="h-8 w-24 bg-muted rounded" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </PhantomLoader>
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-destructive">
                                            {error}
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => {
                                        const canManageTarget =
                                            isSuperAdmin || !hasPrivilegedAdminRole(user.roles)
                                        const blockedTitle =
                                            'Only super admins can modify admin or co-admin accounts.'

                                        return (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className="text-xs">
                                                                {(user.name || 'U')
                                                                    .split(' ')
                                                                    .map((part) => part[0])
                                                                    .join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{user.name || 'Unknown'}</p>
                                                            <p className="text-xs text-muted-foreground">{user.email || 'No email'}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.map((role) => (
                                                            <Badge key={role} variant="outline">
                                                                {role}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="gap-1">
                                                        {user.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                        {user.status || 'pending'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{user.ridesCompleted || 0}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setSelectedUserId(user.id)
                                                                setSelectedUserDetails(null)
                                                                setIsViewDialogOpen(true)
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            disabled={!canManageTarget}
                                                            title={!canManageTarget ? blockedTitle : undefined}
                                                            onClick={() => openEditDialog(user.id)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            disabled={!canManageTarget}
                                                            title={!canManageTarget ? blockedTitle : undefined}
                                                            onClick={() =>
                                                                handleDeleteUser(user.id, user.name, user.roles)
                                                            }
                                                        >
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                            Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page <= 1}
                                onClick={() => setCurrentPage((page) => page - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page >= pagination.totalPages}
                                onClick={() => setCurrentPage((page) => page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="shrink-0">
                        <DialogTitle>User Profile</DialogTitle>
                        <DialogDescription>Complete user profile details</DialogDescription>
                    </DialogHeader>
                    {detailsLoading ? (
                        <div className="text-sm text-muted-foreground">Loading user details...</div>
                    ) : detailsError ? (
                        <div className="text-sm text-destructive">{detailsError}</div>
                    ) : selectedUserDetails ? (
                        <div className="space-y-6 text-sm overflow-y-auto pr-1">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Profile</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Name" value={selectedUserDetails.name} />
                                    <DetailItem label="Username" value={selectedUserDetails.username} />
                                    <DetailItem label="Email" value={selectedUserDetails.email} />
                                    <DetailItem label="Phone" value={selectedUserDetails.phone} />
                                    <DetailItem label="Location" value={selectedUserDetails.location} />
                                    <DetailItem label="Bio" value={selectedUserDetails.bio} />
                                    <DetailItem label="DOB" value={selectedUserDetails.dob} />
                                    <DetailItem label="Blood Type" value={selectedUserDetails.bloodType} />
                                    <DetailItem label="Subscription" value={selectedUserDetails.subscriptionTier} />
                                    <DetailItem label="Onboarding" value={selectedUserDetails.onboardingCompleted ? 'Completed' : 'Incomplete'} />
                                </div>
                                <div className="mt-3">
                                    <p className="text-muted-foreground mb-1">Roles</p>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedUserDetails.roles.map((role) => (
                                            <Badge key={role} variant="outline">
                                                {role}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Activity & Stats</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="XP" value={selectedUserDetails.xpPoints?.toString()} />
                                    <DetailItem label="Level" value={`${selectedUserDetails.level} · ${selectedUserDetails.levelTitle}`} />
                                    <DetailItem label="Reputation" value={selectedUserDetails.reputationScore?.toFixed?.(2)} />
                                    <DetailItem label="Rides Completed" value={selectedUserDetails.rideStats?.totalRides?.toString()} />
                                    <DetailItem label="Total Distance (km)" value={selectedUserDetails.rideStats?.totalDistanceKm?.toString()} />
                                    <DetailItem label="Longest Ride (km)" value={selectedUserDetails.rideStats?.longestRideKm?.toString()} />
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Preferences</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Units" value={selectedUserDetails.preferences?.units} />
                                    <DetailItem label="Dark Mode" value={selectedUserDetails.preferences?.darkMode ? 'On' : 'Off'} />
                                    <DetailItem label="Ride Reminders" value={selectedUserDetails.preferences?.rideReminders ? 'On' : 'Off'} />
                                    <DetailItem label="Service Reminder (km)" value={selectedUserDetails.preferences?.serviceReminderKm?.toString()} />
                                    <DetailItem label="Profile Visibility" value={selectedUserDetails.preferences?.profileVisibility} />
                                    <DetailItem label="Open to Invite" value={selectedUserDetails.preferences?.openToInvite ? 'Yes' : 'No'} />
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Notifications</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Push" value={selectedUserDetails.preferences?.pushNotifications ? 'On' : 'Off'} />
                                    <DetailItem label="Email" value={selectedUserDetails.preferences?.emailNotifications ? 'On' : 'Off'} />
                                    <DetailItem label="SMS" value={selectedUserDetails.preferences?.smsNotifications ? 'On' : 'Off'} />
                                    <DetailItem label="Unread" value={selectedUserDetails.unreadNotifications.toString()} />
                                    <DetailItem label="Total" value={selectedUserDetails.counts.notifications.toString()} />
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Safety</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Helmet Verified" value={selectedUserDetails.helmetVerified ? 'Yes' : 'No'} />
                                    <DetailItem label="Last Safety Check" value={selectedUserDetails.lastSafetyCheck} />
                                </div>
                                <div className="mt-3">
                                    <p className="text-muted-foreground mb-1">Emergency Contacts</p>
                                    {selectedUserDetails.emergencyContacts.length ? (
                                        <div className="space-y-2">
                                            {selectedUserDetails.emergencyContacts.map((contact) => (
                                                <div key={contact.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                                                    <div>
                                                        <p className="font-medium">
                                                            {contact.name}
                                                            {contact.isPrimary ? ' (Primary)' : ''}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {contact.relationship || 'Contact'}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">No emergency contacts</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Badges</p>
                                {selectedUserDetails.badges.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUserDetails.badges.map((entry) => (
                                            <Badge key={`${entry.badge.id}-${entry.earnedAt}`} variant="secondary">
                                                {entry.badge.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">No badges earned</p>
                                )}
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Counts</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Posts" value={selectedUserDetails.counts.posts.toString()} />
                                    <DetailItem label="Comments" value={selectedUserDetails.counts.comments.toString()} />
                                    <DetailItem label="Followers" value={selectedUserDetails.counts.followers.toString()} />
                                    <DetailItem label="Following" value={selectedUserDetails.counts.following.toString()} />
                                    <DetailItem label="Created Rides" value={selectedUserDetails.counts.createdRides.toString()} />
                                    <DetailItem label="Created Clubs" value={selectedUserDetails.counts.createdClubs.toString()} />
                                    <DetailItem label="Marketplace Listings" value={selectedUserDetails.counts.marketplaceListings.toString()} />
                                    <DetailItem label="Club Memberships" value={selectedUserDetails.counts.clubMemberships.toString()} />
                                </div>
                            </div>
                        </div>
                    ) : selectedUser ? (
                        <div className="text-sm text-muted-foreground">
                            No details loaded for {selectedUser.name || selectedUser.email || 'user'}.
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add User</DialogTitle>
                        <DialogDescription>Create a user and assign initial roles</DialogDescription>
                    </DialogHeader>
                    <UserForm
                        form={form}
                        setForm={setForm}
                        includePassword
                        roleOptions={assignableRoleOptions}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateUser} disabled={saving || !form.email || !form.password}>
                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Create User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Edit profile, contact, and role details</DialogDescription>
                    </DialogHeader>
                    <UserForm
                        form={form}
                        setForm={setForm}
                        roleOptions={assignableRoleOptions}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditUser} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function UserForm({
    form,
    setForm,
    includePassword = false,
    roleOptions,
}: {
    form: UserFormData
    setForm: Dispatch<SetStateAction<UserFormData>>
    includePassword?: boolean
    roleOptions: readonly RoleOption[]
}) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <Input
                    placeholder="Name"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <Input
                    placeholder="Username"
                    value={form.username}
                    onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                />
                <Input
                    placeholder="Email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                />
                <Input
                    placeholder="Phone"
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
                <Input
                    placeholder="Location"
                    value={form.location}
                    onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                />
                <Input
                    placeholder="Bio"
                    value={form.bio}
                    onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                />
            </div>
            {includePassword ? (
                <Input
                    type="password"
                    placeholder="Temporary Password"
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                />
            ) : null}
            <div>
                <p className="text-sm font-medium mb-2">Roles</p>
                <div className="grid grid-cols-2 gap-2">
                    {roleOptions.map((role) => (
                        <label key={role} className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={form.roles.includes(role)}
                                onCheckedChange={() => {
                                    setForm((prev) => {
                                        const exists = prev.roles.includes(role)
                                        if (exists) {
                                            const nextRoles = prev.roles.filter((r) => r !== role)
                                            return { ...prev, roles: nextRoles.length ? nextRoles : ['RIDER'] }
                                        }
                                        return { ...prev, roles: [...prev.roles, role] }
                                    })
                                }}
                            />
                            {role}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    )
}

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-medium">{value && value !== '' ? value : 'N/A'}</p>
        </div>
    )
}
