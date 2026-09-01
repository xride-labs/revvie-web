import type { Metadata, Viewport } from 'next'
import { Josefin_Sans } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const josefinSans = Josefin_Sans({
  variable: '--font-josefin',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://revvie.xride-labs.in'

export const metadata: Metadata = {
  // Required for relative OG/icon URLs to resolve to an absolute address instead of
  // silently pointing at localhost in production.
  metadataBase: new URL(APP_URL),
  title: 'Revvie — Ride. Track. Connect.',
  description:
    'The social platform built for motorcycle riders — clubs, organized rides, live GPS tracking, events, expense splitting, and a rider-only marketplace. Launching November 12.',
  keywords: [
    'motorcycle',
    'bikers',
    'clubs',
    'rides',
    'social',
    'community',
    'marketplace',
    'events',
    'expense splitting',
  ],
  authors: [{ name: 'Revvie Team' }],
  icons: {
    // /favicon.ico is served automatically from app/favicon.ico by Next's file
    // convention — only the icons without a convention-matching filename go here.
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'Revvie — Ride. Track. Connect.',
    description:
      'The social platform built for motorcycle riders — clubs, organized rides, live GPS tracking, events, expense splitting, and a rider-only marketplace. Launching November 12.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0d0d0f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${josefinSans.variable} antialiased min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-white`}
      >
        <div className="flex-1 relative w-full max-w-[1920px] mx-auto border-x border-border shadow-2xl bg-canvas">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  )
}
