'use client'

import { useSyncExternalStore } from 'react'

const MINUTE = 60_000

/**
 * A clock that is safe to read during render.
 *
 * Calling `Date.now()` straight from a component body makes the render impure: the React
 * Compiler stops memoizing the component, and a server-rendered value can disagree with
 * the client's first paint. `useSyncExternalStore` fixes both — `getSnapshot` is bucketed
 * to the tick interval so repeated reads inside one render return the same number, and the
 * server snapshot is `0`, which callers below treat as "no clock yet".
 */
export function useNow(intervalMs: number = MINUTE): number {
  return useSyncExternalStore(
    (onStoreChange) => {
      const id = setInterval(onStoreChange, intervalMs)
      return () => clearInterval(id)
    },
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => 0,
  )
}

/**
 * Pure formatter — takes the clock as an argument instead of reading it.
 *
 * `now === 0` means the clock has not started (server render or first paint), so we fall
 * back to an absolute date rather than emit markup the client will immediately contradict.
 */
export function formatRelativeTime(
  iso: string | null | undefined,
  now: number,
  fallback: string = '',
): string {
  if (!iso) return fallback

  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return fallback
  if (now === 0) return new Date(then).toLocaleDateString()

  const minutes = Math.floor((now - then) / MINUTE)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`

  return new Date(then).toLocaleDateString()
}
