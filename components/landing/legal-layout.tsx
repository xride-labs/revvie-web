'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import { Footer } from './footer'

interface LegalLayoutProps {
  title: string
  subtitle?: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  children,
}: LegalLayoutProps) {
  return (
    <main className="min-h-screen bg-canvas">
      {/* Minimal nav for legal pages */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-canvas/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/assets/revvie_logo_icon.png"
              alt="Revvie"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-lg font-bold text-white uppercase tracking-wider">
              Revvie
            </span>
          </Link>
          <div className="flex items-center gap-1 text-xs text-text-secondary/60">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-text-secondary">{title}</span>
          </div>
        </div>
      </nav>

      {/* Page header */}
      <div className="pt-32 pb-12 border-b border-border/30">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-neon-green text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Legal
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-wider mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-text-secondary text-base max-w-2xl">{subtitle}</p>
            )}
            <p className="mt-4 text-text-secondary/50 text-sm">
              Last updated: {lastUpdated}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="py-16">
        <motion.div
          className="max-w-4xl mx-auto px-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
        >
          {children}
        </motion.div>
      </div>

      <Footer />
    </main>
  )
}
