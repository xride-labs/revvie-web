'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImagePlus, Link2, Search, Trash2, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUrlInputProps {
  value: string | null
  onChange: (value: string | null) => void
  label?: string
  hint?: string
  /** 'file' mode also shows the file upload option */
  onFileChange?: (file: File) => void
  filePreview?: string | null
  className?: string
  searchQuery?: string
  aspectClass?: string
}

export function ImageUrlInput({
  value,
  onChange,
  label,
  hint,
  onFileChange,
  filePreview,
  className,
  searchQuery = 'motorcycle',
  aspectClass = 'aspect-square',
}: ImageUrlInputProps) {
  const [urlDraft, setUrlDraft] = useState('')
  const [urlError, setUrlError] = useState('')
  const [previewError, setPreviewError] = useState(false)
  const [tab, setTab] = useState<'upload' | 'url'>('upload')
  const fileRef = useRef<HTMLInputElement>(null)

  const displayPreview = value ?? filePreview ?? null

  const handleApplyUrl = () => {
    const trimmed = urlDraft.trim()
    if (!trimmed) {
      setUrlError('Enter a URL')
      return
    }
    if (!/^https?:\/\/.+\..+/.test(trimmed)) {
      setUrlError('Must be a valid http(s) URL')
      return
    }
    onChange(trimmed)
    setUrlDraft('')
    setUrlError('')
    setPreviewError(false)
  }

  const openGoogleImages = () => {
    window.open(
      `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(searchQuery)}`,
      '_blank',
      'noopener',
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {label && <Label className="text-sm font-semibold">{label}</Label>}

      {/* Preview */}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center',
          aspectClass,
        )}
      >
        {displayPreview && !previewError ? (
          <>
            <img
              src={displayPreview}
              alt={label}
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setPreviewError(true)}
            />
            <button
              type="button"
              onClick={() => {
                onChange(null)
                setPreviewError(false)
              }}
              className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground py-6">
            <ImagePlus className="w-8 h-8" />
            {hint && <p className="text-xs">{hint}</p>}
            {previewError && (
              <p className="text-xs text-destructive">Could not load this URL</p>
            )}
          </div>
        )}
      </div>

      {/* Tab switcher */}
      {onFileChange && (
        <div className="flex rounded-lg border overflow-hidden text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors',
              tab === 'upload'
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Upload className="w-3.5 h-3.5" /> Upload file
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors',
              tab === 'url'
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Link2 className="w-3.5 h-3.5" /> Use URL
          </button>
        </div>
      )}

      {/* File upload (only when onFileChange provided and tab is 'upload') */}
      {onFileChange && tab === 'upload' && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) {
                onFileChange(f)
                onChange(null)
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" /> Choose file
          </Button>
        </>
      )}

      {/* URL input (shown when no onFileChange, or tab === 'url') */}
      {(!onFileChange || tab === 'url') && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={urlDraft}
              onChange={(e) => {
                setUrlDraft(e.target.value)
                setUrlError('')
                setPreviewError(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleApplyUrl()
                }
              }}
              className={urlError ? 'border-destructive' : ''}
            />
            <Button type="button" onClick={handleApplyUrl} size="sm" className="shrink-0">
              Use
            </Button>
          </div>
          {urlError && <p className="text-xs text-destructive">{urlError}</p>}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs gap-1.5"
            onClick={openGoogleImages}
          >
            <Search className="w-3.5 h-3.5" />
            Search Google Images (opens in new tab — copy URL, paste above)
          </Button>
        </div>
      )}
    </div>
  )
}
