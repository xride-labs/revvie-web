import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Organization Inactive | Revvie',
  description: 'This organization is currently suspended or archived.',
}

export default function TenantSuspendedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
      <div className="mx-auto max-w-md space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-950/40 text-amber-400 ring-1 ring-amber-800/50">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Organization Unavailable
          </h1>
          <p className="text-sm text-neutral-400">
            This organization portal is currently suspended, archived, or undergoing review.
            If you are an administrator, please reach out to Revvie Support.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-800 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Revvie Home
          </Link>
        </div>
      </div>
    </div>
  )
}
