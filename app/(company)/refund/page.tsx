import type { Metadata } from 'next'
import { LegalLayout } from '@/components/landing/legal-layout'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — Revvie',
  description:
    "Revvie's refund and cancellation policy for Revvie Pro subscriptions and Marketplace transactions.",
}

export default function RefundPage() {
  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      subtitle="We want you to be happy with Revvie. Here's everything you need to know about cancellations and refunds."
      lastUpdated="June 27, 2026"
    >
      <div className="space-y-10 text-text-secondary leading-relaxed">
        <Section title="1. Overview">
          <p>
            This Refund &amp; Cancellation Policy governs refunds and cancellations for
            all paid services offered by XRide Labs through the Revvie Platform, including
            Revvie Pro subscriptions. This policy is consistent with applicable Indian
            consumer protection laws, including the Consumer Protection Act, 2019 and
            applicable RBI guidelines for digital payments.
          </p>
          <p className="mt-3">
            All payments on the Revvie Platform are processed through Razorpay Software
            Private Limited. Refunds, where applicable, will be credited to the original
            payment method used at the time of purchase.
          </p>
        </Section>

        <Section title="2. Revvie Pro Subscription">
          <div className="bg-surface border border-border/40 rounded-2xl p-6 mb-6">
            <p className="text-white font-semibold mb-3">Subscription Plans Available:</p>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Monthly Subscription</span>
                <span className="text-neon-green font-semibold">
                  Billed every 30 days
                </span>
              </li>
              <li className="flex justify-between">
                <span>Annual Subscription</span>
                <span className="text-neon-green font-semibold">
                  Billed once per year
                </span>
              </li>
            </ul>
          </div>

          <p>
            Revvie Pro subscriptions are billed in advance on a recurring cycle (monthly
            or annually). By subscribing, you authorise XRide Labs to charge your selected
            payment method automatically at the start of each billing cycle.
          </p>
        </Section>

        <Section title="3. Free Trial">
          <p>
            When a free trial is offered for Revvie Pro, the trial provides access to all
            Pro features for the trial duration at no charge. At the end of the trial
            period, your subscription will automatically convert to a paid plan and your
            payment method will be charged unless you cancel before the trial ends.
          </p>
          <p className="mt-3">
            Free trials are limited to one per user/account/device. Creating multiple
            accounts to obtain additional free trials is a violation of our Terms &amp;
            Conditions.
          </p>
        </Section>

        <Section title="4. Cancellation Policy">
          <p>You may cancel your Revvie Pro subscription at any time through:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              The Revvie mobile app:{' '}
              <strong className="text-white">
                Settings → Account → Subscription → Cancel Subscription
              </strong>
            </li>
            <li>
              Emailing us at{' '}
              <a
                href="mailto:hello@xride-labs.in"
                className="text-neon-green hover:underline"
              >
                hello@xride-labs.in
              </a>{' '}
              with your account email and cancellation request
            </li>
          </ul>
          <p className="mt-4">
            <strong className="text-white">When cancellation takes effect:</strong> Your
            cancellation takes effect at the end of your current billing period. You will
            continue to have access to Pro features until the end of the paid period. You
            will not be charged for the next billing cycle.
          </p>
          <p className="mt-3">
            Example: If you are on a monthly plan and cancel on the 15th day of your
            billing cycle, you retain Pro access until the end of that month. You will not
            be billed for the following month.
          </p>
        </Section>

        <Section title="5. Refund Eligibility">
          <Subsection title="5.1 Monthly Subscriptions">
            <p>
              Monthly subscriptions are generally{' '}
              <strong className="text-white">non-refundable</strong> once the billing
              cycle has started. If you believe your charge was made in error, please
              contact us within 7 days of the charge at{' '}
              <a
                href="mailto:hello@xride-labs.in"
                className="text-neon-green hover:underline"
              >
                hello@xride-labs.in
              </a>{' '}
              and we will review your case.
            </p>
          </Subsection>

          <Subsection title="5.2 Annual Subscriptions">
            <p>
              If you purchase an annual Revvie Pro subscription and are not satisfied, you
              may request a{' '}
              <strong className="text-white">full refund within 7 days</strong> of the
              initial purchase date, provided you have not made significant use of
              Pro-exclusive features during that period. After 7 days, annual
              subscriptions are non-refundable.
            </p>
          </Subsection>

          <Subsection title="5.3 Technical Issues">
            <p>
              If a technical error on our part results in you being charged for a service
              you did not receive or could not access, you are entitled to a full refund
              for the affected period. Please contact us with details of the issue within
              14 days of the charge.
            </p>
          </Subsection>

          <Subsection title="5.4 Exceptional Circumstances">
            <p>
              We evaluate refund requests outside the standard policy on a case-by-case
              basis. Factors we consider include the length of the subscription, extent of
              service use, and the nature of the request. We reserve the right to grant or
              deny such requests at our sole discretion.
            </p>
          </Subsection>
        </Section>

        <Section title="6. Non-Refundable Items">
          <p>The following are not eligible for refunds:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              Monthly subscriptions after the billing cycle has started (unless due to
              technical error).
            </li>
            <li>Annual subscriptions after the 7-day window has passed.</li>
            <li>
              Free trial periods that have converted to paid subscriptions (you must
              cancel before the trial ends).
            </li>
            <li>
              Subscriptions cancelled after the end of a free trial where the trial was
              used in full.
            </li>
            <li>Account terminations due to violations of our Terms &amp; Conditions.</li>
            <li>
              Promotional or discounted subscriptions, unless otherwise stated in the
              promotion terms.
            </li>
          </ul>
        </Section>

        <Section title="7. Marketplace Transactions">
          <p>
            The Revvie Marketplace facilitates peer-to-peer transactions between users.
            XRide Labs is not a party to these transactions. As such:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              Refunds or returns for Marketplace purchases are governed by the terms
              agreed between the buyer and seller at the time of sale.
            </li>
            <li>
              We strongly recommend buyers and sellers agree to clear refund and return
              terms before completing a transaction.
            </li>
            <li>
              Disputes between buyers and sellers must be resolved between the parties
              directly. XRide Labs may offer limited mediation assistance but is not
              obligated to resolve such disputes.
            </li>
            <li>
              In cases of confirmed fraud, we may, at our sole discretion, assist in
              facilitating a refund or taking action against the fraudulent party.
            </li>
          </ul>
        </Section>

        <Section title="8. How to Request a Refund">
          <p>To request a refund, please follow these steps:</p>
          <ol className="list-decimal pl-6 mt-3 space-y-3">
            <li>
              <strong className="text-white">Contact us</strong> at{' '}
              <a
                href="mailto:hello@xride-labs.in"
                className="text-neon-green hover:underline"
              >
                hello@xride-labs.in
              </a>{' '}
              with the subject line{' '}
              <strong className="text-white">
                &quot;Refund Request — [Your Username]&quot;
              </strong>
              .
            </li>
            <li>
              <strong className="text-white">Include the following information:</strong>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Your registered email address</li>
                <li>Date of the charge</li>
                <li>Amount charged</li>
                <li>Reason for the refund request</li>
                <li>
                  Razorpay Payment ID (visible in your bank statement or email receipt),
                  if available
                </li>
              </ul>
            </li>
            <li>
              We will{' '}
              <strong className="text-white">
                acknowledge your request within 2 business days
              </strong>{' '}
              and provide a resolution within 7 business days.
            </li>
          </ol>
        </Section>

        <Section title="9. Refund Processing Timeline">
          <div className="bg-surface border border-border/40 rounded-2xl p-6">
            <div className="space-y-4">
              <TimelineItem
                step="01"
                title="Request Received"
                description="We acknowledge your refund request within 2 business days."
              />
              <TimelineItem
                step="02"
                title="Review"
                description="We review your request and verify eligibility within 5 business days."
              />
              <TimelineItem
                step="03"
                title="Refund Initiated"
                description="Approved refunds are initiated within 7 business days of your request."
              />
              <TimelineItem
                step="04"
                title="Credit to Account"
                description="Refunds take 5–10 business days to reflect in your account, depending on your bank or card issuer."
              />
            </div>
          </div>
          <p className="mt-4 text-sm text-text-secondary/60">
            Refunds are processed in INR to the original payment method. We are not
            responsible for currency conversion charges or fees levied by your bank.
          </p>
        </Section>

        <Section title="10. Chargebacks">
          <p>
            If you initiate a chargeback with your bank or card issuer without first
            contacting us, we reserve the right to suspend your account pending resolution
            of the chargeback. We encourage you to contact us directly to resolve payment
            disputes — we are committed to addressing legitimate concerns promptly.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We reserve the right to modify this Refund &amp; Cancellation Policy at any
            time. Changes will be effective upon posting to the Platform. Continued use of
            the Platform after changes constitutes acceptance of the updated policy. We
            encourage you to review this policy periodically.
          </p>
        </Section>

        <Section title="12. Contact Us">
          <p>For any refund or cancellation queries, please reach out to us:</p>
          <div className="mt-4 bg-surface border border-border/40 rounded-2xl p-6 space-y-2">
            <p>
              <strong className="text-white">XRide Labs — Support</strong>
            </p>
            <p>
              Email:{' '}
              <a
                href="mailto:hello@xride-labs.in"
                className="text-neon-green hover:underline"
              >
                hello@xride-labs.in
              </a>
            </p>
            <p className="text-sm text-text-secondary/60 mt-2">
              Response time: 2 business days for acknowledgement, 7 business days for
              resolution
            </p>
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

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="text-text-secondary leading-[1.8]">{children}</div>
    </div>
  )
}

function TimelineItem({
  step,
  title,
  description,
}: {
  step: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
        <span className="text-neon-green text-xs font-bold">{step}</span>
      </div>
      <div>
        <p className="text-white font-semibold text-sm">{title}</p>
        <p className="text-text-secondary text-sm mt-0.5">{description}</p>
      </div>
    </div>
  )
}
