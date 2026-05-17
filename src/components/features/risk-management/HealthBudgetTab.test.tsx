import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HealthBudgetTab } from './HealthBudgetTab'
import type { BudgetMetrics } from '@/types'

const HEALTH_METRICS: BudgetMetrics[] = [
  {
    categoryId: 'cat-1',
    categoryName: 'Dokter / Doctor',
    monthlyLimit: 500_000,
    totalSpent: 300_000,
    remainingBudget: 200_000,
    percentageUsed: 60,
    dailySpendingPower: 10_000,
    isOverbudget: false,
    progressColor: 'yellow',
  },
  {
    categoryId: 'cat-2',
    categoryName: 'Farmasi / Pharmacy',
    monthlyLimit: 300_000,
    totalSpent: 350_000,
    remainingBudget: -50_000,
    percentageUsed: 117,
    dailySpendingPower: 0,
    isOverbudget: true,
    progressColor: 'red',
  },
]

describe('HealthBudgetTab', () => {
  it('renders health category names', () => {
    render(<HealthBudgetTab householdId="hh-1" metrics={HEALTH_METRICS} />)
    expect(screen.getByText('Dokter / Doctor')).toBeDefined()
    expect(screen.getByText('Farmasi / Pharmacy')).toBeDefined()
  })

  it('shows empty state when no health metrics', () => {
    render(<HealthBudgetTab householdId="hh-1" metrics={[]} />)
    expect(screen.getByText(/no healthcare categories/i)).toBeDefined()
  })

  it('renders spending and limit for each category', () => {
    render(<HealthBudgetTab householdId="hh-1" metrics={HEALTH_METRICS} />)
    expect(screen.getAllByText(/Rp/i).length).toBeGreaterThan(0)
  })

  it('shows overbudget indicator for over-limit categories', () => {
    render(<HealthBudgetTab householdId="hh-1" metrics={HEALTH_METRICS} />)
    expect(screen.getAllByText(/over.*budget|overbudget|over budget/i).length).toBeGreaterThan(0)
  })

  it('renders a month filter control', () => {
    render(<HealthBudgetTab householdId="hh-1" metrics={HEALTH_METRICS} />)
    expect(screen.getByLabelText(/month/i)).toBeDefined()
  })
})
