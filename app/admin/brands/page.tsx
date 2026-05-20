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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Store,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  ExternalLink,
  Trash2,
  Eye,
} from 'lucide-react'
import {
  adminApi,
  getAllBusinesses,
  deleteBusiness,
  type PendingBusiness,
} from '@/lib/server/admin'
import { toast } from 'sonner'
import { AdminCRUDPopover, CRUDActionBuilders } from '@/components/admin/crud-popover'

const VERIFICATION_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  APPROVED:  'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-700',
}

export default function AdminBrandsPage() {
  const [businesses, setBusinesses] = useState<PendingBusiness[]>([])
  const [loading, setLoading]   = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({})
  const [viewBiz, setViewBiz]   = useState<PendingBusiness | null>(null)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]       = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAllBusinesses({
        page,
        limit: 20,
        status:  statusFilter !== 'all' ? statusFilter : undefined,
        search:  search.trim() || undefined,
      })
      setBusinesses(res.items)
      setTotalPages(res.pagination.totalPages)
      setTotal(res.pagination.total)
    } catch {
      toast.error('Failed to load businesses')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search])

  useEffect(() => { load() }, [load])

  const act = async (fn: () => Promise<void>, id: string, msg: string) => {
    setActioningId(id)
    try {
      await fn()
      toast.success(msg)
      await load()
    } catch {
      toast.error('Action failed')
    } finally {
      setActioningId(null)
    }
  }

  const stats = {
    total,
    pending:   businesses.filter((b) => (b as any).verification === 'PENDING').length,
    submitted: businesses.filter((b) => (b as any).verification === 'SUBMITTED').length,
    approved:  businesses.filter((b) => (b as any).verification === 'APPROVED').length,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Brands" value={stats.total} color="text-foreground" />
        <StatCard label="Pending" value={stats.pending} color="text-amber-600" />
        <StatCard label="Under Review" value={stats.submitted} color="text-blue-600" />
        <StatCard label="Approved" value={stats.approved} color="text-green-600" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Brand Management</CardTitle>
              <CardDescription>Full CRUD — approve, reject, delete brand profiles</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or owner…"
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SUBMITTED">Under Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : businesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No brands found</TableCell>
                  </TableRow>
                ) : businesses.map((biz) => {
                  const verification = (biz as any).verification as string ?? 'PENDING'
                  return (
                    <TableRow key={biz.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-xl shrink-0">
                            <AvatarImage src={biz.logoUrl ?? undefined} className="object-cover" />
                            <AvatarFallback className="rounded-xl text-xs">{biz.displayName[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate max-w-[160px]">{biz.displayName}</p>
                            <p className="text-xs text-muted-foreground">/{biz.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{biz.owner.name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[140px]">{biz.owner.email ?? '—'}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {biz.categories.slice(0, 2).map((c) => (
                            <Badge key={c} variant="outline" className="text-[10px] px-1">{c.replace(/_/g, ' ')}</Badge>
                          ))}
                          {biz.categories.length > 2 && (
                            <Badge variant="outline" className="text-[10px] px-1">+{biz.categories.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{[biz.city, biz.region, biz.country].filter(Boolean).join(', ') || '—'}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={VERIFICATION_COLORS[verification] ?? ''}>{verification}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(biz.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <AdminCRUDPopover
                          actions={[
                            CRUDActionBuilders.view(() => setViewBiz(biz)),
                            ...(verification === 'SUBMITTED' ? [
                              CRUDActionBuilders.custom('approve', 'Approve', () =>
                                act(() => adminApi.approveBusinessSubmission(biz.id), biz.id, `${biz.displayName} approved`),
                                { icon: <CheckCircle className="h-4 w-4" /> }
                              ),
                              CRUDActionBuilders.custom('reject', 'Reject', () =>
                                act(() => adminApi.rejectBusinessSubmission(biz.id, rejectNotes[biz.id]), `reject-${biz.id}`, `${biz.displayName} rejected`),
                                { icon: <XCircle className="h-4 w-4" />, variant: 'destructive' }
                              ),
                            ] : []),
                            CRUDActionBuilders.delete(() =>
                              act(() => deleteBusiness(biz.id), `del-${biz.id}`, `${biz.displayName} deleted`),
                              false, false
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
              Page {page} of {totalPages} ({total} brands)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={!!viewBiz} onOpenChange={(open) => { if (!open) setViewBiz(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Brand Details</DialogTitle>
            <DialogDescription>Full profile information</DialogDescription>
          </DialogHeader>
          {viewBiz && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 rounded-xl">
                  <AvatarImage src={viewBiz.logoUrl ?? undefined} className="object-cover" />
                  <AvatarFallback className="rounded-xl text-xl">{viewBiz.displayName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-base">{viewBiz.displayName}</p>
                  <p className="text-muted-foreground text-xs">/{viewBiz.slug}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {viewBiz.categories.map((c) => (
                      <Badge key={c} variant="outline" className="text-[10px]">{c.replace(/_/g, ' ')}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Owner">{viewBiz.owner.name ?? '—'}</Field>
                <Field label="Email">{viewBiz.owner.email ?? '—'}</Field>
                <Field label="Location">{[viewBiz.city, viewBiz.region, viewBiz.country].filter(Boolean).join(', ') || '—'}</Field>
                <Field label="Created">{new Date(viewBiz.createdAt).toLocaleDateString()}</Field>
              </div>

              {viewBiz.verificationNotes && (
                <div className="rounded-md border p-3 bg-muted/40">
                  <p className="text-xs text-muted-foreground mb-1">Verification Notes</p>
                  <p>{viewBiz.verificationNotes}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Rejection Notes (optional)</p>
                <Textarea
                  placeholder="Reason for rejection…"
                  className="text-xs h-16 resize-none"
                  value={rejectNotes[viewBiz.id] ?? ''}
                  onChange={(e) => setRejectNotes((p) => ({ ...p, [viewBiz.id]: e.target.value }))}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" asChild>
              <a href={`/b/${viewBiz?.slug}`} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> View Public Page
              </a>
            </Button>
            {viewBiz && (viewBiz as any).verification === 'SUBMITTED' && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 gap-1.5"
                  disabled={!!actioningId}
                  onClick={() => { act(() => adminApi.approveBusinessSubmission(viewBiz.id), viewBiz.id, 'Approved'); setViewBiz(null) }}
                >
                  {actioningId === viewBiz.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
                  disabled={!!actioningId}
                  onClick={() => { act(() => adminApi.rejectBusinessSubmission(viewBiz.id, rejectNotes[viewBiz.id]), `reject-${viewBiz.id}`, 'Rejected'); setViewBiz(null) }}
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="font-medium">{children}</p>
    </div>
  )
}
