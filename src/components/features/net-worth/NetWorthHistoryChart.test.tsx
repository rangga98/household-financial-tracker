import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NetWorthHistoryChart } from './NetWorthHistoryChart'
import type { NetWorthSnapshot } from '@/types/net-worth'

vi.mock('@tremor/react', () => ({
  AreaChart: ({ data, noDataText }: { data: unknown[]; noDataText?: string }) => (
    <div data-testid="area-chart" data-count={data.length}>
      {data.length === 0 && noDataText && <span>{noDataText}</span>}
    </div>
  ),
}))

const makeSnapshot = (date: string, netWorth: number): NetWorthSnapshot => ({
  id: `snap-${date}`,
  householdId: 'hh-1',
  snapshotDate: date,
  totalCurrentAssets: netWorth > 0 ? netWorth : 0,
  totalNonCurrentAssets: 0,
  totalAssets: netWorth > 0 ? netWorth : 0,
  totalLiabilities: netWorth < 0 ? Math.abs(netWorth) : 0,
  netWorth,
  createdAt: `${date}T00:00:00Z`,
})

describe('NetWorthHistoryChart', () => {
  it('renders chart with multiple snapshots', () => {
    const snapshots = [
      makeSnapshot('2026-01-01', 100_000_000),
      makeSnapshot('2026-02-01', 150_000_000),
      makeSnapshot('2026-03-01', 200_000_000),
    ]
    render(<NetWorthHistoryChart snapshots={snapshots} />)

    const chart = screen.getByTestId('area-chart')
    expect(chart).toBeInTheDocument()
    expect(chart.getAttribute('data-count')).toBe('3')
  })

  it('shows helper text when only 1 snapshot exists', () => {
    const snapshots = [makeSnapshot('2026-01-01', 100_000_000)]
    render(<NetWorthHistoryChart snapshots={snapshots} />)

    expect(screen.getByText(/update your net worth again/i)).toBeInTheDocument()
  })

  it('shows no-data text when snapshots is empty', () => {
    render(<NetWorthHistoryChart snapshots={[]} />)

    expect(screen.getByText(/no history yet/i)).toBeInTheDocument()
  })

  it('renders chart heading', () => {
    const snapshots = [makeSnapshot('2026-01-01', 100_000_000)]
    render(<NetWorthHistoryChart snapshots={snapshots} />)

    expect(screen.getByText(/net worth over time/i)).toBeInTheDocument()
  })
})
