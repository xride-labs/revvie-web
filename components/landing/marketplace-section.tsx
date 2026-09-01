'use client'

import { motion, type Variants } from 'motion/react'
import { ShoppingBag, Star, Sparkles, PackageSearch } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useListPublicListingsQuery } from '@/features/marketplace/api'
import type { PublicListing } from '@/features/marketplace/schemas'

function formatPrice(price: number, currency: string): string {
  if (currency === 'INR') {
    return `₹${price.toLocaleString('en-IN')}`
  }
  return `${currency} ${price.toLocaleString()}`
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

function ListingCard({ listing }: { listing: PublicListing }) {
  return (
    <motion.div variants={cardVariants} className="group cursor-pointer">
      <motion.div
        className="relative rounded-3xl bg-surface overflow-hidden border-2 border-border hover:border-brand-red-light/60 transition-all duration-300"
        whileHover={{
          y: -8,
          boxShadow: '6px 6px 0px rgba(255, 29, 45, 0.5)',
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Product Image Area */}
        <div className="aspect-square bg-canvas border-b-2 border-border relative overflow-hidden flex items-center justify-center">
          {listing.image ? (
            <Image
              src={listing.image}
              alt={listing.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-linear-to-b from-transparent to-surface/30" />
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Image
                  src="/logo-mark.png"
                  alt=""
                  width={100}
                  height={100}
                  className="opacity-30 group-hover:opacity-45 transition-opacity duration-300"
                />
              </motion.div>
            </>
          )}

          {listing.featured && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-brand-red-light/15 border-2 border-brand-red-light/40 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-brand-red-light" />
              <span className="text-xs text-brand-red-light font-semibold">Featured</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-red-light transition-colors duration-300 line-clamp-1">
            {listing.title}
          </h3>

          {/* Price */}
          <div className="text-2xl font-bold text-white mb-4">
            {formatPrice(listing.price, listing.currency)}
          </div>

          {/* Seller info */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {listing.seller.avatar ? (
                <Image
                  src={listing.seller.avatar}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                  <span className="text-white text-xs font-bold">
                    {listing.seller.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate text-sm text-white font-medium">
                  {listing.seller.name}
                </div>
                <div className="truncate text-xs text-text-secondary/60">
                  {listing.club?.name ?? listing.category ?? 'Independent seller'}
                </div>
              </div>
            </div>

            {/* Rating */}
            {listing.rating !== null && (
              <div className="flex shrink-0 items-center gap-1">
                <Star className="w-4 h-4 text-white fill-white" />
                <span className="text-sm text-white font-semibold">
                  {listing.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function MarketplaceSection() {
  const { data, isLoading, isError } = useListPublicListingsQuery()
  const listings = data?.listings ?? []

  return (
    <section id="marketplace" className="landing-section bg-canvas">
      {/* Background glow */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-125 bg-white/4 rounded-full blur-3xl"
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
            The <span className="text-brand-red-light">Gear</span>
          </h2>
          <p className="landing-copy mx-auto max-w-2xl">
            Buy and sell motorcycle parts &amp; gear. Every seller&apos;s clubs and
            reputation visible. No faceless transactions.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-3xl border-2 border-border bg-surface"
              >
                <div className="aspect-square bg-white/5" />
                <div className="space-y-3 p-6">
                  <div className="h-4 w-3/4 rounded bg-white/5" />
                  <div className="h-6 w-1/2 rounded bg-white/5" />
                  <div className="h-8 w-full rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <motion.div
            className="mx-auto flex max-w-md flex-col items-center rounded-3xl border-2 border-dashed border-border bg-surface/40 px-8 py-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <PackageSearch className="h-10 w-10 text-white/40" strokeWidth={1.5} />
            <p className="mt-4 text-sm text-text-secondary">
              {isError
                ? "Couldn't load the marketplace right now — check back shortly."
                : 'No listings yet. The marketplace opens with the app on November 12.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </motion.div>
        )}

        {/* Browse more CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-primary border-2 border-primary text-white font-bold uppercase tracking-wide text-lg shadow-[6px_6px_0px_#850000] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all duration-300"
          >
            <ShoppingBag className="w-5 h-5" />
            Browse Marketplace
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
