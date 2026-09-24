'use client'

import { useState, useRef } from 'react'
import { Upload, X, Check, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploadBrandAssetMutation } from '@/features/admin/api'
import { toast } from 'sonner'

interface AssetDropzoneProps {
  label: string
  description: string
  assetType: 'logo' | 'icon' | 'favicon'
  currentUrl?: string | null
  onUploaded: (url: string) => void
  recommendedDimensions?: string
}

export function AssetDropzone({
  label,
  description,
  assetType,
  currentUrl,
  onUploaded,
  recommendedDimensions = '512x512 PNG or SVG',
}: AssetDropzoneProps) {
  const [uploadAsset, { isLoading }] = useUploadBrandAssetMutation()
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileProcess = async (file: File) => {
    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds maximum limit of 5MB')
      return
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PNG, JPG, WebP, and SVG files are supported')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      if (!base64) return

      try {
        const res = await uploadAsset({ file: base64, type: assetType }).unwrap()
        onUploaded(res.secureUrl || res.url)
        toast.success(`${label} uploaded successfully to Cloudinary!`)
      } catch (err: unknown) {
        console.error('Failed to upload brand asset:', err)
        const message =
          (err as { data?: { message?: string }; message?: string })?.data
            ?.message ||
          (err as Error)?.message ||
          'Failed to upload asset'
        toast.error(message)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files?.[0]) {
      handleFileProcess(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-white tracking-wide">{label}</span>
          <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
        </div>
        <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
          {recommendedDimensions}
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
          isDragOver
            ? 'border-[#ff1d2d] bg-[#ff1d2d]/10'
            : 'border-[#3a3a3c] bg-[#141416] hover:border-neutral-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileProcess(e.target.files[0])
            }
          }}
        />

        {/* Thumbnail preview */}
        <div className="relative w-16 h-16 rounded-lg bg-[#0d0d0f] border border-[#3a3a3c] flex items-center justify-center overflow-hidden shrink-0 group">
          {currentUrl ? (
            <img
              src={currentUrl}
              alt={label}
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-neutral-600" />
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-[#ff1d2d] animate-spin" />
            </div>
          )}
        </div>

        {/* Details & Actions */}
        <div className="flex-1 min-w-0 text-center md:text-left">
          {currentUrl ? (
            <div className="flex flex-col">
              <span className="text-xs font-mono text-emerald-400 flex items-center justify-center md:justify-start gap-1 font-semibold">
                <Check className="w-3.5 h-3.5" /> Asset Configured
              </span>
              <span className="text-[11px] text-neutral-400 truncate mt-0.5" title={currentUrl}>
                {currentUrl}
              </span>
            </div>
          ) : (
            <div className="text-xs text-neutral-400">
              Drag & drop asset file here, or click to browse
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="border-[#3a3a3c] bg-[#1c1c1e] text-white hover:bg-neutral-800 hover:text-white text-xs h-8"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            {currentUrl ? 'Replace' : 'Upload'}
          </Button>

          {currentUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLoading}
              onClick={() => onUploaded('')}
              className="text-neutral-400 hover:text-red-400 hover:bg-red-950/20 text-xs h-8 px-2"
              title="Clear asset"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
