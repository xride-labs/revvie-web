'use client'

import { motion } from 'framer-motion'
import { Users, MapPin, Radio, Shield, Compass } from 'lucide-react'

const features = [
  {
    icon: MapPin,
    badge: 'Live Ops',
    metric: '12 riders syncing',
    title: 'Live Group Tracking',
    description:
      'Real-time GPS tracking for your entire convoy. See all riders, their status, and keep everyone safe on the road. Never lose sight of your pack.',
    color: '#77ff00',
    size: 'hero',
    layout: 'lg:col-span-7 lg:row-span-2',
  },
  {
    icon: Users,
    badge: 'Social Graph',
    metric: 'Profiles + achievements',
    title: 'Rider Identity',
    description:
      'Build your motorcycle profile. Show off your clubs, rides, and reputation.',
    color: '#c83737',
    size: 'compact',
    layout: 'lg:col-span-5 lg:row-span-1',
  },
  {
    icon: Shield,
    badge: 'Community',
    metric: 'Verified clubs',
    title: 'Motorcycle Clubs',
    description: 'Join exclusive clubs. Club badges show your brotherhood.',
    color: '#37c8c3',
    size: 'compact',
    layout: 'lg:col-span-3 lg:row-span-1',
  },
  {
    icon: Compass,
    badge: 'Events',
    metric: 'Planned group routes',
    title: 'Organized Rides',
    description: 'Like clan wars for bikers. Schedule rides and epic group journeys.',
    color: '#77ff00',
    size: 'wide',
    layout: 'lg:col-span-4 lg:row-span-1',
  },
  {
    icon: Radio,
    badge: 'Comms',
    metric: 'Ride-only channels',
    title: 'Ride Chat',
    description: 'Chat activates when rides start. Auto-archives after rides end.',
    color: '#c83737',
    size: 'wide',
    layout: 'lg:col-span-5 lg:row-span-1',
  },
]

export function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  return (
    <section id="features" className="landing-section bg-canvas">
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
            The Bento{' '}
            <span className="bg-linear-to-r from-brand-red-light to-brand-red bg-clip-text text-transparent">
              Garage
            </span>
          </h2>
          <p className="landing-copy mx-auto max-w-2xl">
            Everything bikers need. From discovering clubs to tracking rides in real-time.
          </p>
        </motion.div>

        <div className="mb-6 sm:mb-8 rounded-2xl border border-[#444444]/60 bg-surface/50 px-4 py-3 sm:px-5 sm:py-3.5 text-center text-xs sm:text-sm text-text-secondary">
          Pick your lane above, then unlock this full stack below.
        </div>

        {/* Bento Grid */}
        <motion.div
          className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[13rem]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isHero = feature.size === 'hero'

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`group relative ${feature.layout}`}
              >
                <motion.div
                  className={`
                    relative overflow-hidden rounded-3xl bg-surface
                    border-2 border-border p-5 sm:p-6
                    transition-all duration-300 hover:border-brand-teal
                    h-full ${isHero
                      ? 'min-h-[26rem] sm:min-h-[30rem] lg:min-h-0'
                      : 'min-h-[16rem] sm:min-h-[18rem] lg:min-h-0'}
                  `}
                  whileHover={{
                    scale: 1.01,
                    boxShadow: '6px 6px 0px rgba(55, 200, 195, 1)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Glow effect on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${feature.color}10, transparent 70%)`,
                    }}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
                    <span
                      className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                      style={{
                        color: feature.color,
                        borderColor: `${feature.color}44`,
                        backgroundColor: `${feature.color}12`,
                      }}
                    >
                      {feature.badge}
                    </span>
                    <span className="text-[11px] font-medium text-text-secondary/75">
                      {feature.metric}
                    </span>
                  </div>

                  {/* Icon */}
                  <motion.div
                    className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl flex items-center justify-center mb-4 sm:mb-5"
                    style={{ backgroundColor: `${feature.color}15` }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.15 }}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: feature.color }} />
                  </motion.div>

                  {/* Content */}
                  <h3 className="relative z-10 text-lg sm:text-xl font-bold text-white mb-2 sm:mb-2.5 uppercase tracking-wide leading-tight">
                    {feature.title}
                  </h3>
                  <p className="relative z-10 text-text-secondary text-sm sm:text-[15px] leading-relaxed max-w-2xl">
                    {feature.description}
                  </p>

                  {/* Large card extra content - Map mockup */}
                  {isHero && (
                    <div className="mt-5 sm:mt-6 relative hidden sm:block">
                      <div className="absolute inset-0 bg-linear-to-t from-surface to-transparent z-10" />
                      <div className="relative h-36 bg-canvas border-2 border-border rounded-2xl overflow-hidden">
                        {/* Map mockup */}
                        <div className="absolute inset-0 opacity-40">
                          <svg className="w-full h-full" viewBox="0 0 400 160">
                            {/* Grid lines */}
                            {[...Array(8)].map((_, i) => (
                              <line
                                key={`h-${i}`}
                                x1="0"
                                y1={i * 20 + 10}
                                x2="400"
                                y2={i * 20 + 10}
                                stroke="#333333"
                                strokeWidth="1"
                              />
                            ))}
                            {[...Array(20)].map((_, i) => (
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
                            {/* Route path */}
                            <motion.path
                              d="M 30 120 Q 80 80 150 100 T 250 60 T 370 90"
                              fill="none"
                              stroke="#77ff00"
                              strokeWidth="3"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              whileInView={{ pathLength: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 2 }}
                            />
                          </svg>
                        </div>
                        {/* Rider dots */}
                        <div className="absolute inset-0">
                          {[
                            { x: '10%', y: '70%', delay: 0 },
                            { x: '35%', y: '55%', delay: 0.2 },
                            { x: '55%', y: '35%', delay: 0.4 },
                            { x: '85%', y: '50%', delay: 0.6 },
                          ].map((dot, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-4 h-4"
                              style={{ left: dot.x, top: dot.y }}
                              animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.8, 1, 0.8],
                              }}
                              transition={{
                                duration: 2,
                                delay: dot.delay,
                                repeat: Infinity,
                              }}
                            >
                              <div className="w-full h-full rounded-full bg-brand-red-light shadow-[0_0_15px_rgba(200,55,55,0.6)]" />
                            </motion.div>
                          ))}
                        </div>
                        {/* Status badge */}
                        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-surface border-2 border-border px-3 py-1.5 rounded-full">
                          <div className="w-2 h-2 rounded-full bg-[#77ff00] animate-pulse" />
                          <span className="text-xs text-white font-medium">
                            12 Riders Live
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="relative z-10 mt-4 sm:mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-white/80">
                    Learn more
                    <span className="h-px w-8 bg-white/35" />
                  </div>

                  {/* Corner decoration */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 opacity-10"
                    style={{
                      background: `radial-gradient(circle at 100% 0%, ${feature.color}, transparent 70%)`,
                    }}
                  />
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
