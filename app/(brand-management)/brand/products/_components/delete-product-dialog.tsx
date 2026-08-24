import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { BrandProduct } from '@/entities/business/model'

export function DeleteProductDialog({
  target,
  onOpenChange,
  onConfirm,
  deleting,
}: {
  target: BrandProduct | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  deleting: boolean
}) {
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete product?</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{target?.title}</span> will be permanently
            removed from your catalogue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Deleting…
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
