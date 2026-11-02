'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { authClient } from '@/lib/auth-client'

interface PinwrenQueue {
  q?: unknown[][]
}

declare global {
  interface Window {
    Pinwren?: PinwrenQueue & {
      identify?: (user: { name?: string; email?: string }) => void
    }
  }
}

// NEXT_PUBLIC_* values are inlined at build time (see the Dockerfile ARGs).
const PINWREN_URL = (
  process.env.NEXT_PUBLIC_PINWREN_URL || 'https://bug.shubpy.com'
).replace(/\/+$/, '')
const PINWREN_KEY = process.env.NEXT_PUBLIC_PINWREN_KEY?.trim() ?? ''

/**
 * Pinwren feedback / bug-report widget. Renders nothing and stays off unless
 * NEXT_PUBLIC_PINWREN_KEY is set. Signed-in riders get their name and email
 * pre-filled (unverified identify; no id/signature is sent).
 */
export function PinwrenWidget() {
  const { data: session } = authClient.useSession()
  const name = session?.user?.name
  const email = session?.user?.email

  useEffect(() => {
    if (!PINWREN_KEY || !email) return
    const user = { name: name || undefined, email }
    const api = (window.Pinwren = window.Pinwren || { q: [] })
    if (typeof api.identify === 'function') api.identify(user)
    else (api.q = api.q || []).push(['identify', user])
  }, [name, email])

  if (!PINWREN_KEY) return null

  return (
    <Script
      src={`${PINWREN_URL}/widget.js`}
      data-project={PINWREN_KEY}
      strategy="afterInteractive"
    />
  )
}
