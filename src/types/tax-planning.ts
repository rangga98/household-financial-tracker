export type TaxObligationType = 'vehicle_registration' | 'property_tax' | 'custom'
export type FilingStatus = 'pending' | 'filed'
export type TaxFilingType = 'income_tax' | 'custom'

// ─── Tax Obligation (backed by financial_goals, goal_type = 'tax_obligation') ───

export interface TaxObligation {
  id: string
  householdId: string
  name: string
  taxType: TaxObligationType
  targetAmount: number
  currentAmount: number
  targetDate: string             // ISO date 'YYYY-MM-DD'
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ─── Tax Filing Deadline ────────────────────────────────────────────────────────

export interface TaxFilingDeadline {
  id: string
  householdId: string
  taxType: TaxFilingType
  fiscalYear: number
  filingDeadline: string         // ISO date 'YYYY-MM-DD'
  status: FilingStatus
  filedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ─── Tax Deduction (backed by transactions, is_tax_deductible = true) ──────────

export interface TaxDeductionRecord {
  id: string                     // transactions.id
  amount: number
  transactionDate: string        // ISO date 'YYYY-MM-DD'
  description: string | null
  categoryId: string
  categoryName: string           // joined from categories.name
  fiscalYear: number
}

// ─── Action Input Types ─────────────────────────────────────────────────────────

export interface CreateTaxObligationInput {
  householdId: string
  name: string
  taxType: TaxObligationType
  targetAmount: number
  targetDate: string
  notes: string | null
}

export interface UpdateTaxObligationInput {
  name: string
  taxType: TaxObligationType
  targetAmount: number
  targetDate: string
  notes: string | null
}

export interface CreateFilingDeadlineInput {
  householdId: string
  taxType: TaxFilingType
  fiscalYear: number
  filingDeadline: string
  notes: string | null
}

export interface FlagDeductionInput {
  transactionId: string
  fiscalYear: number
}

// ─── Derived State (Never Persisted) ──────────────────────────────────────────

export interface TaxInstallment {
  month: string                  // 'YYYY-MM'
  amount: number
  cumulativeAmount: number
}

export interface TaxObligationWithSchedule {
  obligation: TaxObligation
  remainingAmount: number        // targetAmount - currentAmount
  remainingMonths: number
  monthlyInstallment: number     // base = floor(remainingAmount / remainingMonths)
  installmentSchedule: TaxInstallment[]
  isOverdue: boolean             // targetDate < today
}

export interface TaxFilingDeadlineWithCountdown extends TaxFilingDeadline {
  daysUntilDeadline: number      // positive = future, 0 = today, negative = past
  isUrgent: boolean              // daysUntilDeadline <= 30 AND status = 'pending'
}

export interface TaxDashboardData {
  obligations: TaxObligationWithSchedule[]
  filingDeadlines: TaxFilingDeadlineWithCountdown[]
  currentMonthInstallmentTotal: number
  overdueObligationCount: number
  urgentDeadlineCount: number
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
