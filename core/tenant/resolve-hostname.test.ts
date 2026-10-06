import { describe, it, expect } from 'vitest'
import {
  normalizeHost,
  extractSubdomain,
  resolveHostname,
  isReservedSubdomain,
} from './resolve-hostname'

describe('resolveHostname and helper functions', () => {
  describe('normalizeHost', () => {
    it('normalizes hostnames, stripping port and www and casing', () => {
      expect(normalizeHost('Revvie.App:3000')).toBe('revvie.app')
      expect(normalizeHost('www.revvie.app')).toBe('revvie.app')
      expect(normalizeHost('WWW.KTM-Bangalore.Revvie.xride-labs.in:443')).toBe(
        'ktm-bangalore.revvie.xride-labs.in',
      )
    })
  })

  describe('extractSubdomain', () => {
    it('extracts subdomain relative to configured root domain', () => {
      expect(extractSubdomain('revvie.app', 'revvie.app')).toBeNull()
      expect(extractSubdomain('admin.revvie.app', 'revvie.app')).toBe('admin')
      expect(extractSubdomain('ktm.revvie.app', 'revvie.app')).toBe('ktm')
      expect(
        extractSubdomain('ktm-bangalore.revvie.xride-labs.in', 'revvie.xride-labs.in'),
      ).toBe('ktm-bangalore')
      expect(extractSubdomain('admin.revvie.xride-labs.in', 'revvie.xride-labs.in')).toBe(
        'admin',
      )
      expect(extractSubdomain('localhost:3000', 'localhost:3000')).toBeNull()
      expect(extractSubdomain('ktm.localhost:3000', 'localhost:3000')).toBe('ktm')
    })
  })

  describe('isReservedSubdomain', () => {
    it('identifies system reserved subdomains', () => {
      expect(isReservedSubdomain('admin')).toBe(true)
      expect(isReservedSubdomain('api')).toBe(true)
      expect(isReservedSubdomain('auth')).toBe(true)
      expect(isReservedSubdomain('www')).toBe(true)
      expect(isReservedSubdomain('ktm')).toBe(false)
      expect(isReservedSubdomain('ktm-bangalore')).toBe(false)
    })
  })

  describe('resolveHostname', () => {
    it('resolves consumer when host is root domain', () => {
      const res = resolveHostname('revvie.app', 'revvie.app')
      expect(res.category).toBe('CONSUMER')
      expect(res.subdomain).toBeNull()
    })

    it('resolves platform when host is admin subdomain', () => {
      const res = resolveHostname('admin.revvie.app', 'revvie.app')
      expect(res.category).toBe('PLATFORM')
      expect(res.subdomain).toBe('admin')
    })

    it('resolves reserved when host is reserved subdomain like api or auth', () => {
      const res = resolveHostname('api.revvie.app', 'revvie.app')
      expect(res.category).toBe('RESERVED')
      expect(res.subdomain).toBe('api')
    })

    it('resolves tenant when host is an organization subdomain', () => {
      const res = resolveHostname('ktm-bangalore.revvie.app', 'revvie.app')
      expect(res.category).toBe('TENANT')
      expect(res.subdomain).toBe('ktm-bangalore')
    })
  })
})
