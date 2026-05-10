import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryFilter } from './CategoryFilter'

describe('CategoryFilter', () => {
  const mockOnFilterChange = vi.fn()
  const mockOnSearchChange = vi.fn()

  it('renders search input', () => {
    render(
      <CategoryFilter
        filterType="all"
        onFilterTypeChange={mockOnFilterChange}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
      />
    )

    expect(screen.getByPlaceholderText('Search categories...')).toBeDefined()
  })

  it('renders filter type buttons', () => {
    render(
      <CategoryFilter
        filterType="all"
        onFilterTypeChange={mockOnFilterChange}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
      />
    )

    expect(screen.getByText('all')).toBeDefined()
    expect(screen.getByText('fixed')).toBeDefined()
    expect(screen.getByText('variable')).toBeDefined()
  })

  it('calls onFilterTypeChange when filter button clicked', async () => {
    render(
      <CategoryFilter
        filterType="all"
        onFilterTypeChange={mockOnFilterChange}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
      />
    )

    const fixedButton = screen.getByText('fixed')
    await userEvent.click(fixedButton)

    expect(mockOnFilterChange).toHaveBeenCalledWith('fixed')
  })

  it('calls onSearchChange when typing in search input', async () => {
    render(
      <CategoryFilter
        filterType="all"
        onFilterTypeChange={mockOnFilterChange}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search categories...')
    fireEvent.change(searchInput, { target: { value: 'grocery' } })

    expect(mockOnSearchChange).toHaveBeenCalledWith('grocery')
  })
})
