import { describe, it, expect } from 'vitest'
import {
  calculateNextPremiumDueDate,
  calculateCoverageGap,
  derivePremiumStatus,
  getDaysUntilDue,
} from './insurance'

// ---------------------------------------------------------------------------
// T004: calculateNextPremiumDueDate
// ---------------------------------------------------------------------------
describe('calculateNextPremiumDueDate', () => {
  it('returns null for one-time frequency', () => {
    expect(calculateNextPremiumDueDate('2026-01-15', 'one-time')).toBeNull()
  })

  it('advances by 1 month for monthly', () => {
    expect(calculateNextPremiumDueDate('2026-01-15', 'monthly')).toBe('2026-02-15')
  })

  it('advances by 3 months for quarterly', () => {
    expect(calculateNextPremiumDueDate('2026-01-15', 'quarterly')).toBe('2026-04-15')
  })

  it('advances by 6 months for semi-annual', () => {
    expect(calculateNextPremiumDueDate('2026-01-15', 'semi-annual')).toBe('2026-07-15')
  })

  it('advances by 12 months for annual', () => {
    expect(calculateNextPremiumDueDate('2026-01-15', 'annual')).toBe('2027-01-15')
  })

  it('clamps month-end: Jan 31 + 1 month → Feb 28 (non-leap)', () => {
    expect(calculateNextPremiumDueDate('2026-01-31', 'monthly')).toBe('2026-02-28')
  })

  it('clamps month-end: Jan 31 + 1 month → Feb 29 (leap year)', () => {
    expect(calculateNextPremiumDueDate('2024-01-31', 'monthly')).toBe('2024-02-29')
  })

  it('clamps month-end: Jan 31 + 3 months → Apr 30', () => {
    expect(calculateNextPremiumDueDate('2026-01-31', 'quarterly')).toBe('2026-04-30')
  })

  it('clamps month-end: Aug 31 + 6 months → Feb 28', () => {
    expect(calculateNextPremiumDueDate('2025-08-31', 'semi-annual')).toBe('2026-02-28')
  })

  it('advances by 12 months crossing year boundary', () => {
    expect(calculateNextPremiumDueDate('2026-12-15', 'annual')).toBe('2027-12-15')
  })
})

// ---------------------------------------------------------------------------
// T005: calculateCoverageGap
// ---------------------------------------------------------------------------
describe('calculateCoverageGap', () => {
  it('returns gray with zero percentage when no target is set', () => {
    const result = calculateCoverageGap(1_500_000_000, null)
    expect(result.color).toBe('gray')
    expect(result.percentage).toBe(0)
    expect(result.isAdequate).toBe(false)
    expect(result.gap).toBe(0)
  })

  it('returns green when coverage meets the target exactly', () => {
    const result = calculateCoverageGap(2_000_000_000, 2_000_000_000)
    expect(result.color).toBe('green')
    expect(result.percentage).toBe(100)
    expect(result.isAdequate).toBe(true)
    expect(result.gap).toBe(0)
  })

  it('returns green when coverage exceeds the target', () => {
    const result = calculateCoverageGap(2_500_000_000, 2_000_000_000)
    expect(result.color).toBe('green')
    expect(result.percentage).toBe(100)
    expect(result.isAdequate).toBe(true)
    expect(result.gap).toBeLessThanOrEqual(0)
  })

  it('returns yellow when coverage is 50–99% of target', () => {
    const result = calculateCoverageGap(1_500_000_000, 2_000_000_000)
    expect(result.color).toBe('yellow')
    expect(result.percentage).toBe(75)
    expect(result.isAdequate).toBe(false)
    expect(result.gap).toBe(500_000_000)
  })

  it('returns red when coverage is below 50% of target', () => {
    const result = calculateCoverageGap(500_000_000, 2_000_000_000)
    expect(result.color).toBe('red')
    expect(result.percentage).toBe(25)
    expect(result.isAdequate).toBe(false)
    expect(result.gap).toBe(1_500_000_000)
  })

  it('percentage is capped at 100 even when coverage exceeds target', () => {
    const result = calculateCoverageGap(3_000_000_000, 2_000_000_000)
    expect(result.percentage).toBe(100)
  })

  it('handles zero totalCoverage with a set target', () => {
    const result = calculateCoverageGap(0, 1_000_000_000)
    expect(result.color).toBe('red')
    expect(result.percentage).toBe(0)
    expect(result.gap).toBe(1_000_000_000)
    expect(result.isAdequate).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// T006: derivePremiumStatus + getDaysUntilDue
// ---------------------------------------------------------------------------
describe('derivePremiumStatus', () => {
  const today = new Date('2026-05-17')

  it('returns one-time when nextDueDate is null', () => {
    expect(derivePremiumStatus(null, null, today)).toBe('one-time')
  })

  it('returns overdue when due date is in the past and not paid', () => {
    expect(derivePremiumStatus('2026-05-01', null, today)).toBe('overdue')
  })

  it('returns upcoming when due date is today', () => {
    expect(derivePremiumStatus('2026-05-17', null, today)).toBe('upcoming')
  })

  it('returns upcoming when due date is in the future', () => {
    expect(derivePremiumStatus('2026-06-01', null, today)).toBe('upcoming')
  })

  it('returns paid when lastPaymentDate is on or after nextDueDate', () => {
    expect(derivePremiumStatus('2026-05-01', '2026-05-01', today)).toBe('paid')
  })

  it('returns paid when lastPaymentDate is after nextDueDate', () => {
    expect(derivePremiumStatus('2026-05-01', '2026-05-15', today)).toBe('paid')
  })

  it('returns overdue when lastPaymentDate is before nextDueDate', () => {
    expect(derivePremiumStatus('2026-05-10', '2026-04-10', today)).toBe('overdue')
  })
})

describe('getDaysUntilDue', () => {
  const today = new Date('2026-05-17')

  it('returns null when nextDueDate is null', () => {
    expect(getDaysUntilDue(null, today)).toBeNull()
  })

  it('returns 0 when due today', () => {
    expect(getDaysUntilDue('2026-05-17', today)).toBe(0)
  })

  it('returns positive days when due in the future', () => {
    expect(getDaysUntilDue('2026-05-27', today)).toBe(10)
  })

  it('returns negative days when overdue', () => {
    expect(getDaysUntilDue('2026-05-07', today)).toBe(-10)
  })
})
