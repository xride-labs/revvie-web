'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle,
  XCircle,
  Shield,
  Users,
  MapPin,
  RefreshCw,
  Loader2,
  CheckCheck,
  Clock,
  Building2,
  Store,
  Megaphone,
  Percent,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import {
  useGetApprovalsQuery,
  useGetBusinessSubmissionsQuery,
  useGetAdCampaignsQuery,
  useGetAdminDiscountsQuery,
  useApproveBusinessSubmissionMutation,
  useRejectBusinessSubmissionMutation,
  useVerifyClubMutation,
  useApproveClubRequestMutation,
  useRejectClubRequestMutation,
  useAcceptRideParticipantMutation,
  useDeclineRideParticipantMutation,
  useApproveAdCampaignMutation,
  useRejectAdCampaignMutation,
  useDeleteAdminDiscountMutation,
  useBulkVerifyClubsMutation,
  useBulkApproveClubRequestsMutation,
  useBulkAcceptRideParticipantsMutation,
  useBulkApproveBusinessesMutation,
  useBulkApproveAdCampaignsMutation,
} from '@/features/admin/api'
import { toast } from 'sonner'

export default function AdminApprovalsPage() {
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({})

  const { data, isLoading: approvalsLoading, refetch: refetchApprovals } = useGetApprovalsQuery()
  const { data: bizData, refetch: refetchBusinesses } = useGetBusinessSubmissionsQuery()
  const { data: adsData, refetch: refetchAds } = useGetAdCampaignsQuery({
    status: 'PENDING_APPROVAL',
    limit: 50,
  })
  const { data: discountsData } = useGetAdminDiscountsQuery({ limit: 50 })

  const businesses = bizData?.items ?? []
  const adCampaigns = adsData?.items ?? []
  const discounts = discountsData?.items ?? []
  const loading = approvalsLoading

  const [approveBusinessSubmission] = useApproveBusinessSubmissionMutation()
  const [rejectBusinessSubmission] = useRejectBusinessSubmissionMutation()
  const [verifyClub] = useVerifyClubMutation()
  const [approveClubRequest] = useApproveClubRequestMutation()
  const [rejectClubRequest] = useRejectClubRequestMutation()
  const [acceptRideParticipant] = useAcceptRideParticipantMutation()
  const [declineRideParticipant] = useDeclineRideParticipantMutation()
  const [approveAdCampaign] = useApproveAdCampaignMutation()
  const [rejectAdCampaign] = useRejectAdCampaignMutation()
  const [deleteAdminDiscount] = useDeleteAdminDiscountMutation()
  const [bulkVerifyClubsMutation] = useBulkVerifyClubsMutation()
  const [bulkApproveClubRequestsMutation] = useBulkApproveClubRequestsMutation()
  const [bulkAcceptRideParticipantsMutation] = useBulkAcceptRideParticipantsMutation()
  const [bulkApproveBusinessesMutation] = useBulkApproveBusinessesMutation()
  const [bulkApproveAdCampaignsMutation] = useBulkApproveAdCampaignsMutation()

  const refetchAll = () => {
    refetchApprovals()
    refetchBusinesses()
    refetchAds()
  }

  // Tag invalidation on each mutation already triggers a refetch of the relevant query —
  // this wrapper just tracks which row is busy and surfaces a toast.
  const act = async (fn: () => Promise<unknown>, id: string, successMsg: string) => {
    setActioningId(id)
    try {
      await fn()
      toast.success(successMsg)
    } catch {
      toast.error('Action failed — try again')
    } finally {
      setActioningId(null)
    }
  }

  const bulkAction = async (
    key: string,
    fn: () => Promise<{ processed: number; failed: number }>,
    label: string,
  ) => {
    setActioningId(key)
    try {
      const { processed, failed } = await fn()
      toast.success(
        failed > 0 ? `${label}: ${processed} done, ${failed} failed` : `${label}: ${processed} done`,
      )
    } catch {
      toast.error('Bulk action failed — try again')
    } finally {
      setActioningId(null)
    }
  }

  const approveAllClubs = () =>
    bulkAction(
      'bulk-clubs',
      () => bulkVerifyClubsMutation((data?.pendingClubs ?? []).map((c) => c.id)).unwrap(),
      'Clubs verified',
    )

  const approveAllClubRequests = () =>
    bulkAction(
      'bulk-club-requests',
      () =>
        bulkApproveClubRequestsMutation(
          (data?.pendingClubRequests ?? []).map((r) => r.id),
        ).unwrap(),
      'Club join requests approved',
    )

  const approveAllRideRequests = () =>
    bulkAction(
      'bulk-ride-requests',
      () =>
        bulkAcceptRideParticipantsMutation(
          (data?.pendingRideRequests ?? []).map((r) => r.id),
        ).unwrap(),
      'Ride participants accepted',
    )

  const approveAllBusinesses = () =>
    bulkAction(
      'bulk-businesses',
      () => bulkApproveBusinessesMutation(businesses.map((b) => b.id)).unwrap(),
      'Business submissions approved',
    )

  const approveAllAdCampaigns = () =>
    bulkAction(
      'bulk-ads',
      () => bulkApproveAdCampaignsMutation(adCampaigns.map((a) => a.id)).unwrap(),
      'Ad campaigns approved',
    )

  const totalPending =
    (data
      ? data.pendingClubs.length +
        data.pendingClubRequests.length +
        data.pendingRideRequests.length
      : 0) +
    businesses.length +
    adCampaigns.length

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Approvals</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalPending > 0
              ? `${totalPending} item${totalPending !== 1 ? 's' : ''} awaiting your action`
              : 'All caught up — nothing pending'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetchAll} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {totalPending === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <CheckCheck className="w-12 h-12 text-green-500" />
            <p className="text-lg font-semibold">All clear</p>
            <p className="text-sm text-muted-foreground">
              No pending approvals right now.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="businesses">
        <TabsList>
          <TabsTrigger value="businesses" className="gap-2">
            <Store className="w-4 h-4" />
            Businesses
            {businesses.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                {businesses.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="clubs" className="gap-2">
            <Building2 className="w-4 h-4" />
            Clubs
            {(data?.pendingClubs.length ?? 0) > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                {data!.pendingClubs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="club-requests" className="gap-2">
            <Users className="w-4 h-4" />
            Club Joins
            {(data?.pendingClubRequests.length ?? 0) > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                {data!.pendingClubRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ride-requests" className="gap-2">
            <MapPin className="w-4 h-4" />
            Ride Joins
            {(data?.pendingRideRequests.length ?? 0) > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                {data!.pendingRideRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ad-campaigns" className="gap-2">
            <Megaphone className="w-4 h-4" />
            Ad Campaigns
            {adCampaigns.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                {adCampaigns.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="discounts" className="gap-2">
            <Percent className="w-4 h-4" />
            Discounts
            {discounts.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                {discounts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Business submissions ── */}
        <TabsContent value="businesses" className="mt-4 space-y-4">
          {businesses.length === 0 ? (
            <EmptyState
              icon={<Store className="w-8 h-8" />}
              label="No pending business submissions"
            />
          ) : (
            <>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={approveAllBusinesses}
                  disabled={actioningId === 'bulk-businesses'}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  {actioningId === 'bulk-businesses' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4" />
                  )}
                  Approve All ({businesses.length})
                </Button>
              </div>
              <div className="space-y-3">
                {businesses.map((biz) => (
                  <Card key={biz.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 rounded-xl shrink-0">
                          <AvatarImage
                            src={biz.logoUrl ?? undefined}
                            alt={biz.displayName}
                            className="object-cover"
                          />
                          <AvatarFallback className="rounded-xl">
                            {biz.displayName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{biz.displayName}</p>
                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                              {biz.categories.map((c) => c.replace(/_/g, ' ')).join(', ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Owner: {biz.owner.name || biz.owner.email || 'Unknown'}
                            {(biz.city || biz.country) &&
                              ` · ${[biz.city, biz.country].filter(Boolean).join(', ')}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Submitted {new Date(biz.createdAt).toLocaleDateString()}
                          </p>
                          <div className="mt-2">
                            <Textarea
                              placeholder="Rejection notes (optional)"
                              className="text-xs h-14 resize-none"
                              value={rejectNotes[biz.id] ?? ''}
                              onChange={(e) =>
                                setRejectNotes((prev) => ({
                                  ...prev,
                                  [biz.id]: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <ActionButton
                            id={biz.id}
                            activeId={actioningId}
                            variant="approve"
                            onClick={() =>
                              act(
                                () => approveBusinessSubmission(biz.id).unwrap(),
                                biz.id,
                                `${biz.displayName} approved`,
                              )
                            }
                          />
                          <ActionButton
                            id={`reject-${biz.id}`}
                            activeId={actioningId}
                            variant="reject"
                            onClick={() =>
                              act(
                                () =>
                                  rejectBusinessSubmission({
                                    businessId: biz.id,
                                    notes: rejectNotes[biz.id] || undefined,
                                  }).unwrap(),
                                `reject-${biz.id}`,
                                `${biz.displayName} rejected`,
                              )
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Pending clubs ── */}
        <TabsContent value="clubs" className="mt-4 space-y-4">
          {data?.pendingClubs.length === 0 ? (
            <EmptyState
              icon={<Shield className="w-8 h-8" />}
              label="No unverified clubs"
            />
          ) : (
            <>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={approveAllClubs}
                  disabled={actioningId === 'bulk-clubs'}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  {actioningId === 'bulk-clubs' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4" />
                  )}
                  Verify All ({data!.pendingClubs.length})
                </Button>
              </div>
              <div className="space-y-3">
                {data!.pendingClubs.map((club) => (
                  <Card key={club.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          <Shield className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{club.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Owner: {club.owner?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {club._count.members} member{club._count.members !== 1 ? 's' : ''} ·
                            Created {new Date(club.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <ActionButton
                            id={club.id}
                            activeId={actioningId}
                            variant="approve"
                            onClick={() =>
                              act(
                                () => verifyClub(club.id).unwrap(),
                                club.id,
                                `${club.name} verified`,
                              )
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Club join requests ── */}
        <TabsContent value="club-requests" className="mt-4 space-y-4">
          {data?.pendingClubRequests.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              label="No pending club join requests"
            />
          ) : (
            <>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={approveAllClubRequests}
                  disabled={actioningId === 'bulk-club-requests'}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  {actioningId === 'bulk-club-requests' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4" />
                  )}
                  Approve All ({data!.pendingClubRequests.length})
                </Button>
              </div>
              <div className="space-y-3">
                {data!.pendingClubRequests.map((req) => (
                  <Card key={req.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback>
                            {(req.user.name || req.user.email || 'U')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">
                            {req.user.name || req.user.email || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Wants to join{' '}
                            <span className="font-medium text-foreground">
                              {req.club.name}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <ActionButton
                            id={req.id}
                            activeId={actioningId}
                            variant="approve"
                            onClick={() =>
                              act(
                                () => approveClubRequest(req.id).unwrap(),
                                req.id,
                                'Request approved',
                              )
                            }
                          />
                          <ActionButton
                            id={`reject-${req.id}`}
                            activeId={actioningId}
                            variant="reject"
                            onClick={() =>
                              act(
                                () => rejectClubRequest(req.id).unwrap(),
                                `reject-${req.id}`,
                                'Request rejected',
                              )
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Ride join requests ── */}
        <TabsContent value="ride-requests" className="mt-4 space-y-4">
          {data?.pendingRideRequests.length === 0 ? (
            <EmptyState
              icon={<MapPin className="w-8 h-8" />}
              label="No pending ride join requests"
            />
          ) : (
            <>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={approveAllRideRequests}
                  disabled={actioningId === 'bulk-ride-requests'}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  {actioningId === 'bulk-ride-requests' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4" />
                  )}
                  Accept All ({data!.pendingRideRequests.length})
                </Button>
              </div>
              <div className="space-y-3">
                {data!.pendingRideRequests.map((req) => (
                  <Card key={req.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback>
                            {(req.user.name || req.user.email || 'U')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">
                            {req.user.name || req.user.email || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Wants to join ride:{' '}
                            <span className="font-medium text-foreground">
                              {req.ride.title}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(req.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <ActionButton
                            id={req.id}
                            activeId={actioningId}
                            variant="approve"
                            onClick={() =>
                              act(
                                () => acceptRideParticipant(req.id).unwrap(),
                                req.id,
                                'Participant accepted',
                              )
                            }
                          />
                          <ActionButton
                            id={`decline-${req.id}`}
                            activeId={actioningId}
                            variant="reject"
                            onClick={() =>
                              act(
                                () => declineRideParticipant(req.id).unwrap(),
                                `decline-${req.id}`,
                                'Participant declined',
                              )
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Ad campaign approvals ── */}
        <TabsContent value="ad-campaigns" className="mt-4 space-y-4">
          {adCampaigns.length === 0 ? (
            <EmptyState
              icon={<Megaphone className="w-8 h-8" />}
              label="No ad campaigns awaiting approval"
            />
          ) : (
            <>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={approveAllAdCampaigns}
                  disabled={actioningId === 'bulk-ads'}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  {actioningId === 'bulk-ads' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4" />
                  )}
                  Approve All ({adCampaigns.length})
                </Button>
              </div>
              <div className="space-y-3">
                {adCampaigns.map((ad) => (
                  <Card key={ad.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {ad.imageUrl && (
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-16 h-16 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{ad.title}</p>
                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                              {ad.ctaLabel}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            By {ad.business.displayName}
                            {' · ₹'}
                            {(ad.budgetPaise / 100).toLocaleString()} budget
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(ad.startsAt).toLocaleDateString()} –{' '}
                            {new Date(ad.endsAt).toLocaleDateString()}
                          </p>
                          <div className="mt-2">
                            <Textarea
                              placeholder="Rejection notes (optional)"
                              className="text-xs h-14 resize-none"
                              value={rejectNotes[ad.id] ?? ''}
                              onChange={(e) =>
                                setRejectNotes((prev) => ({
                                  ...prev,
                                  [ad.id]: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <ActionButton
                            id={ad.id}
                            activeId={actioningId}
                            variant="approve"
                            onClick={() =>
                              act(
                                () =>
                                  approveAdCampaign({
                                    id: ad.id,
                                    notes: rejectNotes[ad.id] || undefined,
                                  }).unwrap(),
                                ad.id,
                                `${ad.title} approved`,
                              )
                            }
                          />
                          <ActionButton
                            id={`reject-${ad.id}`}
                            activeId={actioningId}
                            variant="reject"
                            onClick={() =>
                              act(
                                () =>
                                  rejectAdCampaign({
                                    id: ad.id,
                                    notes: rejectNotes[ad.id] || undefined,
                                  }).unwrap(),
                                `reject-${ad.id}`,
                                `${ad.title} rejected`,
                              )
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Discount moderation ── */}
        <TabsContent value="discounts" className="mt-4 space-y-4">
          {discounts.length === 0 ? (
            <EmptyState
              icon={<Percent className="w-8 h-8" />}
              label="No active discounts"
            />
          ) : (
            <div className="space-y-3">
              {discounts.map((d) => (
                <Card key={d.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <Percent className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm truncate">{d.title}</p>
                          {d.code && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4 px-1 font-mono"
                            >
                              {d.code}
                            </Badge>
                          )}
                          {d.isFeatured && (
                            <Badge variant="secondary" className="text-[10px] h-4 px-1">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {d.percentOff != null
                            ? `${d.percentOff}% off`
                            : d.amountOffPaise != null
                              ? `₹${(d.amountOffPaise / 100).toLocaleString()} off`
                              : 'Discount'}
                          {' · by '}
                          {d.business.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(d.validFrom).toLocaleDateString()} –{' '}
                          {new Date(d.validUntil).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="h-8 px-3 gap-1"
                        >
                          <a
                            href={`/b/${d.businessId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3" /> Brand
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!!actioningId}
                          onClick={() =>
                            act(
                              () => deleteAdminDiscount(d.id).unwrap(),
                              d.id,
                              'Discount removed',
                            )
                          }
                          className="gap-1 border-red-200 text-red-600 hover:bg-red-50 h-8 px-3"
                        >
                          {actioningId === d.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ActionButton({
  id,
  activeId,
  variant,
  onClick,
}: {
  id: string
  activeId: string | null
  variant: 'approve' | 'reject'
  onClick: () => void
}) {
  const busy = activeId === id
  if (variant === 'approve') {
    return (
      <Button
        size="sm"
        onClick={onClick}
        disabled={!!activeId}
        className="gap-1 bg-green-600 hover:bg-green-700 h-8 px-3"
      >
        {busy ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <CheckCircle className="w-3 h-3" />
        )}
        {busy ? '' : 'Approve'}
      </Button>
    )
  }
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      disabled={!!activeId}
      className="gap-1 border-red-200 text-red-600 hover:bg-red-50 h-8 px-3"
    >
      {busy ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {busy ? '' : 'Reject'}
    </Button>
  )
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
        {icon}
        <p className="text-sm">{label}</p>
      </CardContent>
    </Card>
  )
}
