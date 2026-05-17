import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaxPlanningDashboard } from './TaxPlanningDashboard'
import type { TaxDashboardData } from '@/types/tax-planning'

vi.mock('@/app/actions/tax-planning', () => ({
  createTaxObligation: vi.fn(),
  updateTaxObligation: vi.fn(),
  deleteTaxObligation: vi.fn(),
  renewTaxObligation: vi.fn(),
  createFilingDeadline: vi.fn(),
  markFilingDeadlineAsFiled: vi.fn(),
  unarchiveFilingDeadline: vi.fn(),
  unflagTransactionAsDeductible: vi.fn(),
}))

const BASE_DASHBOARD: TaxDashboardData = {
  obligations: [
    {
      obligation: {
        id: 'goal-1',
        householdId: 'hh-1',
        name: 'Honda Beat',
        taxType: 'vehicle_registration',
        targetAmount: 1_200_000,
        currentAmount: 0,
        targetDate: '2026-12-01',
        notes: null,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      remainingAmount: 1_200_000,
      remainingMonths: 11,
      monthlyInstallment: 109_090,
      installmentSchedule: [],
      isOverdue: false,
    },
  ],
  filingDeadlines: [
    {
      id: 'dl-1',
      householdId: 'hh-1',
      taxType: 'income_tax',
      fiscalYear: 2026,
      filingDeadline: '2027-03-31',
      status: 'pending',
      filedAt: null,
      notes: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      daysUntilDeadline: 60,
      isUrgent: false,
    },
  ],
  currentMonthInstallmentTotal: 109_090,
  overdueObligationCount: 0,
  urgentDeadlineCount: 0,
}

const EMPTY_DASHBOARD: TaxDashboardData = {
  obligations: [],
  filingDeadlines: [],
  currentMonthInstallmentTotal: 0,
  overdueObligationCount: 0,
  urgentDeadlineCount: 0,
}

describe('TaxPlanningDashboard', () => {
  it('renders Overview tab by default with KPI cards', () => {
    render(
      <TaxPlanningDashboard
        householdId="hh-1"
        data={BASE_DASHBOARD}
        currentFiscalYear={2026}
        deductions={[]}
        isYearLocked={false}
        onRefresh={vi.fn()}
        onFiscalYearChange={vi.fn()}
      />
    )
    expect(screen.getAllByText(/monthly|installment|obligation|filing/i).length).toBeGreaterThan(0)
  })

  it('renders current month installment KPI', () => {
    render(
      <TaxPlanningDashboard
        householdId="hh-1"
        data={BASE_DASHBOARD}
        currentFiscalYear={2026}
        deductions={[]}
        isYearLocked={false}
        onRefresh={vi.fn()}
        onFiscalYearChange={vi.fn()}
      />
    )
    expect(screen.getAllByText(/Rp/i).length).toBeGreaterThan(0)
  })

  it('shows tab navigation with Obligations, Deadlines, Deductions tabs', () => {
    render(
      <TaxPlanningDashboard
        householdId="hh-1"
        data={BASE_DASHBOARD}
        currentFiscalYear={2026}
        deductions={[]}
        isYearLocked={false}
        onRefresh={vi.fn()}
        onFiscalYearChange={vi.fn()}
      />
    )
    expect(screen.getByRole('tab', { name: /obligations/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /deadlines/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /deductions/i })).toBeDefined()
  })

  it('switching to Obligations tab shows obligation cards', async () => {
    render(
      <TaxPlanningDashboard
        householdId="hh-1"
        data={BASE_DASHBOARD}
        currentFiscalYear={2026}
        deductions={[]}
        isYearLocked={false}
        onRefresh={vi.fn()}
        onFiscalYearChange={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('tab', { name: /obligations/i }))
    expect(screen.getByText('Honda Beat')).toBeDefined()
  })

  it('switching to Deadlines tab shows filing deadline cards', async () => {
    render(
      <TaxPlanningDashboard
        householdId="hh-1"
        data={BASE_DASHBOARD}
        currentFiscalYear={2026}
        deductions={[]}
        isYearLocked={false}
        onRefresh={vi.fn()}
        onFiscalYearChange={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('tab', { name: /deadlines/i }))
    expect(screen.getAllByText(/income tax|SPT|FY/i).length).toBeGreaterThan(0)
  })

  it('shows empty state KPIs when data is empty', () => {
    render(
      <TaxPlanningDashboard
        householdId="hh-1"
        data={EMPTY_DASHBOARD}
        currentFiscalYear={2026}
        deductions={[]}
        isYearLocked={false}
        onRefresh={vi.fn()}
        onFiscalYearChange={vi.fn()}
      />
    )
    expect(screen.getAllByText(/0|no.*obligation|no.*deadline/i).length).toBeGreaterThan(0)
  })
})
