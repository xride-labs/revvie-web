import type { Metadata } from 'next'
import { LegalLayout } from '@/components/landing/legal-layout'

export const metadata: Metadata = {
  title: 'Privacy Policy — Revvie',
  description: 'Learn how Revvie collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Your privacy matters to us. This policy explains what data we collect, how we use it, and your rights as a Revvie user."
      lastUpdated="June 27, 2026"
    >
      <div className="space-y-10 text-text-secondary leading-relaxed">

        <Section title="1. Introduction">
          <p>
            XRide Labs (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the Revvie platform — a social platform for motorcycle riders. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Revvie mobile application and website (collectively, the &quot;Platform&quot;).
          </p>
          <p className="mt-3">
            This policy complies with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and India&apos;s Digital Personal Data Protection Act, 2023 (&quot;DPDPA 2023&quot;).
          </p>
          <p className="mt-3">
            By using the Platform, you consent to the data practices described in this Privacy Policy. If you do not agree, please discontinue use of the Platform.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <Subsection title="2.1 Information You Provide Directly">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Account Information:</strong> Name, username, email address, password (hashed), phone number, date of birth, and profile photo.</li>
              <li><strong className="text-white">Profile Information:</strong> Bio, motorcycle details (make, model, year), riding experience, home city, and social links you choose to share.</li>
              <li><strong className="text-white">User Content:</strong> Posts, photos, videos, ride reviews, marketplace listings, and other content you submit.</li>
              <li><strong className="text-white">Communications:</strong> Messages sent through in-app chat, support requests, and feedback.</li>
              <li><strong className="text-white">Payment Information:</strong> When subscribing to Revvie Pro, payment details are processed by Razorpay. We do not store your full card or bank details on our servers.</li>
              <li><strong className="text-white">Emergency Contacts:</strong> Names and phone numbers of contacts you designate for SOS features.</li>
            </ul>
          </Subsection>
          <Subsection title="2.2 Information Collected Automatically">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Location Data:</strong> GPS coordinates, speed, and route data when you use ride tracking features, with your permission. You can disable location access at any time in your device settings.</li>
              <li><strong className="text-white">Device Information:</strong> Device type, operating system, unique device identifiers (UDID/AAID), app version, and mobile network information.</li>
              <li><strong className="text-white">Usage Data:</strong> Features accessed, screens viewed, buttons tapped, time spent, and crash logs.</li>
              <li><strong className="text-white">Log Data:</strong> IP addresses, browser type, referring URLs, and dates/times of access when using our website.</li>
              <li><strong className="text-white">Sensor Data:</strong> Accelerometer and motion sensor data when you have enabled fall detection or snatch detection features.</li>
            </ul>
          </Subsection>
          <Subsection title="2.3 Information from Third Parties">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Social Sign-In:</strong> If you sign in with Google or other social providers, we receive your name, email address, and profile picture from that provider.</li>
              <li><strong className="text-white">Analytics Partners:</strong> Aggregated analytics data from PostHog for product improvement.</li>
              <li><strong className="text-white">Payment Processors:</strong> Transaction status and metadata from Razorpay (not card/bank details).</li>
            </ul>
          </Subsection>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Create and manage your account, and authenticate your identity.</li>
            <li>Provide, maintain, and improve the Platform and its features.</li>
            <li>Process payments and manage your Revvie Pro subscription.</li>
            <li>Enable ride tracking, club management, and social features.</li>
            <li>Facilitate peer-to-peer communication and Marketplace transactions.</li>
            <li>Send you notifications about rides, clubs, messages, and Platform updates you have opted into.</li>
            <li>Respond to your support requests and provide customer service.</li>
            <li>Monitor Platform safety, detect fraud, and enforce our Terms &amp; Conditions.</li>
            <li>Analyse usage patterns to improve performance and develop new features.</li>
            <li>Comply with applicable laws and legal obligations.</li>
            <li>Send marketing communications where you have given explicit consent (you can opt out at any time).</li>
          </ul>
        </Section>

        <Section title="4. Sharing of Your Information">
          <p>We do not sell your personal data. We may share your information in the following circumstances:</p>
          <Subsection title="4.1 With Other Users">
            <p>Your profile name, photo, riding history, and club memberships are visible to other Revvie users as per your privacy settings. Your real-time location is never shared publicly; it is only used for ride tracking features within your consent.</p>
          </Subsection>
          <Subsection title="4.2 With Service Providers">
            <p>We share data with third-party vendors who assist us in operating the Platform, subject to confidentiality obligations:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Cloud hosting and infrastructure (AWS / Supabase)</li>
              <li>Payment processing (Razorpay)</li>
              <li>Analytics (PostHog)</li>
              <li>Crash reporting (Sentry)</li>
              <li>Push notifications (Expo / FCM / APNs)</li>
            </ul>
          </Subsection>
          <Subsection title="4.3 For Legal Reasons">
            <p>We may disclose your information if required to do so by law, court order, or governmental authority, or if we believe disclosure is necessary to protect the rights, property, or safety of XRide Labs, our users, or the public.</p>
          </Subsection>
          <Subsection title="4.4 Business Transfers">
            <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity, subject to the same privacy protections.</p>
          </Subsection>
        </Section>

        <Section title="5. Location Data">
          <p>
            Revvie uses precise location data to power ride tracking, nearby club discovery, and emergency SOS features. Location access is only activated when you explicitly start a ride or use a location-dependent feature.
          </p>
          <p className="mt-3">
            We request background location access on supported devices solely to continue tracking an active ride when the app is minimised. This access is not used for any other purpose. You may revoke location permissions at any time through your device settings, though doing so will disable ride tracking features.
          </p>
          <p className="mt-3">
            Location data from completed rides is stored on our servers to provide you with your ride history, statistics, and to generate community route maps (where you have opted in to public route sharing).
          </p>
        </Section>

        <Section title="6. Cookies and Tracking Technologies">
          <p>
            Our website uses cookies and similar tracking technologies to remember your preferences, maintain your session, and understand how you interact with our website. We use:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong className="text-white">Essential Cookies:</strong> Required for authentication and core website functionality. Cannot be disabled.</li>
            <li><strong className="text-white">Analytics Cookies:</strong> Help us understand traffic patterns and improve our website. You can opt out via your browser settings.</li>
            <li><strong className="text-white">Preference Cookies:</strong> Remember your settings and preferences for a better experience.</li>
          </ul>
          <p className="mt-3">
            You can manage cookie preferences through your browser settings. Note that disabling certain cookies may affect website functionality.
          </p>
        </Section>

        <Section title="7. Data Retention">
          <p>
            We retain your personal data for as long as your account is active or as needed to provide you with our services. You can delete your account at any time through the app settings. Upon account deletion:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Your profile and most personal data is permanently deleted within 30 days.</li>
            <li>Anonymised ride data may be retained for community features (e.g., popular routes) in a form that cannot identify you.</li>
            <li>Transaction records and billing information are retained for 7 years as required by Indian tax and accounting laws.</li>
            <li>Data required for ongoing legal proceedings or regulatory compliance may be retained until such matters are resolved.</li>
          </ul>
        </Section>

        <Section title="8. Security">
          <p>
            We implement industry-standard technical and organisational security measures to protect your personal data against unauthorised access, loss, misuse, or alteration. These include:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Encryption of data in transit using TLS 1.3.</li>
            <li>Encryption of sensitive data at rest.</li>
            <li>Hashed passwords using bcrypt.</li>
            <li>Role-based access controls for employees.</li>
            <li>Regular security audits and vulnerability assessments.</li>
          </ul>
          <p className="mt-3">
            No method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. In the event of a data breach affecting your rights, we will notify you as required by applicable law.
          </p>
        </Section>

        <Section title="9. Your Rights Under DPDPA 2023">
          <p>Under India&apos;s Digital Personal Data Protection Act, 2023, you have the following rights:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong className="text-white">Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong className="text-white">Right to Correction:</strong> Request correction of inaccurate or incomplete personal data.</li>
            <li><strong className="text-white">Right to Erasure:</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
            <li><strong className="text-white">Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time, without affecting the lawfulness of prior processing.</li>
            <li><strong className="text-white">Right to Grievance Redressal:</strong> Lodge a complaint about how your data is handled.</li>
            <li><strong className="text-white">Right to Nominate:</strong> Nominate another individual to exercise your rights in the event of your death or incapacity.</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, please contact our Data Grievance Officer at <a href="mailto:hello@xride-labs.in" className="text-neon-green hover:underline">hello@xride-labs.in</a>. We will respond to verifiable requests within 30 days.
          </p>
        </Section>

        <Section title="10. Children's Privacy">
          <p>
            Revvie is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently collected personal data from a child under 13, we will take steps to delete such information promptly. If you believe we may have collected information from a child under 13, please contact us immediately at <a href="mailto:hello@xride-labs.in" className="text-neon-green hover:underline">hello@xride-labs.in</a>.
          </p>
        </Section>

        <Section title="11. International Data Transfers">
          <p>
            Your data may be stored and processed in data centres outside India (including the United States, via our cloud infrastructure providers). When we transfer data internationally, we ensure appropriate safeguards are in place consistent with applicable Indian data protection law, including contractual clauses with our service providers.
          </p>
        </Section>

        <Section title="12. Third-Party Links and Services">
          <p>
            Our Platform may contain links to third-party websites or integrate with third-party services (such as mapping, social sign-in, or payment processing). These third parties have their own privacy policies. We are not responsible for the privacy practices of third parties and encourage you to review their policies before providing them with any personal information.
          </p>
        </Section>

        <Section title="13. Changes to This Privacy Policy">
          <p>
            We may update this Privacy Policy periodically to reflect changes in our practices or applicable law. We will notify you of material changes by updating the &quot;Last updated&quot; date and, where required by law, by providing more prominent notice (such as an in-app notification). Your continued use of the Platform after the effective date of any changes constitutes your acceptance of the updated policy.
          </p>
        </Section>

        <Section title="14. Data Grievance Officer">
          <p>As required under Indian law, we have designated a Data Grievance Officer to handle privacy-related queries and complaints:</p>
          <div className="mt-4 bg-surface border border-border/40 rounded-2xl p-6 space-y-2">
            <p><strong className="text-white">Data Grievance Officer</strong></p>
            <p>XRide Labs</p>
            <p>Email: <a href="mailto:hello@xride-labs.in" className="text-neon-green hover:underline">hello@xride-labs.in</a></p>
            <p className="mt-2 text-text-secondary/60 text-sm">Response time: within 30 days of receipt of complaint</p>
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
      <div className="text-text-secondary leading-[1.8] space-y-3">
        {children}
      </div>
    </div>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-2">{title}</h3>
      <div className="text-text-secondary leading-[1.8]">{children}</div>
    </div>
  )
}
