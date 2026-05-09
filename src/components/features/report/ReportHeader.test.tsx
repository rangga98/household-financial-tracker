import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReportHeader } from './ReportHeader'

describe('ReportHeader', () => {
  it('displays selected month in human-readable format', () => {
    render(
      <ReportHeader
        selectedMonth="2026-05"
        onMonthChange={vi.fn()}
        availableMonths={['2026-05', '2026-04', '2026-03']}
      />
    )
    expect(screen.getByText(/may 2026/i)).toBeInTheDocument()
  })

  it('calls onMonthChange when a new month is selected', () => {
    const onMonthChange = vi.fn()
    render(
      <ReportHeader
        selectedMonth="2026-05"
        onMonthChange={onMonthChange}
        availableMonths={['2026-05', '2026-04', '2026-03']}
      />
    )
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '2026-04' } })
    expect(onMonthChange).toHaveBeenCalledWith('2026-04')
  })

  it('renders all available months as options', () => {
    render(
      <ReportHeader
        selectedMonth="2026-05"
        onMonthChange={vi.fn()}
        availableMonths={['2026-05', '2026-04', '2026-03']}
      />
    )
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)
  })
})
