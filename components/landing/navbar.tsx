'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

const sectionLinks = [
  { label: 'Ecosystem', href: '#ecosystem' },
  { label: 'Features', href: '#features' },
  { label: 'Invest', href: '#invest' },
  { label: 'Marketplace', href: '#marketplace' },
  { label: 'Download', href: '#download' },
]

export function Navbar() {
  const shouldReduceMotion = useReducedMotion()
  const [activeSection, setActiveSection] = useState<string>('#ecosystem')

  const sectionIds = useMemo(
    () => sectionLinks.map((link) => link.href.replace('#', '')),
    [],
  )

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (!visible.length) return

        const id = visible[0].target.id
        setActiveSection(`#${id}`)
      },
      {
        root: null,
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0.2, 0.4, 0.6, 0.8],
      },
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [sectionIds])

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-canvas"
      initial={shouldReduceMotion ? { opacity: 0 } : { y: -100, opacity: 0 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0.2 : 0.6, ease: 'easeOut' }}
    >
      <div className="landing-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/revvie_logo_icon.png"
              alt="Revvie"
              width={44}
              height={44}
              className="w-11 h-11"
            />
            <span className="text-2xl font-bold text-white tracking-wide uppercase">
              Revvie
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 rounded-full border border-border bg-surface p-1.5">
            {sectionLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={activeSection === link.href ? 'true' : 'false'}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-300 ${activeSection === link.href
                    ? 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]'
                    : 'text-text-secondary hover:bg-white/8 hover:text-white'
                  }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Single CTA - Get the App */}
          <Button
            asChild
            className="rounded-full border-2 border-primary bg-primary px-8 py-6 text-base font-bold uppercase text-white shadow-[4px_4px_0px_#850000] transition-all duration-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
          >
            <Link href="/signup">Get the App</Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  )
}
