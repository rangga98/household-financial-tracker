import type { PaymentFrequency, PremiumStatus, CoverageStatus } from '@/types/risk-management'

/**
 * Advance an ISO date string by the given number of months.
 * Clamps to the last day of the target month to handle month-end edge cases
 * (e.g., Jan 31 + 1 month = Feb 28/29).
 */
function addMonths(dateStr: string, months: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const targetYear = year + Math.floor((month - 1 + months) / 12)
  const targetMonth = ((month - 1 + months) % 12) + 1
  const lastDay = new Date(targetYear, targetMonth, 0).getDate()
  const clampedDay = Math.min(day, lastDay)
  return [
    String(targetYear).padStart(4, '0'),
    String(targetMonth).padStart(2, '0'),
    String(clampedDay).padStart(2, '0'),
  ].join('-')
}

const FREQUENCY_MONTHS: Record<Exclude<PaymentFrequency, 'one-time'>, number> = {
  monthly: 1,
  quarterly: 3,
  'semi-annual': 6,
  annual: 12,
}

/**
 * Calculate the next premium due date from the current due date and frequency.
 * Returns null for one-time frequency.
 * Handles month-end clamping (e.g., Jan 31 + monthly = Feb 28/29).
 *
 * @param currentDueDate  ISO date string 'YYYY-MM-DD'
 * @param frequency       PaymentFrequency
 * @returns               ISO date string or null
 */
export function calculateNextPremiumDueDate(
  currentDueDate: string,
  frequency: PaymentFrequency
): string | null {
  if (frequency === 'one-time') return null
  return addMonths(currentDueDate, FREQUENCY_MONTHS[frequency])
}

/**
 * Calculate coverage gap and adequacy status.
 *
 * Color thresholds:
 *   - 'gray'   → no target set
 *   - 'red'    → coverage < 50% of target
 *   - 'yellow' → coverage 50–99% of target
 *   - 'green'  → coverage >= 100% of target
 *
 * @param totalCoverage     SUM of active policy coverage amounts
 * @param protectionTarget  User-defined target (null = not set)
 * @returns                 CoverageStatus
 */
export function calculateCoverageGap(
  totalCoverage: number,
  protectionTarget: number | null
): CoverageStatus {
  if (protectionTarget === null || protectionTarget <= 0) {
    return {
      totalCoverage,
      protectionTarget: null,
      gap: 0,
      percentage: 0,
      isAdequate: false,
      color: 'gray',
    }
  }

  const raw = (totalCoverage / protectionTarget) * 100
  const percentage = Math.min(raw, 100)
  const isAdequate = totalCoverage >= protectionTarget
  const gap = protectionTarget - totalCoverage

  let color: CoverageStatus['color']
  if (percentage >= 100) color = 'green'
  else if (percentage >= 50) color = 'yellow'
  else color = 'red'

  return {
    totalCoverage,
    protectionTarget,
    gap,
    percentage,
    isAdequate,
    color,
  }
}

/**
 * Derive the premium payment status for a single policy.
 *
 * @param nextDueDate      ISO date string or null (null → one-time)
 * @param lastPaymentDate  ISO date string of the most recent transaction, or null
 * @param today            Date object (injected for testability)
 * @returns                PremiumStatus
 */
export function derivePremiumStatus(
  nextDueDate: string | null,
  lastPaymentDate: string | null,
  today: Date
): PremiumStatus {
  if (nextDueDate === null) return 'one-time'

  if (lastPaymentDate !== null && lastPaymentDate >= nextDueDate) return 'paid'

  const todayStr = today.toISOString().split('T')[0]
  if (nextDueDate < todayStr) return 'overdue'

  return 'upcoming'
}

/**
 * Calculate days until premium is due (positive = future, negative = overdue, 0 = today).
 * Returns null if nextDueDate is null (one-time policy).
 *
 * @param nextDueDate  ISO date string or null
 * @param today        Date object (injected for testability)
 * @returns            number or null
 */
export function getDaysUntilDue(nextDueDate: string | null, today: Date): number | null {
  if (nextDueDate === null) return null
  const todayMs = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const [y, m, d] = nextDueDate.split('-').map(Number)
  const dueMs = Date.UTC(y, m - 1, d)
  return Math.round((dueMs - todayMs) / (1000 * 60 * 60 * 24))
}
