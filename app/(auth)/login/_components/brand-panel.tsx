import Link from 'next/link'
import { Check } from 'lucide-react'
import { PORTAL_FEATURES } from '../_lib/constants'

/** Left-hand brand identity panel — desktop only, purely static. */
export function BrandPanel() {
  return (
    <aside className="hidden lg:flex flex-col w-[400px] shrink-0 min-h-screen bg-[#050505] border-r border-border relative overflow-hidden">
      {/* Atmospheric glow */}
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-brand-red-light/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-neon-green/6 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col flex-1 items-start justify-center px-12 py-16 relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-16 group">
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-border">
            <img src="/revvie-logo.png" alt="Revvie" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold text-white tracking-[0.2em] uppercase">
            Revvie
          </span>
        </Link>

        {/* Headline */}
        <h1 className="text-[2.4rem] font-bold text-white leading-[1.15] mb-5 tracking-tight">
          The portal for
          <br />
          <span className="text-brand-red-light">riders who build.</span>
        </h1>
        <p className="text-text-secondary text-[0.95rem] mb-12 leading-relaxed max-w-[280px]">
          Manage clubs, run events, track your community, and sell on the marketplace — all
          from one dashboard.
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
