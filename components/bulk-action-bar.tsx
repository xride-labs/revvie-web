'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BulkAction {
  key: string
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  onClick: () => void | Promise<void>
}

/**
 * Floating action bar that appears when ≥1 row is selected. Drop it at the
 * bottom of any management screen and feed it the selection count + actions.
 * `busyKey` disables the bar and spins the active action while a bulk call runs.
 */
export function BulkActionBar({
  count,
  actions,
  onClear,
  busyKey = null,
  className,
}: {
  count: number
  actions: BulkAction[]
  onClear: () => void
  busyKey?: string | null
  className?: string
}) {
  if (count === 0) return null
  const busy = busyKey !== null

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4',
        className,
      )}
    >
      <div className="flex items-center gap-3 rounded-2xl border bg-background/95 px-4 py-2.5 shadow-lg backdrop-blur">
        <span className="whitespace-nowrap text-sm font-medium">{count} selected</span>
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          {actions.map((a) => (
            <Button
              key={a.key}
              size="sm"
              variant={a.variant ?? 'default'}
              disabled={busy}
              onClick={a.onClick}
            >
              {busyKey === a.key ? <Loader2 className="h-4 w-4 animate-spin" /> : a.icon}
              <span className={a.icon || busyKey === a.key ? 'ml-1.5' : undefined}>
                {a.label}
              </span>
            </Button>
          ))}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={onClear}
          disabled={busy}
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
