'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Bell,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  Users,
  MessageSquare,
  ShoppingBag,
  Heart,
  UserPlus,
  Megaphone,
  CalendarCheck,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react'
import { adminApi, type AdminNotificationRecord } from '@/lib/server/admin'
import { PhantomLoader } from '@/components/loading/phantom-loader'

const TYPE_ICON: Record<string, { icon: LucideIcon; color: string }> = {
  RIDE_INVITE:          { icon: MapPin,        color: 'text-blue-500' },
  RIDE_JOIN_REQUEST:    { icon: MapPin,        color: 'text-amber-500' },
  RIDE_JOIN_ACCEPTED:   { icon: CalendarCheck, color: 'text-green-500' },
  RIDE_REMINDER:        { icon: Clock,         color: 'text-blue-400' },
  RIDE_CANCELLED:       { icon: AlertTriangle, color: 'text-red-500' },
  CLUB_INVITE:          { icon: Users,         color: 'text-purple-500' },
  CLUB_JOIN_REQUEST:    { icon: Users,         color: 'text-amber-500' },
  CLUB_JOIN_ACCEPTED:   { icon: Users,         color: 'text-green-500' },
  CLUB_ANNOUNCEMENT:    { icon: Megaphone,     color: 'text-amber-500' },
  MARKETPLACE_MESSAGE:  { icon: ShoppingBag,   color: 'text-indigo-500' },
  LISTING_SOLD:         { icon: ShoppingBag,   color: 'text-green-500' },
  LISTING_OFFER:        { icon: ShoppingBag,   color: 'text-blue-500' },
  LISTING_INTERESTED:   { icon: ShoppingBag,   color: 'text-amber-500' },
  MESSAGE:              { icon: MessageSquare, color: 'text-cyan-500' },
  FOLLOW:               { icon: UserPlus,      color: 'text-violet-500' },
  COMMENT:              { icon: MessageSquare, color: 'text-slate-500' },
  LIKE:                 { icon: Heart,         color: 'text-red-500' },
  FRIEND_REQUEST:       { icon: UserPlus,      color: 'text-pink-500' },
}

const TYPE_OPTIONS = [
  'RIDE_INVITE',
  'CLUB_INVITE',
  'CLUB_JOIN_REQUEST',
  'CLUB_JOIN_ACCEPTED',
  'CLUB_ANNOUNCEMENT',
  'RIDE_JOIN_REQUEST',
  'RIDE_JOIN_ACCEPTED',
  'RIDE_REMINDER',
  'RIDE_CANCELLED',
  'MARKETPLACE_MESSAGE',
  'LISTING_SOLD',
  'LISTING_OFFER',
  'LISTING_INTERESTED',
  'MESSAGE',
  'FOLLOW',
  'COMMENT',
  'LIKE',
  'FRIEND_REQUEST',
] as const

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotificationRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [unreadOnly, setUnreadOnly] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError(null)

    const params: Record<string, string | number | boolean> = {
      page: currentPage,
      limit: 25,
    }
    if (typeFilter !== 'all') params.type = typeFilter
    if (unreadOnly === 'unread') params.unreadOnly = true
    if (searchQuery.trim()) params.search = searchQuery.trim()

    adminApi
      .getNotifications(params)
      .then((response) => {
        if (!isMounted) return
        setNotifications(response.items)
        setTotalPages(response.pagination.totalPages)
        setTotalItems(response.pagination.total)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to load notifications')
      })
      .finally(() => {
        if (!isMounted) return
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [currentPage, searchQuery, typeFilter, unreadOnly])

  const stats = useMemo(() => {
    return {
      total: totalItems,
      unread: notifications.filter((n) => !n.isRead).length,
      email: notifications.filter((n) => n.sentViaEmail).length,
      push: notifications.filter((n) => n.sentViaPush).length,
    }
  }, [notifications, totalItems])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.unread}</p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.push}</p>
                <p className="text-sm text-muted-foreground">Push Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.email}</p>
                <p className="text-sm text-muted-foreground">Email Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Browse recent user notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search by title, message, or user"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value); setCurrentPage(1) }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={unreadOnly} onValueChange={(value) => { setUnreadOnly(value); setCurrentPage(1) }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Read Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Notification</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-0">
                      <PhantomLoader loading>
                        <div className="divide-y">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 px-4 py-3">
                              <div className="w-8 h-8 rounded-full bg-muted" />
                              <div className="flex-1 space-y-1">
                                <div className="h-4 w-40 bg-muted rounded" />
                                <div className="h-3 w-56 bg-muted rounded" />
                              </div>
                              <div className="h-5 w-20 bg-muted rounded" />
                              <div className="h-5 w-16 bg-muted rounded" />
                              <div className="h-4 w-24 bg-muted rounded" />
                            </div>
                          ))}
                        </div>
                      </PhantomLoader>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No notifications found
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-[10px]">
                              {(notification.user.name || 'U')
                                .split(' ')
                                .map((part) => part[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{notification.user.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{notification.user.email || '—'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {notification.message || '—'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const meta = TYPE_ICON[notification.type] ?? { icon: Bell, color: 'text-muted-foreground' }
                          const TypeIcon = meta.icon
                          return (
                            <span className="flex items-center gap-1.5">
                              <TypeIcon className={`w-3.5 h-3.5 shrink-0 ${meta.color}`} />
                              <Badge variant="outline" className="text-[10px]">{notification.type.replace(/_/g, ' ')}</Badge>
                            </span>
                          )
                        })()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={notification.isRead ? 'secondary' : 'default'}>
                          {notification.isRead ? 'Read' : 'Unread'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({totalItems} notifications)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
