'use client'

import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Rocket, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { getLaunchDate, useCountdown } from '@/hooks/use-countdown'

const DEFAULT_GOOGLE_FORM_EMBED_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfyvoEvxmRfF9_S6Yd-8CYgXPKlVlFxq4dptlXorZU-lhxIGg/viewform?embedded=true'

export default function LaunchPage() {
  const shouldReduceMotion = useReducedMotion()
  const fromPath = useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }

    const params = new URLSearchParams(window.location.search)
    return params.get('from')
  }, [])

  const launchDate = useMemo(() => getLaunchDate(), [])
  const countdown = useCountdown(launchDate)

  const googleFormEmbedUrl =
    process.env.NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL || DEFAULT_GOOGLE_FORM_EMBED_URL

  let googleFormOpenUrl = googleFormEmbedUrl
  try {
    const parsed = new URL(googleFormEmbedUrl)
    parsed.searchParams.delete('embedded')
    googleFormOpenUrl = parsed.toString()
  } catch {
    googleFormOpenUrl = googleFormEmbedUrl
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-canvas text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-48 top-[-15%] h-[38rem] w-[38rem] rounded-full bg-brand-red-light/18 blur-3xl"
          animate={
            shouldReduceMotion
              ? { opacity: 0.55 }
              : { x: [0, 70, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }
          }
          transition={{
            duration: 18,
            repeat: shouldReduceMotion ? 0 : Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute -right-52 bottom-[-24%] h-[42rem] w-[42rem] rounded-full bg-white/6 blur-3xl"
          animate={
            shouldReduceMotion
              ? { opacity: 0.5 }
              : { x: [0, -80, 0], y: [0, -35, 0], scale: [1, 1.06, 1] }
          }
          transition={{
            duration: 20,
            repeat: shouldReduceMotion ? 0 : Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-60">
        <svg
          viewBox="0 0 1200 700"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="track-red" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff1d2d" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#b3151f" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="track-teal" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          <motion.path
            d="M-40 530 C 220 390, 380 600, 640 420 C 840 280, 980 490, 1240 340"
            stroke="url(#track-red)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.6 }}
            animate={{ pathLength: 1, opacity: [0.4, 0.95, 0.45] }}
            transition={{
              duration: shouldReduceMotion ? 0.1 : 6,
              repeat: shouldReduceMotion ? 0 : Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.path
            d="M-50 180 C 120 330, 340 80, 560 220 C 760 350, 940 180, 1240 260"
            stroke="url(#track-teal)"
            strokeWidth="2.6"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: [0.4, 0.85, 0.35] }}
            transition={{
              duration: shouldReduceMotion ? 0.1 : 8,
              repeat: shouldReduceMotion ? 0 : Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
          />

          <motion.circle
            cx="220"
            cy="188"
            r="7"
            fill="#ffffff"
            animate={
              shouldReduceMotion
                ? { opacity: 0.8 }
                : { scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }
            }
            transition={{
              duration: 2.8,
              repeat: shouldReduceMotion ? 0 : Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.circle
            cx="955"
            cy="414"
            r="8"
            fill="#ff1d2d"
            animate={
              shouldReduceMotion
                ? { opacity: 0.8 }
                : { scale: [1, 1.4, 1], opacity: [0.4, 1, 0.45] }
            }
            transition={{
              duration: 3.2,
              repeat: shouldReduceMotion ? 0 : Infinity,
              ease: 'easeInOut',
              delay: 0.8,
            }}
          />
        </svg>
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-14 md:px-10 md:py-20">
        <div className="grid w-full gap-9 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-red-light/30 bg-brand-red-light/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-red-light">
              <Sparkles className="h-3.5 w-3.5" />
              Xride Labs // Launch Sequence
            </div>

            <div className="space-y-5">
              <h1 className="font-[var(--font-josefin)] text-4xl uppercase leading-[1.02] tracking-[-0.03em] md:text-6xl lg:text-7xl">
                Revvie is almost ready for the road.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-white/78 md:text-lg">
                We are tuning the full platform for launch. Until then, every route leads
                here. Drop your details and we will invite you first when the gates open.
              </p>
            </div>

            {fromPath ? (
              <p className="inline-flex max-w-full items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/70 md:text-sm">
                <Rocket className="h-4 w-4 shrink-0 text-white/70" />
                Requested route currently paused:{' '}
                <span className="truncate text-white/92">{fromPath}</span>
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Days', value: countdown.days },
                { label: 'Hours', value: countdown.hours },
                { label: 'Minutes', value: countdown.minutes },
                { label: 'Seconds', value: countdown.seconds },
              ].map((unit) => (
                <motion.div
                  key={unit.label}
                  className="rounded-2xl border-2 border-border bg-surface p-4"
                  animate={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : {
                          boxShadow: [
                            '0 0 0 rgba(0,0,0,0)',
                            '0 0 28px rgba(255,29,45,0.18)',
                            '0 0 0 rgba(0,0,0,0)',
                          ],
                        }
                  }
                  transition={{
                    duration: 3.2,
                    repeat: shouldReduceMotion ? 0 : Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <p className="text-3xl font-bold text-white md:text-4xl" suppressHydrationWarning>
                    {unit.value}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/60">
                    {unit.label}
                  </p>
                </motion.div>
              ))}
            </div>

            <p className="text-sm text-white/60">
              Launch target: {launchDate.toUTCString()}
              {countdown.completed ? ' // We are live, rollout in progress.' : ''}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            className="rounded-3xl border-2 border-border bg-surface p-6 shadow-[0_40px_90px_rgba(0,0,0,0.45)] md:p-8"
          >
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-brand-red-light">
              Early Interest
            </p>
            <h2 className="text-2xl font-semibold text-white md:text-3xl">
              Join the first wave
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/72">
              Submit your interest through our official Google Form. We are keeping intake
              centralized for launch.
            </p>

            <div className="mt-6 rounded-2xl border border-white/12 bg-black/35 p-5">
              <p className="text-sm leading-relaxed text-white/72">
                The interest form now opens on a dedicated page for a cleaner launch
                experience.
              </p>
              <Link
                href="/launch/interest"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-red-light px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-red"
              >
                Open Interest Form
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-3 text-xs text-white/60">
              If the dedicated page is blocked on your network, open the Google Form
              directly.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-white/58">
              <span className="rounded-full border border-white/12 px-3 py-1">
                Invite-only rollout
              </span>
              <span className="rounded-full border border-white/12 px-3 py-1">
                Rider-first roadmap
              </span>
              <span className="rounded-full border border-white/12 px-3 py-1">
                Direct founder updates
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-5">
              <a
                href={googleFormOpenUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/85 transition-colors hover:text-white"
              >
                Open Google Form
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href="mailto:hello@xride-labs.in"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/85 transition-colors hover:text-white"
              >
                hello@xride-labs.in
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
