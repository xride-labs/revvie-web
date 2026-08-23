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
  title: 'Revvie - Ride Together, Build Your Tribe',
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
  authors: [{ name: 'Revvie Team' }],
  openGraph: {
    title: 'Revvie - Ride Together, Build Your Tribe',
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
      <body className={`${josefinSans.variable} antialiased min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-white`}>
        <div className="flex-1 relative w-full max-w-[1920px] mx-auto border-x border-border shadow-2xl bg-canvas">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  )
}
