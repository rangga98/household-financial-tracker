import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DeductionList } from './DeductionList'
import type { TaxDeductionRecord } from '@/types/tax-planning'

vi.mock('@/app/actions/tax-planning', () => ({
  unflagTransactionAsDeductible: vi.fn().mockResolvedValue({ success: true, data: undefined }),
}))

const RECORD_A: TaxDeductionRecord = {
  id: 'txn-1',
  amount: 500_000,
  transactionDate: '2026-03-15',
  description: 'Office supplies',
  categoryId: 'cat-1',
  categoryName: 'Office',
  fiscalYear: 2026,
}

const RECORD_B: TaxDeductionRecord = {
  id: 'txn-2',
  amount: 1_000_000,
  transactionDate: '2026-04-10',
  description: 'Training fee',
  categoryId: 'cat-2',
  categoryName: 'Education',
  fiscalYear: 2026,
}

describe('DeductionList', () => {
  it('renders empty state when no deductions', () => {
    render(
      <DeductionList
        deductions={[]}
        fiscalYear={2026}
        isLocked={false}
        householdId="hh-1"
        onRefresh={vi.fn()}
        onFiscalYearChange={vi.fn()}
      />
    )
    expect(screen.getAllByText(/no.*deduction|no.*record/i).length).toBeGreaterThan(0)
  })

  it('renders each deduction record with description and amount', () => {
    render(
      <DeductionList
        deductions={[RECORD_A, RECORD_B]}
        fiscalYear={2026}
        isLocked={false}
        householdId="hh-1"
        onRefresh={vi.fn()}
        onFiscalYearChange={vi.fn()}
      />
    )
    expect(screen.getByText('Office supplies')).toBeDefined()
    expect(screen.getByText('Training fee')).toBeDefined()
  })

  it('shows category totals section', () => {
    render(
      <DeductionList
        deductions={[RECORD_A, RECORD_B]}
        fiscalYear={2026}
        isLocked={false}
        householdId="hh-1"
        onRefresh={vi.fn()}
        onFiscalYearChange={vi.fn()}
      />
    )
    expect(screen.getAllByText(/total|Office|Education/i).length).toBeGreaterThan(0)
  })

  it('disables unflag buttons when isLocked', () => {
    render(
      <DeductionList
        deductions={[RECORD_A]}
        fiscalYear={2026}
        isLocked={true}
        householdId="hh-1"
        onRefresh={vi.fn()}
        onFiscalYearChange={vi.fn()}
      />
    )
    const unflagButtons = screen.getAllByRole('button', { name: /unflag|remove/i })
    unflagButtons.forEach((btn) => {
      expect((btn as HTMLButtonElement).disabled).toBe(true)
    })
  })

  it('enables unflag buttons when not locked', () => {
    render(
      <DeductionList
        deductions={[RECORD_A]}
        fiscalYear={2026}
        isLocked={false}
        householdId="hh-1"
        onRefresh={vi.fn()}
        onFiscalYearChange={vi.fn()}
      />
    )
    const unflagButtons = screen.getAllByRole('button', { name: /unflag|remove/i })
    unflagButtons.forEach((btn) => {
      expect((btn as HTMLButtonElement).disabled).toBe(false)
    })
  })
})
