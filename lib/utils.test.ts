import { describe, it, expect } from 'vitest'
import { cn, optimizeImageUrl } from './utils'

describe('web lib utils', () => {
  describe('cn', () => {
    it('should merge tailwind class names correctly', () => {
      const result = cn('px-2 py-1', 'bg-red-500', 'px-4')
      expect(result).toContain('py-1')
      expect(result).toContain('bg-red-500')
      expect(result).toContain('px-4')
      expect(result).not.toContain('px-2')
    })
  })

  describe('optimizeImageUrl', () => {
    it('should return unsplash placeholder when image URL is null or empty', () => {
      const result = optimizeImageUrl(null, 400)
      expect(result).toContain('images.unsplash.com')
      expect(result).toContain('w=400')
    })

    it('should return base64 data URLs unmodified', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE'
      expect(optimizeImageUrl(dataUrl)).toBe(dataUrl)
    })

    it('should add transformation options for Cloudinary URLs', () => {
      const cloudUrl = 'https://res.cloudinary.com/demo/image/upload/v12345/sample.jpg'
      const optimized = optimizeImageUrl(cloudUrl, 600)
      expect(optimized).toContain('/upload/w_600,c_fill,f_auto,q_auto:good/')
    })
  })
})
