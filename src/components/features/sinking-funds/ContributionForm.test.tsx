import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ContributionForm } from './ContributionForm'

vi.mock('@/app/actions/sinking-funds', () => ({
  recordContribution: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'tx-1',
      goalId: 'fund-1',
      amount: 5_000_000,
      transactionDate: '2026-05-12',
      notes: null,
    },
  }),
}))

const mockOnSuccess = vi.fn()
const mockOnCancel = vi.fn()

const DEFAULT_PROPS = {
  goalId: 'fund-1',
  goalName: 'New Car',
  householdId: 'hh-1',
  onSuccess: mockOnSuccess,
  onCancel: mockOnCancel,
}

describe('ContributionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders amount, transactionDate and notes fields', () => {
    render(<ContributionForm {...DEFAULT_PROPS} />)

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
  })

  it('defaults transactionDate to today', () => {
    render(<ContributionForm {...DEFAULT_PROPS} />)

    const today = new Date().toISOString().split('T')[0]
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
    expect(dateInput.value).toBe(today)
  })

  it('shows validation error when amount is empty', async () => {
    render(<ContributionForm {...DEFAULT_PROPS} />)

    fireEvent.click(screen.getByRole('button', { name: /save|add contribution/i }))

    await waitFor(() => {
      expect(screen.getByText(/amount.*required|required.*amount/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when amount is zero', async () => {
    render(<ContributionForm {...DEFAULT_PROPS} />)

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: /save|add contribution/i }))

    await waitFor(() => {
      expect(screen.getByText(/greater than zero/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when amount is negative', async () => {
    render(<ContributionForm {...DEFAULT_PROPS} />)

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '-1000' } })
    fireEvent.click(screen.getByRole('button', { name: /save|add contribution/i }))

    await waitFor(() => {
      expect(screen.getByText(/greater than zero/i)).toBeInTheDocument()
    })
  })

  it('calls recordContribution and onSuccess on valid submission', async () => {
    const { recordContribution } = await import('@/app/actions/sinking-funds')
    render(<ContributionForm {...DEFAULT_PROPS} />)

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '5000000' } })
    fireEvent.click(screen.getByRole('button', { name: /save|add contribution/i }))

    await waitFor(() => {
      expect(recordContribution).toHaveBeenCalledWith(
        expect.objectContaining({ goalId: 'fund-1', amount: 5_000_000 })
      )
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<ContributionForm {...DEFAULT_PROPS} />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockOnCancel).toHaveBeenCalled()
  })
})
