import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ClubMember } from '@/entities/club/model'

export function RemoveMemberDialog({
  open,
  onOpenChange,
  member,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: ClubMember | null
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {member?.user.name} from the club? They will
            need to request to join again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Remove Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
