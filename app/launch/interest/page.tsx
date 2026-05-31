import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'

const DEFAULT_GOOGLE_FORM_EMBED_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfyvoEvxmRfF9_S6Yd-8CYgXPKlVlFxq4dptlXorZU-lhxIGg/viewform?embedded=true'

function getGoogleFormUrls() {
  const embedUrl =
    process.env.NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL || DEFAULT_GOOGLE_FORM_EMBED_URL

  try {
    const parsed = new URL(embedUrl)
    parsed.searchParams.delete('embedded')
    return { embedUrl, openUrl: parsed.toString() }
  } catch {
    return { embedUrl, openUrl: embedUrl }
  }
}

export default function LaunchInterestPage() {
  const { embedUrl, openUrl } = getGoogleFormUrls()

  return (
    <main className="min-h-screen bg-[#090c11] px-4 py-8 text-white md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/launch"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Launch
          </Link>

          <a
            href={openUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          >
            Open Directly
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <section className="rounded-3xl border border-white/12 bg-[#11161f]/90 p-4 shadow-[0_35px_80px_rgba(0,0,0,0.45)] md:p-6">
          <h1 className="text-2xl font-semibold md:text-3xl">Launch Interest Form</h1>
          <p className="mt-2 text-sm text-white/70 md:text-base">
            Fill out the official form below. Your response goes straight into the launch intake queue.
          </p>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/12 bg-black/35">
            <iframe
              title="Revvie launch interest form"
              src={embedUrl}
              className="h-[80vh] min-h-[760px] w-full border-0"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            >
              Loading Google Form...
            </iframe>
          </div>
        </section>
      </div>
    </main>
  )
}
