import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createInsurancePolicy,
  updateInsurancePolicy,
  deactivateInsurancePolicy,
  setProtectionTarget,
} from './risk-management'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: vi.fn(),
}))

import { getSupabaseServerClient } from '@/lib/supabase/server'

const BASE_POLICY = {
  id: 'pol-1',
  household_id: 'hh-1',
  name: 'Jiwa AIA',
  insurance_type: 'life',
  insurer: 'AIA',
  coverage_amount: '1000000000',
  premium_amount: '2000000',
  payment_frequency: 'annual',
  start_date: '2025-01-01',
  next_due_date: '2026-01-01',
  is_active: true,
  notes: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

function mockSupabaseInsert(returnData: unknown) {
  return {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: returnData, error: null }),
        }),
      }),
    }),
  }
}

function mockSupabaseUpdate(returnData: unknown) {
  return {
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: returnData, error: null }),
            }),
          }),
        }),
      }),
    }),
  }
}

function mockSupabaseSoftDelete() {
  return {
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          is: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    }),
  }
}

describe('createInsurancePolicy', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success with created policy', async () => {
    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockSupabaseInsert(BASE_POLICY) as never)

    const result = await createInsurancePolicy({
      householdId: 'hh-1',
      name: 'Jiwa AIA',
      insuranceType: 'life',
      insurer: 'AIA',
      coverageAmount: 1_000_000_000,
      premiumAmount: 2_000_000,
      paymentFrequency: 'annual',
      startDate: '2025-01-01',
      nextDueDate: '2026-01-01',
      notes: null,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Jiwa AIA')
      expect(result.data.coverageAmount).toBe(1_000_000_000)
    }
  })

  it('returns error when name is empty', async () => {
    const result = await createInsurancePolicy({
      householdId: 'hh-1',
      name: '  ',
      insuranceType: 'life',
      insurer: 'AIA',
      coverageAmount: 1_000_000_000,
      premiumAmount: 2_000_000,
      paymentFrequency: 'annual',
      startDate: '2025-01-01',
      nextDueDate: '2026-01-01',
      notes: null,
    })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/name/i)
  })

  it('returns error when premiumAmount is zero', async () => {
    const result = await createInsurancePolicy({
      householdId: 'hh-1',
      name: 'Jiwa AIA',
      insuranceType: 'life',
      insurer: 'AIA',
      coverageAmount: 1_000_000_000,
      premiumAmount: 0,
      paymentFrequency: 'annual',
      startDate: '2025-01-01',
      nextDueDate: '2026-01-01',
      notes: null,
    })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/premium/i)
  })

  it('returns error when nextDueDate missing for non-one-time frequency', async () => {
    const result = await createInsurancePolicy({
      householdId: 'hh-1',
      name: 'Jiwa AIA',
      insuranceType: 'life',
      insurer: 'AIA',
      coverageAmount: 1_000_000_000,
      premiumAmount: 2_000_000,
      paymentFrequency: 'monthly',
      startDate: '2025-01-01',
      nextDueDate: null,
      notes: null,
    })

    expect(result.success).toBe(false)
  })
})

describe('updateInsurancePolicy', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success with updated policy', async () => {
    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockSupabaseUpdate(BASE_POLICY) as never)

    const result = await updateInsurancePolicy('pol-1', {
      name: 'Jiwa AIA Updated',
      insuranceType: 'life',
      insurer: 'AIA',
      coverageAmount: 1_500_000_000,
      premiumAmount: 2_000_000,
      paymentFrequency: 'annual',
      startDate: '2025-01-01',
      nextDueDate: '2026-01-01',
      notes: null,
    })

    expect(result.success).toBe(true)
  })

  it('returns error when insurer is empty', async () => {
    const result = await updateInsurancePolicy('pol-1', {
      name: 'Jiwa AIA',
      insuranceType: 'life',
      insurer: '  ',
      coverageAmount: 1_000_000_000,
      premiumAmount: 2_000_000,
      paymentFrequency: 'annual',
      startDate: '2025-01-01',
      nextDueDate: '2026-01-01',
      notes: null,
    })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/insurer/i)
  })
})

describe('deactivateInsurancePolicy', () => {
  beforeEach(() => vi.clearAllMocks())

  it('soft-deletes the policy (sets deleted_at)', async () => {
    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockSupabaseSoftDelete() as never)

    const result = await deactivateInsurancePolicy('pol-1')
    expect(result.success).toBe(true)
  })

  it('returns error on db failure', async () => {
    vi.mocked(getSupabaseServerClient).mockResolvedValue({
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({ error: { message: 'DB error' } }),
          }),
        }),
      }),
    } as never)

    const result = await deactivateInsurancePolicy('pol-1')
    expect(result.success).toBe(false)
  })
})

describe('setProtectionTarget', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a new protection target when none exists', async () => {
    const mockGoal = {
      id: 'goal-1',
      household_id: 'hh-1',
      target_amount: '2000000000',
    }
    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockSupabaseInsert(mockGoal) as never)

    const result = await setProtectionTarget({
      householdId: 'hh-1',
      targetAmount: 2_000_000_000,
      existingGoalId: null,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.targetAmount).toBe(2_000_000_000)
    }
  })

  it('returns error when targetAmount is zero', async () => {
    const result = await setProtectionTarget({
      householdId: 'hh-1',
      targetAmount: 0,
      existingGoalId: null,
    })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/target/i)
  })
})
