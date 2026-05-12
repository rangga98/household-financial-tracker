import { describe, it, expect } from 'vitest'
import { computeFutureValue, computeProgress, isFundOverdue } from './sinking-funds'

describe('computeFutureValue', () => {
  it('calculates standard case: Rp50M at 5% for 10 years', () => {
    const result = computeFutureValue(50_000_000, 0.05, 10)
    expect(result).toBeCloseTo(81_444_731.34, 0)
  })

  it('returns currentCost when years = 0', () => {
    expect(computeFutureValue(50_000_000, 0.05, 0)).toBe(50_000_000)
  })

  it('handles negative inflation (deflation)', () => {
    const result = computeFutureValue(50_000_000, -0.02, 5)
    expect(result).toBeLessThan(50_000_000)
    expect(result).toBeCloseTo(45_196_039.84, 0)
  })

  it('handles zero inflation', () => {
    expect(computeFutureValue(50_000_000, 0, 10)).toBe(50_000_000)
  })

  it('rounds result to 2 decimal places', () => {
    const result = computeFutureValue(100_000, 0.07, 1)
    expect(result).toBe(107_000)
  })
})

describe('computeProgress', () => {
  it('returns 0 when currentAmount is 0', () => {
    expect(computeProgress(0, 100_000)).toBe(0)
  })

  it('returns 50 when halfway funded', () => {
    expect(computeProgress(50_000, 100_000)).toBe(50)
  })

  it('returns 100 when exactly fully funded', () => {
    expect(computeProgress(100_000, 100_000)).toBe(100)
  })

  it('returns > 100 when over-funded (not capped)', () => {
    expect(computeProgress(150_000, 100_000)).toBe(150)
  })

  it('returns 100 when targetAmount is 0 (edge guard)', () => {
    expect(computeProgress(0, 0)).toBe(100)
  })

  it('returns correct percentage for partial funding', () => {
    expect(computeProgress(10_000_000, 50_000_000)).toBe(20)
  })
})

describe('isFundOverdue', () => {
  it('returns false when targetDate is null', () => {
    expect(isFundOverdue(null, false)).toBe(false)
  })

  it('returns false when fund is already complete', () => {
    expect(isFundOverdue('2020-01-01', true)).toBe(false)
  })

  it('returns true when targetDate is in the past and not complete', () => {
    expect(isFundOverdue('2020-01-01', false)).toBe(true)
  })

  it('returns false when targetDate is in the future and not complete', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const iso = futureDate.toISOString().split('T')[0]
    expect(isFundOverdue(iso, false)).toBe(false)
  })

  it('returns false when targetDate is today and not complete', () => {
    const today = new Date().toISOString().split('T')[0]
    expect(isFundOverdue(today, false)).toBe(false)
  })
})
