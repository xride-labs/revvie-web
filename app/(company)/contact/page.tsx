import type { Metadata } from 'next'
import { LegalLayout } from '@/components/landing/legal-layout'
import { Mail, MessageSquare, Clock, Instagram, Youtube } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us — Revvie',
  description: 'Get in touch with the Revvie team for support, business inquiries, or feedback.',
}

export default function ContactPage() {
  return (
    <LegalLayout
      title="Contact Us"
      subtitle="We're here to help. Reach out for support, partnerships, or just to say hello."
      lastUpdated="June 27, 2026"
    >
      <div className="space-y-10 text-text-secondary leading-relaxed">

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ContactCard
            icon={<Mail className="w-5 h-5 text-neon-green" />}
            title="General Enquiries"
            description="Questions about Revvie, partnerships, or press."
            contact="hello@xride-labs.in"
            href="mailto:hello@xride-labs.in"
          />
          <ContactCard
            icon={<MessageSquare className="w-5 h-5 text-electric-blue" />}
            title="Rider Support"
            description="Account issues, billing, or bug reports."
            contact="hello@xride-labs.in"
            href="mailto:hello@xride-labs.in"
          />
        </div>

        <Section title="Response Times">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResponseCard label="General Enquiries" time="2–3 business days" />
            <ResponseCard label="Billing & Refunds" time="2 business days" />
            <ResponseCard label="Technical Support" time="1–2 business days" />
          </div>
          <p className="mt-4 text-sm text-text-secondary/60 flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            Our support team operates Monday to Friday, 10 AM – 7 PM IST (excluding public holidays).
          </p>
        </Section>

        <Section title="Before You Contact Us">
          <p>You may find a quick answer in our frequently asked questions:</p>
          <ul className="mt-4 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group bg-surface border border-border/40 rounded-2xl overflow-hidden"
              >
                <summary className="flex justify-between items-center p-5 cursor-pointer text-white font-medium hover:text-neon-green transition-colors list-none">
                  <span>{faq.q}</span>
                  <span className="text-text-secondary/60 text-lg group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="px-5 pb-5 text-text-secondary text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </ul>
        </Section>

        <Section title="Business & Brand Partnerships">
          <p>
            Are you a motorcycle dealership, brand, or riding gear company looking to connect with the Revvie community? We offer brand partnership programmes, sponsored campaigns, and exclusive marketplace placements.
          </p>
          <p className="mt-3">
            Reach out at <a href="mailto:hello@xride-labs.in" className="text-neon-green hover:underline">hello@xride-labs.in</a> with the subject line <strong className="text-white">&quot;Brand Partnership Enquiry&quot;</strong> and our partnerships team will be in touch.
          </p>
        </Section>

        <Section title="Follow Us">
          <p>Stay up to date with Revvie news, ride updates, and community highlights:</p>
          <div className="flex flex-wrap gap-4 mt-4">
            <SocialLink
              icon={<Instagram className="w-5 h-5" />}
              label="Instagram"
              handle="@revvieapp"
              href="https://instagram.com"
            />
            <SocialLink
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              }
              label="X (Twitter)"
              handle="@revvieapp"
              href="https://twitter.com"
            />
            <SocialLink
              icon={<Youtube className="w-5 h-5" />}
              label="YouTube"
              handle="Revvie"
              href="https://youtube.com"
            />
          </div>
        </Section>

        <Section title="Report Abuse or Safety Concerns">
          <p>
            If you encounter content on Revvie that violates our community standards or poses a safety risk — including dangerous riding content, harassment, or illegal activity — please report it directly through the app by tapping the report icon on any post, profile, or message.
          </p>
          <p className="mt-3">
            For urgent safety concerns that cannot be handled through in-app reporting, email us at <a href="mailto:hello@xride-labs.in" className="text-neon-green hover:underline">hello@xride-labs.in</a> with the subject <strong className="text-white">&quot;Safety Report&quot;</strong>. We treat all safety reports with the highest priority.
          </p>
        </Section>

        <Section title="Company Details">
          <div className="bg-surface border border-border/40 rounded-2xl p-6 space-y-2">
            <p className="text-white font-bold text-lg">XRide Labs</p>
            <p>Operating as: <strong className="text-white">Revvie</strong></p>
            <p className="mt-3">
              <strong className="text-white">Email:</strong>{' '}
              <a href="mailto:hello@xride-labs.in" className="text-neon-green hover:underline">hello@xride-labs.in</a>
            </p>
            <p>
              <strong className="text-white">Website:</strong>{' '}
              <a href="https://revvie.xride-labs.in" className="text-neon-green hover:underline">revvie.xride-labs.in</a>
            </p>
            <p>
              <strong className="text-white">Country:</strong> India
            </p>
          </div>
        </Section>

      </div>
    </LegalLayout>
  )
}

const faqs = [
  {
    q: 'How do I cancel my Revvie Pro subscription?',
    a: 'You can cancel your subscription anytime from Settings → Account → Subscription → Cancel Subscription within the Revvie app. Your Pro access continues until the end of the current billing period.',
  },
  {
    q: 'I was charged but didn\'t get Pro access. What do I do?',
    a: 'Please email us at hello@xride-labs.in with your account email and the Razorpay payment ID (visible in your bank statement). We\'ll resolve this within 2 business days.',
  },
  {
    q: 'How do I delete my Revvie account?',
    a: 'Go to Settings → Account → Delete Account in the app. Account deletion is permanent and processes within 30 days. Your data is removed per our Privacy Policy.',
  },
  {
    q: 'I forgot my password. How do I reset it?',
    a: 'On the login screen, tap "Forgot Password?" and enter your email address. You\'ll receive a reset link within a few minutes. Check your spam folder if you don\'t see it.',
  },
  {
    q: 'How do I report a user or club for violating community standards?',
    a: 'Tap the three-dot menu on any post, profile, or ride listing and select "Report". Our moderation team reviews all reports and typically responds within 24–48 hours.',
  },
  {
    q: 'I\'m a brand/business. How do I set up a brand account on Revvie?',
    a: 'Visit our brand registration page or email hello@xride-labs.in with "Brand Account Request" in the subject line. Our team will guide you through the onboarding process.',
  },
]

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

function ContactCard({
  icon, title, description, contact, href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  contact: string
  href: string
}) {
  return (
    <a
      href={href}
      className="block bg-surface border border-border/40 rounded-2xl p-6 hover:border-neon-green/30 transition-all duration-300 group"
    >
      <div className="w-10 h-10 rounded-xl bg-canvas border border-border/40 flex items-center justify-center mb-4 group-hover:border-neon-green/30 transition-colors">
        {icon}
      </div>
      <h3 className="text-white font-bold mb-1 group-hover:text-neon-green transition-colors">{title}</h3>
      <p className="text-text-secondary/70 text-sm mb-3">{description}</p>
      <p className="text-neon-green text-sm font-medium">{contact}</p>
    </a>
  )
}

function ResponseCard({ label, time }: { label: string; time: string }) {
  return (
    <div className="bg-surface border border-border/40 rounded-2xl p-4 text-center">
      <p className="text-text-secondary/60 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white font-bold">{time}</p>
    </div>
  )
}

function SocialLink({
  icon, label, handle, href,
}: {
  icon: React.ReactNode
  label: string
  handle: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-surface border border-border/40 rounded-2xl px-5 py-3 hover:border-neon-green/30 hover:text-white transition-all duration-300"
    >
      <span className="text-text-secondary">{icon}</span>
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-text-secondary/60 text-xs">{handle}</p>
      </div>
    </a>
  )
}
