import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MonthlyComparison } from './MonthlyComparison'

describe('MonthlyComparison', () => {
  it('displays both month totals and difference', () => {
    render(
      <MonthlyComparison
        currentMonthTotal={5500000}
        previousMonthTotal={5000000}
        currentMonthLabel="May 2026"
        previousMonthLabel="April 2026"
      />
    )
    expect(screen.getByText(/may 2026/i)).toBeInTheDocument()
    expect(screen.getByText(/april 2026/i)).toBeInTheDocument()
  })

  it('shows percentage change and directional indicator for increase', () => {
    render(
      <MonthlyComparison
        currentMonthTotal={5500000}
        previousMonthTotal={5000000}
        currentMonthLabel="May 2026"
        previousMonthLabel="April 2026"
      />
    )
    expect(screen.getByText(/10%/)).toBeInTheDocument()
  })

  it('highlights significant increase (>10%) with alert styling', () => {
    render(
      <MonthlyComparison
        currentMonthTotal={6000000}
        previousMonthTotal={5000000}
        currentMonthLabel="May 2026"
        previousMonthLabel="April 2026"
      />
    )
    const alertElement = screen.getByText(/20%/)
    expect(alertElement).toBeInTheDocument()
  })

  it('shows decrease with downward indicator', () => {
    render(
      <MonthlyComparison
        currentMonthTotal={4500000}
        previousMonthTotal={5000000}
        currentMonthLabel="May 2026"
        previousMonthLabel="April 2026"
      />
    )
    expect(screen.getByText(/-10%/)).toBeInTheDocument()
  })

  it('shows no data when previous month total is zero', () => {
    render(
      <MonthlyComparison
        currentMonthTotal={5000000}
        previousMonthTotal={0}
        currentMonthLabel="May 2026"
        previousMonthLabel="April 2026"
      />
    )
    expect(screen.getByText(/no data/i)).toBeInTheDocument()
  })
})
