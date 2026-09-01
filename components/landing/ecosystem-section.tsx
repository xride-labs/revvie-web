'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import Link from 'next/link'
import {
  Smartphone,
  MapPin,
  Users,
  ShoppingBag,
  ArrowRight,
  Monitor,
  BarChart3,
  Calendar,
  Package,
  Shield,
} from 'lucide-react'

export function EcosystemSection() {
  const [hovered, setHovered] = useState<'rider' | 'partner' | null>(null)

  return (
    <section id="ecosystem" className="landing-section bg-canvas">
      {/* Background glow */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/4 -translate-y-1/2 w-150 h-150 bg-neon-green/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 -translate-y-1/2 w-150 h-150 bg-teal/5 rounded-full blur-3xl"
          animate={{ scale: [1.15, 1, 1.15], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="landing-container">
        {/* Section header */}
        <motion.div
          className="landing-header"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="landing-title mb-5">
            Choose Your{' '}
            <span className="bg-linear-to-r from-neon-green to-teal bg-clip-text text-transparent">
              Ride
            </span>
          </h2>
          <p className="landing-copy mx-auto max-w-2xl">
            Two paths, one community. Pick the lane that fits you.
          </p>
        </motion.div>

        <motion.div
          className="mb-8 sm:mb-10 mx-auto max-w-3xl rounded-2xl border-2 border-border bg-surface p-2.5"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-neon-green/30 bg-neon-green/8 px-4 py-3">
              <div className="flex items-center gap-2 text-neon-green text-xs font-bold uppercase tracking-[0.15em]">
                <Smartphone className="h-3.5 w-3.5" /> Rider App
              </div>
              <p className="mt-1.5 text-xs text-text-secondary">
                Best for riders joining convoys, clubs, and live sessions.
              </p>
            </div>
            <div className="rounded-xl border border-teal/30 bg-teal/8 px-4 py-3">
              <div className="flex items-center gap-2 text-teal text-xs font-bold uppercase tracking-[0.15em]">
                <Monitor className="h-3.5 w-3.5" /> Web Command Center
              </div>
              <p className="mt-1.5 text-xs text-text-secondary">
                Best for captains and shops running clubs, events, and sales.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Split-screen Grid */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-8">
          {/* LEFT: For Riders */}
          <motion.div
            className="group relative"
            onMouseEnter={() => setHovered('rider')}
            onMouseLeave={() => setHovered(null)}
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="relative overflow-hidden rounded-3xl bg-surface border-2 border-border p-5 sm:p-7 lg:p-8 min-h-112 sm:min-h-128 lg:min-h-136 flex flex-col transition-all duration-300"
              animate={{
                opacity: hovered === 'partner' ? 0.45 : 1,
                scale: hovered === 'rider' ? 1.01 : 1,
                borderColor:
                  hovered === 'rider' ? 'rgba(119, 255, 0, 0.6)' : 'rgba(34, 34, 34, 1)',
              }}
              transition={{ duration: 0.3 }}
              whileHover={{
                boxShadow: '6px 6px 0px rgba(119, 255, 0, 0.8)',
              }}
            >
              {/* Neon green corner glow */}
              <div className="absolute top-0 left-0 w-60 h-60 bg-linear-to-br from-neon-green/10 to-transparent pointer-events-none rounded-3xl" />

              {/* Badge */}
              <div className="relative mb-5">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/15 text-neon-green text-sm font-bold uppercase tracking-wider">
                  <Smartphone className="w-4 h-4" />
                  For Riders
                </span>
              </div>

              {/* Copy */}
              <h3 className="relative text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 uppercase tracking-tight">
                Own the Streets
              </h3>
              <p className="relative text-text-secondary text-base sm:text-lg mb-5 sm:mb-6 max-w-md leading-relaxed">
                Track rides, find your squad, and build your riding legacy — all from your
                pocket.
              </p>

              <div className="relative mb-4 sm:mb-5 flex flex-wrap gap-2">
                {['Live rider map', 'Auto ride chat', 'Club discover feed'].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-neon-green/30 bg-neon-green/10 px-3 py-1.5 text-[11px] font-semibold text-neon-green"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>

              {/* Phone Mockup */}
              <div className="relative flex-1 flex items-center justify-center mb-5 sm:mb-6">
                <motion.div
                  className="relative w-38 h-68 sm:w-48 sm:h-84 lg:w-52 lg:h-92"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* Phone frame */}
                  <div className="absolute inset-0 bg-surface rounded-[2.5rem] shadow-[8px_8px_0px_#3a3a3c] border-2 border-border overflow-hidden">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-surface rounded-b-2xl z-10" />

                    {/* Screen content – Ride Tracking */}
                    <div className="absolute inset-1.5 bg-canvas rounded-4xl overflow-hidden">
                      {/* Status bar */}
                      <div className="flex items-center justify-between px-6 pt-8 pb-2">
                        <span className="text-[10px] text-text-secondary font-medium">
                          9:41
                        </span>
                        <div className="flex gap-1">
                          <div className="w-3.5 h-2 rounded-sm bg-white/60" />
                          <div className="w-3.5 h-2 rounded-sm bg-text-secondary/30" />
                        </div>
                      </div>

                      {/* Map area */}
                      <div className="mx-3 h-32 sm:h-44 bg-canvas border-2 border-border rounded-2xl overflow-hidden relative">
                        {/* Grid lines */}
                        <svg
                          className="absolute inset-0 w-full h-full opacity-30"
                          viewBox="0 0 200 160"
                        >
                          {[...Array(8)].map((_, i) => (
                            <line
                              key={`h-${i}`}
                              x1="0"
                              y1={i * 20 + 10}
                              x2="200"
                              y2={i * 20 + 10}
                              stroke="#333333"
                              strokeWidth="1"
                            />
                          ))}
                          {[...Array(10)].map((_, i) => (
                            <line
                              key={`v-${i}`}
                              x1={i * 20 + 10}
                              y1="0"
                              x2={i * 20 + 10}
                              y2="160"
                              stroke="#333333"
                              strokeWidth="1"
                            />
                          ))}
                          <motion.path
                            d="M 20 130 Q 60 80 100 100 T 180 50"
                            fill="none"
                            stroke="#ff1d2d"
                            strokeWidth="3"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 2 }}
                          />
                        </svg>
                        {/* Rider dots */}
                        {[
                          { left: '15%', top: '75%', c: '#ff1d2d' },
                          { left: '45%', top: '55%', c: '#ffffff' },
                          { left: '80%', top: '30%', c: '#8e8e93' },
                        ].map((dot, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-3 h-3 rounded-full shadow-lg"
                            style={{
                              left: dot.left,
                              top: dot.top,
                              backgroundColor: dot.c,
                            }}
                            animate={{ scale: [1, 1.4, 1] }}
                            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                          />
                        ))}
                        {/* Live badge */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-surface border-2 border-border px-2.5 py-1 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-red-light animate-pulse" />
                          <span className="text-[9px] text-white font-semibold">
                            8 Riders Live
                          </span>
                        </div>
                      </div>

                      {/* Ride info cards */}
                      <div className="px-3 pt-3 space-y-2">
                        <div className="bg-canvas border-2 border-border rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-red-light/15 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-brand-red-light" />
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] text-white font-semibold">
                              Sunday Highway Run
                            </div>
                            <div className="text-[9px] text-text-secondary">
                              12 riders • 85 km
                            </div>
                          </div>
                          <div className="text-[9px] text-brand-red-light font-bold">LIVE</div>
                        </div>
                        <div className="bg-canvas border-2 border-border rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-red-light/15 flex items-center justify-center">
                            <Users className="w-4 h-4 text-brand-red-light" />
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] text-white font-semibold">
                              Desert Eagles MC
                            </div>
                            <div className="text-[9px] text-text-secondary">
                              48 members
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone shadow reflection */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-neon-green/10 blur-xl rounded-full" />
                </motion.div>
              </div>

              {/* Feature pills */}
              <div className="relative flex flex-wrap gap-2 mb-4 sm:mb-5">
                {['Live Tracking', 'Club Discovery', 'Ride Chat', 'Rider Profile'].map(
                  (f) => (
                    <span
                      key={f}
                      className="px-3 py-1.5 rounded-full bg-neon-green/10 text-neon-green text-xs font-semibold border border-neon-green/20"
                    >
                      {f}
                    </span>
                  ),
                )}
              </div>

              {/* Download CTAs */}
              <div className="relative flex flex-col sm:flex-row gap-3">
                <a
                  href="#download"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-primary border-2 border-primary text-white font-bold uppercase tracking-wide text-xs sm:text-sm shadow-[4px_4px_0px_#850000] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all duration-300"
                >
                  {/* Apple icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  iOS
                </a>
                <a
                  href="#download"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-primary border-2 border-primary text-white font-bold uppercase tracking-wide text-xs sm:text-sm shadow-[4px_4px_0px_#850000] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all duration-300"
                >
                  {/* Android icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.85-.31-.16-.69-.04-.85.27l-1.86 3.22c-1.44-.65-3.03-1.01-4.72-1.01s-3.28.36-4.72 1.01l-1.86-3.22c-.16-.31-.54-.43-.85-.27-.31.16-.43.54-.27.85l1.84 3.18C2.35 11.26.32 14.44 0 18h24c-.32-3.56-2.35-6.74-6.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
                  </svg>
                  Android
                </a>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: For Captains & Shops */}
          <motion.div
            className="group relative"
            onMouseEnter={() => setHovered('partner')}
            onMouseLeave={() => setHovered(null)}
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <motion.div
              className="relative overflow-hidden rounded-3xl bg-surface border-2 border-border p-5 sm:p-7 lg:p-8 min-h-112 sm:min-h-128 lg:min-h-136 flex flex-col transition-all duration-300"
              animate={{
                opacity: hovered === 'rider' ? 0.45 : 1,
                scale: hovered === 'partner' ? 1.01 : 1,
                borderColor:
                  hovered === 'partner'
                    ? 'rgba(55, 200, 195, 0.6)'
                    : 'rgba(34, 34, 34, 1)',
              }}
              transition={{ duration: 0.3 }}
              whileHover={{
                boxShadow: '6px 6px 0px rgba(55, 200, 195, 0.8)',
              }}
            >
              {/* Teal corner glow */}
              <div className="absolute top-0 right-0 w-60 h-60 bg-linear-to-bl from-teal/10 to-transparent pointer-events-none rounded-3xl" />

              {/* Badge */}
              <div className="relative mb-5">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/15 text-teal text-sm font-bold uppercase tracking-wider">
                  <Monitor className="w-4 h-4" />
                  For Captains & Shops
                </span>
              </div>

              {/* Copy */}
              <h3 className="relative text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 uppercase tracking-tight">
                Command Center
              </h3>
              <p className="relative text-text-secondary text-base sm:text-lg mb-5 sm:mb-6 max-w-md leading-relaxed">
                Manage your club, sell gear, and organize the chaos — from a powerful web
                dashboard.
              </p>

              <div className="relative mb-4 sm:mb-5 flex flex-wrap gap-2">
                {['Member analytics', 'Ride scheduling', 'Marketplace tools'].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-teal/30 bg-teal/10 px-3 py-1.5 text-[11px] font-semibold text-teal"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>

              {/* Laptop Mockup */}
              <div className="relative flex-1 flex items-center justify-center mb-5 sm:mb-6">
                <motion.div
                  className="relative w-full max-w-64 sm:max-w-78"
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                >
                  {/* Laptop frame */}
                  <div className="relative bg-surface rounded-2xl border-2 border-border shadow-[8px_8px_0px_#3a3a3c] overflow-hidden">
                    {/* Browser chrome */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-canvas border-b-2 border-border">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <div className="w-2.5 h-2.5 rounded-full bg-border" />
                        <div className="w-2.5 h-2.5 rounded-full bg-border" />
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="px-4 py-1 rounded-lg bg-surface border border-border text-[9px] text-text-secondary/50 font-mono">
                          dashboard.revvie.app
                        </div>
                      </div>
                    </div>

                    {/* Dashboard content */}
                    <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3 aspect-16/10">
                      {/* Top stat cards */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            label: 'Total Members',
                            val: '248',
                            icon: Users,
                            c: 'text-teal',
                          },
                          {
                            label: 'Active Rides',
                            val: '12',
                            icon: MapPin,
                            c: 'text-neon-green',
                          },
                          {
                            label: 'Revenue',
                            val: '₹4.2L',
                            icon: ShoppingBag,
                            c: 'text-brand-red-light',
                          },
                        ].map((stat, i) => (
                          <motion.div
                            key={i}
                            className="bg-canvas border-2 border-border rounded-xl p-2.5"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                          >
                            <stat.icon className={`w-3.5 h-3.5 ${stat.c} mb-1`} />
                            <div className="text-white text-sm font-bold">{stat.val}</div>
                            <div className="text-[8px] text-text-secondary/50">
                              {stat.label}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Chart area */}
                      <div className="bg-canvas border-2 border-border rounded-xl p-3 flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] text-text-secondary/60 font-semibold uppercase">
                            Member Growth
                          </span>
                          <BarChart3 className="w-3 h-3 text-teal/60" />
                        </div>
                        <svg
                          className="w-full h-16"
                          viewBox="0 0 200 60"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <motion.path
                            d="M 0 50 Q 25 45 50 35 T 100 25 T 150 15 T 200 5"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5 }}
                          />
                          <path
                            d="M 0 50 Q 25 45 50 35 T 100 25 T 150 15 T 200 5 L 200 60 L 0 60 Z"
                            fill="url(#chartFill)"
                          />
                        </svg>
                      </div>

                      {/* Recent activity */}
                      <div className="space-y-1.5">
                        {[
                          {
                            icon: Calendar,
                            text: 'New ride scheduled',
                            time: '2m ago',
                            c: 'bg-teal/15 text-teal',
                          },
                          {
                            icon: Package,
                            text: 'Order #1247 shipped',
                            time: '15m ago',
                            c: 'bg-neon-green/15 text-neon-green',
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 bg-canvas border border-border rounded-lg px-2.5 py-2"
                          >
                            <div
                              className={`w-5 h-5 rounded-md ${item.c} flex items-center justify-center`}
                            >
                              <item.icon className="w-3 h-3" />
                            </div>
                            <span className="text-[9px] text-white font-medium flex-1">
                              {item.text}
                            </span>
                            <span className="text-[8px] text-text-secondary/40">
                              {item.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Laptop base/stand */}
                  <div className="mx-auto w-2/3 h-2 bg-surface rounded-b-lg border-x-2 border-b-2 border-border" />
                  <div className="mx-auto w-1/3 h-1 bg-border rounded-b-md" />

                  {/* Laptop shadow */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-teal/10 blur-xl rounded-full" />
                </motion.div>
              </div>

              {/* Feature pills */}
              <div className="relative flex flex-wrap gap-2 mb-5 sm:mb-6">
                {[
                  'Club Analytics',
                  'Event Management',
                  'Marketplace',
                  'Member Control',
                ].map((f) => (
                  <span
                    key={f}
                    className="px-3 py-1.5 rounded-full bg-teal/10 text-teal text-xs font-semibold border border-teal/20"
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Web Portal CTA */}
              <Link
                href="/login"
                className="relative flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border-2 border-white/25 bg-canvas text-white font-bold uppercase tracking-wide text-xs sm:text-sm shadow-[4px_4px_0px_#3a3a3c] hover:translate-y-1 hover:translate-x-1 hover:shadow-none hover:border-white/50 transition-all duration-300"
              >
                <Shield className="w-4 h-4" />
                Access Web Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
