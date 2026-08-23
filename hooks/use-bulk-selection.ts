'use client'

import { useCallback, useMemo, useState } from 'react'

/**
 * Row-selection state for bulk actions on any list/table.
 *
 * Tracks a Set of selected ids and exposes the helpers a table header (select
 * all) and rows (toggle) need, plus `selectedIds` to hand to a bulk API call.
 * Deliberately UI-agnostic — pair it with <BulkActionBar /> for the floating
 * action bar.
 */
export function useBulkSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const isSelected = useCallback((id: string) => selected.has(id), [selected])

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const set = useCallback((id: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const clear = useCallback(() => setSelected(new Set()), [])

  /** Toggle a whole page of ids: if all are selected, clear them; else add all. */
  const toggleAll = useCallback((ids: string[]) => {
    setSelected((prev) => {
      const allOn = ids.length > 0 && ids.every((id) => prev.has(id))
      const next = new Set(prev)
      if (allOn) ids.forEach((id) => next.delete(id))
      else ids.forEach((id) => next.add(id))
      return next
    })
  }, [])

  const allSelected = useCallback(
    (ids: string[]) => ids.length > 0 && ids.every((id) => selected.has(id)),
    [selected],
  )

  const someSelected = useCallback(
    (ids: string[]) => ids.some((id) => selected.has(id)) && !ids.every((id) => selected.has(id)),
    [selected],
  )

  const selectedIds = useMemo(() => Array.from(selected), [selected])

  return {
    selected,
    selectedIds,
    count: selected.size,
    isSelected,
    toggle,
    set,
    clear,
    toggleAll,
    allSelected,
    someSelected,
  }
}
