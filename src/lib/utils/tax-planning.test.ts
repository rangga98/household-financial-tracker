import { describe, it, expect } from 'vitest'
import {
  computeRemainingMonths,
  computeTaxInstallments,
  isTaxObligationOverdue,
  computeDaysUntilDeadline,
  isFilingDeadlineUrgent,
  buildObligationWithSchedule,
} from './tax-planning'
import type { TaxObligation } from '@/types/tax-planning'

// ---------------------------------------------------------------------------
// computeRemainingMonths
// ---------------------------------------------------------------------------
describe('computeRemainingMonths', () => {
  it('returns 11 for Jan 1 → Dec 1 same year', () => {
    expect(computeRemainingMonths('2026-12-01', new Date('2026-01-01'))).toBe(11)
  })

  it('returns 1 when due date is in the same month as today', () => {
    expect(computeRemainingMonths('2026-01-15', new Date('2026-01-01'))).toBe(1)
  })

  it('clamps to 1 when today is past the due date month', () => {
    expect(computeRemainingMonths('2026-01-15', new Date('2026-01-20'))).toBe(1)
  })

  it('clamps to 1 when due date is in the past (different month)', () => {
    expect(computeRemainingMonths('2025-12-01', new Date('2026-01-01'))).toBe(1)
  })

  it('returns 12 for a full year ahead', () => {
    expect(computeRemainingMonths('2027-01-01', new Date('2026-01-01'))).toBe(12)
  })

  it('returns correct months crossing year boundary', () => {
    expect(computeRemainingMonths('2027-03-01', new Date('2026-12-01'))).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// computeTaxInstallments
// ---------------------------------------------------------------------------
describe('computeTaxInstallments', () => {
  it('returns 11 installments for Jan→Dec', () => {
    const result = computeTaxInstallments(1_100_000, '2026-12-01', new Date('2026-01-01'))
    expect(result).toHaveLength(11)
  })

  it('all installment amounts sum exactly to remainingAmount', () => {
    const remaining = 1_200_000
    const result = computeTaxInstallments(remaining, '2026-12-01', new Date('2026-01-01'))
    const total = result.reduce((sum: number, i: { amount: number }) => sum + i.amount, 0)
    expect(total).toBe(remaining)
  })

  it('first month absorbs the integer remainder', () => {
    const result = computeTaxInstallments(7, '2026-04-01', new Date('2026-01-01'))
    expect(result).toHaveLength(3)
    expect(result[0].amount).toBe(3)
    expect(result[1].amount).toBe(2)
    expect(result[2].amount).toBe(2)
  })

  it('returns single installment equal to remainingAmount when <1 month remaining', () => {
    const result = computeTaxInstallments(1_000_000, '2026-01-05', new Date('2026-01-01'))
    expect(result).toHaveLength(1)
    expect(result[0].amount).toBe(1_000_000)
  })

  it('cumulativeAmount increases correctly', () => {
    const result = computeTaxInstallments(600_000, '2026-04-01', new Date('2026-01-01'))
    expect(result[0].cumulativeAmount).toBe(result[0].amount)
    expect(result[result.length - 1].cumulativeAmount).toBe(600_000)
  })

  it('months are in YYYY-MM format starting from the current month', () => {
    const result = computeTaxInstallments(300_000, '2026-04-01', new Date('2026-01-01'))
    expect(result[0].month).toBe('2026-01')
    expect(result[1].month).toBe('2026-02')
    expect(result[2].month).toBe('2026-03')
  })

  it('sum integrity with odd remainder — 1_000_001 over 3 months', () => {
    const result = computeTaxInstallments(1_000_001, '2026-04-01', new Date('2026-01-01'))
    const total = result.reduce((sum: number, i: { amount: number }) => sum + i.amount, 0)
    expect(total).toBe(1_000_001)
    expect(result[0].amount).toBe(333_335)
    expect(result[1].amount).toBe(333_333)
    expect(result[2].amount).toBe(333_333)
  })

  it('handles evenly divisible amounts — no remainder', () => {
    const result = computeTaxInstallments(900_000, '2026-04-01', new Date('2026-01-01'))
    expect(result[0].amount).toBe(300_000)
    expect(result[1].amount).toBe(300_000)
    expect(result[2].amount).toBe(300_000)
  })
})

// ---------------------------------------------------------------------------
// isTaxObligationOverdue
// ---------------------------------------------------------------------------
describe('isTaxObligationOverdue', () => {
  it('returns true when target date is in the past', () => {
    expect(isTaxObligationOverdue('2025-12-01', new Date('2026-01-01'))).toBe(true)
  })

  it('returns false when target date is in the future', () => {
    expect(isTaxObligationOverdue('2026-12-01', new Date('2026-01-01'))).toBe(false)
  })

  it('returns false when target date is today', () => {
    expect(isTaxObligationOverdue('2026-01-01', new Date('2026-01-01'))).toBe(false)
  })

  it('returns true when target date was yesterday', () => {
    expect(isTaxObligationOverdue('2025-12-31', new Date('2026-01-01'))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// computeDaysUntilDeadline
// ---------------------------------------------------------------------------
describe('computeDaysUntilDeadline', () => {
  it('returns 30 when deadline is 30 days away', () => {
    expect(computeDaysUntilDeadline('2027-03-31', new Date('2027-03-01'))).toBe(30)
  })

  it('returns 0 when deadline is today', () => {
    expect(computeDaysUntilDeadline('2026-05-17', new Date('2026-05-17'))).toBe(0)
  })

  it('returns positive days for future deadline', () => {
    expect(computeDaysUntilDeadline('2026-05-27', new Date('2026-05-17'))).toBe(10)
  })

  it('returns negative days for past deadline', () => {
    expect(computeDaysUntilDeadline('2026-05-07', new Date('2026-05-17'))).toBe(-10)
  })
})

// ---------------------------------------------------------------------------
// isFilingDeadlineUrgent
// ---------------------------------------------------------------------------
describe('isFilingDeadlineUrgent', () => {
  it('returns true when pending and deadline is ≤30 days away', () => {
    expect(isFilingDeadlineUrgent('2027-03-31', 'pending', new Date('2027-03-01'))).toBe(true)
  })

  it('returns true when pending and deadline is exactly 30 days away', () => {
    expect(isFilingDeadlineUrgent('2027-03-31', 'pending', new Date('2027-03-01'))).toBe(true)
  })

  it('returns false when pending but deadline is >30 days away', () => {
    expect(isFilingDeadlineUrgent('2027-03-31', 'pending', new Date('2027-01-01'))).toBe(false)
  })

  it('returns false when filed even if deadline is ≤30 days away', () => {
    expect(isFilingDeadlineUrgent('2027-03-31', 'filed', new Date('2027-03-01'))).toBe(false)
  })

  it('returns true when pending and deadline is today', () => {
    expect(isFilingDeadlineUrgent('2026-05-17', 'pending', new Date('2026-05-17'))).toBe(true)
  })

  it('returns true when pending and deadline is overdue', () => {
    expect(isFilingDeadlineUrgent('2026-05-01', 'pending', new Date('2026-05-17'))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// buildObligationWithSchedule
// ---------------------------------------------------------------------------
describe('buildObligationWithSchedule', () => {
  const BASE_OBLIGATION: TaxObligation = {
    id: 'goal-1',
    householdId: 'hh-1',
    name: 'Honda Beat',
    taxType: 'vehicle_registration',
    targetAmount: 1_200_000,
    currentAmount: 0,
    targetDate: '2026-12-01',
    notes: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }

  it('computes remainingAmount as targetAmount - currentAmount', () => {
    const result = buildObligationWithSchedule(BASE_OBLIGATION, new Date('2026-01-01'))
    expect(result.remainingAmount).toBe(1_200_000)
  })

  it('computes remainingAmount correctly when currentAmount > 0', () => {
    const obligation = { ...BASE_OBLIGATION, currentAmount: 200_000 }
    const result = buildObligationWithSchedule(obligation, new Date('2026-01-01'))
    expect(result.remainingAmount).toBe(1_000_000)
  })

  it('sets isOverdue correctly', () => {
    const past = { ...BASE_OBLIGATION, targetDate: '2025-12-01' }
    expect(buildObligationWithSchedule(past, new Date('2026-01-01')).isOverdue).toBe(true)
    expect(buildObligationWithSchedule(BASE_OBLIGATION, new Date('2026-01-01')).isOverdue).toBe(false)
  })

  it('installmentSchedule sum equals remainingAmount', () => {
    const result = buildObligationWithSchedule(BASE_OBLIGATION, new Date('2026-01-01'))
    const total = result.installmentSchedule.reduce((sum: number, i: { amount: number }) => sum + i.amount, 0)
    expect(total).toBe(result.remainingAmount)
  })

  it('monthlyInstallment is floor(remainingAmount / remainingMonths)', () => {
    const result = buildObligationWithSchedule(BASE_OBLIGATION, new Date('2026-01-01'))
    expect(result.monthlyInstallment).toBe(Math.floor(result.remainingAmount / result.remainingMonths))
  })
})
