import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SavingsRate } from './SavingsRate'

describe('SavingsRate', () => {
  it('renders Healthy status for >20% savings rate', () => {
    render(<SavingsRate savingsRate={30} totalIncome={10000000} totalExpenses={7000000} />)
    expect(screen.getByText(/30\.00%/)).toBeInTheDocument()
    expect(screen.getAllByText(/healthy/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders Caution status for 10-20% savings rate', () => {
    render(<SavingsRate savingsRate={15} totalIncome={10000000} totalExpenses={8500000} />)
    expect(screen.getByText(/15\.00%/)).toBeInTheDocument()
    expect(screen.getAllByText(/caution/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders Needs Attention status for <10% savings rate', () => {
    render(<SavingsRate savingsRate={5} totalIncome={10000000} totalExpenses={9500000} />)
    expect(screen.getByText(/5\.00%/)).toBeInTheDocument()
    expect(screen.getAllByText(/needs attention/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders N/A when savingsRate is null', () => {
    render(<SavingsRate savingsRate={null} totalIncome={0} totalExpenses={500000} />)
    expect(screen.getByText(/n\/a/i)).toBeInTheDocument()
    expect(screen.getAllByText(/needs attention/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders Needs Attention for negative savings rate', () => {
    render(<SavingsRate savingsRate={-10} totalIncome={10000000} totalExpenses={11000000} />)
    expect(screen.getByText(/-10\.00%/)).toBeInTheDocument()
    expect(screen.getAllByText(/needs attention/i).length).toBeGreaterThanOrEqual(1)
  })

  it('displays total income and total expenses', () => {
    render(<SavingsRate savingsRate={20} totalIncome={10000000} totalExpenses={8000000} />)
    expect(screen.getByText(/10\.000\.000/)).toBeInTheDocument()
    expect(screen.getByText(/8\.000\.000/)).toBeInTheDocument()
  })
})
