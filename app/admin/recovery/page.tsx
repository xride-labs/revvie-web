'use client'

import { useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { SUPER_ADMIN_ROLES } from '@/core/auth/roles'
import type {
  AdminRecoveryCase,
  RecoveryFactor,
  RecoveryStatus,
} from '@/entities/admin/model'
import {
  useApproveRecoveryMutation,
  useGetRecoveriesQuery,
  useGetRecoveryQuery,
  useRejectRecoveryMutation,
  useRequestRecoveryInfoMutation,
} from '@/features/admin/api'
import { hasAnyRole, useAuth } from '@/lib/use-auth'

const FACTOR_OPTIONS: { value: RecoveryFactor; label: string }[] = [
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'OAUTH', label: 'Linked Google/Apple sign-in' },
  { value: 'PASSKEY', label: 'Passkeys' },
]

const STATUS_LABELS: Record<RecoveryStatus, string> = {
  PENDING_REVIEW: 'Pending review',
  NEEDS_INFO: 'Needs info',
  REJECTED: 'Rejected',
  APPROVED: 'Approved (hold)',
  CANCELLED: 'Cancelled',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  EXPIRED: 'Expired',
}

/** Statuses a reviewer can still act on; everything else is terminal or in the hold. */
const ACTIONABLE: RecoveryStatus[] = ['PENDING_REVIEW', 'NEEDS_INFO']

type Decision = { kind: 'approve' | 'reject' | 'info'; recovery: AdminRecoveryCase }

function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

function errorMessage(error: unknown): string {
  const message = (error as { message?: string } | undefined)?.message
  return message || 'Something went wrong. Please try again.'
}

export default function AdminRecoveryPage() {
  const { user } = useAuth()
  // Approve/reject are ADMIN-only on the server; hiding them is a convenience, the
  // API remains the authority (CO_ADMIN can still read and request more info).
  const canDecide = hasAnyRole(user, ...SUPER_ADMIN_ROLES)

  const {
    data: recoveries = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetRecoveriesQuery()
  const [approve, { isLoading: approving }] = useApproveRecoveryMutation()
  const [reject, { isLoading: rejecting }] = useRejectRecoveryMutation()
  const [requestInfo, { isLoading: requesting }] = useRequestRecoveryInfoMutation()

  const [decision, setDecision] = useState<Decision | null>(null)
  const [note, setNote] = useState('')
  const [factors, setFactors] = useState<RecoveryFactor[]>([])
  const [detailId, setDetailId] = useState<string | null>(null)

  const { data: detail, isFetching: detailLoading } = useGetRecoveryQuery(detailId ?? '', {
    skip: !detailId,
  })

  const busy = approving || rejecting || requesting

  function openDecision(kind: Decision['kind'], recovery: AdminRecoveryCase) {
    setNote('')
    setFactors([])
    setDecision({ kind, recovery })
  }

  function toggleFactor(factor: RecoveryFactor) {
    setFactors((prev) =>
      prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor],
    )
  }

  async function submitDecision() {
    if (!decision) return
    const { kind, recovery } = decision
    const trimmed = note.trim() || undefined
    try {
      if (kind === 'approve') {
        const result = await approve({
          id: recovery.id,
          retireFactors: factors,
          note: trimmed,
        }).unwrap()
        toast.success('Recovery approved', {
          description: result.releaseAt
            ? `The seven-day hold ends ${formatDate(result.releaseAt)}.`
            : 'The seven-day hold has started.',
        })
      } else if (kind === 'reject') {
        await reject({ id: recovery.id, note: trimmed }).unwrap()
        toast.success('Recovery rejected')
      } else {
        await requestInfo({ id: recovery.id, note: trimmed }).unwrap()
        toast.success('More information requested')
      }
      setDecision(null)
    } catch (err) {
      toast.error('Action failed', { description: errorMessage(err) })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Account recovery</h1>
          <p className="text-sm text-muted-foreground">
            Riders who lost every sign-in factor. Approval starts a seven-day hold before
            the new destination is released.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recovery queue</CardTitle>
          <CardDescription>
            {canDecide
              ? 'Review each request, then approve, reject, or ask for more information.'
              : 'You can review requests and ask for more information. Approval is limited to administrators.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">
              Could not load recovery requests. You may not have access.
            </p>
          ) : recoveries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recovery requests.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rider</TableHead>
                  <TableHead>Verified destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hold ends</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recoveries.map((recovery) => {
                  const actionable = ACTIONABLE.includes(recovery.status)
                  return (
                    <TableRow key={recovery.id}>
                      <TableCell>
                        {recovery.user ? (
                          <>
                            <div className="font-medium">
                              {recovery.user.name ?? 'Unnamed'}
                            </div>
                            {recovery.user.username ? (
                              <div className="text-xs text-muted-foreground">
                                @{recovery.user.username}
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <span className="text-muted-foreground">No matching account</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs uppercase text-muted-foreground">
                          {recovery.destinationChannel}
                        </div>
                        <div>{recovery.destinationValue}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{STATUS_LABELS[recovery.status]}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(recovery.releaseAt)}</TableCell>
                      <TableCell>{formatDate(recovery.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailId(recovery.id)}
                          >
                            Details
                          </Button>
                          {actionable ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDecision('info', recovery)}
                            >
                              Request info
                            </Button>
                          ) : null}
                          {actionable && canDecide ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openDecision('reject', recovery)}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                disabled={!recovery.user}
                                title={
                                  recovery.user ? undefined : 'No matching account to recover'
                                }
                                onClick={() => openDecision('approve', recovery)}
                              >
                                Approve
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!decision} onOpenChange={(open) => !open && setDecision(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision?.kind === 'approve'
                ? 'Approve recovery'
                : decision?.kind === 'reject'
                  ? 'Reject recovery'
                  : 'Request more information'}
            </DialogTitle>
            <DialogDescription>
              {decision?.kind === 'approve'
                ? 'Choose which existing sign-in factors to retire when the seven-day hold completes. The rider is notified on every existing factor.'
                : 'Add an optional note for the audit trail.'}
            </DialogDescription>
          </DialogHeader>

          {decision?.kind === 'approve' ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Factors to retire</p>
              {FACTOR_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={factors.includes(option.value)}
                    onCheckedChange={() => toggleFactor(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="recovery-note">Note (optional)</Label>
            <Textarea
              id="recovery-note"
              value={note}
              maxLength={1000}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDecision(null)} disabled={busy}>
              Cancel
            </Button>
            <Button
              onClick={submitDecision}
              disabled={busy || (decision?.kind === 'approve' && factors.length === 0)}
            >
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {decision?.kind === 'approve'
                ? 'Confirm approval'
                : decision?.kind === 'reject'
                  ? 'Confirm rejection'
                  : 'Send request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recovery details</DialogTitle>
            <DialogDescription>
              Audit history for this request. Codes and receipts are never shown.
            </DialogDescription>
          </DialogHeader>
          {detailLoading || !detail ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                <dt className="text-muted-foreground">Status</dt>
                <dd>{STATUS_LABELS[detail.status]}</dd>
                <dt className="text-muted-foreground">Verified destination</dt>
                <dd>
                  {detail.destinationChannel}: {detail.destinationValue}
                </dd>
                <dt className="text-muted-foreground">Hold ends</dt>
                <dd>{formatDate(detail.releaseAt)}</dd>
                <dt className="text-muted-foreground">Request expires</dt>
                <dd>{formatDate(detail.expiresAt)}</dd>
                <dt className="text-muted-foreground">Reviewer</dt>
                <dd>{detail.reviewer?.name ?? '—'}</dd>
                {detail.retireFactors.length > 0 ? (
                  <>
                    <dt className="text-muted-foreground">Factors to retire</dt>
                    <dd>{detail.retireFactors.join(', ')}</dd>
                  </>
                ) : null}
              </dl>
              {detail.explanation ? (
                <div>
                  <p className="text-muted-foreground">Rider explanation</p>
                  <p className="whitespace-pre-wrap">{detail.explanation}</p>
                </div>
              ) : null}
              {detail.reviewerNote ? (
                <div>
                  <p className="text-muted-foreground">Reviewer note</p>
                  <p className="whitespace-pre-wrap">{detail.reviewerNote}</p>
                </div>
              ) : null}
              <div>
                <p className="font-medium mb-1">Audit events</p>
                {detail.events.length === 0 ? (
                  <p className="text-muted-foreground">No events recorded.</p>
                ) : (
                  <ul className="space-y-1">
                    {detail.events.map((event) => (
                      <li key={event.id} className="flex justify-between gap-4">
                        <span>{event.type}</span>
                        <span className="text-muted-foreground">
                          {formatDate(event.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
