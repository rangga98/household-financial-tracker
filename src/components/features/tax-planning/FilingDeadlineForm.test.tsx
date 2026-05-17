import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilingDeadlineForm } from './FilingDeadlineForm'

vi.mock('@/app/actions/tax-planning', () => ({
  createFilingDeadline: vi.fn().mockResolvedValue({ success: true, data: {} }),
}))

describe('FilingDeadlineForm', () => {
  it('renders all required fields', () => {
    render(
      <FilingDeadlineForm householdId="hh-1" onSuccess={vi.fn()} onCancel={vi.fn()} />
    )
    expect(screen.getByLabelText(/tax type/i)).toBeDefined()
    expect(screen.getByLabelText(/fiscal year/i)).toBeDefined()
    expect(screen.getByLabelText(/filing deadline/i)).toBeDefined()
  })

  it('shows validation error when fiscal year is empty on submit', async () => {
    render(
      <FilingDeadlineForm householdId="hh-1" onSuccess={vi.fn()} onCancel={vi.fn()} />
    )
    await userEvent.click(screen.getByRole('button', { name: /create|save/i }))
    await waitFor(() => {
      expect(screen.getAllByText(/year.*required|required.*year/i).length).toBeGreaterThan(0)
    })
  })

  it('shows server duplicate error as form-level error', async () => {
    const { createFilingDeadline } = await import('@/app/actions/tax-planning')
    vi.mocked(createFilingDeadline).mockResolvedValueOnce({
      success: false,
      error: 'Duplicate filing deadline for this tax type and fiscal year',
    })

    render(
      <FilingDeadlineForm householdId="hh-1" onSuccess={vi.fn()} onCancel={vi.fn()} />
    )
    const yearInput = screen.getByLabelText(/fiscal year/i)
    const deadlineInput = screen.getByLabelText(/filing deadline/i)
    await userEvent.type(yearInput, '2026')
    await userEvent.type(deadlineInput, '2027-03-31')
    await userEvent.click(screen.getByRole('button', { name: /create|save/i }))
    await waitFor(() => {
      expect(screen.getAllByText(/duplicate/i).length).toBeGreaterThan(0)
    })
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    render(
      <FilingDeadlineForm householdId="hh-1" onSuccess={vi.fn()} onCancel={onCancel} />
    )
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
