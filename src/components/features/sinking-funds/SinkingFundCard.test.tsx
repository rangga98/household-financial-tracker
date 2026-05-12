import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SinkingFundCard } from './SinkingFundCard'
import type { SinkingFund } from '@/types/sinking-funds'

const mockFund: SinkingFund = {
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

const mockHandlers = {
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onAddContribution: vi.fn(),
}

describe('SinkingFundCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the fund name', () => {
    render(<SinkingFundCard fund={mockFund} {...mockHandlers} />)
    expect(screen.getByText('New Car')).toBeInTheDocument()
  })

  it('renders ProgressBar with 20% progress (10M / 50M)', () => {
    render(<SinkingFundCard fund={mockFund} {...mockHandlers} />)
    expect(screen.getByText(/20/)).toBeInTheDocument()
  })

  it('displays amount remaining correctly', () => {
    render(<SinkingFundCard fund={mockFund} {...mockHandlers} />)
    expect(screen.getByText(/40\.000\.000|40,000,000|40 juta/i)).toBeInTheDocument()
  })

  it('does NOT show Overdue badge when targetDate is null', () => {
    render(<SinkingFundCard fund={mockFund} {...mockHandlers} />)
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument()
  })

  it('shows Overdue badge when targetDate is past and not complete', () => {
    const overdueFund: SinkingFund = {
      ...mockFund,
      targetDate: '2020-01-01',
    }
    render(<SinkingFundCard fund={overdueFund} {...mockHandlers} />)
    expect(screen.getByText(/overdue/i)).toBeInTheDocument()
  })

  it('does NOT show Overdue badge when fund is complete even if date is past', () => {
    const completeFund: SinkingFund = {
      ...mockFund,
      targetDate: '2020-01-01',
      currentAmount: 50_000_000,
    }
    render(<SinkingFundCard fund={completeFund} {...mockHandlers} />)
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument()
  })

  it('shows over-funded indicator when progress > 100%', () => {
    const overFundedFund: SinkingFund = {
      ...mockFund,
      currentAmount: 60_000_000,
    }
    render(<SinkingFundCard fund={overFundedFund} {...mockHandlers} />)
    expect(screen.getAllByText(/120|over.?fund/i).length).toBeGreaterThan(0)
  })

  it('fires onEdit when Edit button is clicked', () => {
    render(<SinkingFundCard fund={mockFund} {...mockHandlers} />)
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockFund)
  })

  it('fires onAddContribution when Add Contribution button is clicked', () => {
    render(<SinkingFundCard fund={mockFund} {...mockHandlers} />)
    fireEvent.click(screen.getByRole('button', { name: /add contribution/i }))
    expect(mockHandlers.onAddContribution).toHaveBeenCalledWith(mockFund)
  })

  it('fires onDelete when Delete is confirmed via AlertDialog', async () => {
    render(<SinkingFundCard fund={mockFund} {...mockHandlers} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    const confirmButton = screen.getByRole('button', { name: /confirm|yes|delete/i })
    fireEvent.click(confirmButton)
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('fund-1')
  })

  it('does NOT fire onDelete when AlertDialog is cancelled', () => {
    render(<SinkingFundCard fund={mockFund} {...mockHandlers} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)
    expect(mockHandlers.onDelete).not.toHaveBeenCalled()
  })
})
