import { describe, it, expect } from 'vitest'
import { calculateZakatFitrah } from './zakat-fitrah'

describe('calculateZakatFitrah', () => {
  describe('basic calculation', () => {
    it('should calculate Zakat Fitrah for 1 person', () => {
      const result = calculateZakatFitrah({
        familyMembers: 1,
        stapleFoodPricePerSha: 50000,
      })

      expect(result.amount).toBe(125000)
      expect(result.totalKg).toBe(2.5)
    })

    it('should calculate Zakat Fitrah for multiple family members', () => {
      const result = calculateZakatFitrah({
        familyMembers: 4,
        stapleFoodPricePerSha: 50000,
      })

      expect(result.amount).toBe(500000)
      expect(result.totalKg).toBe(10)
    })
  })

  describe('custom sha weight', () => {
    it('should use custom sha weight when provided', () => {
      const result = calculateZakatFitrah({
        familyMembers: 2,
        stapleFoodPricePerSha: 50000,
        shaWeightKg: 3.0,
      })

      expect(result.amount).toBe(300000)
      expect(result.shaWeightKg).toBe(3.0)
      expect(result.totalKg).toBe(6)
    })
  })

  describe('edge cases', () => {
    it('should handle zero family members', () => {
      const result = calculateZakatFitrah({
        familyMembers: 0,
        stapleFoodPricePerSha: 50000,
      })

      expect(result.amount).toBe(0)
      expect(result.totalKg).toBe(0)
    })

    it('should handle zero price', () => {
      const result = calculateZakatFitrah({
        familyMembers: 4,
        stapleFoodPricePerSha: 0,
      })

      expect(result.amount).toBe(0)
    })

    it('should default to 2.5kg sha weight', () => {
      const result = calculateZakatFitrah({
        familyMembers: 2,
        stapleFoodPricePerSha: 50000,
      })

      expect(result.shaWeightKg).toBe(2.5)
    })

    it('should round to 2 decimal places', () => {
      const result = calculateZakatFitrah({
        familyMembers: 3,
        stapleFoodPricePerSha: 33333.33,
      })

      expect(result.amount).toBe(249999.98)
    })
  })
})
