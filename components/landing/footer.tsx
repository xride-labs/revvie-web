'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Instagram, Youtube } from 'lucide-react'

const socialLinks = [
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  {
    icon: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    href: 'https://twitter.com',
    label: 'X',
  },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
]

const legalLinks = [
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Refund Policy', href: '/refund' },
]

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Footer() {
  return (
    <footer className="landing-section relative overflow-hidden bg-linear-to-b from-canvas to-black">
      {/* Fade-to-black gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black pointer-events-none" />

      <div className="landing-container">
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8">
            <Image
              src="/assets/revvie_logo_icon.png"
              alt="Revvie"
              width={48}
              height={48}
              className="w-12 h-12"
            />
            <span className="text-3xl font-bold text-white uppercase tracking-wider">
              Revvie
            </span>
          </Link>

          {/* Tagline */}
          <p className="text-text-secondary/60 text-base max-w-md mb-10 font-medium">
            The social platform for motorcycle riders. Discover clubs, join rides, build
            your legacy.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-6 mb-10">
            {socialLinks.map((link, index) => {
              const Icon = link.icon
              return (
                <motion.a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-text-secondary/60 hover:text-white hover:bg-border border-2 border-border transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={link.label}
                >
                  <Icon />
                </motion.a>
              )
            })}
          </div>

          {/* Company + Legal links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-8">
            {companyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-text-secondary/50 text-sm hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Divider line */}
          <div className="w-full max-w-sm h-px bg-border/40 mb-6" />

          {/* Legal links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-text-secondary/40 text-xs hover:text-text-secondary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-text-secondary/30 text-sm">
            © 2026 Revvie by XRide Labs. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
