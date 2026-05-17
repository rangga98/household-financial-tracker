import type { NetWorthItem, NetWorthSnapshot, NetWorthSummary } from '@/types/net-worth'

/**
 * Calculate net worth summary from a list of active items.
 * @param items Active net worth items (is_active = true)
 * @returns Aggregated summary with all totals
 */
export function calculateNetWorthSummary(items: NetWorthItem[]): NetWorthSummary {
  const totalCurrentAssets = items
    .filter((i) => i.type === 'CURRENT_ASSET')
    .reduce((sum, i) => sum + i.amount, 0)

  const totalNonCurrentAssets = items
    .filter((i) => i.type === 'NON_CURRENT_ASSET')
    .reduce((sum, i) => sum + i.amount, 0)

  const totalAssets = totalCurrentAssets + totalNonCurrentAssets

  const totalLiabilities = items
    .filter((i) => i.type === 'LIABILITY')
    .reduce((sum, i) => sum + i.amount, 0)

  const netWorth = totalAssets - totalLiabilities

  return {
    totalCurrentAssets,
    totalNonCurrentAssets,
    totalAssets,
    totalLiabilities,
    netWorth,
    isPositive: netWorth >= 0,
  }
}

/**
 * Create a snapshot payload from a list of active items for the given date.
 * @param items Active net worth items
 * @param date Snapshot date in 'YYYY-MM-DD' format (defaults to today)
 * @returns Snapshot-ready object (without id, householdId, createdAt)
 */
export function createSnapshotFromItems(
  items: NetWorthItem[],
  date?: string
): Omit<NetWorthSnapshot, 'id' | 'householdId' | 'createdAt'> {
  const summary = calculateNetWorthSummary(items)
  const snapshotDate = date ?? new Date().toISOString().split('T')[0]

  return {
    snapshotDate,
    totalCurrentAssets: summary.totalCurrentAssets,
    totalNonCurrentAssets: summary.totalNonCurrentAssets,
    totalAssets: summary.totalAssets,
    totalLiabilities: summary.totalLiabilities,
    netWorth: summary.netWorth,
  }
}

/**
 * Determine the color indicator for a net worth value.
 * @param netWorth The computed net worth value
 * @returns 'green' if >= 0, 'red' if < 0
 */
export function getNetWorthColor(netWorth: number): 'green' | 'red' {
  return netWorth >= 0 ? 'green' : 'red'
}
