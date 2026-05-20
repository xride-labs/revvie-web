'use client'

import { useState, useEffect } from 'react'
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
import {
  Search,
  Download,
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react'
import { useAdminRides } from '@/store/features/admin'
import { AdminCRUDPopover, CRUDActionBuilders } from '@/components/admin/crud-popover'

interface AdminRide {
  id: string
  title: string
  description?: string | null
  startLocation: string
  endLocation?: string | null
  distance?: number | null
  duration?: number | null
  scheduledAt?: string | null
  status: string
  experienceLevel?: string | null
  pace?: string | null
  participantCount?: number
  creator: { id: string; name: string | null; image?: string | null }
}

const statusColors: Record<string, string> = {
  PLANNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const statusIcons: Record<string, LucideIcon> = {
  PLANNED: Calendar,
  IN_PROGRESS: PlayCircle,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
}

export default function AdminRidesPage() {
  const {
    rides: rawRides,
    pagination,
    fetchRides,
    updateRideStatus: dispatchUpdateRideStatus,
    deleteRide: dispatchDeleteRide,
  } = useAdminRides()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRide, setSelectedRide] = useState<AdminRide | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const rides: AdminRide[] = rawRides.map((ride) => ({
    id: ride.id,
    title: ride.title,
    description: ride.description,
    startLocation: ride.startLocation,
    endLocation: ride.endLocation,
    distance: ride.distance,
    duration: ride.duration,
    scheduledAt: ride.scheduledAt,
    status: ride.status,
    experienceLevel: ride.experienceLevel,
    pace: ride.pace,
    participantCount: ride._count?.participants ?? 0,
    creator: {
      id: ride.creator?.id ?? '',
      name: ride.creator?.name ?? 'Unknown',
      image: ride.creator?.image ?? null,
    },
  }))

  useEffect(() => {
    const params: Record<string, string> = {
      page: String(currentPage),
      limit: '20',
    }
    if (statusFilter !== 'all') params.status = statusFilter
    if (searchQuery) params.search = searchQuery
    fetchRides(params)
  }, [statusFilter, currentPage, searchQuery, fetchRides])

  // Debounced server-side search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentPage === 1) {
        const params: Record<string, string> = { page: '1', limit: '20' }
        if (statusFilter !== 'all') params.status = statusFilter
        if (searchQuery) params.search = searchQuery
        fetchRides(params)
      } else {
        setCurrentPage(1)
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchQuery, currentPage, statusFilter, fetchRides])

  const handleCancelRide = async (ride: AdminRide) => {
    if (!confirm(`Cancel ride "${ride.title}"?`)) return
    await dispatchUpdateRideStatus(ride.id, 'CANCELLED')
  }

  const handleDeleteRide = async (ride: AdminRide) => {
    if (!confirm(`Delete ride "${ride.title}"? This cannot be undone.`)) return
    await dispatchDeleteRide(ride.id)
  }

  const stats = {
    total: rides.length,
    planned: rides.filter((r) => r.status === 'PLANNED').length,
    inProgress: rides.filter((r) => r.status === 'IN_PROGRESS').length,
    completed: rides.filter((r) => r.status === 'COMPLETED').length,
    cancelled: rides.filter((r) => r.status === 'CANCELLED').length,
  }

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
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Rides</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.planned}</p>
            <p className="text-sm text-muted-foreground">Planned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{stats.inProgress}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-sm text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Rides Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Ride Management</CardTitle>
              <CardDescription>Monitor and manage all rides</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search rides..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PLANNED">Planned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ride</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12.5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rides.map((ride) => {
                  const StatusIcon = statusIcons[ride.status as keyof typeof statusIcons]
                  return (
                    <TableRow key={ride.id}>
                      <TableCell className="max-w-[220px]">
                        <div>
                          <p className="font-medium truncate">{ride.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{ride.startLocation}{ride.endLocation ? ` → ${ride.endLocation}` : ''}</span>
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs">
                              {(ride.creator.name ?? 'U')
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {ride.creator.name || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {ride.scheduledAt ? formatDate(ride.scheduledAt) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{ride.distance || 0} km</p>
                          <p className="text-xs text-muted-foreground">
                            ~{Math.floor((ride.duration || 0) / 60)}h{' '}
                            {(ride.duration || 0) % 60}m
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {ride.participantCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`gap-1 ${statusColors[ride.status as keyof typeof statusColors]}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {ride.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <AdminCRUDPopover
                          actions={[
                            CRUDActionBuilders.view(() => {
                              setSelectedRide(ride)
                              setIsViewDialogOpen(true)
                            }),
                            ...(ride.status !== 'CANCELLED' && ride.status !== 'COMPLETED'
                              ? [
                                CRUDActionBuilders.custom(
                                  'cancel',
                                  'Cancel Ride',
                                  () => handleCancelRide(ride),
                                  {
                                    icon: <XCircle className="h-4 w-4" />,
                                    variant: 'destructive',
                                  }
                                ),
                              ]
                              : []),
                            CRUDActionBuilders.delete(
                              () => handleDeleteRide(ride),
                              false,
                              false
                            ),
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} rides)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Ride Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ride Details</DialogTitle>
            <DialogDescription>Full ride information</DialogDescription>
          </DialogHeader>
          {selectedRide && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedRide.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {selectedRide.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Route</p>
                    <p className="font-medium">
                      {selectedRide.startLocation} → {selectedRide.endLocation}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Scheduled</p>
                    <p className="font-medium">
                      {selectedRide.scheduledAt
                        ? formatDate(selectedRide.scheduledAt)
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Distance</p>
                  <p className="font-medium">{selectedRide.distance || 0} km</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {Math.floor((selectedRide.duration || 0) / 60)}h{' '}
                    {(selectedRide.duration || 0) % 60}m
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience Level</p>
                  <p className="font-medium">{selectedRide.experienceLevel || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pace</p>
                  <p className="font-medium">{selectedRide.pace || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Participants</p>
                  <p className="font-medium">
                    {selectedRide.participantCount || 0} riders
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge
                    className={
                      statusColors[selectedRide.status as keyof typeof statusColors]
                    }
                  >
                    {selectedRide.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Ride Creator</p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {(selectedRide.creator.name ?? 'U')
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{selectedRide.creator.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedRide.creator.name || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedRide?.status === 'IN_PROGRESS' && (
              <Button>
                <MapPin className="w-4 h-4 mr-2" />
                Track Live
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
