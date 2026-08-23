'use client'

import { motion, AnimatePresence } from 'framer-motion'
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

const investCards = [
  {
    icon: TrendingUp,
    title: 'Early-Stage Opportunity',
    description:
      "Get in on the ground floor of India's first biker-centric social and marketplace platform. A growing rider community with massive potential.",
    color: '#77ff00',
    gradient: 'from-[#77ff00]/10 to-transparent',
  },
  {
    icon: Globe,
    title: 'Expanding Market',
    description:
      "India has 200M+ two-wheeler owners. We're building the platform that connects riders, clubs, and gear — all in one place.",
    color: '#37c8c3',
    gradient: 'from-[#37c8c3]/10 to-transparent',
  },
  {
    icon: Rocket,
    title: 'Series A — Open Now',
    description:
      "Our seed round closed successfully. We're now raising Series A to scale operations, grow the marketplace, and expand to new regions.",
    color: '#c83737',
    gradient: 'from-[#c83737]/10 to-transparent',
  },
]

// Floating asset definitions for the dialog background
const floatingAssets = [
  { icon: Bike, x: '8%', y: '12%', size: 28, delay: 0, color: '#77ff00' },
  { icon: HardHat, x: '85%', y: '8%', size: 24, delay: 0.3, color: '#37c8c3' },
  { icon: MapPin, x: '90%', y: '75%', size: 22, delay: 0.6, color: '#c83737' },
  { icon: Compass, x: '5%', y: '80%', size: 26, delay: 0.9, color: '#77ff00' },
  { icon: IndianRupee, x: '75%', y: '45%', size: 20, delay: 1.2, color: '#37c8c3' },
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
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-brand-red-light via-neon-green to-teal" />

            <div className="p-8">
              {isSubmitted ? (
                /* Success State */
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-neon-green/15 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Rocket className="w-10 h-10 text-neon-green" />
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
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-canvas border-2 border-border text-white placeholder:text-text-secondary/40 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/30 transition-all text-sm"
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
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#1a1a1a] border border-[#444444]/50 text-white placeholder:text-text-secondary/40 focus:outline-none focus:border-teal/60 focus:ring-1 focus:ring-teal/30 transition-all text-sm"
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
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#1a1a1a] border border-[#444444]/50 text-white placeholder:text-text-secondary/40 focus:outline-none focus:border-teal/60 focus:ring-1 focus:ring-teal/30 transition-all text-sm"
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
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#1a1a1a] border border-[#444444]/50 text-white placeholder:text-text-secondary/40 focus:outline-none focus:border-teal/60 focus:ring-1 focus:ring-teal/30 transition-all text-sm"
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
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-canvas border-2 border-border text-white placeholder:text-text-secondary/40 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/30 transition-all text-sm resize-none"
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
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

          {/* Cards Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {investCards.map((card, index) => {
              const Icon = card.icon
              return (
                <motion.div key={index} variants={itemVariants} className="group">
                  <motion.div
                    className="relative overflow-hidden rounded-3xl bg-surface border-2 border-border p-8 h-full"
                    whileHover={{
                      scale: 1.01,
                      boxShadow: `6px 6px 0px ${card.color}`,
                    }}
                  >
                    {/* Top gradient glow */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-40 bg-linear-to-b ${card.gradient} pointer-events-none`}
                    />

                    {/* Icon */}
                    <motion.div
                      className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                      style={{ backgroundColor: `${card.color}15` }}
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                    >
                      <Icon className="w-7 h-7" style={{ color: card.color }} />
                    </motion.div>

                    {/* Content */}
                    <h3 className="relative text-xl font-bold text-white mb-3 uppercase tracking-wide">
                      {card.title}
                    </h3>
                    <p className="relative text-text-secondary text-sm leading-relaxed">
                      {card.description}
                    </p>

                    {/* Corner decoration */}
                    <div
                      className="absolute bottom-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 100% 100%, ${card.color}, transparent 70%)`,
                      }}
                    />
                  </motion.div>
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
              className="inline-flex items-center gap-3 px-12 py-5 rounded-full bg-brand-yellow border-2 border-brand-yellow text-canvas font-bold uppercase tracking-wide text-lg shadow-[6px_6px_0px_#D6A300] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
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
