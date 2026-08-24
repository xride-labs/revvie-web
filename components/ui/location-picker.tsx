'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LocationValue {
  name: string
  lat: number
  lng: number
}

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

interface LocationPickerProps {
  label?: string
  placeholder?: string
  value: LocationValue | null
  onChange: (value: LocationValue | null) => void
  pinColor?: 'green' | 'red' | 'amber' | 'blue'
  className?: string
  required?: boolean
}

export function LocationPicker({
  label,
  placeholder = 'Search for a location…',
  value,
  onChange,
  pinColor = 'blue',
  className,
  required,
}: LocationPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      setShowResults(false)
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          { headers: { 'Accept-Language': 'en' } },
        )
        const data: NominatimResult[] = await res.json()
        setResults(data)
        setShowResults(true)
      } catch {
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 420)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const pinColorClass: Record<string, string> = {
    green: 'text-green-500',
    red: 'text-red-500',
    amber: 'text-amber-500',
    blue: 'text-blue-500',
  }

  const handleSelect = (result: NominatimResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const parts = result.display_name.split(', ')
    const name = parts.slice(0, 3).join(', ')
    onChange({ name, lat, lng })
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  const handleClear = () => {
    onChange(null)
    setQuery('')
  }

  const bbox = value
    ? `${value.lng - 0.018},${value.lat - 0.018},${value.lng + 0.018},${value.lat + 0.018}`
    : null

  return (
    <div className={cn('space-y-2', className)} ref={containerRef}>
      {label && <Label className="text-base font-semibold">{label}</Label>}

      {value ? (
        <div className="rounded-xl border bg-muted/30 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5">
            <MapPin className={cn('w-4 h-4 shrink-0', pinColorClass[pinColor])} />
            <span className="flex-1 text-sm font-medium leading-snug">{value.name}</span>
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear location"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {bbox && (
            <iframe
              title={`Map: ${value.name}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${value.lat},${value.lng}`}
              className="w-full h-40 border-t"
              style={{ border: 0 }}
              loading="lazy"
            />
          )}
          <div className="px-3 py-1.5 border-t bg-muted/10">
            <p className="text-xs text-muted-foreground font-mono">
              {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            )}
            <Input
              className="pl-9 h-12"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required={required && !value}
              autoComplete="off"
            />
          </div>

          {showResults && results.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background border rounded-xl shadow-lg overflow-hidden">
              {results.map((r) => {
                const parts = r.display_name.split(', ')
                const primary = parts[0]
                const secondary = parts.slice(1, 4).join(', ')
                return (
                  <button
                    key={r.place_id}
                    type="button"
                    className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left border-b last:border-b-0"
                    onClick={() => handleSelect(r)}
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{primary}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {secondary}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {showResults && results.length === 0 && !isSearching && query.length >= 3 && (
            <div className="absolute z-50 w-full mt-1 bg-background border rounded-xl shadow-lg px-3 py-3">
              <p className="text-sm text-muted-foreground text-center">
                No places found for &quot;{query}&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
