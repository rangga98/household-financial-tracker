import type { UUID } from 'crypto'

export interface GivingSettings {
  id: string
  householdId: string
  userId: string
  nama?: string
  namaLengkap?: string
  email?: string
  zakatAutoRate?: number
  compassionFixedAmount?: number
  donationAutoRate?: number
}

export interface GivingGoal {
  id: string
  householdId: string
  goalType: 'giving_zakat' | 'giving_compassion' | 'giving_donation'
  name: string
  targetAmount: number
  currentAmount: number
  isLocked: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ZakatMaalInput {
  nisabEligibleAssets: number
  nisabThreshold: number
}

export interface ZakatFitrahInput {
  familyMembers: number
  stapleFoodPricePerSha: number
  shaWeightKg?: number
}

export interface ZakatMaalResult {
  isDue: boolean
  amount: number
  nisabEligibleAssets: number
  nisabThreshold: number
  excessAssets: number
}

export interface ZakatFitrahResult {
  amount: number
  familyMembers: number
  shaWeightKg: number
  totalKg: number
}

export interface GivingTransaction {
  id: string
  householdId: string
  userId: string
  categoryId: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  description: string
  transactionDate: Date
  goalId: string
  createdAt: Date
}

export interface GivingCategorySummary {
  category: 'Zakat' | 'Compassion Fund' | 'Donation'
  totalEarmarked: number
  totalDisbursed: number
  currentBalance: number
}

export interface GivingSummary {
  period: {
    startDate: Date
    endDate: Date
  }
  categories: GivingCategorySummary[]
  totals: {
    totalEarmarked: number
    totalDisbursed: number
    netBalance: number
  }
}

export type GivingGoalType = 'giving_zakat' | 'giving_compassion' | 'giving_donation'

export const GIVING_GOAL_TYPES: Record<GivingGoalType, string> = {
  giving_zakat: 'Zakat',
  giving_compassion: 'Compassion Fund',
  giving_donation: 'Donation',
}

export const DEFAULT_SHA_WEIGHT_KG = 2.5
export const ZAKAT_MAAL_RATE = 0.025
