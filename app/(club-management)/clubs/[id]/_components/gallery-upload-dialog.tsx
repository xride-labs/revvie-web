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

export function GalleryUploadDialog({
  open,
  onOpenChange,
  files,
  onFilesChange,
  uploading,
  onUpload,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  files: File[]
  onFilesChange: (files: File[]) => void
  uploading: boolean
  onUpload: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Club Photos</DialogTitle>
          <DialogDescription>Add photos to the club gallery.</DialogDescription>
        </DialogHeader>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onFilesChange(Array.from(e.target.files || []))}
        />
        {files.length > 0 && (
          <p className="text-xs text-muted-foreground">{files.length} file(s) selected</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onUpload} disabled={uploading || files.length === 0}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
