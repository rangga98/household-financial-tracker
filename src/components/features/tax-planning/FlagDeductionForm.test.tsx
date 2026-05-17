import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FlagDeductionForm } from './FlagDeductionForm'

vi.mock('@/app/actions/tax-planning', () => ({
  flagTransactionAsDeductible: vi.fn().mockResolvedValue({ success: true, data: undefined }),
}))

describe('FlagDeductionForm', () => {
  it('renders fiscal year field', () => {
    render(
      <FlagDeductionForm
        transactionId="txn-1"
        householdId="hh-1"
        defaultFiscalYear={2026}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByLabelText(/fiscal year/i)).toBeDefined()
  })

  it('pre-fills fiscal year with defaultFiscalYear', () => {
    render(
      <FlagDeductionForm
        transactionId="txn-1"
        householdId="hh-1"
        defaultFiscalYear={2026}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    const input = screen.getByLabelText(/fiscal year/i) as HTMLInputElement
    expect(input.value).toBe('2026')
  })

  it('shows validation error when fiscal year is zero', async () => {
    render(
      <FlagDeductionForm
        transactionId="txn-1"
        householdId="hh-1"
        defaultFiscalYear={0}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /flag|save/i }))
    await waitFor(() => {
      expect(screen.getAllByText(/year.*required|required/i).length).toBeGreaterThan(0)
    })
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    render(
      <FlagDeductionForm
        transactionId="txn-1"
        householdId="hh-1"
        defaultFiscalYear={2026}
        onSuccess={vi.fn()}
        onCancel={onCancel}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows server error when action fails', async () => {
    const { flagTransactionAsDeductible } = await import('@/app/actions/tax-planning')
    vi.mocked(flagTransactionAsDeductible).mockResolvedValueOnce({
      success: false,
      error: 'Fiscal year 2026 is archived. Unarchive to make changes.',
    })
    render(
      <FlagDeductionForm
        transactionId="txn-1"
        householdId="hh-1"
        defaultFiscalYear={2026}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /flag|save/i }))
    await waitFor(() => {
      expect(screen.getAllByText(/archived/i).length).toBeGreaterThan(0)
    })
  })
})
