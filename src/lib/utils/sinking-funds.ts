/**
 * Education cost inflation projection.
 * FV = currentCost × (1 + inflationRate)^years
 *
 * @param currentCost - Current cost in monetary units (e.g., 50_000_000)
 * @param inflationRate - Annual inflation rate as decimal (e.g., 0.05 for 5%); accepts negative
 * @param years - Number of years until needed (must be >= 0)
 * @returns Future value rounded to 2 decimal places
 */
export function computeFutureValue(
  currentCost: number,
  inflationRate: number,
  years: number
): number {
  const raw = currentCost * Math.pow(1 + inflationRate, years)
  return Math.round(raw * 100) / 100
}

/**
 * Sinking fund progress as a percentage.
 * NOT capped at 100 — allows over-funded state to be expressed.
 *
 * @param currentAmount - Amount saved so far
 * @param targetAmount - Target amount
 * @returns Percentage (0–100+). Returns 100 if targetAmount is 0.
 */
export function computeProgress(currentAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 100
  return (currentAmount / targetAmount) * 100
}

/**
 * Determine if a sinking fund is overdue.
 *
 * @param targetDate - ISO date string 'YYYY-MM-DD' or null
 * @param isComplete - Whether the fund has reached its target
 * @returns true if targetDate is strictly in the past and the fund is not complete
 */
export function isFundOverdue(targetDate: string | null, isComplete: boolean): boolean {
  if (targetDate === null) return false
  if (isComplete) return false
  const today = new Date().toISOString().split('T')[0]
  return targetDate < today
}
