import {
  Navbar,
  HeroSection,
  CountdownSection,
  EcosystemSection,
  FeaturesSection,
  InvestSection,
  MarketplaceSection,
  ClosingSection,
  Footer,
} from '@/components/landing'
import { redirect } from 'next/navigation'

function isWebDisabled(): boolean {
  const raw = process.env.WEB_DISABLED ?? process.env.NEXT_PUBLIC_WEB_DISABLED
  const value = raw
    ?.trim()
    .replace(/^['\"]|['\"]$/g, '')
    .toLowerCase()

  return value === 'true' || value === '1' || value === 'yes' || value === 'on'
}

export default function Home() {
  if (isWebDisabled()) {
    redirect('/launch?from=/')
  }

  return (
    <main className="landing-shell min-h-screen bg-canvas">
      <Navbar />
      <HeroSection />
      <CountdownSection />
      <EcosystemSection />
      <FeaturesSection />
      <InvestSection />
      <MarketplaceSection />
      <ClosingSection />
      <Footer />
    </main>
  )
}
