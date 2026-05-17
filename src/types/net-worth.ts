export type NetWorthItemType = 'CURRENT_ASSET' | 'NON_CURRENT_ASSET' | 'LIABILITY'

export interface NetWorthItem {
  id: string
  householdId: string
  name: string
  amount: number
  type: NetWorthItemType
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface NetWorthSnapshot {
  id: string
  householdId: string
  snapshotDate: string
  totalCurrentAssets: number
  totalNonCurrentAssets: number
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  createdAt: string
}

export interface NetWorthSummary {
  totalCurrentAssets: number
  totalNonCurrentAssets: number
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  isPositive: boolean
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
