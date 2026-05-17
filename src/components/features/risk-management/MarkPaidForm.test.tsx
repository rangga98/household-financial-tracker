import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarkPaidForm } from './MarkPaidForm'
import type { InsurancePolicy } from '@/types/risk-management'

const POLICY: InsurancePolicy = {
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
}

describe('MarkPaidForm', () => {
  it('renders payment date and amount fields', () => {
    render(
      <MarkPaidForm
        policy={POLICY}
        householdId="hh-1"
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByLabelText(/payment date/i)).toBeDefined()
    expect(screen.getByLabelText(/amount/i)).toBeDefined()
  })

  it('pre-fills amount with policy premiumAmount', () => {
    render(
      <MarkPaidForm
        policy={POLICY}
        householdId="hh-1"
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement
    expect(Number(amountInput.value)).toBe(2_000_000)
  })

  it('shows validation error when amount is empty on submit', async () => {
    render(
      <MarkPaidForm
        policy={POLICY}
        householdId="hh-1"
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    const amountInput = screen.getByLabelText(/amount/i)
    await userEvent.clear(amountInput)
    await userEvent.click(screen.getByRole('button', { name: /confirm|record/i }))
    await waitFor(() => {
      expect(screen.getAllByText(/amount.*greater|must be.*positive/i).length).toBeGreaterThan(0)
    })
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    render(
      <MarkPaidForm
        policy={POLICY}
        householdId="hh-1"
        onSuccess={vi.fn()}
        onCancel={onCancel}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
