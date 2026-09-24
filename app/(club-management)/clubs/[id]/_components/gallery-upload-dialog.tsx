import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { ImageIcon, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

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
  const [previews, setPreviews] = useState<{ id: string; url: string; file: File }[]>([])

  const handleAddFile = (dataUrl: string, file: File) => {
    const id = `${file.name}-${file.size}-${Date.now()}`
    setPreviews((prev) => [...prev, { id, url: dataUrl, file }])
    onFilesChange([...files, file])
  }

  const handleRemove = (id: string, index: number) => {
    setPreviews((prev) => prev.filter((p) => p.id !== id))
    onFilesChange(files.filter((_, i) => i !== index))
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setPreviews([])
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-[#1c1c1e] border-[#3a3a3c] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <ImageIcon className="w-5 h-5 text-[#ff1d2d]" />
            Upload Club Photos
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-400">
            Add high-resolution photos to the club gallery.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <ImageDropzone
            aspectRatio="video"
            description="Drag & drop or browse photos up to 5MB"
            disabled={uploading}
            onUpload={handleAddFile}
          />

          {previews.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-mono text-neutral-400">
                Selected for upload ({previews.length}):
              </p>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                {previews.map((item, idx) => (
                  <div
                    key={item.id}
                    className="relative aspect-video rounded-lg overflow-hidden border border-[#3a3a3c] bg-black/40 group"
                  >
                    <Image
                      src={item.url}
                      alt={item.file.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id, idx)}
                      disabled={uploading}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-[#ff1d2d] transition-colors"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-[#3a3a3c]">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={uploading}
            className="border-[#3a3a3c] bg-[#1c1c1e] text-neutral-300 hover:text-white text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={onUpload}
            disabled={uploading || files.length === 0}
            className="bg-[#ff1d2d] hover:bg-[#b3151f] text-white text-xs gap-1.5"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Uploading ({files.length})...
              </>
            ) : (
              `Upload ${files.length > 0 ? `(${files.length})` : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

