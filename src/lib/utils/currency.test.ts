import { describe, it, expect } from 'vitest'
import { formatRp, formatCompactRp, parseRp } from '@/lib/utils/currency'

describe('currency utilities', () => {
  describe('formatRp', () => {
    it('formats small amounts', () => {
      expect(formatRp(50000)).toContain('50.000')
    })

    it('formats large amounts', () => {
      expect(formatRp(1500000)).toContain('1.500.000')
    })
  })

  describe('formatCompactRp', () => {
    it('formats thousands', () => {
      expect(formatCompactRp(500000)).toBe('Rp 500 RB')
    })

    it('formats millions (JT)', () => {
      expect(formatCompactRp(2500000)).toBe('Rp 2.5 JT')
    })

    it('formats billions (M)', () => {
      expect(formatCompactRp(1500000000)).toBe('Rp 1.5 M')
    })
  })

  describe('parseRp', () => {
    it('parses plain numbers', () => {
      expect(parseRp('50000')).toBe(50000)
    })

    it('parses formatted strings', () => {
      expect(parseRp('Rp 50.000')).toBe(50000)
    })
  })
})
