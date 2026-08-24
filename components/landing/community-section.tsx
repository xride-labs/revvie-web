'use client'

import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion, type Variants } from 'motion/react'

const testimonials = [
  {
    quote:
      'Finally, a platform that gets biker culture. The club discovery through profiles is genius. Found my crew in 2 weeks.',
    author: 'Jake M.',
    role: 'Desert Eagles MC',
    avatar: 'JM',
  },
  {
    quote:
      'The ride tracking feature is next level. Everyone in the convoy visible, real-time updates. Safety first.',
    author: 'Sarah K.',
    role: 'Texas Roadsters',
    avatar: 'SK',
  },
  {
    quote:
      'Sold 3 sets of gear through the marketplace. Buyers could see my clubs and reputation. Built real trust.',
    author: 'Marcus T.',
    role: 'Pacific Coast Riders',
    avatar: 'MT',
  },
]

const stats = [
  { value: '50+', label: 'Cities' },
  { value: '99%', label: 'Rider Satisfaction' },
  { value: '24/7', label: 'Support' },
  { value: '0', label: 'Cyclists Allowed' },
]

export function CommunitySection() {
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

  const headerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    hover: {
      y: -10,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.3 },
    },
  }

  const statsVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (custom: unknown) => {
      const i = typeof custom === 'number' ? custom : 0
      return {
        opacity: 1,
        scale: 1,
        transition: {
          delay: i * 0.1,
          duration: 0.5,
          ease: 'easeOut',
        },
      }
    },
  }

  return (
    <section id="community" className="py-24 bg-linear-to-b from-background to-[#1e1e1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <Badge
              variant="secondary"
              className="mb-4 px-4 py-2 text-sm font-medium bg-brand-red/10 text-brand-red-light border-0"
            >
              Community
            </Badge>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            What Riders Are Saying
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Join thousands of motorcycle enthusiasts who&apos;ve found their tribe.
          </motion.p>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover="hover"
              className="bg-card rounded-2xl p-6 shadow-lg border border-border cursor-pointer"
            >
              <motion.div className="flex items-start gap-4 mb-4" whileHover={{ x: 5 }}>
                <Avatar className="w-12 h-12 bg-linear-to-br from-brand-red to-brand-red-light">
                  <AvatarFallback className="bg-linear-to-br from-brand-red to-brand-red-light text-white font-semibold">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </motion.div>
              <motion.p
                className="text-muted-foreground italic"
                whileHover={{ color: '#ffffff' }}
              >
                &quot;{testimonial.quote}&quot;
              </motion.p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          className="bg-secondary rounded-3xl p-8 sm:p-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                custom={index}
                variants={statsVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  className="text-3xl sm:text-4xl font-bold text-white mb-1"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
