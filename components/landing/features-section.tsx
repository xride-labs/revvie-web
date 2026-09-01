'use client'

import { motion, type Variants } from 'motion/react'
import {
  Users,
  MapPin,
  Shield,
  Compass,
  Ticket,
  Receipt,
  Bike,
  UsersRound,
  MessageCircle,
  Trophy,
} from 'lucide-react'

const features = [
  {
    icon: MapPin,
    label: 'Live Ops',
    title: 'Live Group Tracking',
    description:
      'Real-time GPS for your entire convoy. See every rider, their status, and never lose sight of the pack.',
  },
  {
    icon: Users,
    label: 'Social Graph',
    title: 'Rider Identity',
    description: 'Your motorcycle profile — bikes, clubs, rides, and reputation, in one place.',
  },
  {
    icon: Shield,
    label: 'Community',
    title: 'Motorcycle Clubs',
    description: 'Discover and join clubs in your city. Wear the badge, run with the crew.',
  },
  {
    icon: Compass,
    label: 'Rides',
    title: 'Organized Rides',
    description: 'Schedule group rides and turn outings into shared stories.',
  },
  {
    icon: Ticket,
    label: 'Events',
    title: 'Event Hosting',
    description: 'Host meetups and track days with ticket tiers and QR gate check-in.',
  },
  {
    icon: Receipt,
    label: 'Money',
    title: 'Expense Splitting',
    description: 'Log fuel, food, and tolls once — split evenly across the crew, automatically.',
  },
  {
    icon: Bike,
    label: 'Garage',
    title: 'My Garage',
    description: 'Every bike you own, tracked and serviced — your fleet, on record.',
  },
  {
    icon: UsersRound,
    label: 'Squads',
    title: 'Friends & Squads',
    description: 'Your riding crew, one tap away. Private, separate from public clubs.',
  },
  {
    icon: MessageCircle,
    label: 'Comms',
    title: 'Chat & Messaging',
    description: 'Ride chat activates when rides start and auto-archives when they end.',
  },
  {
    icon: Trophy,
    label: 'Progress',
    title: 'Ride Legacy',
    description: 'Earn XP for every kilometre, level up, and unlock Fun Mode challenges.',
  },
]

export function FeaturesSection() {
  const headerVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  }

  const rowVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  }

  return (
    <section id="features" className="landing-section bg-canvas">
      <div className="landing-container">
        {/* Section header */}
        <motion.div
          className="landing-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={headerVariants}
        >
          <h2 className="landing-title mb-5">
            The Full{' '}
            <span className="text-brand-red-light">Stack</span>
          </h2>
          <p className="landing-copy mx-auto max-w-2xl">
            Everything a rider needs, wired together — not ten apps pretending to be one.
          </p>
        </motion.div>

        {/* Spec rail */}
        <div className="relative mt-4">
          {/* The rail itself — a continuous line every feature connects to */}
          <div
            className="absolute top-0 bottom-0 w-px bg-border sm:left-11"
            style={{ left: '1.375rem' }}
            aria-hidden
          />

          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                className="group relative grid grid-cols-1 gap-2 border-b border-border/60 py-8 pl-12 last:border-0 sm:grid-cols-[15rem_1fr] sm:items-baseline sm:gap-10 sm:py-10 sm:pl-24"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={rowVariants}
                transition={{ delay: (index % 5) * 0.06 }}
              >
                {/* Node on the rail */}
                <div
                  className="absolute top-9 flex h-6 w-6 items-center justify-center rounded-full border-2 border-brand-red-light bg-canvas transition-colors duration-300 group-hover:bg-brand-red-light sm:left-8 sm:top-11"
                  style={{ left: '0.375rem' }}
                  aria-hidden
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-red-light transition-colors duration-300 group-hover:bg-white" />
                </div>

                {/* Left: icon + label + title */}
                <div className="flex items-start gap-4 sm:flex-col sm:gap-3">
                  <Icon className="h-6 w-6 shrink-0 text-white/70 transition-colors duration-300 group-hover:text-brand-red-light" strokeWidth={1.75} />
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary/70">
                      {feature.label}
                    </span>
                    <h3 className="mt-1 text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
                      {feature.title}
                    </h3>
                  </div>
                </div>

                {/* Right: description */}
                <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
