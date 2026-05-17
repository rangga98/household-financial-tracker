import type { TaxObligation, TaxInstallment, TaxObligationWithSchedule, FilingStatus } from '@/types/tax-planning'

/**
 * Compute remaining full months between today and the due date.
 * A "remaining month" is any month that hasn't started yet relative to today's month.
 * Returns minimum 1.
 *
 * @param dueDate  ISO date string 'YYYY-MM-DD'
 * @param today    Reference date (defaults to new Date())
 */
export function computeRemainingMonths(dueDate: string, today: Date = new Date()): number {
  const [dueYear, dueMonth] = dueDate.split('-').map(Number)
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth() + 1

  const months = (dueYear - todayYear) * 12 + (dueMonth - todayMonth)
  return Math.max(1, months)
}

/**
 * Compute monthly installment schedule.
 *
 * - baseInstallment = Math.floor(remainingAmount / remainingMonths)
 * - remainder       = remainingAmount % remainingMonths
 * - installments[0].amount = baseInstallment + remainder  (first month absorbs remainder)
 * - Sum of all installment amounts === remainingAmount exactly.
 *
 * @param remainingAmount  targetAmount - currentAmount (must be ≥ 0)
 * @param dueDate          ISO date string 'YYYY-MM-DD'
 * @param today            Reference date (defaults to new Date())
 */
export function computeTaxInstallments(
  remainingAmount: number,
  dueDate: string,
  today: Date = new Date()
): TaxInstallment[] {
  const remainingMonths = computeRemainingMonths(dueDate, today)
  const base = Math.floor(remainingAmount / remainingMonths)
  const remainder = remainingAmount % remainingMonths

  const startYear = today.getFullYear()
  const startMonth = today.getMonth() + 1

  const installments: TaxInstallment[] = []
  let cumulative = 0

  for (let i = 0; i < remainingMonths; i++) {
    const amount = i === 0 ? base + remainder : base
    cumulative += amount

    const monthNum = ((startMonth - 1 + i) % 12) + 1
    const yearOffset = Math.floor((startMonth - 1 + i) / 12)
    const year = startYear + yearOffset

    installments.push({
      month: `${String(year).padStart(4, '0')}-${String(monthNum).padStart(2, '0')}`,
      amount,
      cumulativeAmount: cumulative,
    })
  }

  return installments
}

/**
 * Determine if a tax obligation is overdue (target_date < today).
 *
 * @param targetDate  ISO date string 'YYYY-MM-DD'
 * @param today       Reference date (defaults to new Date())
 */
export function isTaxObligationOverdue(targetDate: string, today: Date = new Date()): boolean {
  const todayStr = today.toISOString().split('T')[0]
  return targetDate < todayStr
}

/**
 * Compute days until a filing deadline.
 * Positive = future, 0 = today, negative = past (overdue).
 *
 * @param filingDeadline  ISO date string 'YYYY-MM-DD'
 * @param today           Reference date (defaults to new Date())
 */
export function computeDaysUntilDeadline(filingDeadline: string, today: Date = new Date()): number {
  const todayMs = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const [y, m, d] = filingDeadline.split('-').map(Number)
  const deadlineMs = Date.UTC(y, m - 1, d)
  return Math.round((deadlineMs - todayMs) / (1000 * 60 * 60 * 24))
}

/**
 * Determine if a filing deadline is urgent.
 * Urgent = status is 'pending' AND days until deadline ≤ 30.
 *
 * @param filingDeadline  ISO date string 'YYYY-MM-DD'
 * @param status          FilingStatus
 * @param today           Reference date (defaults to new Date())
 */
export function isFilingDeadlineUrgent(
  filingDeadline: string,
  status: FilingStatus,
  today: Date = new Date()
): boolean {
  if (status === 'filed') return false
  return computeDaysUntilDeadline(filingDeadline, today) <= 30
}

/**
 * Build TaxObligationWithSchedule from a TaxObligation and a reference date.
 * All derived state is computed here — nothing is persisted.
 *
 * @param obligation  TaxObligation from financial_goals
 * @param today       Reference date (defaults to new Date())
 */
export function buildObligationWithSchedule(
  obligation: TaxObligation,
  today: Date = new Date()
): TaxObligationWithSchedule {
  const remainingAmount = Math.max(0, obligation.targetAmount - obligation.currentAmount)
  const remainingMonths = computeRemainingMonths(obligation.targetDate, today)
  const monthlyInstallment = Math.floor(remainingAmount / remainingMonths)
  const installmentSchedule = computeTaxInstallments(remainingAmount, obligation.targetDate, today)
  const isOverdue = isTaxObligationOverdue(obligation.targetDate, today)

  return {
    obligation,
    remainingAmount,
    remainingMonths,
    monthlyInstallment,
    installmentSchedule,
    isOverdue,
  }
}
