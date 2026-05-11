import { describe, it, expect } from 'vitest'
import {
  calculateFINumber,
  calculateAnnualSavings,
  calculateYearsToFI,
  generateTrajectory,
  computeFIProjection,
} from './finance'
import type { FIProfile } from '@/types/financial-freedom'

describe('calculateFINumber', () => {
  it('calculates FI Number using 4% Rule (× 25)', () => {
    expect(calculateFINumber(40000)).toBe(1000000)
    expect(calculateFINumber(50000)).toBe(1250000)
    expect(calculateFINumber(30000)).toBe(750000)
  })

  it('returns 0 for zero expenses', () => {
    expect(calculateFINumber(0)).toBe(0)
  })

  it('handles decimal expenses', () => {
    expect(calculateFINumber(42500.5)).toBe(1062512.5)
  })
})

describe('calculateAnnualSavings', () => {
  it('calculates annual savings from expenses and savings rate', () => {
    // annualIncome = 40000 / (1 - 0.5) = 80000
    // annualSavings = 80000 × 0.5 = 40000
    expect(calculateAnnualSavings(40000, 0.5)).toBe(40000)
  })

  it('handles 25% savings rate', () => {
    // annualIncome = 40000 / (1 - 0.25) = 53333.33...
    // annualSavings = 53333.33 × 0.25 = 13333.33...
    const result = calculateAnnualSavings(40000, 0.25)
    expect(result).toBeCloseTo(13333.33, 1)
  })

  it('returns 0 for 0% savings rate', () => {
    expect(calculateAnnualSavings(40000, 0)).toBe(0)
  })

  it('handles 100% savings rate (edge case)', () => {
    // annualIncome = 40000 / 0 = Infinity
    // This is an edge case - savings rate of 100% means no expenses
    expect(calculateAnnualSavings(40000, 1)).toBe(Infinity)
  })
})

describe('calculateYearsToFI', () => {
  it('calculates years to FI with compound interest', () => {
    const currentNetWorth = 100000
    const annualSavings = 40000
    const fiNumber = 1000000
    const expectedReturn = 0.07

    const result = calculateYearsToFI(currentNetWorth, annualSavings, fiNumber, expectedReturn)

    // Should be a positive number of years
    expect(result).not.toBeNull()
    expect(result!).toBeGreaterThan(0)
    expect(result!).toBeLessThan(30) // Reasonable range
  })

  it('returns 0 when already at FI Number', () => {
    const result = calculateYearsToFI(1000000, 40000, 1000000, 0.07)
    expect(result).toBe(0)
  })

  it('returns 0 when net worth exceeds FI Number', () => {
    const result = calculateYearsToFI(1500000, 40000, 1000000, 0.07)
    expect(result).toBe(0)
  })

  it('handles 0 savings with existing net worth (FI reachable via compound growth)', () => {
    // With $100k net worth and 7% return, FI is reachable via compound growth
    const result = calculateYearsToFI(100000, 0, 1000000, 0.07)
    expect(result).not.toBeNull()
    expect(result!).toBeGreaterThan(30) // Takes ~35 years
  })

  it('returns null when 0 savings AND 0 return (truly unreachable)', () => {
    const result = calculateYearsToFI(100000, 0, 1000000, 0)
    expect(result).toBeNull()
  })

  it('handles 0% expected return (linear calculation)', () => {
    // With 0% return, it's simple division: (FI - NW) / savings
    // (1000000 - 100000) / 40000 = 22.5 years
    const result = calculateYearsToFI(100000, 40000, 1000000, 0)
    expect(result).toBeCloseTo(22.5, 1)
  })

  it('handles very low savings', () => {
    const result = calculateYearsToFI(100000, 1000, 1000000, 0.07)
    expect(result).not.toBeNull()
    expect(result!).toBeGreaterThan(25) // Compound interest helps, but still takes time
  })

  it('handles starting from zero net worth', () => {
    const result = calculateYearsToFI(0, 40000, 1000000, 0.07)
    expect(result).not.toBeNull()
    expect(result!).toBeGreaterThanOrEqual(15) // ~15 years with good savings rate
  })

  it('handles negative inputs gracefully', () => {
    // Negative inputs should be treated as invalid
    expect(() => calculateYearsToFI(-100000, 40000, 1000000, 0.07)).toThrow()
    expect(() => calculateYearsToFI(100000, -40000, 1000000, 0.07)).toThrow()
    expect(() => calculateYearsToFI(100000, 40000, -1000000, 0.07)).toThrow()
  })
})

describe('generateTrajectory', () => {
  it('generates year-by-year trajectory until FI', () => {
    const currentNetWorth = 100000
    const annualSavings = 40000
    const fiNumber = 1000000
    const expectedReturn = 0.07
    const currentAge = 30
    const currentYear = 2024

    const trajectory = generateTrajectory(
      currentNetWorth,
      annualSavings,
      fiNumber,
      expectedReturn,
      currentAge,
      currentYear
    )

    // First year should be current state
    expect(trajectory[0].year).toBe(2024)
    expect(trajectory[0].age).toBe(30)
    expect(trajectory[0].netWorth).toBe(100000)

    // Last year should be at or above FI Number
    const lastYear = trajectory[trajectory.length - 1]
    expect(lastYear.netWorth).toBeGreaterThanOrEqual(fiNumber)

    // Each year should show growth
    for (let i = 1; i < trajectory.length; i++) {
      expect(trajectory[i].netWorth).toBeGreaterThan(trajectory[i - 1].netWorth)
      expect(trajectory[i].age).toBe(trajectory[i - 1].age + 1)
      expect(trajectory[i].year).toBe(trajectory[i - 1].year + 1)
    }
  })

  it('returns single entry when already FI', () => {
    const trajectory = generateTrajectory(1000000, 40000, 1000000, 0.07, 30, 2024)

    expect(trajectory.length).toBe(1)
    expect(trajectory[0].netWorth).toBe(1000000)
    expect(trajectory[0].age).toBe(30)
  })

  it('handles 0% return (linear growth)', () => {
    const trajectory = generateTrajectory(100000, 40000, 1000000, 0, 30, 2024)

    // With 0% return, each year should grow by exactly annualSavings
    for (let i = 1; i < trajectory.length; i++) {
      expect(trajectory[i].netWorth).toBe(trajectory[i - 1].netWorth + 40000)
    }
  })

  it('caps trajectory at reasonable length (max 100 years)', () => {
    const trajectory = generateTrajectory(0, 100, 10000000, 0.02, 30, 2024)

    expect(trajectory.length).toBeLessThanOrEqual(100)
  })
})

describe('computeFIProjection', () => {
  it('computes full FI projection from profile', () => {
    const profile: FIProfile = {
      id: 'test-id',
      householdId: 'household-id',
      fiAnnualExpenses: 40000,
      fiSavingsRate: 0.5,
      fiCurrentAge: 30,
      fiCurrentNetWorth: 100000,
      fiExpectedReturn: 0.07,
    }

    const projection = computeFIProjection(profile)

    expect(projection.fiNumber).toBe(1000000)
    expect(projection.yearsToFI).not.toBeNull()
    expect(projection.yearsToFI).toBeGreaterThan(0)
    expect(projection.projectedFIAge).not.toBeNull()
    expect(projection.projectedFIAge).toBe(30 + projection.yearsToFI!)
    expect(projection.progressPercentage).toBe(10) // 100000 / 1000000 = 10%
    expect(projection.isAlreadyFI).toBe(false)
    expect(projection.trajectory.length).toBeGreaterThan(0)
  })

  it('handles already FI state', () => {
    const profile: FIProfile = {
      id: 'test-id',
      householdId: 'household-id',
      fiAnnualExpenses: 40000,
      fiSavingsRate: 0.5,
      fiCurrentAge: 50,
      fiCurrentNetWorth: 1500000, // Exceeds FI Number
      fiExpectedReturn: 0.07,
    }

    const projection = computeFIProjection(profile)

    expect(projection.fiNumber).toBe(1000000)
    expect(projection.yearsToFI).toBe(0)
    expect(projection.projectedFIAge).toBe(50)
    expect(projection.progressPercentage).toBe(100) // Capped at 100
    expect(projection.isAlreadyFI).toBe(true)
    expect(projection.trajectory.length).toBe(1)
  })

  it('handles 0% savings rate (unreachable)', () => {
    const profile: FIProfile = {
      id: 'test-id',
      householdId: 'household-id',
      fiAnnualExpenses: 40000,
      fiSavingsRate: 0,
      fiCurrentAge: 30,
      fiCurrentNetWorth: 100000,
      fiExpectedReturn: 0.07,
    }

    const projection = computeFIProjection(profile)

    expect(projection.fiNumber).toBe(1000000)
    // With 0% savings but existing net worth + positive return, FI is reachable via compound growth
    expect(projection.yearsToFI).not.toBeNull()
    expect(projection.yearsToFI).toBeGreaterThan(30) // Takes longer without savings
    expect(projection.progressPercentage).toBe(10)
    expect(projection.isAlreadyFI).toBe(false)
    expect(projection.trajectory.length).toBeGreaterThan(1)
  })

  it('handles 0% savings rate AND 0% return (truly unreachable)', () => {
    const profile: FIProfile = {
      id: 'test-id',
      householdId: 'household-id',
      fiAnnualExpenses: 40000,
      fiSavingsRate: 0,
      fiCurrentAge: 30,
      fiCurrentNetWorth: 100000,
      fiExpectedReturn: 0, // No growth possible
    }

    const projection = computeFIProjection(profile)

    expect(projection.fiNumber).toBe(1000000)
    expect(projection.yearsToFI).toBeNull() // Truly unreachable
    expect(projection.projectedFIAge).toBeNull()
    expect(projection.progressPercentage).toBe(10)
    expect(projection.isAlreadyFI).toBe(false)
    expect(projection.trajectory.length).toBe(1) // Just current state
  })

  it('handles missing data gracefully', () => {
    const profile: FIProfile = {
      id: 'test-id',
      householdId: 'household-id',
      fiAnnualExpenses: null,
      fiSavingsRate: null,
      fiCurrentAge: null,
      fiCurrentNetWorth: null,
      fiExpectedReturn: null,
    }

    const projection = computeFIProjection(profile)

    // With all nulls, should return safe defaults
    expect(projection.fiNumber).toBe(0)
    expect(projection.yearsToFI).toBeNull()
    expect(projection.projectedFIAge).toBeNull()
    expect(projection.progressPercentage).toBe(0)
    expect(projection.isAlreadyFI).toBe(false)
    expect(projection.trajectory).toEqual([])
  })

  it('handles partial missing data', () => {
    const profile: FIProfile = {
      id: 'test-id',
      householdId: 'household-id',
      fiAnnualExpenses: 40000,
      fiSavingsRate: null, // Missing savings rate
      fiCurrentAge: 30,
      fiCurrentNetWorth: 100000,
      fiExpectedReturn: 0.07,
    }

    const projection = computeFIProjection(profile)

    // With missing savings rate, can't calculate years to FI
    expect(projection.fiNumber).toBe(1000000)
    expect(projection.yearsToFI).toBeNull()
    expect(projection.progressPercentage).toBe(10)
  })

  it('uses default expected return when null', () => {
    const profile: FIProfile = {
      id: 'test-id',
      householdId: 'household-id',
      fiAnnualExpenses: 40000,
      fiSavingsRate: 0.5,
      fiCurrentAge: 30,
      fiCurrentNetWorth: 100000,
      fiExpectedReturn: null, // Should default to 0.07
    }

    const projection = computeFIProjection(profile)

    expect(projection.fiNumber).toBe(1000000)
    expect(projection.yearsToFI).not.toBeNull()
  })

  it('caps progress percentage at 100', () => {
    const profile: FIProfile = {
      id: 'test-id',
      householdId: 'household-id',
      fiAnnualExpenses: 40000,
      fiSavingsRate: 0.5,
      fiCurrentAge: 50,
      fiCurrentNetWorth: 2000000, // 200% of FI Number
      fiExpectedReturn: 0.07,
    }

    const projection = computeFIProjection(profile)

    expect(projection.progressPercentage).toBe(100) // Capped, not 200
  })

  it('handles very low savings rate (< 10%)', () => {
    const profile: FIProfile = {
      id: 'test-id',
      householdId: 'household-id',
      fiAnnualExpenses: 40000,
      fiSavingsRate: 0.05, // 5% savings rate
      fiCurrentAge: 30,
      fiCurrentNetWorth: 100000,
      fiExpectedReturn: 0.07,
    }

    const projection = computeFIProjection(profile)

    expect(projection.yearsToFI).not.toBeNull()
    expect(projection.yearsToFI).toBeGreaterThan(30) // Should take a long time
  })
})
