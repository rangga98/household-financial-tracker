import type { ProgressColor } from '@/lib/utils/budgeting'

export type InsuranceType = 'life' | 'health' | 'property' | 'vehicle' | 'other'

export type PaymentFrequency = 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'one-time'

export type PremiumStatus = 'upcoming' | 'overdue' | 'paid' | 'one-time'

export interface InsurancePolicy {
  id: string
  householdId: string
  name: string
  insuranceType: InsuranceType
  insurer: string
  coverageAmount: number
  premiumAmount: number
  paymentFrequency: PaymentFrequency
  startDate: string
  nextDueDate: string | null
  isActive: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface InsurancePremiumRecord {
  id: string
  policyId: string
  amount: number
  transactionDate: string
  notes: string | null
}

export interface ProtectionTarget {
  id: string
  householdId: string
  targetAmount: number
}

export interface CoverageStatus {
  totalCoverage: number
  protectionTarget: number | null
  gap: number
  percentage: number
  isAdequate: boolean
  color: ProgressColor
}

export interface PolicyWithStatus extends InsurancePolicy {
  premiumStatus: PremiumStatus
  daysUntilDue: number | null
}

export interface InsuranceDashboardData {
  policies: PolicyWithStatus[]
  coverageStatus: CoverageStatus
  protectionTarget: ProtectionTarget | null
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
