import type { Metadata } from 'next'
import { LegalLayout } from '@/components/landing/legal-layout'
import { Users, Zap, Shield, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us — Revvie',
  description: 'Learn about Revvie — who we are, what we\'re building, and our mission to unite the motorcycle community.',
}

export default function AboutPage() {
  return (
    <LegalLayout
      title="About Revvie"
      subtitle="We're building the social layer for motorcycle culture — a place where every rider belongs."
      lastUpdated="June 27, 2026"
    >
      <div className="space-y-10 text-text-secondary leading-relaxed">

        {/* Mission statement */}
        <div className="bg-surface border border-border/40 rounded-3xl p-8 text-center">
          <p className="text-2xl md:text-3xl font-bold text-white leading-snug">
            &ldquo;Ride Together. Build Your Tribe.&rdquo;
          </p>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">
            Revvie exists to turn every solo ride into a shared story, every road into a community route, and every rider into a legend.
          </p>
        </div>

        <Section title="Who We Are">
          <p>
            Revvie is the flagship product of <strong className="text-white">XRide Labs</strong> — a startup born from a simple frustration: the motorcycle community is massive, passionate, and deeply connected offline, but completely fragmented online.
          </p>
          <p className="mt-3">
            Riders use a patchwork of WhatsApp groups, Facebook pages, and spreadsheets to organise rides, discover clubs, and buy gear. We thought there had to be a better way — a platform built specifically for this culture, not just adapted from a generic social media template.
          </p>
          <p className="mt-3">
            Revvie is that platform. We built it from the ground up for riders, with features that matter to the riding community: club management, organised ride coordination, a motorcycle-specific marketplace, real-time ride tracking, safety features, and a social feed that actually respects the culture.
          </p>
        </Section>

        <Section title="Our Mission">
          <p>
            Our mission is to make the global motorcycle community more connected, safer, and more vibrant — one ride at a time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <ValueCard
              icon={<Users className="w-5 h-5 text-neon-green" />}
              title="Community First"
              description="Every feature we build starts with the question: does this make the riding community stronger? Commercial considerations always come second to genuine value for riders."
            />
            <ValueCard
              icon={<Shield className="w-5 h-5 text-electric-blue" />}
              title="Safety Built In"
              description="From fall detection to SOS alerts to ride sharing with trusted contacts, safety isn't an afterthought — it's woven into the core experience."
            />
            <ValueCard
              icon={<Zap className="w-5 h-5 text-brand-yellow" />}
              title="Ride-Native Design"
              description="We design for the realities of motorcycling — gloves on, helmet on, one hand on the bars. The UI is minimal, fast, and works at 100 km/h."
            />
            <ValueCard
              icon={<Globe className="w-5 h-5 text-brand-red-bright" />}
              title="Indian Roads, Global Ambition"
              description="We started in India because Indian riding culture is unlike anything else in the world. But the roads we're building for are everywhere."
            />
          </div>
        </Section>

        <Section title="What Revvie Does">
          <p>Revvie brings together all the tools a motorcycle rider needs into one platform:</p>
          <ul className="mt-4 space-y-4">
            <FeatureItem
              title="Clubs"
              description="Discover and join motorcycle clubs in your city, build your club's digital home, manage membership, and organise rides — all without leaving the app."
            />
            <FeatureItem
              title="Rides"
              description="Plan group rides, invite your crew, track the route in real time, and share the highlights. Turn every outing into a shared memory."
            />
            <FeatureItem
              title="Ride Tracking"
              description="Record your rides with GPS, log speed and distance, track your stats over time, and share routes with the community."
            />
            <FeatureItem
              title="Marketplace"
              description="Buy and sell motorcycle gear, parts, and accessories within a community of verified riders — no more Facebook Marketplace chaos."
            />
            <FeatureItem
              title="Safety Features"
              description="Fall detection, snatch detection, SOS alerts, and emergency contact sharing — because great rides deserve to end safely."
            />
            <FeatureItem
              title="Revvie Pro"
              description="An optional premium tier for power users who want advanced analytics, unlimited ride history, custom themes, and more."
            />
          </ul>
        </Section>

        <Section title="Our Story">
          <p>
            XRide Labs was founded in India by a team of motorcycle enthusiasts who were spending more time managing WhatsApp groups than actually riding. The idea was simple: what if organising a ride with your club was as easy as posting a story?
          </p>
          <p className="mt-3">
            We spent months talking to riders across India — from weekend warriors to serious tourers, from Royal Enfield owners to sportbike riders — to understand what they actually needed. The answer was always the same: less friction, more community.
          </p>
          <p className="mt-3">
            Revvie launched to an invite-only community of early riders who helped shape the product with feedback, bug reports, and honest opinions about what worked and what didn&apos;t. Today, we&apos;re building for every rider in India and beyond.
          </p>
        </Section>

        <Section title="For Brands and Businesses">
          <p>
            Revvie gives motorcycle brands, dealerships, and gear companies a direct channel to an engaged, passionate audience of verified riders. Through our Brand Portal, businesses can:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Create a verified brand presence on Revvie.</li>
            <li>Run targeted campaigns to riders based on bike type, location, and riding habits.</li>
            <li>List products and services on the Marketplace.</li>
            <li>Sponsor rides and community events.</li>
            <li>Access analytics on campaign performance and audience engagement.</li>
          </ul>
          <p className="mt-3">
            To learn more about brand partnerships, email us at <a href="mailto:hello@xride-labs.in" className="text-neon-green hover:underline">hello@xride-labs.in</a>.
          </p>
        </Section>

        <Section title="Contact & Enquiries">
          <div className="bg-surface border border-border/40 rounded-2xl p-6 space-y-2">
            <p className="text-white font-bold">XRide Labs</p>
            <p>Operating as: <strong className="text-white">Revvie</strong></p>
            <p className="mt-3">Email: <a href="mailto:hello@xride-labs.in" className="text-neon-green hover:underline">hello@xride-labs.in</a></p>
            <p>Website: <a href="https://revvie.xride-labs.in" className="text-neon-green hover:underline">revvie.xride-labs.in</a></p>
            <p>Country of Incorporation: <strong className="text-white">India</strong></p>
          </div>
        </Section>

      </div>
    </LegalLayout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4 pb-3 border-b border-border/30">
        {title}
      </h2>
      <div className="text-text-secondary leading-[1.8] space-y-3">{children}</div>
    </div>
  )
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-surface border border-border/40 rounded-2xl p-5">
      <div className="w-10 h-10 rounded-xl bg-canvas border border-border/40 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-white font-bold mb-2">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-4 bg-surface border border-border/40 rounded-2xl p-5">
      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-neon-green" />
      <div>
        <h3 className="text-white font-bold mb-1">{title}</h3>
        <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
