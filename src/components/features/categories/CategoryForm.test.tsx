import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryForm } from './CategoryForm'
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

describe('CategoryForm', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('renders all form fields', () => {
    render(
      <CategoryForm
        householdId="h1"
        onSubmit={mockOnSubmit}
      />
    )

    expect(screen.getByLabelText(/category name/i)).toBeDefined()
    expect(screen.getByLabelText(/type/i)).toBeDefined()
    expect(screen.getByText(/save category/i)).toBeDefined()
  })

  it('shows validation error for empty name', async () => {
    render(
      <CategoryForm
        householdId="h1"
        onSubmit={mockOnSubmit}
      />
    )

    const submitButton = screen.getByText('Save Category')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Category name is required')).toBeDefined()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error for name exceeding 100 characters', async () => {
    render(
      <CategoryForm
        householdId="h1"
        onSubmit={mockOnSubmit}
      />
    )

    const nameInput = screen.getByLabelText(/category name/i)
    await userEvent.type(nameInput, 'a'.repeat(101))

    const submitButton = screen.getByText('Save Category')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Category name must be 100 characters or less')).toBeDefined()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    render(
      <CategoryForm
        householdId="h1"
        onSubmit={mockOnSubmit}
      />
    )

    const nameInput = screen.getByLabelText(/category name/i)
    await userEvent.type(nameInput, 'New Category')

    const typeSelect = screen.getByLabelText(/type/i)
    await userEvent.selectOptions(typeSelect, 'fixed')

    const submitButton = screen.getByText('Save Category')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Category',
          type: 'fixed',
          icon: expect.any(String),
        })
      )
    })
  })

  it('renders in edit mode with pre-filled values', () => {
    render(
      <CategoryForm
        householdId="h1"
        onSubmit={mockOnSubmit}
        category={mockCategory}
      />
    )

    const nameInput = screen.getByLabelText(/category name/i) as HTMLInputElement
    expect(nameInput.value).toBe('Groceries')

    const typeSelect = screen.getByLabelText(/type/i) as HTMLSelectElement
    expect(typeSelect.value).toBe('variable')

    expect(screen.getByText('Update Category')).toBeDefined()
  })

  it('calls onSubmit with updated values in edit mode', async () => {
    render(
      <CategoryForm
        householdId="h1"
        onSubmit={mockOnSubmit}
        category={mockCategory}
      />
    )

    const nameInput = screen.getByLabelText(/category name/i)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Updated Name')

    const submitButton = screen.getByText('Update Category')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Name',
          type: 'variable',
        })
      )
    })
  })
})
