import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NetWorthSummaryCard } from './NetWorthSummaryCard'
import type { NetWorthSummary } from '@/types/net-worth'

const positiveSummary: NetWorthSummary = {
  totalCurrentAssets: 60_000_000,
  totalNonCurrentAssets: 500_000_000,
  totalAssets: 560_000_000,
  totalLiabilities: 200_000_000,
  netWorth: 360_000_000,
  isPositive: true,
}

const negativeSummary: NetWorthSummary = {
  totalCurrentAssets: 5_000_000,
  totalNonCurrentAssets: 0,
  totalAssets: 5_000_000,
  totalLiabilities: 20_000_000,
  netWorth: -15_000_000,
  isPositive: false,
}

const zeroSummary: NetWorthSummary = {
  totalCurrentAssets: 0,
  totalNonCurrentAssets: 0,
  totalAssets: 0,
  totalLiabilities: 0,
  netWorth: 0,
  isPositive: true,
}

describe('NetWorthSummaryCard', () => {
  it('renders all five metric labels', () => {
    render(<NetWorthSummaryCard summary={positiveSummary} />)

    expect(screen.getByText('Current Assets')).toBeInTheDocument()
    expect(screen.getByText('Non-Current Assets')).toBeInTheDocument()
    expect(screen.getByText('Total Assets')).toBeInTheDocument()
    expect(screen.getByText('Total Liabilities')).toBeInTheDocument()
    expect(screen.getByText('Net Worth')).toBeInTheDocument()
  })

  it('applies green styling for positive net worth', () => {
    render(<NetWorthSummaryCard summary={positiveSummary} />)

    const netWorthSection = screen.getByTestId('net-worth-value')
    expect(netWorthSection.className).toMatch(/green/)
  })

  it('applies red styling for negative net worth', () => {
    render(<NetWorthSummaryCard summary={negativeSummary} />)

    const netWorthSection = screen.getByTestId('net-worth-value')
    expect(netWorthSection.className).toMatch(/red/)
  })

  it('applies green styling when net worth is zero', () => {
    render(<NetWorthSummaryCard summary={zeroSummary} />)

    const netWorthSection = screen.getByTestId('net-worth-value')
    expect(netWorthSection.className).toMatch(/green/)
  })

  it('renders all zero values when summary is empty', () => {
    render(<NetWorthSummaryCard summary={zeroSummary} />)

    const zeros = screen.getAllByText('Rp 0')
    expect(zeros.length).toBeGreaterThanOrEqual(5)
  })
})
