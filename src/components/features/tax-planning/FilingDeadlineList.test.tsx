import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FilingDeadlineList } from './FilingDeadlineList'
import type { TaxFilingDeadlineWithCountdown } from '@/types/tax-planning'

vi.mock('@/app/actions/tax-planning', () => ({
  markFilingDeadlineAsFiled: vi.fn().mockResolvedValue({ success: true, data: {} }),
  unarchiveFilingDeadline: vi.fn().mockResolvedValue({ success: true, data: {} }),
}))

const PENDING_URGENT: TaxFilingDeadlineWithCountdown = {
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
  daysUntilDeadline: 15,
  isUrgent: true,
}

const FILED: TaxFilingDeadlineWithCountdown = {
  ...PENDING_URGENT,
  id: 'dl-2',
  status: 'filed',
  filedAt: '2027-03-10T00:00:00Z',
  daysUntilDeadline: 21,
  isUrgent: false,
}

const PENDING_NOT_URGENT: TaxFilingDeadlineWithCountdown = {
  ...PENDING_URGENT,
  id: 'dl-3',
  daysUntilDeadline: 60,
  isUrgent: false,
}

describe('FilingDeadlineList', () => {
  it('renders empty state when no deadlines', () => {
    render(<FilingDeadlineList deadlines={[]} onRefresh={vi.fn()} householdId="hh-1" />)
    expect(screen.getAllByText(/no.*deadline|add.*deadline/i).length).toBeGreaterThan(0)
  })

  it('shows countdown badge with days remaining', () => {
    render(<FilingDeadlineList deadlines={[PENDING_NOT_URGENT]} onRefresh={vi.fn()} householdId="hh-1" />)
    expect(screen.getAllByText(/60.*day|day.*60/i).length).toBeGreaterThan(0)
  })

  it('shows amber urgency alert banner when isUrgent', () => {
    render(<FilingDeadlineList deadlines={[PENDING_URGENT]} onRefresh={vi.fn()} householdId="hh-1" />)
    expect(screen.getAllByText(/urgent|deadline.*approaching/i).length).toBeGreaterThan(0)
  })

  it('shows Filed badge and Unarchive button for filed status', () => {
    render(<FilingDeadlineList deadlines={[FILED]} onRefresh={vi.fn()} householdId="hh-1" />)
    expect(screen.getAllByText(/filed/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /unarchive/i })).toBeDefined()
  })

  it('shows Mark as Filed button for pending status', () => {
    render(<FilingDeadlineList deadlines={[PENDING_NOT_URGENT]} onRefresh={vi.fn()} householdId="hh-1" />)
    expect(screen.getByRole('button', { name: /mark.*filed/i })).toBeDefined()
  })
})
