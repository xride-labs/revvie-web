export interface TenantResolutionData {
  organizationId: string
  slug: string
  name: string
  type: 'CLUB' | 'BRAND' | 'BUSINESS' | 'PLATFORM'
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' | 'PENDING_REVIEW'
  entityId?: string
}

const cache = new Map<string, { data: TenantResolutionData | null; expiresAt: number }>()

/**
 * Fetches tenant resolution metadata from the backend by slug.
 * Uses an in-memory TTL cache to minimize backend hops on high-traffic subdomains.
 */
export async function fetchTenantBySlug(
  slug: string,
  host?: string,
): Promise<TenantResolutionData | null> {
  const cacheKey = slug.toLowerCase()
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }

  const backendUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000/api'

  const endpoint = new URL(`${backendUrl.replace(/\/+$/, '')}/tenant/resolve`)
  endpoint.searchParams.set('slug', slug)
  if (host) {
    endpoint.searchParams.set('host', host)
  }

  try {
    const res = await fetch(endpoint.toString(), {
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      if (res.status === 404) {
        // Negative cache for 15s to avoid hammering backend for invalid subdomains
        cache.set(cacheKey, { data: null, expiresAt: Date.now() + 15_000 })
        return null
      }
      return null
    }

    const body = (await res.json()) as { data?: TenantResolutionData }
    const data = body.data || null
    if (data) {
      // Cache valid tenant for 60s
      cache.set(cacheKey, { data, expiresAt: Date.now() + 60_000 })
    }
    return data
  } catch (err) {
    console.error(`[fetchTenantBySlug] Failed resolving tenant slug="${slug}":`, err)
    return null
  }
}

/** Clear in-memory cache (for testing) */
export function clearTenantCache() {
  cache.clear()
}
