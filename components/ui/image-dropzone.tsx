'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { UploadCloud, X, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fileToDataUrl } from '@/lib/media-utils'
import { toast } from 'sonner'

export interface ImageDropzoneProps {
  label?: string
  description?: string
  value?: string | null
  aspectRatio?: 'square' | 'banner' | 'video' | 'any'
  maxSizeMB?: number
  disabled?: boolean
  className?: string
  onUpload: (dataUrl: string, file: File) => Promise<string | void>
  onRemove?: () => void
}

const ASPECT_STYLES = {
  square: 'aspect-square max-w-[200px]',
  banner: 'aspect-[3/1] w-full min-h-[140px]',
  video: 'aspect-[16/9] w-full min-h-[160px]',
  any: 'min-h-[140px] w-full',
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']

export function ImageDropzone({
  label,
  description,
  value,
  aspectRatio = 'square',
  maxSizeMB = 5,
  disabled = false,
  className = '',
  onUpload,
  onRemove,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    async (file: File) => {
      setErrorMsg(null)

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        const err = 'Invalid file type. Please upload a JPG, PNG, WebP or SVG.'
        setErrorMsg(err)
        toast.error(err)
        return
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        const err = `File exceeds max allowed size of ${maxSizeMB}MB.`
        setErrorMsg(err)
        toast.error(err)
        return
      }

      try {
        setIsUploading(true)
        const dataUrl = await fileToDataUrl(file)
        await onUpload(dataUrl, file)
      } catch (err: unknown) {
        console.error('Image dropzone upload error:', err)
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setErrorMsg(msg)
        toast.error(msg)
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [maxSizeMB, onUpload],
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isUploading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled || isUploading) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-medium text-white block">{label}</label>}

      {value ? (
        <div
          className={`relative rounded-xl overflow-hidden border border-[#3a3a3c] bg-[#0d0d0f] group ${ASPECT_STYLES[aspectRatio]}`}
        >
          <Image
            src={value}
            alt={label || 'Uploaded media'}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="bg-[#1c1c1e] text-white hover:bg-neutral-800 text-xs gap-1.5"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || disabled}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Replace
            </Button>
            {onRemove && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="bg-[#ff1d2d] hover:bg-[#b3151f] text-white text-xs gap-1.5"
                onClick={onRemove}
                disabled={isUploading || disabled}
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`
            ${ASPECT_STYLES[aspectRatio]}
            border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors
            ${
              isDragging
                ? 'border-[#ff1d2d] bg-[#ff1d2d]/10'
                : 'border-[#3a3a3c] hover:border-neutral-500 bg-[#1c1c1e]/60'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#ff1d2d]" />
              <p className="text-xs text-neutral-400 font-mono">Uploading asset...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-neutral-900 border border-[#3a3a3c] flex items-center justify-center text-neutral-400">
                <UploadCloud className="w-5 h-5 text-neutral-300" />
              </div>
              <p className="text-xs font-medium text-white">
                Drag & drop or <span className="text-[#ff1d2d] underline">browse</span>
              </p>
              <p className="text-[11px] text-neutral-400">
                {description || `PNG, JPG, WebP up to ${maxSizeMB}MB`}
              </p>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {errorMsg}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  )
}
