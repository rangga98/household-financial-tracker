import type { FIProfile, FIProjection, FIYearProjection } from '@/types/financial-freedom'

/**
 * Calculate FI Number using the 4% Rule.
 * FI Number = Annual Expenses × 25
 */
export function calculateFINumber(annualExpenses: number): number {
  return annualExpenses * 25
}

/**
 * Calculate annual savings from expenses and savings rate.
 * annualIncome = annualExpenses / (1 - savingsRate)
 * annualSavings = annualIncome × savingsRate
 */
export function calculateAnnualSavings(
  annualExpenses: number,
  savingsRate: number
): number {
  if (savingsRate === 0) return 0
  if (savingsRate === 1) return Infinity // 100% savings = no expenses

  const annualIncome = annualExpenses / (1 - savingsRate)
  return annualIncome * savingsRate
}

/**
 * Calculate Years to FI using compound interest with contributions.
 * Formula: ln((r × FI + savings) / (r × NW + savings)) / ln(1 + r)
 * Returns null if savingsRate <= 0 or currentNetWorth >= fiNumber.
 */
export function calculateYearsToFI(
  currentNetWorth: number,
  annualSavings: number,
  fiNumber: number,
  expectedReturn: number
): number | null {
  // Validate inputs
  if (currentNetWorth < 0 || annualSavings < 0 || fiNumber < 0 || expectedReturn < 0) {
    throw new Error('Negative inputs are not allowed')
  }

  // Already FI
  if (currentNetWorth >= fiNumber) {
    return 0
  }

  // Unreachable - no savings AND no return AND not already FI
  if (annualSavings === 0 && expectedReturn === 0) {
    return null
  }

  // With 0 savings but existing net worth + positive return, FI is reachable via compound growth
  // Formula simplifies to: ln(fiNumber / currentNetWorth) / ln(1 + r)

  // 0% return - simple linear calculation
  if (expectedReturn === 0) {
    return (fiNumber - currentNetWorth) / annualSavings
  }

  // Compound interest formula
  const r = expectedReturn
  const numerator = r * fiNumber + annualSavings
  const denominator = r * currentNetWorth + annualSavings

  // Prevent division by zero or log of non-positive
  if (denominator <= 0 || numerator <= 0) {
    return null
  }

  const years = Math.log(numerator / denominator) / Math.log(1 + r)

  return Math.ceil(years) // Round up to whole years
}

/**
 * Generate year-by-year net worth trajectory.
 * Returns array of { year, age, netWorth } until FI is reached.
 */
export function generateTrajectory(
  currentNetWorth: number,
  annualSavings: number,
  fiNumber: number,
  expectedReturn: number,
  currentAge: number,
  currentYear: number
): FIYearProjection[] {
  const trajectory: FIYearProjection[] = []
  let netWorth = currentNetWorth
  let age = currentAge
  let year = currentYear

  // Already FI - return single entry
  if (netWorth >= fiNumber) {
    trajectory.push({ year, age, netWorth })
    return trajectory
  }

  // No savings and no return - can't progress
  if (annualSavings === 0 && expectedReturn === 0) {
    trajectory.push({ year, age, netWorth })
    return trajectory
  }

  // Generate trajectory year by year
  const maxYears = 100 // Safety cap

  while (netWorth < fiNumber && trajectory.length < maxYears) {
    trajectory.push({ year, age, netWorth })

    // Apply growth: netWorth = netWorth × (1 + r) + annualSavings
    netWorth = netWorth * (1 + expectedReturn) + annualSavings
    age++
    year++
  }

  // Add final year when FI is reached
  if (netWorth >= fiNumber) {
    trajectory.push({ year, age, netWorth })
  }

  return trajectory
}

/**
 * Master function: compute full FI projection from raw inputs.
 * Handles all edge cases and missing data.
 */
export function computeFIProjection(profile: FIProfile): FIProjection {
  const annualExpenses = profile.fiAnnualExpenses ?? 0
  const savingsRate = profile.fiSavingsRate ?? 0
  const currentAge = profile.fiCurrentAge ?? 0
  const currentNetWorth = profile.fiCurrentNetWorth ?? 0
  const expectedReturn = profile.fiExpectedReturn ?? 0.07 // Default 7%

  // Calculate FI Number
  const fiNumber = calculateFINumber(annualExpenses)

  // Check for missing critical data
  const hasMissingData =
    profile.fiAnnualExpenses === null ||
    profile.fiSavingsRate === null ||
    profile.fiCurrentAge === null ||
    profile.fiCurrentNetWorth === null

  // If missing data, return safe defaults
  if (hasMissingData) {
    return {
      fiNumber,
      yearsToFI: null,
      projectedFIAge: null,
      progressPercentage: fiNumber > 0 ? Math.min((currentNetWorth / fiNumber) * 100, 100) : 0,
      isAlreadyFI: false,
      trajectory: [],
    }
  }

  // Calculate annual savings
  const annualSavings = calculateAnnualSavings(annualExpenses, savingsRate)

  // Calculate years to FI
  const yearsToFI = calculateYearsToFI(currentNetWorth, annualSavings, fiNumber, expectedReturn)

  // Calculate projected FI age
  const projectedFIAge = yearsToFI !== null ? currentAge + yearsToFI : null

  // Calculate progress percentage (capped at 100)
  const progressPercentage = fiNumber > 0
    ? Math.min((currentNetWorth / fiNumber) * 100, 100)
    : 0

  // Check if already FI
  const isAlreadyFI = currentNetWorth >= fiNumber && fiNumber > 0

  // Generate trajectory
  const currentYear = new Date().getFullYear()
  const trajectory = generateTrajectory(
    currentNetWorth,
    annualSavings,
    fiNumber,
    expectedReturn,
    currentAge,
    currentYear
  )

  return {
    fiNumber,
    yearsToFI,
    projectedFIAge,
    progressPercentage,
    isAlreadyFI,
    trajectory,
  }
}
