'use client'

import { Button } from '@/components/ui/button'
import { Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion, type Variants } from 'motion/react'

export function CTASection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  const badgeVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity },
    },
  }

  const _decorativeVariants: Variants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 0.8, 0.5],
    },
  }

  return (
    <section className="py-24 bg-linear-to-br from-brand-red via-brand-red-light to-brand-teal relative overflow-hidden">
      {/* Decorative elements */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        animate={{ x: [0, 30, -30, 0], y: [0, 20, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"
        animate={{ x: [0, -30, 30, 0], y: [0, -20, 20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div variants={badgeVariants} animate={['visible', 'animate']}>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Zap className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Ready to Ride?</span>
          </div>
        </motion.div>

        <motion.h2
          variants={itemVariants}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
        >
          Join the Brotherhood.
          <br />
          Start Your Journey Today.
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
        >
          Create your rider profile, discover clubs through people, and participate in
          organized rides. Your motorcycle community awaits.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-full bg-white text-brand-red hover:bg-white/90"
              asChild
            >
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-full border-white/30 text-white hover:bg-white/10 bg-transparent"
              asChild
            >
              <Link href="#features">Explore Features</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm"
        >
          {[
            { icon: '✓', text: 'Free to join' },
            { icon: '✓', text: 'No credit card needed' },
            { icon: '✓', text: 'Motorcycles only' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2"
              whileHover={{ scale: 1.1, color: '#fff' }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {item.text}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
