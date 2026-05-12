import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FundList } from './FundList'
import type { SinkingFund } from '@/types/sinking-funds'

const mockFund1: SinkingFund = {
  id: 'fund-1',
  householdId: 'hh-1',
  name: 'New Car',
  targetAmount: 50_000_000,
  currentAmount: 10_000_000,
  targetDate: null,
  description: null,
  createdAt: '2026-05-12T00:00:00Z',
  updatedAt: '2026-05-12T00:00:00Z',
}

const mockFund2: SinkingFund = {
  ...mockFund1,
  id: 'fund-2',
  name: 'Home Renovation',
  targetAmount: 80_000_000,
  currentAmount: 0,
}

const mockHandlers = {
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onAddContribution: vi.fn(),
}

describe('FundList', () => {
  it('renders empty-state CTA when funds array is empty', () => {
    render(<FundList funds={[]} {...mockHandlers} />)
    expect(screen.getByText(/create your first fund/i)).toBeInTheDocument()
  })

  it('renders one SinkingFundCard per fund', () => {
    render(<FundList funds={[mockFund1, mockFund2]} {...mockHandlers} />)
    expect(screen.getByText('New Car')).toBeInTheDocument()
    expect(screen.getByText('Home Renovation')).toBeInTheDocument()
  })

  it('renders exactly the number of cards matching the funds array length', () => {
    render(<FundList funds={[mockFund1, mockFund2]} {...mockHandlers} />)
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    expect(editButtons).toHaveLength(2)
  })
})
