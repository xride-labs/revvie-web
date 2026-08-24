'use client'

import { motion } from 'motion/react'

/**
 * Subtle SVG atmospheric art for auth page backgrounds.
 * Red-only palette — no teal/blue.
 */
export function PortalBackdropArt() {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 1440 900"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <defs>
        <linearGradient id="portal-grid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e50000" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#7dff00" stopOpacity="0.20" />
        </linearGradient>
        <radialGradient id="portal-halo" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="rgba(229,0,0,0.14)" />
          <stop offset="100%" stopColor="rgba(10,10,10,0)" />
        </radialGradient>
      </defs>

      <rect width="1440" height="900" fill="url(#portal-halo)" />

      <g stroke="url(#portal-grid)" strokeWidth="1" fill="none" opacity="0.45">
        <path d="M0 180 C220 120, 360 280, 560 220 S940 120, 1440 210" />
        <path d="M0 330 C190 250, 420 420, 640 330 S1020 240, 1440 320" />
        <path d="M0 500 C230 430, 450 620, 680 520 S1060 420, 1440 500" />
        <path d="M0 670 C200 600, 440 780, 720 680 S1080 590, 1440 700" />
      </g>

      <g stroke="#e50000" strokeWidth="1.2" fill="none" opacity="0.30">
        <circle cx="230" cy="190" r="90" />
        <circle cx="1180" cy="650" r="120" />
        <path d="M860 160 L980 120 L1100 160 L1060 290 L900 320 Z" />
      </g>

      <g fill="#e50000" opacity="0.40">
        <circle cx="160" cy="590" r="3" />
        <circle cx="420" cy="740" r="2.5" />
        <circle cx="980" cy="210" r="2.5" />
        <circle cx="1260" cy="430" r="3" />
      </g>
    </motion.svg>
  )
}
