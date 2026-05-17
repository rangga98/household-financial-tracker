import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PolicyCard } from './PolicyCard'
import type { PolicyWithStatus } from '@/types/risk-management'

const UPCOMING_POLICY: PolicyWithStatus = {
  id: 'pol-1',
  householdId: 'hh-1',
  name: 'Jiwa AIA',
  insuranceType: 'life',
  insurer: 'AIA',
  coverageAmount: 1_000_000_000,
  premiumAmount: 2_000_000,
  paymentFrequency: 'annual',
  startDate: '2025-01-01',
  nextDueDate: '2026-06-01',
  isActive: true,
  notes: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  premiumStatus: 'upcoming',
  daysUntilDue: 15,
}

const OVERDUE_POLICY: PolicyWithStatus = {
  ...UPCOMING_POLICY,
  id: 'pol-2',
  premiumStatus: 'overdue',
  daysUntilDue: -5,
}

const PAID_POLICY: PolicyWithStatus = {
  ...UPCOMING_POLICY,
  id: 'pol-3',
  premiumStatus: 'paid',
  daysUntilDue: null,
}

describe('PolicyCard', () => {
  it('renders policy name and insurer', () => {
    render(
      <PolicyCard
        policy={UPCOMING_POLICY}
        onEdit={vi.fn()}
        onDeactivate={vi.fn()}
        onMarkPaid={vi.fn()}
      />
    )
    expect(screen.getByText('Jiwa AIA')).toBeDefined()
    expect(screen.getByText('AIA · Life')).toBeDefined()
  })

  it('renders coverage amount', () => {
    render(
      <PolicyCard
        policy={UPCOMING_POLICY}
        onEdit={vi.fn()}
        onDeactivate={vi.fn()}
        onMarkPaid={vi.fn()}
      />
    )
    expect(screen.getAllByText(/Rp/i).length).toBeGreaterThan(0)
  })

  it('shows "Upcoming" badge for upcoming status', () => {
    render(
      <PolicyCard
        policy={UPCOMING_POLICY}
        onEdit={vi.fn()}
        onDeactivate={vi.fn()}
        onMarkPaid={vi.fn()}
      />
    )
    expect(screen.getByText(/upcoming/i)).toBeDefined()
  })

  it('shows "Overdue" badge for overdue status', () => {
    render(
      <PolicyCard
        policy={OVERDUE_POLICY}
        onEdit={vi.fn()}
        onDeactivate={vi.fn()}
        onMarkPaid={vi.fn()}
      />
    )
    expect(screen.getAllByText(/overdue/i).length).toBeGreaterThan(0)
  })

  it('shows "Paid" badge for paid status', () => {
    render(
      <PolicyCard
        policy={PAID_POLICY}
        onEdit={vi.fn()}
        onDeactivate={vi.fn()}
        onMarkPaid={vi.fn()}
      />
    )
    expect(screen.getByText(/paid/i)).toBeDefined()
  })

  it('renders Edit and Deactivate buttons', () => {
    render(
      <PolicyCard
        policy={UPCOMING_POLICY}
        onEdit={vi.fn()}
        onDeactivate={vi.fn()}
        onMarkPaid={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /edit/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /deactivate/i })).toBeDefined()
  })

  it('calls onEdit when Edit button is clicked', async () => {
    const onEdit = vi.fn()
    render(
      <PolicyCard
        policy={UPCOMING_POLICY}
        onEdit={onEdit}
        onDeactivate={vi.fn()}
        onMarkPaid={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(UPCOMING_POLICY)
  })

  it('calls onDeactivate when Deactivate button is clicked', async () => {
    const onDeactivate = vi.fn()
    render(
      <PolicyCard
        policy={UPCOMING_POLICY}
        onEdit={vi.fn()}
        onDeactivate={onDeactivate}
        onMarkPaid={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /^deactivate$/i }))
    await userEvent.click(screen.getByRole('button', { name: /confirm deactivate/i }))
    expect(onDeactivate).toHaveBeenCalledWith('pol-1')
  })
})
