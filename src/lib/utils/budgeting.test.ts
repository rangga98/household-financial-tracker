import { describe, it, expect } from 'vitest'
import {
  calculateDailySpendingPower,
  isOverbudget,
  getProgressColor,
  getPercentageUsed,
} from '@/lib/utils/budgeting'

describe('calculateDailySpendingPower', () => {
  it('calculates DSP for first day of month with no spending', () => {
    const result = calculateDailySpendingPower(
      3_000_000,
      0,
      new Date('2024-01-01')
    )
    expect(result).toBe(3_000_000 / 31)
  })

  it('calculates DSP mid-month with partial spending', () => {
    const result = calculateDailySpendingPower(
      3_000_000,
      500_000,
      new Date('2024-01-10')
    )
    expect(result).toBe(2_500_000 / 22)
  })

  it('clamps to 0 when budget is exceeded', () => {
    const result = calculateDailySpendingPower(
      3_000_000,
      3_500_000,
      new Date('2024-01-15')
    )
    expect(result).toBe(0)
  })

  it('clamps to 0 when budget is exactly exhausted', () => {
    const result = calculateDailySpendingPower(
      3_000_000,
      3_000_000,
      new Date('2024-01-15')
    )
    expect(result).toBe(0)
  })

  it('shows exact remaining budget on last day of month', () => {
    const result = calculateDailySpendingPower(
      3_000_000,
      2_000_000,
      new Date('2024-01-31')
    )
    expect(result).toBe(1_000_000)
  })

  it('handles leap year February correctly', () => {
    const result = calculateDailySpendingPower(
      2_800_000,
      0,
      new Date('2024-02-01')
    )
    expect(result).toBe(2_800_000 / 29)
  })

  it('handles non-leap year February correctly', () => {
    const result = calculateDailySpendingPower(
      2_800_000,
      0,
      new Date('2023-02-01')
    )
    expect(result).toBe(2_800_000 / 28)
  })
})

describe('isOverbudget', () => {
  it('returns true when spending exceeds 80% of limit', () => {
    expect(isOverbudget(1_700_000, 2_000_000)).toBe(true)
  })

  it('returns false when spending is exactly 80% of limit', () => {
    expect(isOverbudget(1_600_000, 2_000_000)).toBe(false)
  })

  it('returns false when spending is below 80% of limit', () => {
    expect(isOverbudget(1_500_000, 2_000_000)).toBe(false)
  })

  it('returns false when limit is null', () => {
    expect(isOverbudget(1_000_000, null)).toBe(false)
  })

  it('returns false when limit is zero', () => {
    expect(isOverbudget(1_000_000, 0)).toBe(false)
  })
})

describe('getProgressColor', () => {
  it('returns green when under 80%', () => {
    expect(getProgressColor(1_500_000, 2_000_000)).toBe('green')
  })

  it('returns yellow when between 80% and 100%', () => {
    expect(getProgressColor(1_700_000, 2_000_000)).toBe('yellow')
  })

  it('returns red when at or over 100%', () => {
    expect(getProgressColor(2_000_000, 2_000_000)).toBe('red')
    expect(getProgressColor(2_100_000, 2_000_000)).toBe('red')
  })

  it('returns gray when limit is null', () => {
    expect(getProgressColor(1_000_000, null)).toBe('gray')
  })
})

describe('getPercentageUsed', () => {
  it('calculates correct percentage', () => {
    expect(getPercentageUsed(1_500_000, 2_000_000)).toBe(75)
  })

  it('caps at 100%', () => {
    expect(getPercentageUsed(2_500_000, 2_000_000)).toBe(100)
  })

  it('returns 0 when limit is null', () => {
    expect(getPercentageUsed(1_000_000, null)).toBe(0)
  })
})
