import { describe, it, expect } from 'vitest'
import { calculateNetWorthSummary, createSnapshotFromItems, getNetWorthColor } from './net-worth'
import type { NetWorthItem } from '@/types/net-worth'

const makeItem = (overrides: Partial<NetWorthItem>): NetWorthItem => ({
  id: 'test-id',
  householdId: 'hh-1',
  name: 'Test Item',
  amount: 0,
  type: 'CURRENT_ASSET',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
})

describe('calculateNetWorthSummary', () => {
  it('returns all zeros when items array is empty', () => {
    const result = calculateNetWorthSummary([])
    expect(result).toEqual({
      totalCurrentAssets: 0,
      totalNonCurrentAssets: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      netWorth: 0,
      isPositive: true,
    })
  })

  it('sums CURRENT_ASSET items correctly', () => {
    const items = [
      makeItem({ type: 'CURRENT_ASSET', amount: 50_000_000 }),
      makeItem({ type: 'CURRENT_ASSET', amount: 10_000_000 }),
    ]
    const result = calculateNetWorthSummary(items)
    expect(result.totalCurrentAssets).toBe(60_000_000)
    expect(result.totalNonCurrentAssets).toBe(0)
    expect(result.totalAssets).toBe(60_000_000)
    expect(result.totalLiabilities).toBe(0)
    expect(result.netWorth).toBe(60_000_000)
    expect(result.isPositive).toBe(true)
  })

  it('sums NON_CURRENT_ASSET items correctly', () => {
    const items = [makeItem({ type: 'NON_CURRENT_ASSET', amount: 500_000_000 })]
    const result = calculateNetWorthSummary(items)
    expect(result.totalCurrentAssets).toBe(0)
    expect(result.totalNonCurrentAssets).toBe(500_000_000)
    expect(result.totalAssets).toBe(500_000_000)
  })

  it('sums LIABILITY items correctly', () => {
    const items = [makeItem({ type: 'LIABILITY', amount: 200_000_000 })]
    const result = calculateNetWorthSummary(items)
    expect(result.totalLiabilities).toBe(200_000_000)
    expect(result.totalAssets).toBe(0)
    expect(result.netWorth).toBe(-200_000_000)
    expect(result.isPositive).toBe(false)
  })

  it('calculates net worth = total assets - total liabilities', () => {
    const items = [
      makeItem({ type: 'CURRENT_ASSET', amount: 50_000_000 }),
      makeItem({ type: 'NON_CURRENT_ASSET', amount: 500_000_000 }),
      makeItem({ type: 'LIABILITY', amount: 200_000_000 }),
    ]
    const result = calculateNetWorthSummary(items)
    expect(result.totalCurrentAssets).toBe(50_000_000)
    expect(result.totalNonCurrentAssets).toBe(500_000_000)
    expect(result.totalAssets).toBe(550_000_000)
    expect(result.totalLiabilities).toBe(200_000_000)
    expect(result.netWorth).toBe(350_000_000)
    expect(result.isPositive).toBe(true)
  })

  it('marks isPositive = true when net worth equals zero', () => {
    const items = [
      makeItem({ type: 'CURRENT_ASSET', amount: 100_000 }),
      makeItem({ type: 'LIABILITY', amount: 100_000 }),
    ]
    const result = calculateNetWorthSummary(items)
    expect(result.netWorth).toBe(0)
    expect(result.isPositive).toBe(true)
  })

  it('marks isPositive = false when liabilities exceed assets', () => {
    const items = [
      makeItem({ type: 'CURRENT_ASSET', amount: 10_000_000 }),
      makeItem({ type: 'LIABILITY', amount: 30_000_000 }),
    ]
    const result = calculateNetWorthSummary(items)
    expect(result.netWorth).toBe(-20_000_000)
    expect(result.isPositive).toBe(false)
  })

  it('handles mixed asset types + liabilities correctly', () => {
    const items = [
      makeItem({ type: 'CURRENT_ASSET', amount: 100_000_000 }),
      makeItem({ type: 'NON_CURRENT_ASSET', amount: 300_000_000 }),
      makeItem({ type: 'LIABILITY', amount: 20_000_000 }),
      makeItem({ type: 'LIABILITY', amount: 10_000_000 }),
    ]
    const result = calculateNetWorthSummary(items)
    expect(result.totalCurrentAssets).toBe(100_000_000)
    expect(result.totalNonCurrentAssets).toBe(300_000_000)
    expect(result.totalAssets).toBe(400_000_000)
    expect(result.totalLiabilities).toBe(30_000_000)
    expect(result.netWorth).toBe(370_000_000)
  })
})

describe('createSnapshotFromItems', () => {
  it('returns correct snapshot shape for empty items', () => {
    const result = createSnapshotFromItems([])
    expect(result.totalCurrentAssets).toBe(0)
    expect(result.totalNonCurrentAssets).toBe(0)
    expect(result.totalAssets).toBe(0)
    expect(result.totalLiabilities).toBe(0)
    expect(result.netWorth).toBe(0)
  })

  it('uses provided date', () => {
    const result = createSnapshotFromItems([], '2026-03-15')
    expect(result.snapshotDate).toBe('2026-03-15')
  })

  it('defaults snapshotDate to today when not provided', () => {
    const today = new Date().toISOString().split('T')[0]
    const result = createSnapshotFromItems([])
    expect(result.snapshotDate).toBe(today)
  })

  it('computes correct totals from mixed items', () => {
    const items = [
      makeItem({ type: 'CURRENT_ASSET', amount: 50_000_000 }),
      makeItem({ type: 'NON_CURRENT_ASSET', amount: 500_000_000 }),
      makeItem({ type: 'LIABILITY', amount: 200_000_000 }),
    ]
    const result = createSnapshotFromItems(items, '2026-01-01')
    expect(result.totalCurrentAssets).toBe(50_000_000)
    expect(result.totalNonCurrentAssets).toBe(500_000_000)
    expect(result.totalAssets).toBe(550_000_000)
    expect(result.totalLiabilities).toBe(200_000_000)
    expect(result.netWorth).toBe(350_000_000)
    expect(result.snapshotDate).toBe('2026-01-01')
  })
})

describe('getNetWorthColor', () => {
  it('returns green for positive net worth', () => {
    expect(getNetWorthColor(1)).toBe('green')
  })

  it('returns green for zero net worth', () => {
    expect(getNetWorthColor(0)).toBe('green')
  })

  it('returns red for negative net worth', () => {
    expect(getNetWorthColor(-1)).toBe('red')
  })

  it('returns green for large positive value', () => {
    expect(getNetWorthColor(999_999_999)).toBe('green')
  })

  it('returns red for large negative value', () => {
    expect(getNetWorthColor(-999_999_999)).toBe('red')
  })
})
