'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { Smartphone, Map, Shield, Compass, Download, ArrowRight } from 'lucide-react'

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion()

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  }

  // Floating animation for 3D assets
  const floatVariants: Variants = {
    float1: {
      y: [0, -20, 0],
      rotate: [0, 5, 0],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    },
    float2: {
      y: [0, -15, 0],
      rotate: [0, -3, 0],
      transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
    },
    float3: {
      y: [0, -25, 0],
      rotate: [0, 8, 0],
      transition: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 },
    },
    float4: {
      y: [0, -18, 0],
      rotate: [0, -5, 0],
      transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 },
    },
    float5: {
      y: [0, -22, 0],
      rotate: [0, 4, 0],
      transition: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 },
    },
  }

  return (
    <section className="landing-section-lg min-h-screen flex items-center justify-center pt-20 bg-canvas">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 bg-linear-to-r from-brand-red-light/20 to-brand-red/10 rounded-full blur-3xl"
          animate={
            shouldReduceMotion ? { opacity: 0.45 } : { x: [0, 50, 0], y: [0, 30, 0] }
          }
          transition={{
            duration: 15,
            repeat: shouldReduceMotion ? 0 : Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-125 h-125 bg-linear-to-l from-brand-teal/15 to-transparent rounded-full blur-3xl"
          animate={
            shouldReduceMotion ? { opacity: 0.35 } : { x: [0, -40, 0], y: [0, -20, 0] }
          }
          transition={{
            duration: 18,
            repeat: shouldReduceMotion ? 0 : Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-neon-green/5 rounded-full blur-3xl"
          animate={shouldReduceMotion ? { opacity: 0.25 } : { scale: [1, 1.1, 1] }}
          transition={{
            duration: 10,
            repeat: shouldReduceMotion ? 0 : Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="landing-container py-14 md:py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            className="text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-red-light/40 bg-brand-red-light/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-red-light"
            >
              Launching November 12
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="landing-title text-5xl sm:text-6xl lg:text-7xl mb-8"
            >
              Ride.{' '}
              <span className="bg-linear-to-r from-brand-red-light to-brand-red bg-clip-text text-transparent">
                Track.
              </span>{' '}
              Connect.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="landing-copy mb-10 max-w-xl mx-auto lg:mx-0"
            >
              The social platform built from the ground up for motorcycle riders — discover
              clubs, run organized rides, track every kilometre live, split the trip&apos;s
              costs, and keep your crew safe. One app instead of a patchwork of WhatsApp groups.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4 justify-center lg:justify-start"
            >
              {/* Primary CTA — Riders */}
              <Button
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 rounded-full bg-primary border-2 border-primary text-white shadow-[6px_6px_0px_#850000] transition-all duration-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none font-bold uppercase tracking-wide"
                asChild
              >
                <a href="#download">
                  <Download className="w-5 h-5 mr-2" />
                  Get Early Access
                </a>
              </Button>
              {/* Secondary CTA — Partners */}
              <Button
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 rounded-full bg-canvas border-2 border-white/25 text-white shadow-[4px_4px_0px_#3a3a3c] transition-all duration-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none hover:border-white/50 font-bold uppercase tracking-wide"
                asChild
              >
                <Link href="/login">
                  Partner Access
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right content - Floating 3D Asset Cloud */}
          <motion.div
            className="relative h-125 lg:h-150 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 1,
              delay: shouldReduceMotion ? 0 : 0.5,
            }}
          >
            {/* Helmet asset */}
            <motion.div
              className="absolute w-32 h-32 sm:w-40 sm:h-40 top-8 left-4 sm:left-8"
              animate={shouldReduceMotion ? { y: 0, rotate: 0 } : 'float1'}
              variants={shouldReduceMotion ? undefined : floatVariants}
            >
              <div className="w-full h-full bg-surface rounded-3xl shadow-[4px_4px_0px_#850000] flex items-center justify-center border-2 border-border">
                <Shield className="w-16 h-16 sm:w-20 sm:h-20 text-brand-red-light" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-surface border-2 border-border text-white text-xs px-3 py-1 rounded-full font-bold uppercase">
                Helmet
              </div>
            </motion.div>

            {/* Phone App Screen */}
            <motion.div
              className="absolute w-48 h-80 sm:w-56 sm:h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
              animate={shouldReduceMotion ? { y: 0, rotate: 0 } : 'float2'}
              variants={shouldReduceMotion ? undefined : floatVariants}
            >
              <div className="w-full h-full bg-surface rounded-[2.5rem] shadow-[8px_8px_0px_#850000] p-2 border-2 border-border">
                <div className="w-full h-full bg-canvas rounded-4xl overflow-hidden relative">
                  {/* App UI mockup */}
                  <div className="absolute inset-0 p-4">
                    <div className="bg-linear-to-b from-brand-red-light/20 to-transparent rounded-2xl p-4 mb-4">
                      <div className="text-brand-red-light text-xs font-bold uppercase mb-1">
                        Live Now
                      </div>
                      <div className="text-white font-bold text-sm">Desert Eagles MC</div>
                      <div className="text-text-secondary text-xs">
                        12 riders • Route 66
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-surface border-2 border-border rounded-xl p-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary" />
                          <div className="flex-1">
                            <div className="h-2 bg-text-secondary rounded w-20 mb-1" />
                            <div className="h-2 bg-text-muted rounded w-14" />
                          </div>
                          <div className="w-6 h-6 rounded-full bg-brand-red-light/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-brand-red-light" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Wheel asset */}
            <motion.div
              className="absolute w-28 h-28 sm:w-36 sm:h-36 bottom-16 left-0 sm:left-4"
              animate={shouldReduceMotion ? { y: 0, rotate: 0 } : 'float3'}
              variants={shouldReduceMotion ? undefined : floatVariants}
            >
              <div className="w-full h-full bg-surface rounded-full shadow-[4px_4px_0px_#3a3a3c] flex items-center justify-center border-2 border-border">
                <motion.div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/40 flex items-center justify-center"
                  animate={shouldReduceMotion ? { rotate: 0 } : { rotate: 360 }}
                  transition={{
                    duration: 8,
                    repeat: shouldReduceMotion ? 0 : Infinity,
                    ease: 'linear',
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-white/70" />
                </motion.div>
              </div>
            </motion.div>

            {/* Route Map asset */}
            <motion.div
              className="absolute w-36 h-28 sm:w-44 sm:h-36 top-4 right-0 sm:right-4"
              animate={shouldReduceMotion ? { y: 0, rotate: 0 } : 'float4'}
              variants={shouldReduceMotion ? undefined : floatVariants}
            >
              <div className="w-full h-full bg-surface rounded-3xl shadow-[4px_4px_0px_#3a3a3c] flex items-center justify-center border-2 border-border p-4">
                <div className="relative w-full h-full">
                  <Map className="w-10 h-10 text-white/70 absolute top-0 left-0" />
                  {/* Route line */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
                    <motion.path
                      d="M 10 60 Q 30 20 50 50 T 90 30"
                      fill="none"
                      stroke="#ff1d2d"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 1 }}
                      transition={{
                        duration: 2,
                        repeat: shouldReduceMotion ? 0 : Infinity,
                        repeatDelay: 1,
                      }}
                    />
                  </svg>
                  {/* Dots on route */}
                  <div className="absolute bottom-1 right-1 flex -space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 rounded-full bg-brand-red-light border border-surface"
                        animate={
                          shouldReduceMotion ? { scale: 1 } : { scale: [1, 1.2, 1] }
                        }
                        transition={{
                          duration: 1,
                          delay: i * 0.2,
                          repeat: shouldReduceMotion ? 0 : Infinity,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Compass asset */}
            <motion.div
              className="absolute w-24 h-24 sm:w-28 sm:h-28 bottom-24 right-8 sm:right-16"
              animate={shouldReduceMotion ? { y: 0, rotate: 0 } : 'float5'}
              variants={shouldReduceMotion ? undefined : floatVariants}
            >
              <div className="w-full h-full bg-surface rounded-3xl shadow-[4px_4px_0px_#3a3a3c] flex items-center justify-center border-2 border-border group hover:border-brand-red-light transition-colors">
                <motion.div
                  animate={shouldReduceMotion ? { rotate: 0 } : { rotate: [0, 360] }}
                  transition={{
                    duration: 20,
                    repeat: shouldReduceMotion ? 0 : Infinity,
                    ease: 'linear',
                  }}
                >
                  <Compass className="w-12 h-12 sm:w-14 sm:h-14 text-white/70" />
                </motion.div>
              </div>
            </motion.div>

            {/* Smartphone icon */}
            <motion.div
              className="absolute w-20 h-20 sm:w-24 sm:h-24 bottom-4 right-1/3"
              animate={
                shouldReduceMotion
                  ? { y: 0, rotate: 0 }
                  : {
                      y: [0, -12, 0],
                      rotate: [0, -8, 0],
                    }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0.2 }
                  : {
                      duration: 5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.8,
                    }
              }
            >
              <div className="w-full h-full bg-primary rounded-2xl shadow-[6px_6px_0px_#850000] flex items-center justify-center border-2 border-primary">
                <Smartphone className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={shouldReduceMotion ? { opacity: 0.65 } : { y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: shouldReduceMotion ? 0 : Infinity }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
        <div className="w-6 h-10 border-2 border-text-secondary/30 rounded-full flex justify-center pt-2">
          <motion.div
            className="w-1.5 h-3 bg-text-secondary/50 rounded-full"
            animate={
              shouldReduceMotion
                ? { opacity: 1, y: 0 }
                : { opacity: [1, 0, 1], y: [0, 4, 0] }
            }
            transition={{ duration: 2, repeat: shouldReduceMotion ? 0 : Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}
