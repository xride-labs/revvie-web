import Link from 'next/link'
import { Compass } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full border border-border bg-surface">
        <Compass className="size-6 text-brand-yellow" aria-hidden />
      </div>

      <div className="max-w-md space-y-2">
        <p className="font-mono text-sm tracking-widest text-muted-foreground">404</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          This road doesn&apos;t go anywhere
        </h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for was moved, deleted, or never existed.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/home">Go to your feed</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to Revvie</Link>
        </Button>
      </div>
    </div>
  )
}
