'use client'

import { motion, type Variants } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'

export function ClosingSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  }
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  return (
    <section className="landing-section relative overflow-hidden bg-canvas">
      {/* Oversized watermark wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center text-[22vw] font-bold uppercase leading-none tracking-tighter text-white/[0.03]"
      >
        REVVIE
      </div>

      <div className="landing-container relative z-10">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.p
            variants={itemVariants}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-red-light"
          >
            No app yet. That&apos;s the point.
          </motion.p>
          <motion.h2 variants={itemVariants} className="landing-title mb-6">
            Every solo ride deserves{' '}
            <span className="text-brand-red-light">a crew.</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg"
          >
            Revvie opens November 12. Get in before the gates do, and be first on the road
            when they open.
          </motion.p>
          <motion.div variants={itemVariants}>
            <a
              href="#download"
              className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-primary px-10 py-6 text-base font-bold uppercase tracking-wide text-white shadow-[6px_6px_0px_#850000] transition-all duration-300 hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              Get Early Access
              <ArrowUpRight className="h-5 w-5" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
