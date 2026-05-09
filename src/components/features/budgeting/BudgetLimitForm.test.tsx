import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BudgetLimitForm } from './BudgetLimitForm'
import type { Category } from '@/types'

const mockCategories: Category[] = [
  {
    id: 'cat-1',
    householdId: 'hh-1',
    name: 'Dining Out',
    type: 'variable',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-2',
    householdId: 'hh-1',
    name: 'Hobbies',
    type: 'variable',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-3',
    householdId: 'hh-1',
    name: 'Electricity',
    type: 'fixed',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

describe('BudgetLimitForm', () => {
  it('renders with variable categories only', () => {
    render(<BudgetLimitForm categories={mockCategories} onSave={vi.fn()} />)

    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByText('Dining Out')).toBeInTheDocument()
    expect(screen.getByText('Hobbies')).toBeInTheDocument()
    expect(screen.queryByText('Electricity')).not.toBeInTheDocument()
  })

  it('calls onSave with correct values', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<BudgetLimitForm categories={mockCategories} onSave={onSave} />)

    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'cat-1' },
    })
    fireEvent.change(screen.getByLabelText(/monthly limit/i), {
      target: { value: '2000000' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save limit/i }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('cat-1', 2000000)
    })
  })

  it('shows error for zero limit', async () => {
    const onSave = vi.fn()
    render(<BudgetLimitForm categories={mockCategories} onSave={onSave} />)

    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'cat-1' },
    })
    fireEvent.change(screen.getByLabelText(/monthly limit/i), {
      target: { value: '0' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save limit/i }))

    expect(await screen.findByText(/must be a positive number/i)).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('shows error for negative limit', async () => {
    const onSave = vi.fn()
    render(<BudgetLimitForm categories={mockCategories} onSave={onSave} />)

    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'cat-1' },
    })
    fireEvent.change(screen.getByLabelText(/monthly limit/i), {
      target: { value: '-1000' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save limit/i }))

    expect(await screen.findByText(/must be a positive number/i)).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('pre-fills limit when editing existing category', () => {
    const categoriesWithLimit = mockCategories.map((c) =>
      c.id === 'cat-1' ? { ...c, monthlyLimit: 1500000 } : c
    )

    render(<BudgetLimitForm categories={categoriesWithLimit} onSave={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'cat-1' },
    })

    expect(screen.getByLabelText(/monthly limit/i)).toHaveValue('1500000')
  })
})
