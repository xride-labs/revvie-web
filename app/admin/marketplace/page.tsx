'use client'

import { useState, useEffect, useMemo } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  MoreHorizontal,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShoppingBag,
  DollarSign,
  Package,
} from 'lucide-react'
import {
  useGetListingsQuery,
  useUpdateListingStatusMutation,
  useDeleteListingMutation,
} from '@/features/admin/api'

interface AdminListing {
  id: string
  title: string
  description?: string | null
  price: number
  currency?: string
  category?: string | null
  subcategory?: string | null
  condition?: string | null
  status: string
  images?: string[]
  seller: { id: string; name: string | null; image?: string | null }
  createdAt: string
  views?: number
  inquiries?: number
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  SOLD: 'bg-blue-100 text-blue-700',
  INACTIVE: 'bg-red-100 text-red-700',
}

const formatStatusLabel = (status: string) => (status === 'INACTIVE' ? 'FLAGGED' : status)

export default function AdminMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, statusFilter])

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: 20,
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [currentPage, statusFilter, debouncedSearch],
  )

  const { data, refetch } = useGetListingsQuery(queryParams)
  const [updateListingStatusMutation] = useUpdateListingStatusMutation()
  const [deleteListingMutation] = useDeleteListingMutation()

  const listings: AdminListing[] = useMemo(
    () =>
      (data?.items ?? []).map((listing) => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        currency: listing.currency,
        category: listing.category,
        subcategory: listing.subcategory,
        condition: listing.condition,
        status: listing.status,
        images: listing.images,
        seller: {
          id: listing.seller?.id ?? '',
          name: listing.seller?.name ?? 'Unknown',
          image: listing.seller?.image ?? null,
        },
        createdAt: listing.createdAt,
        views: 0,
        inquiries: 0,
      })),
    [data],
  )
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 }

  const handleUpdateListingStatus = async (listing: AdminListing, newStatus: string) => {
    await updateListingStatusMutation({ listingId: listing.id, status: newStatus })
  }

  const handleDeleteListing = async (listing: AdminListing) => {
    if (!confirm(`Delete listing "${listing.title}"? This cannot be undone.`)) return
    await deleteListingMutation(listing.id)
  }

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === 'ACTIVE').length,
    sold: listings.filter((l) => l.status === 'SOLD').length,
    flagged: listings.filter((l) => l.status === 'INACTIVE').length,
    totalValue: listings
      .filter((l) => l.status === 'ACTIVE')
      .reduce((sum, l) => sum + (l.price || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Listings</p>
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
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.sold}</p>
                <p className="text-sm text-muted-foreground">Sold</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.flagged}</p>
                <p className="text-sm text-muted-foreground">Flagged</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Active Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Marketplace Management</CardTitle>
              <CardDescription>Monitor and moderate marketplace listings</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                <Search className="w-4 h-4 mr-2" />
                Refresh
              </Button>
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
                placeholder="Search listings..."
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
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SOLD">Sold</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-37.5">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Gear">Gear</SelectItem>
                <SelectItem value="Parts">Parts</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
                <SelectItem value="Motorcycles">Motorcycles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12.5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{listing.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {listing.condition} • {listing.createdAt}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">
                            {listing.seller?.name
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm">{listing.seller?.name || 'Unknown'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">${listing.price}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{listing.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{listing.views} views</p>
                        <p className="text-xs text-muted-foreground">
                          {listing.inquiries} inquiries
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`gap-1 ${statusColors[listing.status as keyof typeof statusColors]}`}
                      >
                        {listing.status === 'INACTIVE' && (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {formatStatusLabel(listing.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedListing(listing)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {listing.status === 'INACTIVE' && (
                            <>
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() =>
                                  handleUpdateListingStatus(listing, 'ACTIVE')
                                }
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Listing
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteListing(listing)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Remove Listing
                              </DropdownMenuItem>
                            </>
                          )}
                          {listing.status === 'ACTIVE' && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleUpdateListingStatus(listing, 'INACTIVE')
                              }
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Flag Listing
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteListing(listing)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Delete Listing
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total}{' '}
              listings)
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

      {/* View Listing Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Listing Details</DialogTitle>
            <DialogDescription>Full listing information</DialogDescription>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              {(selectedListing.images?.length ?? 0) > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {(selectedListing.images ?? []).map((img: string, i: number) => (
                    <img
                      key={i}
                      src={img.startsWith('http://') ? 'https://' + img.slice(7) : img}
                      alt={`${selectedListing.title} ${i + 1}`}
                      className="h-40 w-40 shrink-0 rounded-lg object-cover"
                    />
                  ))}
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{selectedListing.title}</h3>
                  <Badge
                    className={
                      statusColors[selectedListing.status as keyof typeof statusColors]
                    }
                  >
                    {formatStatusLabel(selectedListing.status)}
                  </Badge>
                </div>
                <p className="text-2xl font-bold mt-1">${selectedListing.price}</p>
                <p className="text-muted-foreground text-sm mt-2">
                  {selectedListing.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">
                    {selectedListing.category} / {selectedListing.subcategory}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Condition</p>
                  <p className="font-medium">{selectedListing.condition}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Listed</p>
                  <p className="font-medium">{selectedListing.createdAt}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stats</p>
                  <p className="font-medium">
                    {selectedListing.views} views • {selectedListing.inquiries} inquiries
                  </p>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Seller</p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {selectedListing.seller?.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {selectedListing.seller?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedListing?.status === 'FLAGGED' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedListing) handleDeleteListing(selectedListing)
                    setIsViewDialogOpen(false)
                  }}
                >
                  Remove Listing
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    if (selectedListing)
                      handleUpdateListingStatus(selectedListing, 'ACTIVE')
                    setIsViewDialogOpen(false)
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
