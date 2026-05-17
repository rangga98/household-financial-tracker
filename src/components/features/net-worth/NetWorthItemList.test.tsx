import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NetWorthItemList } from './NetWorthItemList'
import type { NetWorthItem } from '@/types/net-worth'

const makeItem = (overrides: Partial<NetWorthItem>): NetWorthItem => ({
  id: 'item-1',
  householdId: 'hh-1',
  name: 'Test Item',
  amount: 10_000_000,
  type: 'CURRENT_ASSET',
  isActive: true,
  createdAt: '2026-05-17T00:00:00Z',
  updatedAt: '2026-05-17T00:00:00Z',
  ...overrides,
})

const mockOnEdit = vi.fn()
const mockOnDelete = vi.fn()

describe('NetWorthItemList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows empty state when no items exist', () => {
    render(<NetWorthItemList items={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    expect(screen.getByText(/add your first asset or liability/i)).toBeInTheDocument()
  })

  it('renders CURRENT_ASSET items under Current Assets group', () => {
    const items = [makeItem({ name: 'Savings Account', type: 'CURRENT_ASSET', amount: 50_000_000 })]
    render(<NetWorthItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    expect(screen.getByText(/current assets/i)).toBeInTheDocument()
    expect(screen.getByText('Savings Account')).toBeInTheDocument()
  })

  it('renders NON_CURRENT_ASSET items under Non-Current Assets group', () => {
    const items = [makeItem({ name: 'House', type: 'NON_CURRENT_ASSET', amount: 500_000_000 })]
    render(<NetWorthItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    expect(screen.getByText(/non-current assets/i)).toBeInTheDocument()
    expect(screen.getByText('House')).toBeInTheDocument()
  })

  it('renders LIABILITY items under Liabilities group', () => {
    const items = [makeItem({ name: 'Home Mortgage', type: 'LIABILITY', amount: 200_000_000 })]
    render(<NetWorthItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    expect(screen.getByText(/liabilities/i)).toBeInTheDocument()
    expect(screen.getByText('Home Mortgage')).toBeInTheDocument()
  })

  it('renders all three groups when items of each type exist', () => {
    const items = [
      makeItem({ id: '1', name: 'Savings', type: 'CURRENT_ASSET' }),
      makeItem({ id: '2', name: 'House', type: 'NON_CURRENT_ASSET' }),
      makeItem({ id: '3', name: 'Mortgage', type: 'LIABILITY' }),
    ]
    render(<NetWorthItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    expect(screen.getAllByText(/current assets/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/non-current assets/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/liabilities/i).length).toBeGreaterThanOrEqual(1)
  })

  it('only shows groups that have items', () => {
    const items = [makeItem({ name: 'Savings', type: 'CURRENT_ASSET' })]
    render(<NetWorthItemList items={items} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    expect(screen.getAllByText(/current assets/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText(/non-current assets/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/liabilities/i)).not.toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const item = makeItem({ name: 'Savings Account' })
    render(<NetWorthItemList items={[item]} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    fireEvent.click(screen.getByRole('button', { name: /edit savings account/i }))

    expect(mockOnEdit).toHaveBeenCalledWith(item)
  })

  it('calls onDelete when delete button is clicked', () => {
    const item = makeItem({ id: 'item-99', name: 'Old Mortgage' })
    render(<NetWorthItemList items={[item]} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    fireEvent.click(screen.getByRole('button', { name: /delete old mortgage/i }))

    expect(mockOnDelete).toHaveBeenCalledWith('item-99')
  })
})
