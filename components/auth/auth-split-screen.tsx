'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'

interface AuthSplitScreenProps {
  children: React.ReactNode
  title: string
  subtitle: string
  features?: string[]
}

const DEFAULT_FEATURES = [
  'Manage riding clubs & member rosters',
  'Run events, challenges & leaderboards',
  'Track rides, stats & group activity',
  'Sell gear on the Revvie marketplace',
]

export function AuthSplitScreen({
  children,
  title,
  subtitle,
  features = DEFAULT_FEATURES,
}: AuthSplitScreenProps) {
  return (
    <div className="min-h-screen flex bg-canvas overflow-hidden">
      {/* ── LEFT PANEL: brand identity (desktop only) ── */}
      <aside className="hidden lg:flex flex-col w-[400px] shrink-0 min-h-screen bg-[#050505] border-r border-border relative overflow-hidden">
        {/* Atmospheric glow */}
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-brand-red-light/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-neon-green/6 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col flex-1 items-start justify-center px-12 py-16 relative z-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-16 group">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-border">
              {}
              <img
                src="/revvie-logo.png"
                alt="Revvie"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold text-white tracking-[0.2em] uppercase">
              Revvie
            </span>
          </Link>

          {/* Headline */}
          <h1 className="text-[2.4rem] font-bold text-white leading-[1.15] mb-5 tracking-tight">
            {title}
            <br />
            <span className="text-brand-red-light">{subtitle}</span>
          </h1>
          <p className="text-text-secondary text-[0.95rem] mb-12 leading-relaxed max-w-[280px]">
            Manage clubs, run events, track your community, and sell on the marketplace —
            all from one dashboard.
          </p>

          {/* Feature list */}
          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-neon-green/12 border border-neon-green/25 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-neon-green" />
                </div>
                <span className="text-sm text-text-secondary">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom hint */}
        <div className="px-12 pb-10 relative z-10">
          <p className="text-xs text-text-secondary/40 leading-relaxed">
            A rider? Download the{' '}
            <span className="text-neon-green font-medium">Revvie mobile app</span> instead
            — clubs, rides & more in your pocket.
          </p>
        </div>
      </aside>

      {/* ── RIGHT PANEL: auth form ── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-brand-red-light/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo — hidden on desktop (left panel shows it) */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-border">
                {}
                <img
                  src="/revvie-logo.png"
                  alt="Revvie"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-bold text-white tracking-[0.2em] uppercase">
                Revvie
              </span>
            </Link>
          </div>

          {/* ── Card ── */}
          <div className="rounded-3xl bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/[0.07] overflow-hidden shadow-atmospheric">
            {/* Top accent line — centered red fade */}
            <div className="h-px bg-linear-to-r from-transparent via-brand-red-light/50 to-transparent" />
            <div className="p-7">{children}</div>
          </div>

          {/* Mobile bottom hint */}
          <p className="lg:hidden text-center text-xs text-text-secondary/30 mt-6">
            A rider? Download the{' '}
            <span className="font-medium text-neon-green">Revvie mobile app</span>{' '}
            instead.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
