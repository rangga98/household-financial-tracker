import { describe, it, expect } from 'vitest'
import { calculateZakatMaal } from './zakat-maal'

describe('calculateZakatMaal', () => {
  describe('above nisab', () => {
    it('should calculate 2.5% of excess assets above nisab', () => {
      const result = calculateZakatMaal({
        nisabEligibleAssets: 100000000,
        nisabThreshold: 85000000,
      })

      expect(result.isDue).toBe(true)
      expect(result.amount).toBe(375000)
      expect(result.excessAssets).toBe(15000000)
    })

    it('should handle exact calculation with decimals', () => {
      const result = calculateZakatMaal({
        nisabEligibleAssets: 100000000.5,
        nisabThreshold: 85000000.25,
      })

      expect(result.isDue).toBe(true)
      expect(result.amount).toBeGreaterThan(0)
      expect(result.excessAssets).toBe(15000000.25)
    })
  })

  describe('below nisab', () => {
    it('should return 0 when assets are below nisab', () => {
      const result = calculateZakatMaal({
        nisabEligibleAssets: 50000000,
        nisabThreshold: 85000000,
      })

      expect(result.isDue).toBe(false)
      expect(result.amount).toBe(0)
      expect(result.excessAssets).toBe(0)
    })

    it('should return 0 when assets equal nisab threshold', () => {
      const result = calculateZakatMaal({
        nisabEligibleAssets: 85000000,
        nisabThreshold: 85000000,
      })

      expect(result.isDue).toBe(false)
      expect(result.amount).toBe(0)
      expect(result.excessAssets).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle zero assets', () => {
      const result = calculateZakatMaal({
        nisabEligibleAssets: 0,
        nisabThreshold: 85000000,
      })

      expect(result.isDue).toBe(false)
      expect(result.amount).toBe(0)
    })

    it('should handle negative assets', () => {
      const result = calculateZakatMaal({
        nisabEligibleAssets: -10000000,
        nisabThreshold: 85000000,
      })

      expect(result.isDue).toBe(false)
      expect(result.amount).toBe(0)
    })

    it('should handle zero nisab threshold', () => {
      const result = calculateZakatMaal({
        nisabEligibleAssets: 100000000,
        nisabThreshold: 0,
      })

      expect(result.isDue).toBe(true)
      expect(result.amount).toBe(2500000)
      expect(result.excessAssets).toBe(100000000)
    })

    it('should round to 2 decimal places', () => {
      const result = calculateZakatMaal({
        nisabEligibleAssets: 100000001,
        nisabThreshold: 85000000,
      })

      expect(result.amount).toBe(375000.03)
    })
  })
})
