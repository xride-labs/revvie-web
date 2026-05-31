'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Apple, Play, Heart } from 'lucide-react'
import { useState } from 'react'

export function AppStoreSection() {
  const [showInterest, setShowInterest] = useState(false)
  const [interested, setInterested] = useState(false)

  const handleShowInterest = () => {
    setInterested(!interested)
    setShowInterest(true)
    setTimeout(() => setShowInterest(false), 2000)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    hover: {
      y: -10,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.3 },
    },
  }

  return (
    <section className="py-24 bg-linear-to-b from-background to-[#1e1e1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="mb-4">
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-medium bg-brand-red/10 text-brand-red-light border-0"
            >
              📱 Download Our App
            </Badge>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            Ride On-the-Go
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Get the Revvie app and stay connected with your riding community anytime,
            anywhere.
          </motion.p>
        </motion.div>

        {/* App store cards */}
        <motion.div
          className="grid sm:grid-cols-2 gap-8 mb-12 max-w-2xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Google Play Store */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="relative group cursor-pointer"
          >
            <div className="relative bg-card rounded-2xl p-8 border-2 border-border overflow-hidden">
              {/* Coming Soon Badge with Opacity */}
              <motion.div
                initial={{ opacity: 0.6, y: -10 }}
                whileInView={{ opacity: 0.7, y: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute top-4 right-4 z-10"
              >
                <Badge className="bg-brand-teal/20 text-brand-teal border-brand-teal/30 backdrop-blur-sm">
                  Coming Soon
                </Badge>
              </motion.div>

              <div className="flex flex-col items-center justify-center">
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  className="mb-4 p-4 bg-brand-green/10 rounded-xl"
                >
                  <Play className="w-12 h-12 text-brand-green fill-brand-green" />
                </motion.div>

                {/* Text */}
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Google Play Store
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Android app available soon
                </p>

                {/* Button */}
                <Button
                  onClick={handleShowInterest}
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-black rounded-xl"
                  disabled={interested}
                >
                  {interested ? (
                    <>
                      <Heart className="w-4 h-4 mr-2 fill-black" />
                      Interest Registered
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Show Interest
                    </>
                  )}
                </Button>

                {/* Success message */}
                {showInterest && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-brand-green mt-3 font-medium"
                  >
                    ✓ Thanks for your interest!
                  </motion.p>
                )}
              </div>

              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-linear-to-br from-brand-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.div>

          {/* Apple App Store */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="relative group cursor-pointer"
          >
            <div className="relative bg-card rounded-2xl p-8 border-2 border-border overflow-hidden">
              {/* Coming Soon Badge with Opacity */}
              <motion.div
                initial={{ opacity: 0.6, y: -10 }}
                whileInView={{ opacity: 0.7, y: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute top-4 right-4 z-10"
              >
                <Badge className="bg-brand-teal/20 text-brand-teal border-brand-teal/30 backdrop-blur-sm">
                  Coming Soon
                </Badge>
              </motion.div>

              <div className="flex flex-col items-center justify-center">
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: -10, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  className="mb-4 p-4 bg-white/10 rounded-xl"
                >
                  <Apple className="w-12 h-12 text-white fill-white" />
                </motion.div>

                {/* Text */}
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Apple App Store
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  iOS app coming this Q1
                </p>

                {/* Button */}
                <Button
                  onClick={handleShowInterest}
                  className="w-full bg-white text-background hover:bg-white/90 rounded-xl"
                  disabled={interested}
                >
                  {interested ? (
                    <>
                      <Heart className="w-4 h-4 mr-2 fill-current" />
                      Interest Registered
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Show Interest
                    </>
                  )}
                </Button>

                {/* Success message */}
                {showInterest && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-brand-teal mt-3 font-medium"
                  >
                    ✓ Thanks for your interest!
                  </motion.p>
                )}
              </div>

              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground">
            In the meantime, use our web platform to connect with your community.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
