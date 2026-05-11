import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FIProjectionChart } from './FIProjectionChart'
import type { FIYearProjection } from '@/types/financial-freedom'

// Mock recharts
vi.mock('recharts', () => ({
  LineChart: () => <div data-testid="line-chart">LineChart</div>,
  Line: () => <div>Line</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  ReferenceLine: () => <div>ReferenceLine</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

describe('FIProjectionChart', () => {
  const mockTrajectory: FIYearProjection[] = [
    { year: 2024, age: 30, netWorth: 100000 },
    { year: 2025, age: 31, netWorth: 150000 },
    { year: 2026, age: 32, netWorth: 210000 },
    { year: 2027, age: 33, netWorth: 280000 },
  ]

  const mockFINumber = 1000000

  it('renders chart with trajectory data', () => {
    render(<FIProjectionChart trajectory={mockTrajectory} fiNumber={mockFINumber} />)

    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('shows chart title', () => {
    render(<FIProjectionChart trajectory={mockTrajectory} fiNumber={mockFINumber} />)

    expect(screen.getByText(/Net Worth Trajectory/i)).toBeInTheDocument()
  })

  it('shows FI target line indicator', () => {
    render(<FIProjectionChart trajectory={mockTrajectory} fiNumber={mockFINumber} />)

    expect(screen.getByText(/FI Target/i)).toBeInTheDocument()
  })

  it('handles empty trajectory', () => {
    render(<FIProjectionChart trajectory={[]} fiNumber={mockFINumber} />)

    expect(screen.getByText(/No projection data/i)).toBeInTheDocument()
  })

  it('shows summary stats', () => {
    render(<FIProjectionChart trajectory={mockTrajectory} fiNumber={mockFINumber} />)

    // Last year in trajectory
    expect(screen.getByText(/2027/)).toBeInTheDocument()
    // Final net worth
    expect(screen.getByText(/280.000/)).toBeInTheDocument()
  })
})
