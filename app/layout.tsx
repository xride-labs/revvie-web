import type { Metadata } from 'next'
import { Josefin_Sans } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const josefinSans = Josefin_Sans({
  variable: '--font-josefin',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Zoomies - Ride Together, Build Your Tribe',
  description:
    'A social platform for bikers where you discover clubs through people and participate in organized rides like clan wars.',
  keywords: [
    'motorcycle',
    'bikers',
    'clubs',
    'rides',
    'social',
    'community',
    'marketplace',
  ],
  authors: [{ name: 'Zoomies Team' }],
  openGraph: {
    title: 'Zoomies - Ride Together, Build Your Tribe',
    description:
      'A social platform for bikers where you discover clubs through people and participate in organized rides like clan wars.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${josefinSans.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
