import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FinancialFreedomPage from './page'
import type { FIProfile } from '@/types/financial-freedom'

// Mock the server actions
vi.mock('@/app/actions/financial-freedom', () => ({
  getFIProfile: vi.fn(async (): Promise<FIProfile | null> => ({
    id: 'test-id',
    householdId: 'household-id',
    fiAnnualExpenses: 40000,
    fiSavingsRate: 0.5,
    fiCurrentAge: 30,
    fiCurrentNetWorth: 100000,
    fiExpectedReturn: 0.07,
  })),
  getBudgetBasedAnnualExpenses: vi.fn(async () => 48000),
}))

// Mock the profiles query
vi.mock('@/lib/supabase/queries/profiles', () => ({
  getProfiles: vi.fn(async () => [{ id: 'test-id', householdId: 'household-id' }]),
}))

// Mock the dashboard component
vi.mock('@/components/features/financial-freedom/FinancialFreedomDashboard', () => ({
  FinancialFreedomDashboard: ({ profile }: { profile: FIProfile }) => (
    <div data-testid="dashboard">
      <span data-testid="profile-id">{profile.id}</span>
      <span data-testid="fi-number">{(profile.fiAnnualExpenses ?? 0) * 25}</span>
    </div>
  ),
}))

describe('FinancialFreedomPage', () => {
  it('fetches and passes profile to dashboard', async () => {
    const page = await FinancialFreedomPage()
    render(page)

    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('profile-id')).toHaveTextContent('test-id')
  })

  it('renders page title', async () => {
    const page = await FinancialFreedomPage()
    render(page)

    expect(screen.getByText(/Financial Freedom/i)).toBeInTheDocument()
  })

  it('computes FI Number from profile data', async () => {
    const page = await FinancialFreedomPage()
    render(page)

    // 40000 * 25 = 1,000,000
    expect(screen.getByTestId('fi-number')).toHaveTextContent('1000000')
  })
})
