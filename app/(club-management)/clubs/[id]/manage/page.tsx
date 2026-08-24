'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  useGetClubQuery,
  useGetPendingRequestsQuery,
  useApproveRequestMutation,
  useRejectRequestMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useDeleteClubMutation,
  useUpdateClubMutation,
} from '@/features/clubs/api'
import type { ClubMember } from '@/entities/club/model'
import type { ClubRequestsResponse } from '@/features/clubs/schemas'
import { mapApiError } from '@/lib/errors'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBulkSelection } from '@/hooks/use-bulk-selection'
import { usePerformClubManagerBulkActionMutation } from '@/features/admin/api'
import { ChevronLeft, Settings, Users, Shield, Bell, BarChart3 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { PhantomLoader } from '@/components/loading/phantom-loader'

import type { ClubSettings } from './_lib/constants'
import { MembersTab } from './_components/members-tab'
import { RequestsTab } from './_components/requests-tab'
import { SettingsTab } from './_components/settings-tab'
import { DangerTab } from './_components/danger-tab'
import { RemoveMemberDialog } from './_components/remove-member-dialog'
import { DeleteClubDialog } from './_components/delete-club-dialog'

type Member = ClubMember
type PendingRequest = ClubRequestsResponse['requests'][number]

export default function ClubManagePage() {
  const params = useParams()
  const router = useRouter()
  const {
    success: successToast,
    error: errorToast,
    loading: loadingToast,
    dismiss: dismissToast,
  } = useToast()
  const clubId = params.id as string
  const [activeTab, setActiveTab] = useState('members')
  const [clubSettings, setClubSettings] = useState<ClubSettings | null>(null)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsFieldErrors, setSettingsFieldErrors] = useState<Record<string, string>>(
    {},
  )
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [isDeleteClubDialogOpen, setIsDeleteClubDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const {
    data: clubResponse,
    isLoading: clubLoading,
    isError: clubError,
  } = useGetClubQuery(clubId, { skip: !clubId })
  const { data: pendingResponse, isLoading: pendingLoading } = useGetPendingRequestsQuery(
    clubId,
    { skip: !clubId },
  )
  const [approveRequest] = useApproveRequestMutation()
  const [rejectRequest] = useRejectRequestMutation()
  const [updateMemberRole] = useUpdateMemberRoleMutation()
  const [removeMember] = useRemoveMemberMutation()
  const [deleteClub] = useDeleteClubMutation()
  const [updateClub] = useUpdateClubMutation()

  const loading = clubLoading || pendingLoading
  const error = clubError ? 'Failed to load club management data' : null
  const members: Member[] = clubResponse?.club.members ?? []
  const pendingRequests: PendingRequest[] = pendingResponse?.requests ?? []

  useEffect(() => {
    if (!clubResponse) return
    const clubData = clubResponse.club
    setClubSettings({
      id: clubData.id,
      name: clubData.name,
      description: clubData.description,
      location: clubData.location,
      isPublic: clubData.isPublic,
      // The backend does not return these three on GET /clubs/:id — the previous
      // `clubData.requireApproval ?? true` read undefined and fell through to the
      // default on every load, so the toggles never reflected saved state. Kept as
      // explicit defaults until the backend exposes them.
      requireApproval: true,
      allowMemberInvites: true,
      showMemberList: true,
    })
  }, [clubResponse])

  const handleApproveRequest = async (requestId: string, userId: string) => {
    if (!clubSettings) return
    const loadingToastId = loadingToast('Approving request...', {
      description: 'Updating membership status.',
    })
    try {
      await approveRequest({ clubId: clubSettings.id, userId }).unwrap()
      successToast('Request approved')
    } catch (err) {
      console.error('Failed to approve request:', err)
      errorToast('Failed to approve request', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const handleRejectRequest = async (requestId: string, userId: string) => {
    if (!clubSettings) return
    const loadingToastId = loadingToast('Rejecting request...', {
      description: 'Updating membership status.',
    })
    try {
      await rejectRequest({ clubId: clubSettings.id, userId }).unwrap()
      successToast('Request rejected')
    } catch (err) {
      console.error('Failed to reject request:', err)
      errorToast('Failed to reject request', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  // ── Bulk approve/reject of join requests (club-manager scope) ──────────────
  const reqSel = useBulkSelection()
  const [bulkBusy, setBulkBusy] = useState<'approve' | 'reject' | null>(null)
  const [performClubManagerBulkAction] = usePerformClubManagerBulkActionMutation()

  const runBulkRequests = async (action: 'approve' | 'reject') => {
    if (!clubSettings || reqSel.count === 0) return
    const ids = reqSel.selectedIds
    setBulkBusy(action)
    const tid = loadingToast(
      `${action === 'approve' ? 'Approving' : 'Rejecting'} ${ids.length} request${ids.length === 1 ? '' : 's'}...`,
    )
    try {
      const result = await performClubManagerBulkAction({
        module: 'club-member-requests',
        action,
        ids,
      }).unwrap()
      reqSel.clear()
      successToast(
        `${result.processed} request${result.processed === 1 ? '' : 's'} ${action === 'approve' ? 'approved' : 'rejected'}`,
      )
    } catch (err) {
      errorToast(`Bulk ${action} failed`, {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      dismissToast(tid)
      setBulkBusy(null)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!clubSettings) return
    const loadingToastId = loadingToast('Updating role...', {
      description: 'Applying member role changes.',
    })
    const member = members.find((m) => m.id === memberId)
    const userId = member?.userId || memberId
    try {
      await updateMemberRole({
        clubId: clubSettings.id,
        userId,
        data: { role: newRole as 'MEMBER' | 'OFFICER' | 'ADMIN' },
      }).unwrap()
      successToast('Member role updated')
    } catch (err) {
      console.error('Failed to update member role:', err)
      errorToast('Failed to update role', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const handleRemoveMember = async () => {
    if (!clubSettings || !selectedMember) return
    const loadingToastId = loadingToast('Removing member...', {
      description: 'Updating club membership list.',
    })
    const userId = selectedMember.userId || selectedMember.id
    try {
      await removeMember({ clubId: clubSettings.id, userId }).unwrap()
      setIsRemoveDialogOpen(false)
      setSelectedMember(null)
      successToast('Member removed')
    } catch (err) {
      console.error('Failed to remove member:', err)
      errorToast('Failed to remove member', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const handleDeleteClub = async () => {
    if (!clubSettings || deleteConfirmText !== clubSettings.name) return
    const loadingToastId = loadingToast('Deleting club...', {
      description: 'Removing club data and members.',
    })
    try {
      await deleteClub(clubSettings.id).unwrap()
      successToast('Club deleted')
      router.push('/clubs')
    } catch (err) {
      console.error('Failed to delete club:', err)
      errorToast('Failed to delete club', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const handleSaveSettings = async () => {
    if (!clubSettings || isSavingSettings) return
    setIsSavingSettings(true)
    setSettingsFieldErrors({})
    const loadingToastId = loadingToast('Saving settings...', {
      description: 'Updating club configuration.',
    })
    try {
      await updateClub({
        clubId: clubSettings.id,
        data: {
          name: clubSettings.name,
          description: clubSettings.description,
          location: clubSettings.location,
          isPublic: clubSettings.isPublic,
        },
      }).unwrap()
      successToast('Club settings saved')
    } catch (err) {
      console.error('Failed to update club settings:', err)
      const mapped = mapApiError(err)
      if (mapped.fieldErrors) setSettingsFieldErrors(mapped.fieldErrors)
      errorToast(mapped.message, {
        description: mapped.title,
      })
    } finally {
      dismissToast(loadingToastId)
      setIsSavingSettings(false)
    }
  }

  if (loading) {
    return (
      <PhantomLoader loading>
        <div className="min-h-screen p-4 lg:p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-muted rounded-lg" />
            <div className="space-y-1">
              <div className="h-7 w-40 bg-muted rounded" />
              <div className="h-4 w-28 bg-muted rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-28 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="rounded-xl border bg-card p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 w-full bg-muted rounded" />
            ))}
          </div>
        </div>
      </PhantomLoader>
    )
  }

  if (error || !clubSettings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || 'Club not found'}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Manage Club</h1>
          <p className="text-sm text-muted-foreground">{clubSettings.name}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/clubs/${params.id}/analytics`)}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Analytics
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="members" className="gap-2">
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <Bell className="w-4 h-4" />
            Requests
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-2 text-red-600">
            <Shield className="w-4 h-4" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MembersTab
            members={members}
            onRoleChange={handleRoleChange}
            onSelectForRemoval={(member) => {
              setSelectedMember(member)
              setIsRemoveDialogOpen(true)
            }}
          />
        </TabsContent>

        <TabsContent value="requests">
          <RequestsTab
            pendingRequests={pendingRequests}
            reqSel={reqSel}
            bulkBusy={bulkBusy}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            onBulkApprove={() => runBulkRequests('approve')}
            onBulkReject={() => runBulkRequests('reject')}
          />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab
            clubSettings={clubSettings}
            onChange={setClubSettings}
            fieldErrors={settingsFieldErrors}
            isSaving={isSavingSettings}
            onSave={handleSaveSettings}
          />
        </TabsContent>

        <TabsContent value="danger">
          <DangerTab onRequestDelete={() => setIsDeleteClubDialogOpen(true)} />
        </TabsContent>
      </Tabs>

      <RemoveMemberDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        member={selectedMember}
        onConfirm={handleRemoveMember}
      />

      <DeleteClubDialog
        open={isDeleteClubDialogOpen}
        onOpenChange={setIsDeleteClubDialogOpen}
        clubName={clubSettings.name}
        confirmText={deleteConfirmText}
        onConfirmTextChange={setDeleteConfirmText}
        onConfirm={handleDeleteClub}
      />
    </div>
  )
}
