import type { HostResolution } from './types'

export const RESERVED_SUBDOMAINS = [
  'admin',
  'api',
  'app',
  'assets',
  'auth',
  'billing',
  'cdn',
  'dev',
  'docs',
  'mail',
  'preview',
  'staging',
  'static',
  'status',
  'support',
  'test',
  'www',
] as const

export function isReservedSubdomain(subdomain: string): boolean {
  return (RESERVED_SUBDOMAINS as readonly string[]).includes(
    (subdomain || '').toLowerCase().trim(),
  )
}

export function normalizeHost(rawHost: string): string {
  if (!rawHost) return ''
  let host = rawHost.trim().toLowerCase()
  if (host.includes(':')) {
    host = host.split(':')[0]
  }
  if (host.startsWith('www.')) {
    host = host.slice(4)
  }
  return host
}

export function extractSubdomain(rawHost: string, rootDomain: string): string | null {
  const normHost = normalizeHost(rawHost)
  const normRoot = normalizeHost(rootDomain)

  if (normHost === normRoot || !normHost) {
    return null
  }

  const suffix = `.${normRoot}`
  if (normHost.endsWith(suffix)) {
    const sub = normHost.slice(0, -suffix.length)
    return sub.length > 0 ? sub : null
  }

  return null
}

export function resolveHostname(rawHost: string, rootDomain?: string): HostResolution {
  const root =
    rootDomain ||
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    process.env.ROOT_DOMAIN ||
    'revvie.xride-labs.in'

  const normHost = normalizeHost(rawHost)
  const subdomain = extractSubdomain(normHost, root)

  if (!subdomain) {
    return {
      category: 'CONSUMER',
      subdomain: null,
      normalizedHost: normHost,
    }
  }

  if (subdomain === 'admin') {
    return {
      category: 'PLATFORM',
      subdomain: 'admin',
      normalizedHost: normHost,
    }
  }

  if (isReservedSubdomain(subdomain)) {
    return {
      category: 'RESERVED',
      subdomain,
      normalizedHost: normHost,
    }
  }

  return {
    category: 'TENANT',
    subdomain,
    normalizedHost: normHost,
  }
}
