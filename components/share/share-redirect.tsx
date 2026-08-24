'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowDownToLine, Smartphone, Loader2 } from 'lucide-react'

export type ShareKind = 'ride' | 'listing' | 'club' | 'invite' | 'profile'

interface ShareRedirectProps {
  kind: ShareKind
  id: string
  title: string
  description?: string
  imageUrl?: string | null
  meta?: Array<{ label: string; value: string }>
}

const SEGMENT: Record<ShareKind, string> = {
  ride: 'r',
  listing: 'm',
  club: 'c',
  invite: 'i',
  profile: 'u',
}
const COPY: Record<ShareKind, { emoji: string; noun: string }> = {
  ride: { emoji: '🏍️', noun: 'ride' },
  listing: { emoji: '🛒', noun: 'listing' },
  club: { emoji: '👥', noun: 'club' },
  invite: { emoji: '⚡', noun: 'invite' },
  profile: { emoji: '🏍️', noun: 'profile' },
}

const APP_SCHEME = 'revvie'
const APP_PACKAGE = 'com.revvie.app'
const DOWNLOAD_URL = 'https://revvie.xride-labs.in/download'

/** Chrome on Android: opens app directly if installed, else falls back to DOWNLOAD_URL. No dialog. */
function intentUrl(path: string) {
  const fallback = encodeURIComponent(DOWNLOAD_URL)
  return `intent://${path}#Intent;scheme=${APP_SCHEME};package=${APP_PACKAGE};S.browser_fallback_url=${fallback};end`
}

function isAndroid() {
  return typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
}

type Phase = 'redirecting' | 'fallback' | 'non-android'

export function ShareRedirect({
  kind,
  id,
  title,
  description,
  imageUrl,
  meta,
}: ShareRedirectProps) {
  const [phase, setPhase] = useState<Phase>('redirecting')
  const deepPath = `${SEGMENT[kind]}/${id}`
  const copy = COPY[kind]

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!isAndroid()) {
      // App is Android-only — skip any redirect attempt.
      setPhase('non-android')
      return
    }

    // Fire the intent URL after a short paint delay so the content card
    // is visible before Chrome navigates away.
    const fire = window.setTimeout(() => {
      window.location.href = intentUrl(deepPath)
    }, 250)

    // If the page is still visible after 1.8 s, the browser didn't handle
    // the intent URL (e.g. Samsung Internet). Show manual buttons instead.
    const fallback = window.setTimeout(() => {
      if (!document.hidden) setPhase('fallback')
    }, 1800)

    return () => {
      window.clearTimeout(fire)
      window.clearTimeout(fallback)
    }
  }, [deepPath])

  return (
    <main className="min-h-screen bg-canvas text-white flex flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
          {/* Banner */}
          {imageUrl ? (
            <div
              className="h-44 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          ) : (
            <div className="h-32 w-full bg-linear-to-br from-brand-red-light to-brand-red flex items-center justify-center">
              <span className="text-5xl" aria-hidden>
                {copy.emoji}
              </span>
            </div>
          )}

          <div className="p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-medium">
              Shared on Revvie
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-tight">{title}</h1>
            {description && (
              <p className="mt-2 text-sm text-white/70 leading-relaxed">{description}</p>
            )}

            {meta && meta.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {meta.map((m) => (
                  <li key={m.label} className="text-sm text-white/70 flex gap-2">
                    <span className="text-white/40 min-w-[80px]">{m.label}</span>
                    <span className="text-white/90">{m.value}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Phase-gated CTA */}
            <div className="mt-6">
              {phase === 'redirecting' && (
                <div className="flex items-center justify-center gap-3 py-4 text-white/50">
                  <Loader2 size={18} className="animate-spin text-brand-teal" />
                  <span className="text-sm font-medium">Opening Revvie…</span>
                </div>
              )}

              {phase === 'fallback' && (
                <div className="flex flex-col gap-3">
                  <a
                    href={intentUrl(deepPath)}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-brand-teal text-canvas font-semibold py-3.5 transition-all hover:scale-[1.02] hover:bg-brand-teal/90"
                  >
                    <Smartphone size={18} />
                    Open in Revvie
                  </a>
                  <Link
                    href="/download"
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 text-white font-semibold py-3.5 transition-all hover:bg-white/10"
                  >
                    <ArrowDownToLine size={18} />
                    Download Revvie
                  </Link>
                  <p className="mt-1 text-center text-xs text-white/40">
                    Don&apos;t have the app yet? Download it to view this {copy.noun}.
                  </p>
                </div>
              )}

              {phase === 'non-android' && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-white/60 text-center leading-relaxed">
                    Revvie is available on Android. Open this link on your Android phone
                    to join.
                  </p>
                  <Link
                    href="/download"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-brand-teal text-canvas font-semibold py-3.5 transition-all hover:scale-[1.02] hover:bg-brand-teal/90"
                  >
                    <ArrowDownToLine size={18} />
                    Download Revvie
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-white/40 hover:text-white/70 transition-colors inline-flex items-center gap-1"
          >
            Back to revvie.xride-labs.in
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
