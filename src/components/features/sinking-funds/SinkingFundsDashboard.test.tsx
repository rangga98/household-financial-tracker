import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SinkingFundsDashboard } from './SinkingFundsDashboard'
import type { SinkingFund } from '@/types/sinking-funds'

vi.mock('@/app/actions/sinking-funds', () => ({
  createSinkingFund: vi.fn().mockResolvedValue({ success: true, data: {} }),
  updateSinkingFund: vi.fn().mockResolvedValue({ success: true, data: {} }),
  deleteSinkingFund: vi.fn().mockResolvedValue({ success: true, data: undefined }),
  recordContribution: vi.fn().mockResolvedValue({ success: true, data: {} }),
}))

const mockFund: SinkingFund = {
  id: 'fund-1',
  householdId: 'hh-1',
  name: 'New Car',
  targetAmount: 150_000_000,
  currentAmount: 0,
  targetDate: '2028-12-31',
  description: null,
  createdAt: '2026-05-12T00:00:00Z',
  updatedAt: '2026-05-12T00:00:00Z',
}

describe('SinkingFundsDashboard', () => {
  it('renders empty state with CTA when no funds', () => {
    render(<SinkingFundsDashboard initialFunds={[]} householdId="hh-1" />)

    expect(screen.getByText(/create your first fund/i)).toBeInTheDocument()
  })

  it('renders fund list when funds are provided', () => {
    render(<SinkingFundsDashboard initialFunds={[mockFund]} householdId="hh-1" />)

    expect(screen.getByText('New Car')).toBeInTheDocument()
  })

  it('opens create fund dialog when Create Fund button is clicked', async () => {
    render(<SinkingFundsDashboard initialFunds={[]} householdId="hh-1" />)

    fireEvent.click(screen.getByRole('button', { name: /create fund/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/fund name/i)).toBeInTheDocument()
    })
  })

  it('renders multiple funds in the list', () => {
    const anotherFund: SinkingFund = {
      ...mockFund,
      id: 'fund-2',
      name: 'Home Renovation',
      targetAmount: 80_000_000,
    }

    render(
      <SinkingFundsDashboard
        initialFunds={[mockFund, anotherFund]}
        householdId="hh-1"
      />
    )

    expect(screen.getByText('New Car')).toBeInTheDocument()
    expect(screen.getByText('Home Renovation')).toBeInTheDocument()
  })
})
