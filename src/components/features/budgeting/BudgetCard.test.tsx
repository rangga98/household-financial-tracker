import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BudgetCard } from './BudgetCard'
import type { BudgetMetrics } from '@/types'

const mockMetrics: BudgetMetrics = {
  categoryId: 'cat-1',
  categoryName: 'Dining Out',
  monthlyLimit: 2000000,
  totalSpent: 800000,
  remainingBudget: 1200000,
  percentageUsed: 40,
  dailySpendingPower: 40000,
  isOverbudget: false,
  progressColor: 'green',
}

describe('BudgetCard', () => {
  it('renders category name and metrics', () => {
    render(<BudgetCard metrics={mockMetrics} />)

    expect(screen.getByText('Dining Out')).toBeInTheDocument()
    expect(screen.getByText(/Daily Spending Power/)).toBeInTheDocument()
  })

  it('shows progress bar with correct value', () => {
    render(<BudgetCard metrics={mockMetrics} />)

    expect(screen.getByText(/40%/)).toBeInTheDocument()
    expect(screen.getByText(/Rp 800\.000/)).toBeInTheDocument()
  })

  it('does not show alert when not overbudget', () => {
    render(<BudgetCard metrics={mockMetrics} />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows alert when overbudget', () => {
    const overbudgetMetrics = {
      ...mockMetrics,
      totalSpent: 1700000,
      percentageUsed: 85,
      isOverbudget: true,
      progressColor: 'yellow' as const,
    }

    render(<BudgetCard metrics={overbudgetMetrics} />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('handles null limit gracefully', () => {
    const noLimitMetrics = {
      ...mockMetrics,
      monthlyLimit: null,
      percentageUsed: 0,
      progressColor: 'gray' as const,
    }

    render(<BudgetCard metrics={noLimitMetrics} />)

    expect(screen.queryByText(/40%/)).not.toBeInTheDocument()
  })
})
