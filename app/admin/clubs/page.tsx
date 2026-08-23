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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Download,
  CheckCircle,
  XCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  MapPin,
  Calendar,
  Trophy,
} from 'lucide-react'
import { useAdminClubs } from '@/store/features/admin'
import { AdminCRUDPopover, CRUDActionBuilders } from '@/components/admin/crud-popover'
import { Checkbox } from '@/components/ui/checkbox'
import { useBulkSelection } from '@/hooks/use-bulk-selection'
import { BulkActionBar } from '@/components/bulk-action-bar'
import { performBulkAction } from '@/lib/server/admin'
import { toast } from 'sonner'

interface AdminClub {
  id: string
  name: string
  description?: string | null
  location?: string | null
  memberCount?: number
  ridesCount?: number
  verified: boolean
  isPublic?: boolean
  owner?: { id: string; name: string | null; image?: string | null }
  reputation?: number | null
  establishedAt?: string | null
  status?: string
  createdAt?: string
}

export default function AdminClubsPage() {
  const {
    clubs: rawClubs,
    pagination,
    fetchClubs,
    verifyClub: dispatchVerifyClub,
    deleteClub: dispatchDeleteClub,
  } = useAdminClubs()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all')
  const [selectedClub, setSelectedClub] = useState<AdminClub | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const clubs: AdminClub[] = rawClubs.map((club) => ({
    id: club.id,
    name: club.name,
    description: club.description,
    location: club.location,
    memberCount: club.memberCount ?? club._count?.members ?? 0,
    ridesCount: 0,
    verified: club.verified,
    isPublic: club.isPublic,
    owner: {
      id: club.owner?.id ?? '',
      name: club.owner?.name ?? 'Unknown',
      image: club.owner?.image ?? null,
    },
    reputation: club.reputation,
    establishedAt: club.establishedAt,
    status: club.verified ? 'active' : 'pending',
    createdAt: club.createdAt,
  }))

  const doFetch = useCallback(() => {
    const params: Record<string, boolean | string> = {
      page: String(currentPage),
      limit: '20',
    }
    if (verifiedFilter === 'verified') params.verified = true
    if (verifiedFilter === 'unverified') params.verified = false
    if (searchQuery) params.search = searchQuery
    fetchClubs(params)
  }, [verifiedFilter, searchQuery, currentPage, fetchClubs])

  useEffect(() => {
    doFetch()
  }, [doFetch])

  const handleVerifyClub = async (clubId: string) => {
    await dispatchVerifyClub(clubId)
    setIsVerifyDialogOpen(false)
  }

  const handleDeleteClub = async (club: AdminClub) => {
    if (!confirm(`Delete club "${club.name}"? This cannot be undone.`)) return
    await dispatchDeleteClub(club.id)
  }

  // ── Bulk verify (super-admin) ──────────────────────────────────────────────
  const sel = useBulkSelection()
  const [bulkBusy, setBulkBusy] = useState<string | null>(null)

  const runBulkVerify = async () => {
    if (sel.count === 0) return
    const ids = sel.selectedIds
    setBulkBusy('verify')
    try {
      const result = await performBulkAction({ module: 'clubs', action: 'verify', ids })
      toast.success(`${result.processed} club${result.processed === 1 ? '' : 's'} verified`)
      sel.clear()
      doFetch()
    } catch {
      toast.error('Bulk verify failed — try again')
    } finally {
      setBulkBusy(null)
    }
  }

  // Debounced server-side search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentPage === 1) doFetch()
      else setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchQuery, currentPage, doFetch])

  const stats = {
    total: clubs.length,
    verified: clubs.filter((c) => c.verified).length,
    pending: clubs.filter((c) => c.status === 'pending').length,
    totalMembers: clubs.reduce((sum, c) => sum + (c.memberCount || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Clubs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Verification</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clubs Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Club Management</CardTitle>
              <CardDescription>Manage and verify riding clubs</CardDescription>
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
          {/* Tabs for different views */}
          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Clubs</TabsTrigger>
              <TabsTrigger value="pending">
                Pending Verification
                <Badge variant="secondary" className="ml-2">
                  {stats.pending}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clubs..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-37.5">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-37.5">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={sel.allSelected(clubs.map((c) => c.id))}
                      onCheckedChange={() => sel.toggleAll(clubs.map((c) => c.id))}
                      aria-label="Select all clubs"
                    />
                  </TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Rides</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="w-12.5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clubs.map((club) => (
                  <TableRow key={club.id}>
                    <TableCell>
                      <Checkbox
                        checked={sel.isSelected(club.id)}
                        onCheckedChange={() => sel.toggle(club.id)}
                        aria-label={`Select ${club.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {club.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{club.name}</p>
                            {!club.isPublic && (
                              <Badge variant="outline" className="text-[10px]">
                                Private
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {club.location}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{club.owner?.name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">
                          {club.owner?.name || 'Unknown'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {club.memberCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {club.ridesCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      {club.verified ? (
                        <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="w-3 h-3" />
                          Unverified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500">★</span>
                        {club.reputation}
                      </div>
                    </TableCell>
                    <TableCell>
                      <AdminCRUDPopover
                        actions={[
                          CRUDActionBuilders.view(() => {
                            setSelectedClub(club)
                            setIsViewDialogOpen(true)
                          }),
                          ...(club.verified
                            ? []
                            : [
                              CRUDActionBuilders.verify(() => {
                                setSelectedClub(club)
                                setIsVerifyDialogOpen(true)
                              }),
                            ]),
                          CRUDActionBuilders.delete(
                            () => handleDeleteClub(club),
                            false,
                            false
                          ),
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} clubs)
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

      <BulkActionBar
        count={sel.count}
        busyKey={bulkBusy}
        onClear={sel.clear}
        actions={[
          {
            key: 'verify',
            label: 'Verify',
            icon: <ShieldCheck className="h-4 w-4" />,
            onClick: runBulkVerify,
          },
        ]}
      />

      {/* View Club Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Club Details</DialogTitle>
            <DialogDescription>Detailed club information</DialogDescription>
          </DialogHeader>
          {selectedClub && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-lg">
                    {selectedClub.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{selectedClub.name}</h3>
                    {selectedClub.verified && (
                      <Badge className="bg-green-100 text-green-700">Verified</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {selectedClub.description}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedClub.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Established</p>
                    <p className="font-medium">{selectedClub.establishedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Members</p>
                    <p className="font-medium">{selectedClub.memberCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Rides Completed</p>
                    <p className="font-medium">{selectedClub.ridesCount}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Owner</p>
                {selectedClub.owner && (
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {(selectedClub.owner?.name ?? 'U')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{selectedClub.owner.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedClub.owner.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedClub && !selectedClub.verified && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setIsViewDialogOpen(false)
                  setIsVerifyDialogOpen(true)
                }}
              >
                Verify Club
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Club Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Club</DialogTitle>
            <DialogDescription>
              Are you sure you want to verify {selectedClub?.name}? This will give them a
              verified badge.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => selectedClub && handleVerifyClub(selectedClub.id)}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Verify Club
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
