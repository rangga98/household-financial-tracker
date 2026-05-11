import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FinancialFreedomDashboard } from './FinancialFreedomDashboard'
import type { FIProfile, FIProjection } from '@/types/financial-freedom'

// Mock the finance utility
vi.mock('@/lib/utils/finance', () => ({
  computeFIProjection: vi.fn((profile: FIProfile): FIProjection => {
    const annualExpenses = profile.fiAnnualExpenses ?? 0
    const savingsRate = profile.fiSavingsRate ?? 0
    const currentAge = profile.fiCurrentAge ?? 0
    const currentNetWorth = profile.fiCurrentNetWorth ?? 0

    const fiNumber = annualExpenses * 25
    const isAlreadyFI = currentNetWorth >= fiNumber && fiNumber > 0

    return {
      fiNumber,
      yearsToFI: savingsRate > 0 ? 15 : null,
      projectedFIAge: savingsRate > 0 ? currentAge + 15 : null,
      progressPercentage: fiNumber > 0 ? Math.min((currentNetWorth / fiNumber) * 100, 100) : 0,
      isAlreadyFI,
      trajectory: [],
    }
  }),
}))

describe('FinancialFreedomDashboard', () => {
  const mockProfile: FIProfile = {
    id: 'test-id',
    householdId: 'household-id',
    fiAnnualExpenses: 40000,
    fiSavingsRate: 0.5,
    fiCurrentAge: 30,
    fiCurrentNetWorth: 100000,
    fiExpectedReturn: 0.07,
  }

  it('renders FI Number correctly', () => {
    render(<FinancialFreedomDashboard profile={mockProfile} />)

    // FI Number = 40000 * 25 = 1,000,000 (displayed as compact format)
    expect(screen.getByText(/FI Number/i)).toBeInTheDocument()
    expect(screen.getByText(/1.0 JT/i)).toBeInTheDocument() // Compact format
  })

  it('renders Years to FI correctly', () => {
    render(<FinancialFreedomDashboard profile={mockProfile} />)

    expect(screen.getByText(/Years to FI/i)).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument() // Mocked value
  })

  it('renders FI Age correctly', () => {
    render(<FinancialFreedomDashboard profile={mockProfile} />)

    expect(screen.getByText(/FI Age/i)).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument() // 30 + 15
  })

  it('renders progress percentage', () => {
    render(<FinancialFreedomDashboard profile={mockProfile} />)

    // Progress = 100000 / 1000000 * 100 = 10% (displayed as "10.0 %")
    expect(screen.getByText(/10.0/)).toBeInTheDocument()
  })

  it('shows celebratory state when already FI', () => {
    const alreadyFIProfile: FIProfile = {
      ...mockProfile,
      fiCurrentNetWorth: 1500000, // Exceeds FI Number
    }

    render(<FinancialFreedomDashboard profile={alreadyFIProfile} />)

    // Check for celebratory message (emoji + text)
    expect(screen.getByText(/Congratulations/i)).toBeInTheDocument()
  })

  it('shows unreachable message when savings rate is 0', () => {
    const unreachableProfile: FIProfile = {
      ...mockProfile,
      fiSavingsRate: 0,
      fiExpectedReturn: 0, // No growth
    }

    render(<FinancialFreedomDashboard profile={unreachableProfile} />)

    expect(screen.getByText(/unreachable/i)).toBeInTheDocument()
  })

  it('shows onboarding prompt when profile is incomplete', () => {
    const incompleteProfile: FIProfile = {
      id: 'test-id',
      householdId: 'household-id',
      fiAnnualExpenses: null,
      fiSavingsRate: null,
      fiCurrentAge: null,
      fiCurrentNetWorth: null,
      fiExpectedReturn: null,
    }

    render(<FinancialFreedomDashboard profile={incompleteProfile} />)

    expect(screen.getByText(/complete your profile/i)).toBeInTheDocument()
  })

  it('renders with suggested annual expenses', () => {
    render(
      <FinancialFreedomDashboard
        profile={mockProfile}
        suggestedAnnualExpenses={48000}
      />
    )

    // Should still render the dashboard
    expect(screen.getByText(/FI Number/i)).toBeInTheDocument()
  })
})
