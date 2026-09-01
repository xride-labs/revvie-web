'use client'

import Link from 'next/link'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { ArrowUpRight, Flag } from 'lucide-react'
import { useCountdown } from '@/hooks/use-countdown'

const UNITS = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'seconds', label: 'Seconds' },
] as const

const LAUNCH_DATE_LABEL = 'November 12'

export function CountdownSection() {
  const shouldReduceMotion = useReducedMotion()
  const countdown = useCountdown()

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  }
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  return (
    <section id="download" className="landing-section relative overflow-hidden bg-black">
      {/* Checkered flag strip along the top edge */}
      <div
        className="absolute inset-x-0 top-0 h-2"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #fff 0 12px, #000 12px 24px)',
        }}
      />

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-brand-red/10 rounded-full blur-3xl"
          animate={shouldReduceMotion ? { opacity: 0.4 } : { scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="landing-container relative z-10 py-16 sm:py-20">
        <motion.div
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-red-light/40 bg-brand-red-light/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-red-light"
          >
            <Flag className="w-3.5 h-3.5" />
            Gates open {LAUNCH_DATE_LABEL}
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="landing-title mb-4 text-4xl sm:text-5xl lg:text-6xl"
          >
            {countdown.completed ? (
              <>
                We&apos;re <span className="text-neon-green">live.</span>
              </>
            ) : (
              <>
                The road opens{' '}
                <span className="bg-linear-to-r from-brand-red-light to-brand-red bg-clip-text text-transparent">
                  {LAUNCH_DATE_LABEL}.
                </span>
              </>
            )}
          </motion.h2>

          <motion.p variants={itemVariants} className="landing-copy mb-12 max-w-xl">
            {countdown.completed
              ? 'Revvie is rolling out now on iOS and Android.'
              : "Revvie launches simultaneously on iOS and Android. No app yet — that's the honest truth. Get in before the gates open."}
          </motion.p>

          {!countdown.completed && (
            <motion.div
              variants={itemVariants}
              className="mb-12 grid grid-cols-4 gap-3 sm:gap-5"
            >
              {UNITS.map((unit) => (
                <div
                  key={unit.key}
                  className="flex w-18 flex-col items-center rounded-2xl border-2 border-border bg-surface px-2 py-4 shadow-[4px_4px_0px_#3a3a3c] sm:w-28 sm:px-4 sm:py-6"
                >
                  <span
                    className="font-mono text-3xl font-bold tabular-nums text-white sm:text-5xl"
                    suppressHydrationWarning
                  >
                    {countdown[unit.key]}
                  </span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary sm:text-xs">
                    {unit.label}
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <Link
              href="/launch"
              className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-primary px-10 py-6 text-base font-bold uppercase tracking-wide text-white shadow-[6px_6px_0px_#850000] transition-all duration-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
            >
              Get Early Access
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.p variants={itemVariants} className="mt-5 text-xs text-text-secondary/60">
            No spam, no fake countdown &mdash; just an invite the moment we open the gates.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
