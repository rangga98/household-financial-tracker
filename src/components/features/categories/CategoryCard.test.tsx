import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryCard } from './CategoryCard'
import { ToastProvider } from '@/components/features/cash-flow/Toast'
import type { CustomCategory } from '@/lib/supabase/categories'

const mockCategory: CustomCategory = {
  id: 'c1',
  householdId: 'h1',
  name: 'Groceries',
  type: 'variable',
  icon: 'shopping-cart',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
}

function renderWithToast(ui: React.ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>)
}

describe('CategoryCard', () => {
  const mockOnUpdate = vi.fn()

  beforeEach(() => {
    mockOnUpdate.mockClear()
  })

  it('renders category name and type', () => {
    renderWithToast(<CategoryCard category={mockCategory} onUpdate={mockOnUpdate} />)

    expect(screen.getByText('Groceries')).toBeDefined()
    expect(screen.getByText('variable')).toBeDefined()
  })

  it('shows edit and delete buttons', () => {
    renderWithToast(<CategoryCard category={mockCategory} onUpdate={mockOnUpdate} />)

    expect(screen.getByLabelText('Edit category')).toBeDefined()
    expect(screen.getByLabelText('Delete category')).toBeDefined()
  })

  it('opens confirmation dialog on delete click', async () => {
    renderWithToast(<CategoryCard category={mockCategory} onUpdate={mockOnUpdate} />)

    const deleteButton = screen.getByLabelText('Delete category')
    await userEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText('Delete Category?')).toBeDefined()
    })

    expect(screen.getByText(/Are you sure you want to delete/)).toBeDefined()
  })

  it('closes confirmation dialog on cancel', async () => {
    renderWithToast(<CategoryCard category={mockCategory} onUpdate={mockOnUpdate} />)

    const deleteButton = screen.getByLabelText('Delete category')
    await userEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeDefined()
    })

    const cancelButton = screen.getByText('Cancel')
    await userEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText('Delete Category?')).toBeNull()
    })
  })
})
