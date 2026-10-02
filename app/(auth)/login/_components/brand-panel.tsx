import Link from 'next/link'
import { Check } from 'lucide-react'
import { PORTAL_FEATURES } from '../_lib/constants'

/** Left-hand brand identity panel — desktop only, purely static. */
export function BrandPanel() {
  return (
    <aside className="hidden lg:flex flex-col w-full min-h-screen bg-[#050505] border-r border-white/[0.08] relative overflow-hidden justify-between">
      {/* Atmospheric glow */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-brand-red-light/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-neon-green/8 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col flex-1 items-start justify-center px-12 xl:px-20 py-16 relative z-10 max-w-xl mx-auto w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-14 group">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
            <img src="/revvie-logo.png" alt="Revvie" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-bold text-white tracking-[0.2em] uppercase">
            Revvie
          </span>
        </Link>

        {/* Headline */}
        <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.12] mb-6 tracking-tight">
          The portal for
          <br />
          <span className="bg-linear-to-r from-brand-red-light via-brand-red to-primary bg-clip-text text-transparent">
            riders who build.
          </span>
        </h1>
        <p className="text-text-secondary text-base mb-10 leading-relaxed max-w-md">
          Manage clubs, run events, track your community, and sell on the marketplace — all
          from one unified dashboard.
        </p>

        {/* Feature list */}
        <ul className="space-y-4">
          {PORTAL_FEATURES.map((f) => (
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
          <span className="text-neon-green font-medium">Revvie mobile app</span> instead —
          clubs, rides & more in your pocket.
        </p>
      </div>
    </aside>
  )
}
