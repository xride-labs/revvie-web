import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Organization Not Found | Revvie',
  description: 'The requested club or brand organization could not be found.',
}

export default function TenantNotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
      <div className="mx-auto max-w-md space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/40 text-red-400 ring-1 ring-red-800/50">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Organization Not Found
          </h1>
          <p className="text-sm text-neutral-400">
            This subdomain does not exist or may have been renamed or removed.
            Please verify the address or return to the main platform.
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
