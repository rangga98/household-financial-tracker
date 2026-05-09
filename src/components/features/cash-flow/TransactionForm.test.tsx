import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionForm } from './TransactionForm'
import type { Category } from '@/types'

const mockCategories: Category[] = [
  {
    id: 'c1',
    householdId: 'h1',
    name: 'Groceries',
    type: 'variable',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'c2',
    householdId: 'h1',
    name: 'Electricity',
    type: 'fixed',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

describe('TransactionForm', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('renders income and expense buttons', () => {
    render(
      <TransactionForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        currentUserId="u1"
      />
    )

    expect(screen.getByText('Income')).toBeDefined()
    expect(screen.getByText('Expense')).toBeDefined()
  })

  it('shows validation error for empty amount', async () => {
    render(
      <TransactionForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        currentUserId="u1"
      />
    )

    const submitButton = screen.getByText('Save Transaction')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Amount is required')).toBeDefined()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error for empty category', async () => {
    render(
      <TransactionForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        currentUserId="u1"
      />
    )

    const amountInput = screen.getByPlaceholderText('Rp 0')
    await userEvent.type(amountInput, '50000')

    const submitButton = screen.getByText('Save Transaction')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Category is required')).toBeDefined()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    render(
      <TransactionForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        currentUserId="u1"
      />
    )

    const amountInput = screen.getByPlaceholderText('Rp 0')
    await userEvent.type(amountInput, '50000')

    const categorySelect = screen.getByRole('combobox')
    await userEvent.selectOptions(categorySelect, 'c1')

    const submitButton = screen.getByText('Save Transaction')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'expense',
          amount: 50000,
          categoryId: 'c1',
        })
      )
    })
  })

  it('switches between income and expense', async () => {
    render(
      <TransactionForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        currentUserId="u1"
      />
    )

    const incomeButton = screen.getByText('Income')
    await userEvent.click(incomeButton)

    const amountInput = screen.getByPlaceholderText('Rp 0')
    await userEvent.type(amountInput, '100000')

    const categorySelect = screen.getByRole('combobox')
    await userEvent.selectOptions(categorySelect, 'c1')

    const submitButton = screen.getByText('Save Transaction')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'income',
          amount: 100000,
        })
      )
    })
  })
})
