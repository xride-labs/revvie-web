'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Star, BadgeCheck } from 'lucide-react'
import Image from 'next/image'

const listings = [
  {
    title: 'Shoei RF-1400 Helmet',
    price: '₹37,500',
    seller: 'RoadKing_Mike',
    rating: 4.9,
    badge: 'Verified Seller',
    clubs: ['Hill Country Riders'],
  },
  {
    title: 'Akrapovic Exhaust System',
    price: '₹74,500',
    seller: 'MountainCruiser',
    rating: 4.7,
    badge: 'Verified Seller',
    clubs: ['Rocky Mountain MC'],
  },
  {
    title: 'Alpinestars GP Pro Gloves',
    price: '₹9,990',
    seller: 'SunshineRider',
    rating: 5.0,
    badge: 'Top Rated',
    clubs: ['Beach Cruisers'],
  },
  {
    title: 'Ohlins Rear Shock',
    price: '₹54,200',
    seller: 'PNW_Rider',
    rating: 4.8,
    badge: 'Verified Seller',
    clubs: ['Pacific NW MC'],
  },
]

export function MarketplaceSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  return (
    <section id="marketplace" className="landing-section bg-canvas">
      {/* Background glow */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-125 bg-teal/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
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
            The{' '}
            <span className="bg-linear-to-r from-brand-red-light to-brand-red bg-clip-text text-transparent">
              Gear
            </span>
          </h2>
          <p className="landing-copy mx-auto max-w-2xl">
            Buy and sell motorcycle parts &amp; gear. Every seller&apos;s clubs and
            reputation visible. No faceless transactions.
          </p>
        </motion.div>

        {/* Product Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {listings.map((listing, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group cursor-pointer"
            >
              <motion.div
                className="relative rounded-3xl bg-surface/60 backdrop-blur-md overflow-hidden border border-transparent hover:border-teal/40 transition-all duration-500 shadow-atmospheric"
                whileHover={{
                  y: -10,
                  boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6)',
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Product Image Area */}
                <div className="aspect-square bg-linear-to-br from-[#1a1a1a] to-[#2a2a2a] relative overflow-hidden flex items-center justify-center">
                  {/* Decorative gradient */}
                  <div className="absolute inset-0 bg-linear-to-b from-transparent to-surface/30" />

                  {/* Floating icon as product placeholder */}
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 3, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  >
                    <Image
                      src="/assets/revvie_logo_icon.png"
                      alt={listing.title}
                      width={100}
                      height={100}
                      className="opacity-40 group-hover:opacity-60 transition-opacity duration-300"
                    />
                  </motion.div>

                  {/* Verified badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#37c8c3]/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#37c8c3]/30">
                    <BadgeCheck className="w-3.5 h-3.5 text-[#37c8c3]" />
                    <span className="text-xs text-[#37c8c3] font-semibold">
                      {listing.badge}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#37c8c3] transition-colors duration-300">
                    {listing.title}
                  </h3>

                  {/* Price */}
                  <div className="text-2xl font-bold text-[#77ff00] mb-4">
                    {listing.price}
                  </div>

                  {/* Seller info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-linear-to-r from-brand-red-light to-brand-red flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {listing.seller.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm text-white font-medium">
                          {listing.seller}
                        </div>
                        <div className="text-xs text-text-secondary/60">
                          {listing.clubs[0]}
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#77ff00] fill-[#77ff00]" />
                      <span className="text-sm text-white font-semibold">
                        {listing.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Browse more CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.button
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-linear-to-r from-brand-red-light to-brand-red text-white font-bold uppercase tracking-wide text-lg shadow-[0_20px_50px_rgba(200,55,55,0.3)] hover:shadow-[0_25px_60px_rgba(200,55,55,0.4)] transition-shadow duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingBag className="w-5 h-5" />
            Browse Marketplace
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
