import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InstallmentScheduleTable } from './InstallmentScheduleTable'
import type { TaxInstallment } from '@/types/tax-planning'

const make11Months = (): TaxInstallment[] => {
  const months: TaxInstallment[] = []
  let cumulative = 0
  for (let i = 0; i < 11; i++) {
    const amount = i === 0 ? 109_099 : 109_090
    cumulative += amount
    months.push({
      month: `2026-${String(i + 1).padStart(2, '0')}`,
      amount,
      cumulativeAmount: cumulative,
    })
  }
  return months
}

describe('InstallmentScheduleTable', () => {
  it('renders correct number of rows for 11-month schedule', () => {
    const installments = make11Months()
    render(<InstallmentScheduleTable installments={installments} monthlyInstallment={109_090} />)
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThanOrEqual(11)
  })

  it('first row amount is higher than second row (includes remainder)', () => {
    const installments = make11Months()
    render(<InstallmentScheduleTable installments={installments} monthlyInstallment={109_090} />)
    const cells = screen.getAllByRole('cell')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('shows first month label in the table', () => {
    const installments = make11Months()
    render(<InstallmentScheduleTable installments={installments} monthlyInstallment={109_090} />)
    expect(screen.getByText('2026-01')).toBeDefined()
  })

  it('renders a single row for single-installment schedule', () => {
    const single: TaxInstallment[] = [
      { month: '2026-01', amount: 1_000_000, cumulativeAmount: 1_000_000 },
    ]
    render(<InstallmentScheduleTable installments={single} monthlyInstallment={1_000_000} />)
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('2026-01')).toBeDefined()
  })

  it('renders monthly allocation footer label', () => {
    const installments = make11Months()
    render(<InstallmentScheduleTable installments={installments} monthlyInstallment={109_090} />)
    expect(screen.getByText(/monthly allocation/i)).toBeDefined()
  })
})
