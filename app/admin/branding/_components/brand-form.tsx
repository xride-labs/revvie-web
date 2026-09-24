'use client'

import { useState } from 'react'
import { Save, RotateCcw, Mail, Sparkles, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AssetDropzone } from './asset-dropzone'
import type { BrandingConfig } from '@/entities/admin/model'
import { useSendBrandTestEmailMutation } from '@/features/admin/api'
import { toast } from 'sonner'

interface BrandFormProps {
  branding: BrandingConfig
  onChange: (updated: BrandingConfig) => void
  onSave: () => Promise<void>
  onReset: () => void
  isSaving: boolean
  isDirty: boolean
}

const FONT_OPTIONS = [
  { value: 'Josefin Sans', label: 'Josefin Sans (Motorsport Editorial - Default)' },
  { value: 'Inter', label: 'Inter (Clean Technical)' },
  { value: 'Outfit', label: 'Outfit (Modern Geometric)' },
  { value: 'Roboto', label: 'Roboto (High Legibility)' },
  { value: 'Syne', label: 'Syne (Avant-Garde)' },
]

export function BrandForm({
  branding,
  onChange,
  onSave,
  onReset,
  isSaving,
  isDirty,
}: BrandFormProps) {
  const [sendTestEmail, { isLoading: isSendingTest }] = useSendBrandTestEmailMutation()
  const [testEmailRecipient, setTestEmailRecipient] = useState('')
  const [showTestModal, setShowTestModal] = useState(false)

  const handleFieldChange = <K extends keyof BrandingConfig>(
    key: K,
    value: BrandingConfig[K]
  ) => {
    onChange({
      ...branding,
      [key]: value,
    })
  }

  const handleSendTest = async () => {
    try {
      const res = await sendTestEmail({
        to: testEmailRecipient.trim() || undefined,
      }).unwrap()
      toast.success(
        `Brand test email dispatched to ${res.recipient}! Check inbox.`
      )
      setShowTestModal(false)
    } catch (err: unknown) {
      console.error('Failed to send test email:', err)
      const message =
        (err as { data?: { message?: string }; message?: string })?.data
          ?.message ||
        (err as Error)?.message ||
        'Failed to dispatch test email'
      toast.error(message)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Action Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#1c1c1e] border border-[#3a3a3c] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff1d2d]/10 border border-[#ff1d2d]/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#ff1d2d]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Brand Configuration Studio
            </h3>
            <p className="text-xs text-neutral-400">
              {isDirty ? 'Unsaved changes pending' : 'All brand tokens in sync'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTestModal(!showTestModal)}
            className="border-[#3a3a3c] bg-[#141416] text-white hover:bg-neutral-800 text-xs h-9"
          >
            <Mail className="w-3.5 h-3.5 mr-1.5 text-neutral-400" />
            Send Test Email
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={isSaving}
            className="border-[#3a3a3c] bg-[#141416] text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs h-9"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Defaults
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={!isDirty || isSaving}
            className={`text-xs h-9 px-4 font-bold uppercase tracking-wider text-white transition-all shadow-md ${
              isDirty
                ? 'bg-[#ff1d2d] hover:bg-[#ff1d2d]/90'
                : 'bg-neutral-800 text-neutral-400 border border-[#3a3a3c]'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1.5" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Test Email Popup bar */}
      {showTestModal && (
        <div className="p-4 rounded-xl bg-[#141416] border border-[#ff1d2d]/30 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Label className="text-xs text-neutral-400 mb-1 block">
              Recipient Email Address
            </Label>
            <Input
              type="email"
              placeholder="creativekrithik@gmail.com"
              value={testEmailRecipient}
              onChange={(e) => setTestEmailRecipient(e.target.value)}
              className="bg-[#0d0d0f] border-[#3a3a3c] text-white text-xs h-9"
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleSendTest}
            disabled={isSendingTest}
            className="bg-[#ff1d2d] hover:bg-[#ff1d2d]/90 text-white text-xs h-9 px-4 w-full sm:w-auto mt-4 sm:mt-5 font-semibold"
          >
            {isSendingTest ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Mail className="w-3.5 h-3.5 mr-1.5" />
            )}
            Dispatch Test
          </Button>
        </div>
      )}

      {/* Brand Identity Card */}
      <Card className="bg-[#1c1c1e] border-[#3a3a3c]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-white font-bold">Brand Identity</CardTitle>
          <CardDescription className="text-xs text-neutral-400">
            Platform names, tagline, and contact info displayed in email headers and footers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300 font-semibold">Site Name</Label>
              <Input
                value={branding.siteName}
                onChange={(e) => handleFieldChange('siteName', e.target.value)}
                className="bg-[#141416] border-[#3a3a3c] text-white text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300 font-semibold">Tagline</Label>
              <Input
                value={branding.tagline}
                onChange={(e) => handleFieldChange('tagline', e.target.value)}
                className="bg-[#141416] border-[#3a3a3c] text-white text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300 font-semibold">Support Email</Label>
              <Input
                type="email"
                value={branding.supportEmail}
                onChange={(e) => handleFieldChange('supportEmail', e.target.value)}
                className="bg-[#141416] border-[#3a3a3c] text-white text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300 font-semibold">Platform URL</Label>
              <Input
                value={branding.siteUrl}
                onChange={(e) => handleFieldChange('siteUrl', e.target.value)}
                className="bg-[#141416] border-[#3a3a3c] text-white text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography & Dispatch Badge */}
      <Card className="bg-[#1c1c1e] border-[#3a3a3c]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-white font-bold">Typography & Badges</CardTitle>
          <CardDescription className="text-xs text-neutral-400">
            Select typography and custom dispatch pill badge text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300 font-semibold">Font Family</Label>
              <Select
                value={branding.fontFamily}
                onValueChange={(val) => handleFieldChange('fontFamily', val)}
              >
                <SelectTrigger className="bg-[#141416] border-[#3a3a3c] text-white text-xs">
                  <SelectValue placeholder="Select typography" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c1c1e] border-[#3a3a3c] text-white">
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value} className="text-xs">
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-300 font-semibold">
                Email Header Badge Text
              </Label>
              <Input
                value={branding.emailHeaderBadge}
                onChange={(e) => handleFieldChange('emailHeaderBadge', e.target.value)}
                placeholder="OFFICIAL DISPATCH"
                className="bg-[#141416] border-[#3a3a3c] text-white text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Palette & Color Tokens */}
      <Card className="bg-[#1c1c1e] border-[#3a3a3c]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-white font-bold">
            Design Tokens & Palette
          </CardTitle>
          <CardDescription className="text-xs text-neutral-400">
            Manage the primary accent color, dark canvas, elevated surface, and border tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Primary / Signal Accent */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#141416] border border-[#3a3a3c]">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-bold text-white">Signal Accent</Label>
                <div
                  className="w-5 h-5 rounded-md border border-[#3a3a3c]"
                  style={{ backgroundColor: branding.primaryColor }}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => handleFieldChange('primaryColor', e.target.value)}
                  className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                />
                <Input
                  value={branding.primaryColor}
                  onChange={(e) => handleFieldChange('primaryColor', e.target.value)}
                  className="bg-[#0d0d0f] border-[#3a3a3c] text-white font-mono text-xs h-8"
                />
              </div>
            </div>

            {/* Deep Accent / Button Shadow */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#141416] border border-[#3a3a3c]">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-bold text-white">Deep Accent Shadow</Label>
                <div
                  className="w-5 h-5 rounded-md border border-[#3a3a3c]"
                  style={{ backgroundColor: branding.deepColor }}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.deepColor}
                  onChange={(e) => handleFieldChange('deepColor', e.target.value)}
                  className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                />
                <Input
                  value={branding.deepColor}
                  onChange={(e) => handleFieldChange('deepColor', e.target.value)}
                  className="bg-[#0d0d0f] border-[#3a3a3c] text-white font-mono text-xs h-8"
                />
              </div>
            </div>

            {/* Canvas / Background */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#141416] border border-[#3a3a3c]">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-bold text-white">Canvas Black</Label>
                <div
                  className="w-5 h-5 rounded-md border border-[#3a3a3c]"
                  style={{ backgroundColor: branding.canvasColor }}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.canvasColor}
                  onChange={(e) => handleFieldChange('canvasColor', e.target.value)}
                  className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                />
                <Input
                  value={branding.canvasColor}
                  onChange={(e) => handleFieldChange('canvasColor', e.target.value)}
                  className="bg-[#0d0d0f] border-[#3a3a3c] text-white font-mono text-xs h-8"
                />
              </div>
            </div>

            {/* Surface / Card Background */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#141416] border border-[#3a3a3c]">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-bold text-white">Elevated Surface</Label>
                <div
                  className="w-5 h-5 rounded-md border border-[#3a3a3c]"
                  style={{ backgroundColor: branding.surfaceColor }}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.surfaceColor}
                  onChange={(e) => handleFieldChange('surfaceColor', e.target.value)}
                  className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                />
                <Input
                  value={branding.surfaceColor}
                  onChange={(e) => handleFieldChange('surfaceColor', e.target.value)}
                  className="bg-[#0d0d0f] border-[#3a3a3c] text-white font-mono text-xs h-8"
                />
              </div>
            </div>

            {/* Border Token */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#141416] border border-[#3a3a3c]">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-bold text-white">Steel Border</Label>
                <div
                  className="w-5 h-5 rounded-md border border-[#3a3a3c]"
                  style={{ backgroundColor: branding.borderColor }}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.borderColor}
                  onChange={(e) => handleFieldChange('borderColor', e.target.value)}
                  className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                />
                <Input
                  value={branding.borderColor}
                  onChange={(e) => handleFieldChange('borderColor', e.target.value)}
                  className="bg-[#0d0d0f] border-[#3a3a3c] text-white font-mono text-xs h-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Assets Card */}
      <Card className="bg-[#1c1c1e] border-[#3a3a3c]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-white font-bold">Brand Media Assets</CardTitle>
          <CardDescription className="text-xs text-neutral-400">
            Upload CDN-hosted assets to Cloudinary under revvie/branding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AssetDropzone
            label="App Icon Mark"
            description="Square icon used in email headers, web navbar, and notifications."
            assetType="icon"
            currentUrl={branding.iconUrl}
            onUploaded={(url) => handleFieldChange('iconUrl', url)}
            recommendedDimensions="512x512 PNG or WebP"
          />

          <AssetDropzone
            label="Horizontal Logo"
            description="Full horizontal wordmark or emblem for high-resolution displays."
            assetType="logo"
            currentUrl={branding.logoUrl}
            onUploaded={(url) => handleFieldChange('logoUrl', url)}
            recommendedDimensions="1200x400 PNG or SVG"
          />

          <AssetDropzone
            label="Browser Favicon"
            description="Small browser tab icon."
            assetType="favicon"
            currentUrl={branding.faviconUrl}
            onUploaded={(url) => handleFieldChange('faviconUrl', url)}
            recommendedDimensions="64x64 PNG or ICO"
          />
        </CardContent>
      </Card>
    </div>
  )
}
