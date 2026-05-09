import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DailySpendingPower } from './DailySpendingPower'

describe('DailySpendingPower', () => {
  it('displays formatted positive amount', () => {
    render(<DailySpendingPower amount={100000} isOverbudget={false} />)

    expect(screen.getByText(/Rp 100\.000/)).toBeInTheDocument()
  })

  it('displays zero in red when overbudget', () => {
    render(<DailySpendingPower amount={0} isOverbudget={true} />)

    const element = screen.getByText(/Rp 0/)
    expect(element).toBeInTheDocument()
    expect(element).toHaveClass('text-red-600')
  })

  it('does not show red styling when not overbudget', () => {
    render(<DailySpendingPower amount={0} isOverbudget={false} />)

    const element = screen.getByText(/Rp 0/)
    expect(element).not.toHaveClass('text-red-600')
  })

  it('shows supplementary overbudget text when overbudget', () => {
    render(
      <DailySpendingPower amount={0} isOverbudget={true} overbudgetAmount={500000} />
    )

    expect(screen.getByText(/over budget/i)).toBeInTheDocument()
  })

  it('uses tabular-nums class', () => {
    render(<DailySpendingPower amount={100000} isOverbudget={false} />)

    expect(screen.getByText(/Rp 100\.000/)).toHaveClass('tabular-nums')
  })
})
