import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function DeleteClubDialog({
  open,
  onOpenChange,
  clubName,
  confirmText,
  onConfirmTextChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  clubName: string
  confirmText: string
  onConfirmTextChange: (value: string) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Club</DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone. All club data will be lost.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="confirm">
            Type <strong>{clubName}</strong> to confirm deletion
          </Label>
          <Input
            id="confirm"
            className="mt-2"
            value={confirmText}
            onChange={(e) => onConfirmTextChange(e.target.value)}
            placeholder="Enter club name"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              onConfirmTextChange('')
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={confirmText !== clubName}
            onClick={onConfirm}
          >
            Delete Forever
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
