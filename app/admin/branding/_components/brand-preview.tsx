'use client'

import { useState } from 'react'
import { Monitor, Smartphone, Mail, Globe, Sparkles } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { BrandingConfig } from '@/entities/admin/model'

interface BrandPreviewProps {
  branding: BrandingConfig
}

export function BrandPreview({ branding }: BrandPreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')

  const fontStyle = {
    fontFamily: `${branding.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  }

  return (
    <div className="flex flex-col h-full bg-[#1c1c1e] rounded-2xl border border-[#3a3a3c] overflow-hidden shadow-2xl">
      {/* Studio Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#3a3a3c] bg-[#141416]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#ff1d2d]" />
          <span className="text-sm font-bold text-white tracking-wider uppercase">
            Live Brand Simulation
          </span>
        </div>

        {/* Device switcher */}
        <div className="flex items-center gap-1 bg-[#0d0d0f] p-1 rounded-lg border border-[#3a3a3c]">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded-md transition-colors ${
              device === 'desktop' ? 'bg-[#1c1c1e] text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Desktop Preview"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded-md transition-colors ${
              device === 'mobile' ? 'bg-[#1c1c1e] text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Mobile Preview"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Tabs defaultValue="email" className="flex-1 flex flex-col">
        <div className="px-6 pt-3 border-b border-[#3a3a3c] bg-[#141416]/50">
          <TabsList className="bg-[#0d0d0f] border border-[#3a3a3c] p-1">
            <TabsTrigger
              value="email"
              className="text-xs data-[state=active]:bg-[#1c1c1e] data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              Transactional Email
            </TabsTrigger>
            <TabsTrigger
              value="web"
              className="text-xs data-[state=active]:bg-[#1c1c1e] data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              Web App Navigation
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Transactional Email Preview */}
        <TabsContent
          value="email"
          className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-[#050506]"
        >
          <div
            className={`transition-all duration-300 w-full ${
              device === 'mobile' ? 'max-w-[380px]' : 'max-w-[560px]'
            }`}
          >
            {/* Simulated Email Container */}
            <div
              className="rounded-2xl border overflow-hidden shadow-2xl transition-all"
              style={{
                backgroundColor: branding.canvasColor,
                borderColor: branding.borderColor,
                ...fontStyle,
              }}
            >
              {/* Email Top Header Card */}
              <div
                className="p-5 border-b transition-colors flex items-center justify-between"
                style={{
                  backgroundColor: branding.surfaceColor,
                  borderColor: branding.borderColor,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border flex items-center justify-center overflow-hidden shrink-0"
                    style={{
                      borderColor: branding.borderColor,
                      backgroundColor: branding.canvasColor,
                    }}
                  >
                    {branding.iconUrl || branding.logoUrl ? (
                      <img
                        src={branding.iconUrl || branding.logoUrl}
                        alt={branding.siteName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded bg-neutral-700" />
                    )}
                  </div>
                  <div>
                    <div
                      className="text-base font-bold tracking-widest uppercase leading-none"
                      style={{ color: '#ffffff', ...fontStyle }}
                    >
                      {branding.siteName}
                    </div>
                    <div
                      className="text-[10px] font-semibold text-neutral-400 tracking-wider uppercase mt-1"
                      style={fontStyle}
                    >
                      {branding.tagline}
                    </div>
                  </div>
                </div>

                <div
                  className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
                  style={{
                    backgroundColor: `${branding.primaryColor}22`,
                    borderColor: `${branding.primaryColor}55`,
                    color: branding.primaryColor,
                    borderWidth: '1px',
                    ...fontStyle,
                  }}
                >
                  {branding.emailHeaderBadge || 'OFFICIAL DISPATCH'}
                </div>
              </div>

              {/* Email Body Card */}
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h2
                    className="text-2xl font-bold tracking-tight mb-2"
                    style={{ color: '#ffffff', ...fontStyle }}
                  >
                    Welcome to {branding.siteName} 🏍️
                  </h2>
                  <p className="text-sm font-semibold text-neutral-300">
                    Hi Rider,
                  </p>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    Your rider account is officially active. Explore curated twisty routes, connect with verified rider chapters, and roll out with community packs.
                  </p>
                </div>

                {/* Simulated Spec-Rail Row */}
                <div
                  className="rounded-xl border overflow-hidden divide-y"
                  style={{
                    borderColor: branding.borderColor,
                    backgroundColor: '#141416',
                  }}
                >
                  <div className="p-3.5 flex items-start gap-3">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0 shadow-sm"
                      style={{
                        backgroundColor: branding.primaryColor,
                        boxShadow: `0 0 8px ${branding.primaryColor}`,
                      }}
                    />
                    <div>
                      <div className="text-xs font-bold text-white tracking-wide">
                        Verified Club Access
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        Manage roster, organize group rides, and broadcast ride alerts.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Auth Code Block */}
                <div
                  className="p-5 rounded-xl border text-center space-y-2"
                  style={{
                    backgroundColor: '#141416',
                    borderColor: branding.borderColor,
                  }}
                >
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    Verification Passcode
                  </div>
                  <div
                    className="text-3xl font-mono font-bold tracking-[8px] text-white"
                  >
                    749201
                  </div>
                  <div className="text-[10px] text-neutral-500 font-medium">
                    EXPIRES IN 10 MINUTES &bull; SINGLE USE
                  </div>
                </div>

                {/* Simulated Primary CTA Button */}
                <div className="text-center pt-2">
                  <div
                    className="inline-block px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-white transition-transform active:scale-95 cursor-pointer shadow-lg"
                    style={{
                      backgroundColor: branding.primaryColor,
                      border: `2px solid ${branding.primaryColor}`,
                      boxShadow: `4px 4px 0px ${branding.deepColor}`,
                      ...fontStyle,
                    }}
                  >
                    Launch Rider Console
                  </div>
                </div>
              </div>

              {/* Email Footer */}
              <div className="px-6 py-6 border-t text-center text-[11px] text-neutral-500 space-y-1.5"
                style={{ borderColor: branding.borderColor }}
              >
                <div className="font-bold text-white tracking-wider uppercase" style={fontStyle}>
                  {branding.siteName} &bull; {branding.tagline}
                </div>
                <div>Questions? {branding.supportEmail}</div>
                <div className="text-[10px] text-neutral-600">&copy; {new Date().getFullYear()} {branding.siteName}. All rights reserved.</div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Web App Navigation Preview */}
        <TabsContent
          value="web"
          className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-[#050506]"
        >
          <div
            className={`transition-all duration-300 w-full ${
              device === 'mobile' ? 'max-w-[380px]' : 'max-w-[680px]'
            }`}
          >
            <div
              className="rounded-2xl border overflow-hidden shadow-2xl bg-[#0d0d0f]"
              style={{ borderColor: branding.borderColor }}
            >
              {/* Simulated Browser Bar */}
              <div className="px-4 py-2.5 bg-[#141416] border-b border-[#3a3a3c] flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center font-mono text-[11px] text-neutral-400 bg-[#0d0d0f] py-1 px-3 rounded-md border border-[#2a2a2c] truncate">
                  {branding.siteUrl || 'https://revvie.xride-labs.in'}
                </div>
              </div>

              {/* Simulated Navigation Bar */}
              <div
                className="px-6 py-4 flex items-center justify-between border-b"
                style={{
                  backgroundColor: branding.surfaceColor,
                  borderColor: branding.borderColor,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl border flex items-center justify-center overflow-hidden shrink-0"
                    style={{
                      borderColor: branding.borderColor,
                      backgroundColor: branding.canvasColor,
                    }}
                  >
                    {branding.iconUrl || branding.logoUrl ? (
                      <img
                        src={branding.iconUrl || branding.logoUrl}
                        alt={branding.siteName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded bg-neutral-700" />
                    )}
                  </div>
                  <span
                    className="text-lg font-bold tracking-widest uppercase text-white"
                    style={fontStyle}
                  >
                    {branding.siteName}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-6 text-xs font-semibold text-neutral-300" style={fontStyle}>
                  <span className="text-white hover:text-white cursor-pointer">Explore Rides</span>
                  <span className="hover:text-white cursor-pointer">Clubs</span>
                  <span className="hover:text-white cursor-pointer">Marketplace</span>
                </div>

                <div>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md"
                    style={{
                      backgroundColor: branding.primaryColor,
                      boxShadow: `2px 2px 0px ${branding.deepColor}`,
                      ...fontStyle,
                    }}
                  >
                    Join Crew
                  </button>
                </div>
              </div>

              {/* Simulated Hero Snippet */}
              <div className="p-8 text-center space-y-4">
                <span
                  className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
                  style={{
                    backgroundColor: `${branding.primaryColor}22`,
                    color: branding.primaryColor,
                    borderColor: `${branding.primaryColor}55`,
                    borderWidth: '1px',
                    ...fontStyle,
                  }}
                >
                  {branding.tagline}
                </span>
                <h1
                  className="text-3xl font-extrabold text-white tracking-tight"
                  style={fontStyle}
                >
                  The Digital Throttle for Motorcycle Culture
                </h1>
                <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                  Join verified club leads, coordinate Sunday rides, and trade motorcycle gear in an authenticated rider marketplace.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
