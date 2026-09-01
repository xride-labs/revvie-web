'use client'

import { motion, AnimatePresence, type Variants } from 'motion/react'
import {
  TrendingUp,
  Globe,
  Rocket,
  Bike,
  HardHat,
  MapPin,
  Compass,
  Send,
  X,
  User,
  Mail,
  Phone,
  IndianRupee,
  MessageSquare,
} from 'lucide-react'
import { useState, useRef } from 'react'

const investStats = [
  {
    icon: Globe,
    value: '200M+',
    label: 'Two-wheeler owners in India',
    description: "India's two-wheeler market, and no platform built for it — until now.",
  },
  {
    icon: TrendingUp,
    value: 'Seed',
    label: 'Round closed',
    description: "Got us here. A growing rider community with a working product.",
  },
  {
    icon: Rocket,
    value: 'Series A',
    label: 'Open now',
    description: 'Raising to scale operations, grow the marketplace, and expand regions.',
    lead: true,
  },
]

// Floating asset definitions for the dialog background
const floatingAssets = [
  { icon: Bike, x: '8%', y: '12%', size: 28, delay: 0, color: '#8e8e93' },
  { icon: HardHat, x: '85%', y: '8%', size: 24, delay: 0.3, color: '#8e8e93' },
  { icon: MapPin, x: '90%', y: '75%', size: 22, delay: 0.6, color: '#ff1d2d' },
  { icon: Compass, x: '5%', y: '80%', size: 26, delay: 0.9, color: '#8e8e93' },
  { icon: IndianRupee, x: '75%', y: '45%', size: 20, delay: 1.2, color: '#8e8e93' },
]

function InvestDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Floating assets in background */}
          {floatingAssets.map((asset, i) => {
            const Icon = asset.icon
            return (
              <motion.div
                key={i}
                className="absolute pointer-events-none z-51"
                style={{ left: asset.x, top: asset.y }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 0.25,
                  scale: 1,
                  y: [0, -12, 0],
                  rotate: [0, 8, -8, 0],
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  opacity: { delay: asset.delay, duration: 0.5 },
                  scale: { delay: asset.delay, duration: 0.5 },
                  y: {
                    delay: asset.delay,
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                  rotate: {
                    delay: asset.delay,
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
              >
                <Icon
                  style={{ color: asset.color, width: asset.size, height: asset.size }}
                />
              </motion.div>
            )
          })}

          {/* Dialog Card */}
          <motion.div
            className="relative z-52 w-full max-w-lg rounded-3xl bg-surface border-2 border-border overflow-hidden"
            initial={{ scale: 0.9, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-surface border-2 border-border flex items-center justify-center text-text-secondary hover:text-white hover:bg-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-brand-red-light to-transparent" />

            <div className="p-8">
              {isSubmitted ? (
                /* Success State */
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-red-light/15 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Rocket className="w-10 h-10 text-brand-red-light" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-wide">
                    We&apos;ll Be in Touch
                  </h3>
                  <p className="text-text-secondary mb-8">
                    Thank you for your interest in Revvie. Our team will reach out within
                    48 hours.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-8 py-3 rounded-full bg-primary border-2 border-primary text-white font-bold uppercase tracking-wide shadow-[4px_4px_0px_#850000] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                /* Form */
                <>
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white uppercase tracking-wide mb-2">
                      Invest in Revvie
                    </h3>
                    <p className="text-text-secondary text-sm">
                      Fill in your details and our team will get back to you.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-canvas border-2 border-border text-white placeholder:text-text-secondary/40 focus:outline-none focus:border-brand-red-light focus:ring-1 focus:ring-brand-red-light/30 transition-all text-sm"
                      />
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-canvas border-2 border-border text-white placeholder:text-text-secondary/40 focus:outline-none focus:border-brand-red-light focus:ring-1 focus:ring-brand-red-light/30 transition-all text-sm"
                      />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-canvas border-2 border-border text-white placeholder:text-text-secondary/40 focus:outline-none focus:border-brand-red-light focus:ring-1 focus:ring-brand-red-light/30 transition-all text-sm"
                      />
                    </div>

                    {/* Investment Amount */}
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                      <input
                        type="text"
                        name="amount"
                        placeholder="Investment Amount (₹)"
                        value={formData.amount}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-canvas border-2 border-border text-white placeholder:text-text-secondary/40 focus:outline-none focus:border-brand-red-light focus:ring-1 focus:ring-brand-red-light/30 transition-all text-sm"
                      />
                    </div>

                    {/* Message */}
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-text-secondary/50" />
                      <textarea
                        name="message"
                        placeholder="Tell us about your interest..."
                        value={formData.message}
                        onChange={handleChange}
                        rows={3}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-canvas border-2 border-border text-white placeholder:text-text-secondary/40 focus:outline-none focus:border-brand-red-light focus:ring-1 focus:ring-brand-red-light/30 transition-all text-sm resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-2xl bg-primary border-2 border-primary text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-[4px_4px_0px_#850000] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all disabled:opacity-60"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Interest
                        </>
                      )}
                    </motion.button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function InvestSection() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
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

  return (
    <>
      <section id="invest" className="landing-section bg-canvas">
        {/* Background effects */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-1/4 w-150 h-150 bg-neon-green/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-125 h-125 bg-brand-red-light/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
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
              Fuel The <span className="text-neon-green">Revolution</span>
            </h2>
            <p className="landing-copy mx-auto max-w-2xl">
              Be part of the movement shaping the future of motorcycle culture in India.
            </p>
          </motion.div>

          {/* Stat strip */}
          <motion.div
            className="grid grid-cols-1 divide-y divide-border border-y-2 border-border sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {investStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`px-2 py-8 sm:px-8 sm:py-10 ${stat.lead ? 'bg-brand-red-light/5' : ''}`}
                >
                  <Icon
                    className={`h-5 w-5 ${stat.lead ? 'text-brand-red-light' : 'text-white/50'}`}
                    strokeWidth={1.75}
                  />
                  <div
                    className={`mt-4 text-3xl font-bold uppercase tracking-tight sm:text-4xl ${
                      stat.lead ? 'text-brand-red-light' : 'text-white'
                    }`}
                  >
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary/70">
                    {stat.label}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                    {stat.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Invest in Us CTA */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-3 px-12 py-5 rounded-full bg-primary border-2 border-primary text-white font-bold uppercase tracking-wide text-lg shadow-[6px_6px_0px_#850000] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Rocket className="w-5 h-5" />
              Invest in Us
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Investment Dialog */}
      <InvestDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  )
}
