import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SinkingFundForm } from './SinkingFundForm'

vi.mock('@/app/actions/sinking-funds', () => ({
  createSinkingFund: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'fund-1',
      householdId: 'hh-1',
      name: 'New Car',
      targetAmount: 150_000_000,
      currentAmount: 0,
      targetDate: '2028-12-31',
      description: null,
      createdAt: '2026-05-12T00:00:00Z',
      updatedAt: '2026-05-12T00:00:00Z',
    },
  }),
  updateSinkingFund: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'fund-1',
      householdId: 'hh-1',
      name: 'Updated Car',
      targetAmount: 200_000_000,
      currentAmount: 0,
      targetDate: null,
      description: null,
      createdAt: '2026-05-12T00:00:00Z',
      updatedAt: '2026-05-12T00:00:00Z',
    },
  }),
}))

const mockOnSuccess = vi.fn()
const mockOnCancel = vi.fn()

const DEFAULT_PROPS = {
  mode: 'create' as const,
  householdId: 'hh-1',
  onSuccess: mockOnSuccess,
  onCancel: mockOnCancel,
}

describe('SinkingFundForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders name, targetAmount, targetDate and description fields', () => {
    render(<SinkingFundForm {...DEFAULT_PROPS} />)

    expect(screen.getByLabelText(/fund name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/target amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/target date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('shows validation error when name is empty on submit', async () => {
    render(<SinkingFundForm {...DEFAULT_PROPS} />)

    fireEvent.click(screen.getByRole('button', { name: /create fund/i }))

    await waitFor(() => {
      expect(screen.getByText(/fund name is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when targetAmount is zero', async () => {
    render(<SinkingFundForm {...DEFAULT_PROPS} />)

    fireEvent.change(screen.getByLabelText(/fund name/i), { target: { value: 'My Fund' } })
    fireEvent.change(screen.getByLabelText(/target amount/i), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: /create fund/i }))

    await waitFor(() => {
      expect(screen.getByText(/must be greater than zero/i)).toBeInTheDocument()
    })
  })

  it('calls createSinkingFund and onSuccess on valid create submission', async () => {
    const { createSinkingFund } = await import('@/app/actions/sinking-funds')
    render(<SinkingFundForm {...DEFAULT_PROPS} />)

    fireEvent.change(screen.getByLabelText(/fund name/i), { target: { value: 'New Car' } })
    fireEvent.change(screen.getByLabelText(/target amount/i), { target: { value: '150000000' } })
    fireEvent.click(screen.getByRole('button', { name: /create fund/i }))

    await waitFor(() => {
      expect(createSinkingFund).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Car', targetAmount: 150_000_000 })
      )
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('pre-fills form in edit mode with initialValues', () => {
    render(
      <SinkingFundForm
        {...DEFAULT_PROPS}
        mode="edit"
        initialValues={{
          id: 'fund-1',
          name: 'Existing Fund',
          targetAmount: 50_000_000,
          targetDate: null,
          description: 'My notes',
        }}
      />
    )

    expect(screen.getByDisplayValue('Existing Fund')).toBeInTheDocument()
    expect(screen.getByDisplayValue('50000000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('My notes')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<SinkingFundForm {...DEFAULT_PROPS} />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockOnCancel).toHaveBeenCalled()
  })
})
