import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createTaxObligation,
  updateTaxObligation,
  deleteTaxObligation,
  renewTaxObligation,
  createFilingDeadline,
  markFilingDeadlineAsFiled,
  unarchiveFilingDeadline,
  flagTransactionAsDeductible,
  unflagTransactionAsDeductible,
} from './tax-planning'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: vi.fn(),
}))

import { getSupabaseServerClient } from '@/lib/supabase/server'

const BASE_GOAL_ROW = {
  id: 'goal-1',
  household_id: 'hh-1',
  name: 'Honda Beat B 1234 XY',
  goal_type: 'tax_obligation',
  tax_type: 'vehicle_registration',
  target_amount: '1200000',
  current_amount: '0',
  target_date: '2026-12-01',
  description: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const BASE_DEADLINE_ROW = {
  id: 'deadline-1',
  household_id: 'hh-1',
  tax_type: 'income_tax',
  fiscal_year: 2026,
  filing_deadline: '2027-03-31',
  status: 'pending',
  filed_at: null,
  notes: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

function mockInsert(returnData: unknown) {
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

function mockUpdate(returnData: unknown) {
  return {
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: returnData, error: null }),
          }),
        }),
      }),
    }),
  }
}

function mockUpdateNoSelect() {
  return {
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  }
}

function mockSoftDelete() {
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

function mockSelect(returnData: unknown[] | null) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: returnData?.[0] ?? null, error: null }),
              }),
            }),
          }),
        }),
      }),
    }),
  }
}

// ---------------------------------------------------------------------------
// createTaxObligation
// ---------------------------------------------------------------------------
describe('createTaxObligation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success with created obligation', async () => {
    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockInsert(BASE_GOAL_ROW) as never)

    const result = await createTaxObligation({
      householdId: 'hh-1',
      name: 'Honda Beat B 1234 XY',
      taxType: 'vehicle_registration',
      targetAmount: 1_200_000,
      targetDate: '2026-12-01',
      notes: null,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Honda Beat B 1234 XY')
      expect(result.data.targetAmount).toBe(1_200_000)
      expect(result.data.taxType).toBe('vehicle_registration')
    }
  })

  it('returns error when name is empty', async () => {
    const result = await createTaxObligation({
      householdId: 'hh-1',
      name: '  ',
      taxType: 'vehicle_registration',
      targetAmount: 1_200_000,
      targetDate: '2026-12-01',
      notes: null,
    })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/name/i)
  })

  it('returns error when targetAmount is zero', async () => {
    const result = await createTaxObligation({
      householdId: 'hh-1',
      name: 'Honda Beat',
      taxType: 'vehicle_registration',
      targetAmount: 0,
      targetDate: '2026-12-01',
      notes: null,
    })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/amount/i)
  })

  it('returns error when targetAmount is negative', async () => {
    const result = await createTaxObligation({
      householdId: 'hh-1',
      name: 'Honda Beat',
      taxType: 'vehicle_registration',
      targetAmount: -100,
      targetDate: '2026-12-01',
      notes: null,
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// updateTaxObligation
// ---------------------------------------------------------------------------
describe('updateTaxObligation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success with updated obligation', async () => {
    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockUpdate(BASE_GOAL_ROW) as never)

    const result = await updateTaxObligation('goal-1', {
      name: 'Honda Beat Updated',
      taxType: 'vehicle_registration',
      targetAmount: 1_500_000,
      targetDate: '2026-12-01',
      notes: 'Updated',
    })

    expect(result.success).toBe(true)
  })

  it('returns error when name is empty', async () => {
    const result = await updateTaxObligation('goal-1', {
      name: '',
      taxType: 'vehicle_registration',
      targetAmount: 1_200_000,
      targetDate: '2026-12-01',
      notes: null,
    })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/name/i)
  })
})

// ---------------------------------------------------------------------------
// deleteTaxObligation
// ---------------------------------------------------------------------------
describe('deleteTaxObligation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('soft-deletes the obligation (sets deleted_at)', async () => {
    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockSoftDelete() as never)

    const result = await deleteTaxObligation('goal-1')
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

    const result = await deleteTaxObligation('goal-1')
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// renewTaxObligation
// ---------------------------------------------------------------------------
describe('renewTaxObligation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success with updated obligation', async () => {
    const renewed = { ...BASE_GOAL_ROW, target_date: '2027-12-01', target_amount: '1500000', current_amount: '0' }
    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockUpdate(renewed) as never)

    const result = await renewTaxObligation('goal-1', {
      newTargetDate: '2027-12-01',
      newTargetAmount: 1_500_000,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.targetDate).toBe('2027-12-01')
    }
  })

  it('returns error when newTargetAmount is zero', async () => {
    const result = await renewTaxObligation('goal-1', {
      newTargetDate: '2027-12-01',
      newTargetAmount: 0,
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// createFilingDeadline
// ---------------------------------------------------------------------------
describe('createFilingDeadline', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success with created deadline', async () => {
    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockInsert(BASE_DEADLINE_ROW) as never)

    const result = await createFilingDeadline({
      householdId: 'hh-1',
      taxType: 'income_tax',
      fiscalYear: 2026,
      filingDeadline: '2027-03-31',
      notes: null,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.fiscalYear).toBe(2026)
      expect(result.data.status).toBe('pending')
    }
  })

  it('returns error when fiscalYear is negative', async () => {
    const result = await createFilingDeadline({
      householdId: 'hh-1',
      taxType: 'income_tax',
      fiscalYear: -1,
      filingDeadline: '2027-03-31',
      notes: null,
    })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/year/i)
  })

  it('returns error when fiscalYear is not an integer', async () => {
    const result = await createFilingDeadline({
      householdId: 'hh-1',
      taxType: 'income_tax',
      fiscalYear: 20.5,
      filingDeadline: '2027-03-31',
      notes: null,
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// markFilingDeadlineAsFiled
// ---------------------------------------------------------------------------
describe('markFilingDeadlineAsFiled', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success and filed status', async () => {
    const filed = { ...BASE_DEADLINE_ROW, status: 'filed', filed_at: '2027-03-15T00:00:00Z' }
    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockUpdate(filed) as never)

    const result = await markFilingDeadlineAsFiled('deadline-1')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.status).toBe('filed')
  })
})

// ---------------------------------------------------------------------------
// unarchiveFilingDeadline
// ---------------------------------------------------------------------------
describe('unarchiveFilingDeadline', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success and pending status', async () => {
    const pending = { ...BASE_DEADLINE_ROW, status: 'pending', filed_at: null }
    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockUpdate(pending) as never)

    const result = await unarchiveFilingDeadline('deadline-1')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('pending')
      expect(result.data.filedAt).toBeNull()
    }
  })
})

// ---------------------------------------------------------------------------
// flagTransactionAsDeductible
// ---------------------------------------------------------------------------
describe('flagTransactionAsDeductible', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success when fiscal year is not locked', async () => {
    vi.mocked(getSupabaseServerClient).mockResolvedValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'tax_filing_deadlines') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                    }),
                  }),
                }),
              }),
            }),
          }
        }
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }),
    } as never)

    const result = await flagTransactionAsDeductible({ transactionId: 'txn-1', fiscalYear: 2026 })
    expect(result.success).toBe(true)
  })

  it('returns error when fiscal year is locked (filed)', async () => {
    vi.mocked(getSupabaseServerClient).mockResolvedValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'tax_filing_deadlines') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'deadline-1' }, error: null }),
                    }),
                  }),
                }),
              }),
            }),
          }
        }
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }),
    } as never)

    const result = await flagTransactionAsDeductible({ transactionId: 'txn-1', fiscalYear: 2026 })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/archived/i)
  })

  it('returns error when fiscalYear is invalid', async () => {
    const result = await flagTransactionAsDeductible({ transactionId: 'txn-1', fiscalYear: 0 })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/year/i)
  })
})

// ---------------------------------------------------------------------------
// unflagTransactionAsDeductible
// ---------------------------------------------------------------------------
describe('unflagTransactionAsDeductible', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success when fiscal year is not locked', async () => {
    vi.mocked(getSupabaseServerClient).mockResolvedValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'tax_filing_deadlines') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                    }),
                  }),
                }),
              }),
            }),
          }
        }
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }),
    } as never)

    const result = await unflagTransactionAsDeductible('txn-1', 'hh-1', 2026)
    expect(result.success).toBe(true)
  })
})
