'use client'

import { Badge } from '@/components/ui/badge'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'

const steps = [
  {
    step: '01',
    title: 'Create Your Profile',
    description:
      "Sign up and build your rider identity. Add your bikes, riding style, and what you're looking for.",
    image: 'profile',
  },
  {
    step: '02',
    title: 'Discover Through People',
    description:
      'No boring search. Find clubs by exploring rider profiles and their club badges. Click to learn more.',
    image: 'discover',
  },
  {
    step: '03',
    title: 'Join Clubs',
    description:
      'Request to join clubs that match your vibe. Once accepted, their badge appears on your profile.',
    image: 'clubs',
  },
  {
    step: '04',
    title: 'Participate in Rides',
    description:
      'Join scheduled rides like clan wars. Live tracking, ride chat, and convoy visibility in real-time.',
    image: 'rides',
  },
]

export function HowItWorksSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
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

  const stepVariants: Variants = {
    hidden: { opacity: 0, x: 100 },
    visible: (custom: unknown) => {
      const i = typeof custom === 'number' ? custom : 0
      return {
        opacity: 1,
        x: 0,
        transition: {
          delay: i * 0.2,
          duration: 0.6,
          ease: 'easeOut',
        },
      }
    },
  }

  const imageVariants: Variants = {
    hidden: { opacity: 0, x: -100 },
    visible: (custom: unknown) => {
      const i = typeof custom === 'number' ? custom : 0
      return {
        opacity: 1,
        x: 0,
        transition: {
          delay: i * 0.2,
          duration: 0.6,
          ease: 'easeOut',
        },
      }
    },
  }

  return (
    <section
      id="how-it-works"
      className="py-24 bg-linear-to-b from-[#1e1e1e] to-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <Badge
              variant="secondary"
              className="mb-4 px-4 py-2 text-sm font-medium bg-brand-red/10 text-brand-red-light border-0"
            >
              How It Works
            </Badge>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            From Solo to Squad
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            The journey from individual rider to club member. Simple, social, seamless.
          </motion.p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="space-y-16 lg:space-y-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16`}
              variants={itemVariants}
            >
              {/* Image placeholder */}
              <motion.div
                className="flex-1 w-full"
                custom={index}
                variants={imageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-linear-to-br from-brand-red/20 to-brand-teal/20 rounded-3xl transform rotate-3"
                    animate={{ rotate: [3, 5, 3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    className="relative bg-card rounded-3xl shadow-xl border border-border overflow-hidden aspect-4/3"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-[#222222] to-[#2a2a2a] flex items-center justify-center">
                      <div className="text-center p-8">
                        <motion.div
                          className="w-24 h-24 mx-auto mb-4 flex items-center justify-center"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {step.image === 'profile' && (
                            <span className="text-4xl">👤</span>
                          )}
                          {step.image === 'discover' && (
                            <span className="text-4xl">🔍</span>
                          )}
                          {step.image === 'clubs' && (
                            <Image
                              src="/assets/revvie_logo_icon.png"
                              alt="/assets/revvie_logo_icon"
                              width={96}
                              height={96}
                            />
                          )}
                          {step.image === 'rides' && <span className="text-4xl">🗺️</span>}
                        </motion.div>
                        <p className="text-muted-foreground text-sm">
                          App screenshot placeholder
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                className="flex-1 text-center lg:text-left"
                custom={index}
                variants={stepVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div
                  className="inline-flex items-center gap-4 mb-4"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-6xl font-bold text-brand-red-light/20">
                    {step.step}
                  </span>
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  {step.title}
                </h3>
                <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
                  {step.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
