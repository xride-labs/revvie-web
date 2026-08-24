import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckCircle, Edit, Eye, Trash2, XCircle } from 'lucide-react'
import { PhantomLoader } from '@/components/loading/phantom-loader'
import { initials } from '@/shared/lib/initials'
import type { AdminUserRecord } from '@/entities/admin/model'
import type { Pagination } from '@/entities/shared/model'
import { hasPrivilegedAdminRole } from '../_lib/constants'

export function UserTable({
  users,
  isLoading,
  error,
  isSuperAdmin,
  pagination,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: {
  users: AdminUserRecord[]
  isLoading: boolean
  error: string | null
  isSuperAdmin: boolean
  pagination: Pagination
  onPageChange: (updater: (page: number) => number) => void
  onView: (userId: string) => void
  onEdit: (userId: string) => void
  onDelete: (userId: string, name: string | null, roles: string[]) => void
}) {
  const blockedTitle = 'Only super admins can modify admin or co-admin accounts.'

  return (
    <>
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
                const canManageTarget = isSuperAdmin || !hasPrivilegedAdminRole(user.roles)

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs">
                            {initials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email || 'No email'}
                          </p>
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
                      <Badge
                        variant={user.status === 'active' ? 'default' : 'secondary'}
                        className="gap-1"
                      >
                        {user.status === 'active' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {user.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.ridesCompleted || 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => onView(user.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={!canManageTarget}
                          title={!canManageTarget ? blockedTitle : undefined}
                          onClick={() => onEdit(user.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={!canManageTarget}
                          title={!canManageTarget ? blockedTitle : undefined}
                          onClick={() => onDelete(user.id, user.name, user.roles)}
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
            onClick={() => onPageChange((page) => page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange((page) => page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  )
}
