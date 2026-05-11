/**
 * Financial Freedom Module Types
 *
 * FI = Financial Independence
 * Uses the 4% Rule: FI Number = Annual Expenses × 25
 */

/**
 * Input state persisted in the database (profiles table)
 */
export interface FIProfile {
  id: string
  householdId: string
  fiAnnualExpenses: number | null
  fiSavingsRate: number | null // Decimal (e.g., 0.50 = 50%)
  fiCurrentAge: number | null
  fiCurrentNetWorth: number | null
  fiExpectedReturn: number | null // Decimal (e.g., 0.07 = 7%)
}

/**
 * Year-by-year projection data point
 */
export interface FIYearProjection {
  year: number // Calendar year
  age: number
  netWorth: number
}

/**
 * Derived state computed in real-time (never persisted)
 */
export interface FIProjection {
  fiNumber: number // Annual Expenses × 25
  yearsToFI: number | null // null when unreachable (0% savings rate)
  projectedFIAge: number | null
  progressPercentage: number // 0-100, capped at 100
  isAlreadyFI: boolean
  trajectory: FIYearProjection[]
}

/**
 * Combined view consumed by the UI
 */
export interface FIDashboardData {
  profile: FIProfile
  projection: FIProjection
}

/**
 * Input for updating FI profile
 */
export interface FIProfileInput {
  fiAnnualExpenses?: number | null
  fiSavingsRate?: number | null
  fiCurrentAge?: number | null
  fiCurrentNetWorth?: number | null
  fiExpectedReturn?: number | null
}

/**
 * Database row format (snake_case)
 */
export interface FIProfileRow {
  id: string
  household_id: string
  fi_annual_expenses: string | null // NUMERIC returned as string
  fi_savings_rate: string | null
  fi_current_age: number | null
  fi_current_net_worth: string | null
  fi_expected_return: string | null
}
