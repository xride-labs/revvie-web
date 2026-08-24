import type { Metadata } from 'next'
import { LegalLayout } from '@/components/landing/legal-layout'

export const metadata: Metadata = {
  title: 'Terms & Conditions — Revvie',
  description:
    'Read the Terms & Conditions governing your use of Revvie, the social platform for motorcycle riders.',
}

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using Revvie. By accessing or using our platform, you agree to be bound by these terms."
      lastUpdated="June 27, 2026"
    >
      <div className="space-y-10 text-text-secondary leading-relaxed">
        <Section title="1. Agreement to Terms">
          <p>
            These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding
            agreement between you (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;)
            and XRide Labs (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or
            &quot;our&quot;), a company incorporated under the laws of India, governing
            your access to and use of the Revvie mobile application, website (
            <a
              href="https://revvie.xride-labs.in"
              className="text-neon-green hover:underline"
            >
              revvie.xride-labs.in
            </a>
            ), and all related services (collectively, the &quot;Platform&quot;).
          </p>
          <p className="mt-3">
            By creating an account, downloading the app, clicking &quot;I Agree,&quot; or
            otherwise accessing or using the Platform, you confirm that you have read,
            understood, and agree to be bound by these Terms and our{' '}
            <a href="/privacy" className="text-neon-green hover:underline">
              Privacy Policy
            </a>
            , which is incorporated herein by reference. If you do not agree to these
            Terms, you must not access or use the Platform.
          </p>
        </Section>

        <Section title="2. Definitions">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-white">Platform</strong> — The Revvie mobile
              application, website, and all related services operated by XRide Labs.
            </li>
            <li>
              <strong className="text-white">User Content</strong> — Any content including
              text, photos, videos, routes, ride data, reviews, or other material you
              submit, post, or transmit through the Platform.
            </li>
            <li>
              <strong className="text-white">Club</strong> — A motorcycle riding group or
              community created and managed through the Platform.
            </li>
            <li>
              <strong className="text-white">Ride</strong> — An organised group motorcycle
              ride event created, joined, or tracked through the Platform.
            </li>
            <li>
              <strong className="text-white">Marketplace</strong> — The peer-to-peer
              buying and selling section of the Platform for motorcycle-related goods and
              services.
            </li>
            <li>
              <strong className="text-white">Revvie Pro</strong> — Our premium
              subscription tier offering enhanced features.
            </li>
            <li>
              <strong className="text-white">Brand Partner</strong> — Businesses,
              dealerships, or brands that access the Platform through our brand portal.
            </li>
          </ul>
        </Section>

        <Section title="3. Eligibility">
          <p>
            You must be at least 18 years of age to use the Platform. If you are between
            13 and 18 years of age, you may only use the Platform with the verifiable
            consent of a parent or legal guardian, who agrees to these Terms on your
            behalf and accepts responsibility for your use. The Platform is not intended
            for children under 13 years of age, and we do not knowingly collect personal
            information from children under 13.
          </p>
          <p className="mt-3">
            By using the Platform, you represent and warrant that you have the legal
            capacity to enter into these Terms, that you are not barred from using the
            Platform under any applicable law, and that you will comply with all
            applicable laws and regulations.
          </p>
        </Section>

        <Section title="4. Account Registration and Security">
          <p>
            To access most features of the Platform, you must create an account. When
            registering, you agree to:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Provide accurate, current, and complete information.</li>
            <li>Maintain and promptly update your account information.</li>
            <li>
              Keep your password confidential and not share it with any third party.
            </li>
            <li>
              Immediately notify us of any unauthorised use of your account at{' '}
              <a
                href="mailto:hello@xride-labs.in"
                className="text-neon-green hover:underline"
              >
                hello@xride-labs.in
              </a>
              .
            </li>
            <li>
              Accept responsibility for all activities that occur under your account.
            </li>
          </ul>
          <p className="mt-3">
            We reserve the right to disable any account at any time, in our sole
            discretion, if we believe you have violated these Terms. You may not create
            multiple accounts for the purpose of evading a suspension or engaging in
            abusive behaviour.
          </p>
        </Section>

        <Section title="5. User Content">
          <p>
            By submitting User Content to the Platform, you grant XRide Labs a
            non-exclusive, worldwide, royalty-free, sublicensable, and transferable
            licence to use, reproduce, modify, adapt, publish, translate, distribute, and
            display such content in connection with operating and promoting the Platform.
            You retain ownership of your User Content.
          </p>
          <p className="mt-3">You represent and warrant that:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>You own or have the necessary rights to submit the User Content.</li>
            <li>
              The User Content does not infringe any third-party intellectual property,
              privacy, or other rights.
            </li>
            <li>
              The User Content does not contain any defamatory, obscene, hateful, or
              illegal material.
            </li>
            <li>
              Route and location data you share is accurate to the best of your knowledge.
            </li>
          </ul>
          <p className="mt-3">
            We reserve the right to remove any User Content at our discretion, without
            notice, that we believe violates these Terms or is otherwise objectionable.
          </p>
        </Section>

        <Section title="6. Community Standards and Prohibited Conduct">
          <p>Revvie is built on the values of the riding community. You agree not to:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              Post content that is hateful, abusive, harassing, threatening, defamatory,
              or discriminatory.
            </li>
            <li>
              Impersonate any person or entity, or misrepresent your affiliation with any
              person or entity.
            </li>
            <li>
              Post content promoting illegal activities, including reckless riding, racing
              on public roads, or circumventing traffic laws.
            </li>
            <li>Spam, phish, solicit, or engage in pyramid schemes.</li>
            <li>
              Use automated scripts, bots, scrapers, or any means to access the Platform
              in an unauthorised manner.
            </li>
            <li>
              Attempt to gain unauthorised access to any portion of the Platform, other
              user accounts, or computer systems connected to the Platform.
            </li>
            <li>
              Interfere with or disrupt the integrity or performance of the Platform.
            </li>
            <li>
              Collect or harvest personal information from other users without consent.
            </li>
            <li>
              Use the Platform for any commercial purpose not explicitly permitted by us.
            </li>
            <li>
              Post content that glorifies or encourages dangerous, reckless, or illegal
              riding behaviour.
            </li>
          </ul>
          <p className="mt-3">
            Violation of these standards may result in the immediate suspension or
            permanent termination of your account.
          </p>
        </Section>

        <Section title="7. Club Features">
          <p>
            Club Owners and Administrators bear full responsibility for the management of
            their club, including the conduct of members, ride safety, and compliance with
            applicable laws. When organising club rides, the Club Owner agrees that:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              Revvie is a facilitation platform and assumes no liability for events,
              accidents, or disputes arising from club activities.
            </li>
            <li>
              They will ensure all ride participants comply with traffic laws, wear
              appropriate safety gear, and follow safe riding practices.
            </li>
            <li>
              Club descriptions, rules, and communications must comply with these Terms
              and applicable laws.
            </li>
            <li>
              They will not use Revvie to facilitate any illegal gathering or activity.
            </li>
          </ul>
          <p className="mt-3">
            We reserve the right to remove any club or revoke club management privileges
            for violations of these Terms.
          </p>
        </Section>

        <Section title="8. Ride Tracking and Safety">
          <p>
            Revvie offers ride tracking features using your device&apos;s GPS. By using
            these features, you acknowledge:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              Ride tracking data, including speed, distance, and route, is recorded for
              your personal use and, where you consent, shared with club members or
              followers.
            </li>
            <li>
              You are solely responsible for safe and lawful operation of your motorcycle.
              Never use a mobile device while riding.
            </li>
            <li>
              GPS accuracy may vary based on device, terrain, and signal conditions. Do
              not rely solely on the Platform for navigation in safety-critical
              situations.
            </li>
            <li>
              SOS and emergency contact features are provided as a convenience and do not
              substitute for calling emergency services.
            </li>
          </ul>
        </Section>

        <Section title="9. Marketplace">
          <p>
            The Marketplace section of the Platform enables peer-to-peer transactions
            between users for motorcycle-related products and services. You acknowledge
            that:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              XRide Labs is not a party to any transaction between buyers and sellers on
              the Marketplace. We act solely as a facilitating platform.
            </li>
            <li>
              You are responsible for verifying the accuracy of all listings you create.
              Misrepresentation of goods or services is prohibited.
            </li>
            <li>
              Sellers are responsible for the quality, safety, and lawful sale of their
              products. Buyers are responsible for inspecting goods before purchase.
            </li>
            <li>
              We do not guarantee the quality, safety, legality, or delivery of items
              listed on the Marketplace.
            </li>
            <li>
              Disputes between buyers and sellers must be resolved between the parties
              directly. We may, at our discretion, offer facilitation support but are not
              obligated to resolve disputes.
            </li>
            <li>
              Listing, selling, or buying illegal modifications, counterfeit parts, or
              stolen property is strictly prohibited and may result in account termination
              and reporting to law enforcement.
            </li>
          </ul>
        </Section>

        <Section title="10. Revvie Pro Subscription">
          <p>
            Revvie Pro is a paid subscription service that unlocks premium features. By
            subscribing to Revvie Pro:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              You authorise us to charge the applicable subscription fee to your selected
              payment method via Razorpay on a recurring basis (monthly or annually, as
              selected).
            </li>
            <li>
              Your subscription automatically renews at the end of each billing cycle
              unless cancelled prior to the renewal date.
            </li>
            <li>
              You may cancel your subscription at any time through the app settings.
              Cancellation takes effect at the end of the current billing period.
            </li>
            <li>
              We reserve the right to modify subscription pricing with at least 30
              days&apos; prior notice.
            </li>
            <li>
              Features included in Revvie Pro may be modified or removed at our discretion
              with reasonable notice.
            </li>
          </ul>
          <p className="mt-3">
            Please refer to our{' '}
            <a href="/refund" className="text-neon-green hover:underline">
              Refund Policy
            </a>{' '}
            for information on cancellations and refunds.
          </p>
        </Section>

        <Section title="11. Payment Terms">
          <p>
            All payments on the Platform are processed by Razorpay Software Private
            Limited (&quot;Razorpay&quot;), a third-party payment service provider. By
            making any payment on the Platform:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>You agree to Razorpay&apos;s Terms of Service and Privacy Policy.</li>
            <li>
              All prices are listed in Indian Rupees (INR) and are inclusive of applicable
              taxes unless stated otherwise.
            </li>
            <li>
              Goods and Services Tax (GST) will be applied as per prevailing Indian tax
              laws.
            </li>
            <li>
              We are not responsible for payment failures, bank charges, or technical
              issues arising from your payment method or bank.
            </li>
            <li>
              Chargebacks or fraudulent payment disputes may result in immediate
              suspension of your account.
            </li>
          </ul>
        </Section>

        <Section title="12. Intellectual Property">
          <p>
            All content on the Platform that is not User Content, including but not
            limited to the Revvie name, logo, app design, code, graphics, text, and
            trademarks, is the exclusive property of XRide Labs or its licensors and is
            protected by applicable intellectual property laws.
          </p>
          <p className="mt-3">
            You are granted a limited, non-exclusive, non-transferable, revocable licence
            to access and use the Platform solely for your personal, non-commercial use.
            You may not copy, modify, distribute, sell, or lease any part of our Platform
            without our prior written consent.
          </p>
        </Section>

        <Section title="13. Third-Party Services and Links">
          <p>
            The Platform may integrate with or link to third-party services, websites, and
            applications including, but not limited to, mapping services, payment
            processors, and social networks. We do not control these third-party services
            and are not responsible for their content, privacy practices, or terms. Your
            use of third-party services is governed by their own terms and privacy
            policies.
          </p>
        </Section>

        <Section title="14. Disclaimer of Warranties">
          <p>
            THE PLATFORM IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
            BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT
            NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE
            UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL
            COMPONENTS.
          </p>
          <p className="mt-3">
            We do not warrant the accuracy of any route, safety, or mapping data provided
            on the Platform. Riding decisions are your sole responsibility.
          </p>
        </Section>

        <Section title="15. Limitation of Liability">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, XRIDE LABS, ITS DIRECTORS,
            EMPLOYEES, PARTNERS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR IN
            CONNECTION WITH YOUR USE OF THE PLATFORM, INCLUDING BUT NOT LIMITED TO
            ACCIDENTS, INJURIES, PROPERTY DAMAGE, LOSS OF DATA, OR LOSS OF REVENUE, EVEN
            IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p className="mt-3">
            OUR TOTAL AGGREGATE LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO
            THESE TERMS OR THE PLATFORM SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE
            SIX (6) MONTHS PRECEDING THE CLAIM, OR INR 1,000, WHICHEVER IS GREATER.
          </p>
        </Section>

        <Section title="16. Indemnification">
          <p>
            You agree to indemnify, defend, and hold harmless XRide Labs, its officers,
            directors, employees, agents, and licensors from and against any claims,
            liabilities, damages, losses, and expenses (including reasonable legal fees)
            arising out of or related to: (a) your use of the Platform; (b) your User
            Content; (c) your violation of these Terms; (d) your violation of any
            third-party right; or (e) any accident, injury, or damage resulting from your
            participation in rides or club activities facilitated through the Platform.
          </p>
        </Section>

        <Section title="17. Termination">
          <p>
            We reserve the right to suspend or terminate your account and access to the
            Platform at any time, with or without notice, for any reason, including if we
            believe you have violated these Terms. Upon termination, your right to use the
            Platform immediately ceases.
          </p>
          <p className="mt-3">
            You may delete your account at any time through the app settings. Deletion
            requests will be processed within 30 days. Certain data may be retained as
            required by law.
          </p>
        </Section>

        <Section title="18. Governing Law and Dispute Resolution">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of
            India, without regard to conflict of law principles. Any disputes arising
            under these Terms shall be subject to the exclusive jurisdiction of the courts
            of Bengaluru, Karnataka, India.
          </p>
          <p className="mt-3">
            Before initiating any legal proceeding, you agree to attempt to resolve any
            dispute informally by contacting us at{' '}
            <a
              href="mailto:hello@xride-labs.in"
              className="text-neon-green hover:underline"
            >
              hello@xride-labs.in
            </a>
            . We will make good-faith efforts to resolve the dispute within 30 days.
          </p>
        </Section>

        <Section title="19. Changes to Terms">
          <p>
            We reserve the right to modify these Terms at any time. We will provide notice
            of material changes by updating the &quot;Last updated&quot; date at the top
            of these Terms and, where appropriate, by sending an in-app notification or
            email. Your continued use of the Platform after any such changes constitutes
            your acceptance of the updated Terms. We encourage you to review these Terms
            periodically.
          </p>
        </Section>

        <Section title="20. Miscellaneous">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-white">Entire Agreement:</strong> These Terms,
              together with the Privacy Policy and Refund Policy, constitute the entire
              agreement between you and XRide Labs regarding the Platform.
            </li>
            <li>
              <strong className="text-white">Severability:</strong> If any provision of
              these Terms is found to be unenforceable, the remaining provisions will
              remain in full force and effect.
            </li>
            <li>
              <strong className="text-white">Waiver:</strong> Our failure to enforce any
              right or provision of these Terms will not be considered a waiver of such
              right or provision.
            </li>
            <li>
              <strong className="text-white">Assignment:</strong> You may not assign your
              rights under these Terms without our prior written consent. We may assign
              our rights without restriction.
            </li>
          </ul>
        </Section>

        <Section title="21. Contact Us">
          <p>If you have any questions about these Terms, please contact us:</p>
          <div className="mt-4 bg-surface border border-border/40 rounded-2xl p-6 space-y-2">
            <p>
              <strong className="text-white">XRide Labs</strong>
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
            <p>
              Website:{' '}
              <a href="/contact" className="text-neon-green hover:underline">
                revvie.xride-labs.in/contact
              </a>
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
      <div className="text-text-secondary leading-[1.8] space-y-2">{children}</div>
    </div>
  )
}
