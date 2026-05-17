import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RiskManagementDashboard } from './RiskManagementDashboard'
import type { InsuranceDashboardData } from '@/types/risk-management'

const DASHBOARD_DATA: InsuranceDashboardData = {
  policies: [
    {
      id: 'pol-1',
      householdId: 'hh-1',
      name: 'Jiwa AIA',
      insuranceType: 'life',
      insurer: 'AIA',
      coverageAmount: 1_000_000_000,
      premiumAmount: 2_000_000,
      paymentFrequency: 'annual',
      startDate: '2025-01-01',
      nextDueDate: '2026-06-01',
      isActive: true,
      notes: null,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      premiumStatus: 'upcoming',
      daysUntilDue: 15,
    },
  ],
  coverageStatus: {
    totalCoverage: 1_000_000_000,
    protectionTarget: 2_000_000_000,
    gap: 1_000_000_000,
    percentage: 50,
    isAdequate: false,
    color: 'yellow',
  },
  protectionTarget: {
    id: 'goal-1',
    householdId: 'hh-1',
    targetAmount: 2_000_000_000,
  },
}

const EMPTY_DASHBOARD: InsuranceDashboardData = {
  policies: [],
  coverageStatus: {
    totalCoverage: 0,
    protectionTarget: null,
    gap: 0,
    percentage: 0,
    isAdequate: false,
    color: 'gray',
  },
  protectionTarget: null,
}

describe('RiskManagementDashboard', () => {
  it('renders the Insurance tab by default', () => {
    render(
      <RiskManagementDashboard
        householdId="hh-1"
        insuranceData={DASHBOARD_DATA}
      />
    )
    expect(screen.getByText(/Insurance|Asuransi/i)).toBeDefined()
  })

  it('renders InsuranceSummaryCard with coverage data', () => {
    render(
      <RiskManagementDashboard
        householdId="hh-1"
        insuranceData={DASHBOARD_DATA}
      />
    )
    expect(screen.getAllByText(/Rp/i).length).toBeGreaterThan(0)
  })

  it('renders policy list with policy name', () => {
    render(
      <RiskManagementDashboard
        householdId="hh-1"
        insuranceData={DASHBOARD_DATA}
      />
    )
    expect(screen.getByText('Jiwa AIA')).toBeDefined()
  })

  it('shows empty state when no policies exist', () => {
    render(
      <RiskManagementDashboard
        householdId="hh-1"
        insuranceData={EMPTY_DASHBOARD}
      />
    )
    expect(screen.getAllByRole('button', { name: /add policy/i }).length).toBeGreaterThan(0)
  })

  it('opens PolicyForm when "Add Policy" button is clicked', async () => {
    render(
      <RiskManagementDashboard
        householdId="hh-1"
        insuranceData={EMPTY_DASHBOARD}
      />
    )
    await userEvent.click(screen.getAllByRole('button', { name: /add policy/i })[0])
    expect(screen.getByLabelText(/policy name/i)).toBeDefined()
  })
})
