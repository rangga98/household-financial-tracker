import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaxObligationForm } from './TaxObligationForm'

vi.mock('@/app/actions/tax-planning', () => ({
  createTaxObligation: vi.fn().mockResolvedValue({ success: true, data: {} }),
  updateTaxObligation: vi.fn().mockResolvedValue({ success: true, data: {} }),
}))

describe('TaxObligationForm', () => {
  it('renders all required fields in create mode', () => {
    render(
      <TaxObligationForm
        mode="create"
        householdId="hh-1"
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByLabelText(/name/i)).toBeDefined()
    expect(screen.getByLabelText(/tax type/i)).toBeDefined()
    expect(screen.getByLabelText(/total amount/i)).toBeDefined()
    expect(screen.getByLabelText(/due date/i)).toBeDefined()
  })

  it('shows validation error when name is empty on submit', async () => {
    render(
      <TaxObligationForm
        mode="create"
        householdId="hh-1"
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /create|save/i }))
    await waitFor(() => {
      expect(screen.getAllByText(/name.*required|required.*name/i).length).toBeGreaterThan(0)
    })
  })

  it('shows validation error when amount is zero', async () => {
    render(
      <TaxObligationForm
        mode="create"
        householdId="hh-1"
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    const amountInput = screen.getByLabelText(/total amount/i)
    fireEvent.change(amountInput, { target: { value: '0' } })
    await userEvent.click(screen.getByRole('button', { name: /create|save/i }))
    await waitFor(() => {
      expect(screen.getAllByText(/amount.*greater|must be greater/i).length).toBeGreaterThan(0)
    })
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    render(
      <TaxObligationForm
        mode="create"
        householdId="hh-1"
        onSuccess={vi.fn()}
        onCancel={onCancel}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('pre-fills fields in edit mode', () => {
    render(
      <TaxObligationForm
        mode="edit"
        householdId="hh-1"
        initialValues={{
          name: 'Honda Beat B 1234 XY',
          taxType: 'vehicle_registration',
          targetAmount: 1_200_000,
          targetDate: '2026-12-01',
          notes: null,
        }}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect((screen.getByLabelText(/name/i) as HTMLInputElement).value).toBe('Honda Beat B 1234 XY')
  })
})
