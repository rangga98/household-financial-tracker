import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaxObligationList } from './TaxObligationList'
import type { TaxObligationWithSchedule } from '@/types/tax-planning'

const OBLIGATION_A: TaxObligationWithSchedule = {
  obligation: {
    id: 'goal-1',
    householdId: 'hh-1',
    name: 'Honda Beat',
    taxType: 'vehicle_registration',
    targetAmount: 1_200_000,
    currentAmount: 0,
    targetDate: '2026-06-01',
    notes: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  remainingAmount: 1_200_000,
  remainingMonths: 5,
  monthlyInstallment: 240_000,
  installmentSchedule: [],
  isOverdue: false,
}

const OBLIGATION_B: TaxObligationWithSchedule = {
  obligation: {
    id: 'goal-2',
    householdId: 'hh-1',
    name: 'Rumah Depok',
    taxType: 'property_tax',
    targetAmount: 500_000,
    currentAmount: 0,
    targetDate: '2026-12-01',
    notes: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  remainingAmount: 500_000,
  remainingMonths: 11,
  monthlyInstallment: 45_454,
  installmentSchedule: [],
  isOverdue: false,
}

describe('TaxObligationList', () => {
  it('renders empty state with CTA when obligations array is empty', () => {
    render(
      <TaxObligationList
        obligations={[]}
        householdId="hh-1"
        onRefresh={vi.fn()}
      />
    )
    expect(screen.getAllByText(/no tax obligations|add your first/i).length).toBeGreaterThan(0)
  })

  it('renders a card for each obligation', () => {
    render(
      <TaxObligationList
        obligations={[OBLIGATION_A, OBLIGATION_B]}
        householdId="hh-1"
        onRefresh={vi.fn()}
      />
    )
    expect(screen.getByText('Honda Beat')).toBeDefined()
    expect(screen.getByText('Rumah Depok')).toBeDefined()
  })

  it('renders Add Obligation button', () => {
    render(
      <TaxObligationList
        obligations={[]}
        householdId="hh-1"
        onRefresh={vi.fn()}
      />
    )
    expect(screen.getAllByRole('button', { name: /add.*obligation|new.*tax/i }).length).toBeGreaterThan(0)
  })

  it('opens TaxObligationForm dialog when Add button is clicked', async () => {
    render(
      <TaxObligationList
        obligations={[]}
        householdId="hh-1"
        onRefresh={vi.fn()}
      />
    )
    await userEvent.click(screen.getAllByRole('button', { name: /add.*obligation|new.*tax/i })[0])
    expect(screen.getByLabelText(/name/i)).toBeDefined()
  })
})
