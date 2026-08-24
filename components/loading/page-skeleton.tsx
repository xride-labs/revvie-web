import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Route-level fallback used by `loading.tsx`.
 *
 * Deliberately structural rather than a spinner: it holds the same shape the real page
 * settles into, so the layout doesn't jump when content arrives.
 */
export function PageSkeleton({
  rows = 4,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div
      className={cn('space-y-6 px-4 py-8 sm:px-6 lg:px-8', className)}
      role="status"
      aria-label="Loading"
    >
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-border bg-surface p-5"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  )
}
