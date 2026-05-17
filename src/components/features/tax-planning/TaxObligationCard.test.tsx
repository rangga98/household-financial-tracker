import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaxObligationCard } from './TaxObligationCard'
import type { TaxObligationWithSchedule } from '@/types/tax-planning'

const BASE: TaxObligationWithSchedule = {
  obligation: {
    id: 'goal-1',
    householdId: 'hh-1',
    name: 'Honda Beat B 1234 XY',
    taxType: 'vehicle_registration',
    targetAmount: 1_200_000,
    currentAmount: 0,
    targetDate: '2026-12-01',
    notes: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  remainingAmount: 1_200_000,
  remainingMonths: 11,
  monthlyInstallment: 109_090,
  installmentSchedule: [
    { month: '2026-01', amount: 109_100, cumulativeAmount: 109_100 },
    { month: '2026-02', amount: 109_090, cumulativeAmount: 218_190 },
  ],
  isOverdue: false,
}

const OVERDUE: TaxObligationWithSchedule = {
  ...BASE,
  obligation: { ...BASE.obligation, targetDate: '2025-12-01' },
  isOverdue: true,
}

describe('TaxObligationCard', () => {
  it('renders obligation name', () => {
    render(
      <TaxObligationCard
        data={BASE}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onRenew={vi.fn()}
      />
    )
    expect(screen.getByText('Honda Beat B 1234 XY')).toBeDefined()
  })

  it('renders tax type badge', () => {
    render(
      <TaxObligationCard
        data={BASE}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onRenew={vi.fn()}
      />
    )
    expect(screen.getAllByText(/vehicle|STNK|registration/i).length).toBeGreaterThan(0)
  })

  it('renders target amount', () => {
    render(
      <TaxObligationCard
        data={BASE}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onRenew={vi.fn()}
      />
    )
    expect(screen.getAllByText(/Rp|1\.200\.000|1,200,000/i).length).toBeGreaterThan(0)
  })

  it('shows Overdue badge and renew button when overdue', () => {
    render(
      <TaxObligationCard
        data={OVERDUE}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onRenew={vi.fn()}
      />
    )
    expect(screen.getAllByText(/overdue/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /renew/i })).toBeDefined()
  })

  it('does not show Overdue badge when not overdue', () => {
    render(
      <TaxObligationCard
        data={BASE}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onRenew={vi.fn()}
      />
    )
    expect(screen.queryByText(/overdue/i)).toBeNull()
  })

  it('installment schedule is hidden by default', () => {
    render(
      <TaxObligationCard
        data={BASE}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onRenew={vi.fn()}
      />
    )
    expect(screen.queryByText('2026-01')).toBeNull()
  })

  it('toggles installment schedule on expand click', async () => {
    render(
      <TaxObligationCard
        data={BASE}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onRenew={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /view schedule|schedule|expand/i }))
    expect(screen.getByText('2026-01')).toBeDefined()
  })

  it('calls onEdit when Edit is clicked', async () => {
    const onEdit = vi.fn()
    render(
      <TaxObligationCard
        data={BASE}
        onEdit={onEdit}
        onDelete={vi.fn()}
        onRenew={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(BASE.obligation)
  })

  it('calls onDelete when Delete is clicked', async () => {
    const onDelete = vi.fn()
    render(
      <TaxObligationCard
        data={BASE}
        onEdit={vi.fn()}
        onDelete={onDelete}
        onRenew={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('goal-1')
  })
})
