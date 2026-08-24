import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { BulkActionBar } from '@/components/bulk-action-bar'
import { Check, X } from 'lucide-react'
import type { ClubRequestsResponse } from '@/features/clubs/schemas'
import type { useBulkSelection } from '@/hooks/use-bulk-selection'
import { formatDate } from '../_lib/constants'

type PendingRequest = ClubRequestsResponse['requests'][number]

export function RequestsTab({
  pendingRequests,
  reqSel,
  bulkBusy,
  onApprove,
  onReject,
  onBulkApprove,
  onBulkReject,
}: {
  pendingRequests: PendingRequest[]
  reqSel: ReturnType<typeof useBulkSelection>
  bulkBusy: string | null
  onApprove: (requestId: string, userId: string) => void
  onReject: (requestId: string, userId: string) => void
  onBulkApprove: () => void
  onBulkReject: () => void
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Join Requests</CardTitle>
          <CardDescription>Review and approve member requests</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending requests
            </div>
          ) : (
            <ScrollArea className="h-100">
              {/* Select-all → enables bulk approve/reject via the action bar */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <Checkbox
                  checked={reqSel.allSelected(pendingRequests.map((r) => r.id))}
                  onCheckedChange={() =>
                    reqSel.toggleAll(pendingRequests.map((r) => r.id))
                  }
                  aria-label="Select all requests"
                />
                <span className="text-xs text-muted-foreground">
                  Select all ({pendingRequests.length})
                </span>
              </div>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <Checkbox
                      checked={reqSel.isSelected(request.id)}
                      onCheckedChange={() => reqSel.toggle(request.id)}
                      className="mt-1"
                      aria-label={`Select ${request.user.name ?? 'requester'}`}
                    />
                    <Avatar>
                      <AvatarFallback>
                        {(request.user.name ?? 'U')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{request.user.name ?? 'Unknown'}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                      {request.message && (
                        <p className="mt-2 text-sm bg-muted p-3 rounded-lg">
                          &quot;{request.message}&quot;
                        </p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => onApprove(request.id, request.userId)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReject(request.id, request.userId)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <BulkActionBar
        count={reqSel.count}
        busyKey={bulkBusy}
        onClear={reqSel.clear}
        actions={[
          {
            key: 'approve',
            label: 'Approve',
            icon: <Check className="h-4 w-4" />,
            onClick: onBulkApprove,
          },
          {
            key: 'reject',
            label: 'Reject',
            variant: 'outline',
            icon: <X className="h-4 w-4" />,
            onClick: onBulkReject,
          },
        ]}
      />
    </>
  )
}
