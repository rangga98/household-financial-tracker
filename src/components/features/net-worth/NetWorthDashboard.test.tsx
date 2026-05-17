import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NetWorthDashboard } from './NetWorthDashboard'
import type { NetWorthItem, NetWorthSnapshot, NetWorthSummary } from '@/types/net-worth'

vi.mock('@tremor/react', () => ({
  AreaChart: ({ data, noDataText }: { data: unknown[]; noDataText?: string }) => (
    <div data-testid="area-chart" data-count={data.length}>
      {data.length === 0 && noDataText && <span>{noDataText}</span>}
    </div>
  ),
}))

vi.mock('@/app/actions/net-worth', () => ({
  createNetWorthItem: vi.fn().mockResolvedValue({ success: true, data: {} }),
  updateNetWorthItem: vi.fn().mockResolvedValue({ success: true, data: {} }),
  deleteNetWorthItem: vi.fn().mockResolvedValue({ success: true, data: undefined }),
  recordSnapshot: vi.fn().mockResolvedValue({ success: true, data: {} }),
}))

const mockItem: NetWorthItem = {
  id: 'item-1',
  householdId: 'hh-1',
  name: 'Savings Account',
  amount: 50_000_000,
  type: 'CURRENT_ASSET',
  isActive: true,
  createdAt: '2026-05-17T00:00:00Z',
  updatedAt: '2026-05-17T00:00:00Z',
}

const mockSummary: NetWorthSummary = {
  totalCurrentAssets: 50_000_000,
  totalNonCurrentAssets: 0,
  totalAssets: 50_000_000,
  totalLiabilities: 0,
  netWorth: 50_000_000,
  isPositive: true,
}

const mockSnapshots: NetWorthSnapshot[] = []

const DEFAULT_PROPS = {
  initialItems: [mockItem],
  initialSummary: mockSummary,
  initialSnapshots: mockSnapshots,
  householdId: 'hh-1',
}

describe('NetWorthDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page title', () => {
    render(<NetWorthDashboard {...DEFAULT_PROPS} />)

    expect(screen.getAllByText(/net worth/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders summary card section', () => {
    render(<NetWorthDashboard {...DEFAULT_PROPS} />)

    expect(screen.getAllByText('Current Assets').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Net Worth').length).toBeGreaterThanOrEqual(1)
  })

  it('renders item list', () => {
    render(<NetWorthDashboard {...DEFAULT_PROPS} />)

    expect(screen.getByText('Savings Account')).toBeInTheDocument()
  })

  it('renders empty state when no items', () => {
    render(
      <NetWorthDashboard
        {...DEFAULT_PROPS}
        initialItems={[]}
        initialSummary={{
          totalCurrentAssets: 0,
          totalNonCurrentAssets: 0,
          totalAssets: 0,
          totalLiabilities: 0,
          netWorth: 0,
          isPositive: true,
        }}
      />
    )

    expect(screen.getAllByText(/add your first asset or liability/i).length).toBeGreaterThanOrEqual(1)
  })

  it('opens Add Item dialog when Add button is clicked', () => {
    render(<NetWorthDashboard {...DEFAULT_PROPS} />)

    fireEvent.click(screen.getByRole('button', { name: /add item/i }))

    expect(screen.getByLabelText(/item name/i)).toBeInTheDocument()
  })

  it('closes dialog when cancel is clicked', async () => {
    render(<NetWorthDashboard {...DEFAULT_PROPS} />)

    fireEvent.click(screen.getByRole('button', { name: /add item/i }))
    expect(screen.getByLabelText(/item name/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByLabelText(/item name/i)).not.toBeInTheDocument()
    })
  })
})
