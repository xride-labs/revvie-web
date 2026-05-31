import type { Metadata } from 'next'
import Link from 'next/link'
import { DownloadClient } from './download-client'

export const metadata: Metadata = {
  title: 'Download Revvie',
  description:
    "Get the Revvie app for Android. Discover clubs, organize rides, and shop the bikers' marketplace.",
  openGraph: {
    title: 'Download Revvie',
    description:
      "Get the Revvie app for Android. Discover clubs, organize rides, and shop the bikers' marketplace.",
    type: 'website',
    url: 'https://revvie.xride-labs.in/download',
  },
}

/**
 * Drop signed APKs into web/public/downloads/ and update the constants below.
 * The latest APK is what the "Download for Android" button serves.
 *
 *   - Place the latest signed APK at: web/public/downloads/revvie-latest.apk
 *   - When ready to publish on Play Store / App Store, set the URLs below.
 */
const APK_HREF = '/downloads/revvie-latest.apk'
const PLAY_STORE_URL: string | null = null
const APP_STORE_URL: string | null = null

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-canvas text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-xs text-white/40 hover:text-white/70 transition-colors uppercase tracking-[0.2em]"
        >
          ← Back to home
        </Link>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-12">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-teal font-semibold">
            Get Revvie
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight">
            Download for Android
          </h1>
          <p className="mt-4 text-white/70 text-base leading-relaxed max-w-xl">
            Revvie is in beta. Install the latest signed APK below — Play Store and App
            Store releases are on the way.
          </p>

          <DownloadClient apkHref={APK_HREF} />

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <StoreCard
              label="Google Play"
              caption={PLAY_STORE_URL ? 'Open on Play Store' : 'Coming soon'}
              href={PLAY_STORE_URL}
            />
            <StoreCard
              label="App Store"
              caption={APP_STORE_URL ? 'Open on App Store' : 'Coming soon'}
              href={APP_STORE_URL}
            />
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/60 leading-relaxed">
            <p className="font-semibold text-white/80">Installing the APK</p>
            <ol className="mt-3 list-decimal list-inside space-y-1.5">
              <li>Tap the download button above on your Android device.</li>
              <li>
                When prompted, allow Chrome (or your browser) to install unknown apps in{' '}
                <span className="text-white/80">Settings → Apps</span>.
              </li>
              <li>Open the downloaded APK and tap Install.</li>
              <li>Launch Revvie and sign in.</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  )
}

function StoreCard({
  label,
  caption,
  href,
}: {
  label: string
  caption: string
  href: string | null
}) {
  const className =
    'flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors'

  if (!href) {
    return (
      <div className={`${className} opacity-60`}>
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider">{label}</p>
          <p className="font-semibold">{caption}</p>
        </div>
      </div>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} hover:bg-white/[0.08]`}
    >
      <div>
        <p className="text-xs text-white/50 uppercase tracking-wider">{label}</p>
        <p className="font-semibold">{caption}</p>
      </div>
      <span aria-hidden className="text-white/40">
        →
      </span>
    </a>
  )
}
