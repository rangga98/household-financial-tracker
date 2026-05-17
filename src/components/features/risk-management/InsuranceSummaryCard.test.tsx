import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InsuranceSummaryCard } from './InsuranceSummaryCard'
import type { CoverageStatus, ProtectionTarget } from '@/types/risk-management'

const ADEQUATE: CoverageStatus = {
  totalCoverage: 2_000_000_000,
  protectionTarget: 2_000_000_000,
  gap: 0,
  percentage: 100,
  isAdequate: true,
  color: 'green',
}

const GAP: CoverageStatus = {
  totalCoverage: 1_500_000_000,
  protectionTarget: 2_000_000_000,
  gap: 500_000_000,
  percentage: 75,
  isAdequate: false,
  color: 'yellow',
}

const NO_TARGET: CoverageStatus = {
  totalCoverage: 1_000_000_000,
  protectionTarget: null,
  gap: 0,
  percentage: 0,
  isAdequate: false,
  color: 'gray',
}

const PROTECTION_TARGET: ProtectionTarget = {
  id: 'goal-1',
  householdId: 'hh-1',
  targetAmount: 2_000_000_000,
}

describe('InsuranceSummaryCard', () => {
  it('renders total coverage amount', () => {
    render(
      <InsuranceSummaryCard
        coverageStatus={ADEQUATE}
        protectionTarget={PROTECTION_TARGET}
        onSetTarget={vi.fn()}
      />
    )
    expect(screen.getAllByText(/Rp/i).length).toBeGreaterThan(0)
  })

  it('shows "Edit Target" button when target is set', () => {
    render(
      <InsuranceSummaryCard
        coverageStatus={ADEQUATE}
        protectionTarget={PROTECTION_TARGET}
        onSetTarget={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /edit target/i })).toBeDefined()
  })

  it('shows "Set Target" button when no target exists', () => {
    render(
      <InsuranceSummaryCard
        coverageStatus={NO_TARGET}
        protectionTarget={null}
        onSetTarget={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /set target/i })).toBeDefined()
  })

  it('calls onSetTarget when button is clicked', async () => {
    const onSetTarget = vi.fn()
    render(
      <InsuranceSummaryCard
        coverageStatus={NO_TARGET}
        protectionTarget={null}
        onSetTarget={onSetTarget}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /set target/i }))
    expect(onSetTarget).toHaveBeenCalledOnce()
  })

  it('displays gap amount when coverage is insufficient', () => {
    render(
      <InsuranceSummaryCard
        coverageStatus={GAP}
        protectionTarget={PROTECTION_TARGET}
        onSetTarget={vi.fn()}
      />
    )
    expect(screen.getByText(/Gap:/i)).toBeDefined()
  })
})
