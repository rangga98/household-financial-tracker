export type ProgressColor = 'green' | 'yellow' | 'red' | 'gray'

export function calculateDailySpendingPower(
  monthlyLimit: number,
  totalSpent: number,
  currentDate: Date
): number {
  const remainingBudget = monthlyLimit - totalSpent
  if (remainingBudget <= 0) return 0

  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  )
  const remainingDays = lastDayOfMonth.getDate() - currentDate.getDate() + 1

  return Math.max(0, remainingBudget / remainingDays)
}

export function isOverbudget(
  totalSpent: number,
  monthlyLimit: number | null
): boolean {
  if (!monthlyLimit || monthlyLimit <= 0) return false
  return totalSpent / monthlyLimit > 0.8
}

export function getProgressColor(
  spent: number,
  limit: number | null
): ProgressColor {
  if (!limit || limit <= 0) return 'gray'
  const pct = spent / limit
  if (pct >= 1.0) return 'red'
  if (pct >= 0.8) return 'yellow'
  return 'green'
}

export function getPercentageUsed(
  spent: number,
  limit: number | null
): number {
  if (!limit || limit <= 0) return 0
  return Math.min((spent / limit) * 100, 100)
}
