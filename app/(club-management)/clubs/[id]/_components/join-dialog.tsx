import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function JoinDialog({
  open,
  onOpenChange,
  clubName,
  isPublic,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  clubName: string
  isPublic: boolean
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join {clubName}</DialogTitle>
          <DialogDescription>
            {isPublic
              ? 'You will be added as a member immediately.'
              : 'Your request will be reviewed by the club admins.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>{isPublic ? 'Join Now' : 'Send Request'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
