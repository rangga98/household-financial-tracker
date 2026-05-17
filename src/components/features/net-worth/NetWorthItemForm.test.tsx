import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NetWorthItemForm } from './NetWorthItemForm'

vi.mock('@/app/actions/net-worth', () => ({
  createNetWorthItem: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'item-1',
      householdId: 'hh-1',
      name: 'Emergency Savings',
      amount: 50_000_000,
      type: 'CURRENT_ASSET',
      isActive: true,
      createdAt: '2026-05-17T00:00:00Z',
      updatedAt: '2026-05-17T00:00:00Z',
    },
  }),
  updateNetWorthItem: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'item-1',
      householdId: 'hh-1',
      name: 'Updated Savings',
      amount: 75_000_000,
      type: 'CURRENT_ASSET',
      isActive: true,
      createdAt: '2026-05-17T00:00:00Z',
      updatedAt: '2026-05-17T00:00:00Z',
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

describe('NetWorthItemForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders name, amount, and type fields', () => {
    render(<NetWorthItemForm {...DEFAULT_PROPS} />)

    expect(screen.getByLabelText(/item name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument()
  })

  it('shows validation error when name is empty on submit', async () => {
    render(<NetWorthItemForm {...DEFAULT_PROPS} />)

    fireEvent.click(screen.getByRole('button', { name: /add item/i }))

    await waitFor(() => {
      expect(screen.getByText(/item name is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when amount is zero', async () => {
    render(<NetWorthItemForm {...DEFAULT_PROPS} />)

    fireEvent.change(screen.getByLabelText(/item name/i), { target: { value: 'My Asset' } })
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: /add item/i }))

    await waitFor(() => {
      expect(screen.getByText(/amount must be greater than zero/i)).toBeInTheDocument()
    })
  })

  it('calls createNetWorthItem and onSuccess on valid CURRENT_ASSET submission', async () => {
    const { createNetWorthItem } = await import('@/app/actions/net-worth')
    render(<NetWorthItemForm {...DEFAULT_PROPS} />)

    fireEvent.change(screen.getByLabelText(/item name/i), { target: { value: 'Emergency Savings' } })
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '50000000' } })
    fireEvent.click(screen.getByRole('button', { name: /add item/i }))

    await waitFor(() => {
      expect(createNetWorthItem).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Emergency Savings',
          amount: 50_000_000,
          type: 'CURRENT_ASSET',
          householdId: 'hh-1',
        })
      )
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('allows selecting NON_CURRENT_ASSET type', async () => {
    render(<NetWorthItemForm {...DEFAULT_PROPS} />)

    const select = screen.getByLabelText(/type/i)
    fireEvent.change(select, { target: { value: 'NON_CURRENT_ASSET' } })

    expect((select as HTMLSelectElement).value).toBe('NON_CURRENT_ASSET')
  })

  it('allows selecting LIABILITY type', async () => {
    render(<NetWorthItemForm {...DEFAULT_PROPS} />)

    const select = screen.getByLabelText(/type/i)
    fireEvent.change(select, { target: { value: 'LIABILITY' } })

    expect((select as HTMLSelectElement).value).toBe('LIABILITY')
  })

  it('pre-fills form in edit mode with initialValues', () => {
    render(
      <NetWorthItemForm
        {...DEFAULT_PROPS}
        mode="edit"
        initialValues={{
          id: 'item-1',
          householdId: 'hh-1',
          name: 'Existing Asset',
          amount: 50_000_000,
          type: 'NON_CURRENT_ASSET',
          isActive: true,
          createdAt: '2026-05-17T00:00:00Z',
          updatedAt: '2026-05-17T00:00:00Z',
        }}
      />
    )

    expect(screen.getByDisplayValue('Existing Asset')).toBeInTheDocument()
    expect(screen.getByDisplayValue('50000000')).toBeInTheDocument()
    expect((screen.getByLabelText(/type/i) as HTMLSelectElement).value).toBe('NON_CURRENT_ASSET')
  })

  it('calls updateNetWorthItem in edit mode', async () => {
    const { updateNetWorthItem } = await import('@/app/actions/net-worth')
    render(
      <NetWorthItemForm
        {...DEFAULT_PROPS}
        mode="edit"
        initialValues={{
          id: 'item-1',
          householdId: 'hh-1',
          name: 'Old Name',
          amount: 10_000_000,
          type: 'CURRENT_ASSET',
          isActive: true,
          createdAt: '2026-05-17T00:00:00Z',
          updatedAt: '2026-05-17T00:00:00Z',
        }}
      />
    )

    fireEvent.change(screen.getByLabelText(/item name/i), { target: { value: 'Updated Savings' } })
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '75000000' } })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(updateNetWorthItem).toHaveBeenCalledWith(
        'item-1',
        expect.objectContaining({ name: 'Updated Savings', amount: 75_000_000 })
      )
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<NetWorthItemForm {...DEFAULT_PROPS} />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockOnCancel).toHaveBeenCalled()
  })
})
