'use client'

import { useEffect, useMemo, useState } from 'react'

export type CountdownState = {
  days: string
  hours: string
  minutes: string
  seconds: string
  completed: boolean
}

const FALLBACK_LAUNCH_DATE = '2026-11-11T18:30:00.000Z'

function formatPart(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(2, '0')
}

/** The confirmed public launch date, read from `NEXT_PUBLIC_LAUNCH_DATE` with a hardcoded fallback. */
export function getLaunchDate(): Date {
  const envValue = process.env.NEXT_PUBLIC_LAUNCH_DATE
  const parsed = envValue ? Date.parse(envValue) : Number.NaN

  if (!Number.isNaN(parsed)) {
    return new Date(parsed)
  }

  return new Date(FALLBACK_LAUNCH_DATE)
}

function getCountdown(target: Date): CountdownState {
  const diffMs = target.getTime() - Date.now()

  if (diffMs <= 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00', completed: true }
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    days: formatPart(days),
    hours: formatPart(hours),
    minutes: formatPart(minutes),
    seconds: formatPart(seconds),
    completed: false,
  }
}

/** Ticks every second toward the launch date (or a caller-supplied target). */
export function useCountdown(target?: Date): CountdownState {
  const targetDate = useMemo(() => target ?? getLaunchDate(), [target])
  const [countdown, setCountdown] = useState<CountdownState>(() => getCountdown(targetDate))

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCountdown(getCountdown(targetDate))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [targetDate])

  return countdown
}
