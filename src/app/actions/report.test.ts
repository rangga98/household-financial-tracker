import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getReportData } from './report'

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: vi.fn(),
}))

import { getSupabaseServerClient } from '@/lib/supabase/server'

const mockSupabaseClient = (responses: Record<string, { data: unknown[] | null; error: { message: string } | null }>) => {
  const mockFrom = vi.fn().mockReturnThis()
  const mockSelect = vi.fn().mockReturnThis()
  const mockEq = vi.fn().mockReturnThis()
  const mockGte = vi.fn().mockReturnThis()
  const mockLt = vi.fn().mockReturnThis()

  let currentQuery = ''

  mockSelect.mockImplementation((query: string) => {
    currentQuery = query
    return { eq: mockEq, gte: mockGte, lt: mockLt, from: mockFrom }
  })

  mockEq.mockImplementation(() => ({ eq: mockEq, gte: mockGte, lt: mockLt, select: mockSelect }))
  mockGte.mockImplementation(() => ({ lt: mockLt, select: mockSelect }))
  mockLt.mockImplementation(() => {
    const response = currentQuery.includes('category_id')
      ? responses.current
      : responses.previous
    return Promise.resolve(response ?? { data: [], error: null })
  })

  mockFrom.mockImplementation(() => ({
    select: mockSelect,
    eq: mockEq,
    gte: mockGte,
    lt: mockLt,
  }))

  return { from: mockFrom }
}

describe('getReportData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns aggregated expense breakdown and monthly totals', async () => {
    const currentData = [
      { type: 'expense', amount: 500000, category_id: 'c1', categories: [{ name: 'Groceries', color: '#3b82f6' }] },
      { type: 'expense', amount: 300000, category_id: 'c2', categories: [{ name: 'Transportation', color: '#ef4444' }] },
      { type: 'income', amount: 2000000, category_id: 'c3', categories: [{ name: 'Salary', color: '#22c55e' }] },
    ]

    const mockClient = mockSupabaseClient({
      current: { data: currentData, error: null },
      previous: { data: [], error: null },
    })

    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockClient as never)

    const result = await getReportData('h1', '2026-05')

    expect(result.selectedMonth).toBe('2026-05')
    expect(result.expenseBreakdown).toHaveLength(2)
    expect(result.expenseBreakdown[0].categoryName).toBe('Groceries')
    expect(result.expenseBreakdown[0].totalAmount).toBe(500000)
    expect(result.expenseBreakdown[0].percentage).toBeCloseTo(62.5, 1)
    expect(result.monthlyTotals.totalIncome).toBe(2000000)
    expect(result.monthlyTotals.totalExpenses).toBe(800000)
    expect(result.monthlyTotals.savingsRate).toBe(60)
    expect(result.monthlyTotals.netSavings).toBe(1200000)
    expect(result.comparison).toBeNull()
  })

  it('includes month-over-month comparison when previous data exists', async () => {
    const currentData = [
      { type: 'expense', amount: 550000, category_id: 'c1', categories: [{ name: 'Groceries', color: '#3b82f6' }] },
      { type: 'income', amount: 2000000, category_id: 'c3', categories: [{ name: 'Salary', color: '#22c55e' }] },
    ]

    const previousData = [
      { type: 'expense', amount: 500000 },
      { type: 'income', amount: 2000000 },
    ]

    const mockClient = mockSupabaseClient({
      current: { data: currentData, error: null },
      previous: { data: previousData, error: null },
    })

    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockClient as never)

    const result = await getReportData('h1', '2026-05')

    expect(result.comparison).not.toBeNull()
    expect(result.comparison!.expenseDifference).toBe(50000)
    expect(result.comparison!.expensePercentChange).toBe(10)
    expect(result.comparison!.isIncrease).toBe(true)
    expect(result.comparison!.isSignificantIncrease).toBe(false)
  })

  it('flags significant increase when >10%', async () => {
    const currentData = [
      { type: 'expense', amount: 600000, category_id: 'c1', categories: [{ name: 'Groceries', color: '#3b82f6' }] },
    ]

    const previousData = [
      { type: 'expense', amount: 500000 },
    ]

    const mockClient = mockSupabaseClient({
      current: { data: currentData, error: null },
      previous: { data: previousData, error: null },
    })

    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockClient as never)

    const result = await getReportData('h1', '2026-05')

    expect(result.comparison!.isSignificantIncrease).toBe(true)
  })

  it('returns null savingsRate when totalIncome is zero', async () => {
    const currentData = [
      { type: 'expense', amount: 500000, category_id: 'c1', categories: [{ name: 'Groceries', color: '#3b82f6' }] },
    ]

    const mockClient = mockSupabaseClient({
      current: { data: currentData, error: null },
      previous: { data: [], error: null },
    })

    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockClient as never)

    const result = await getReportData('h1', '2026-05')

    expect(result.monthlyTotals.savingsRate).toBeNull()
  })

  it('returns empty arrays when no transactions exist', async () => {
    const mockClient = mockSupabaseClient({
      current: { data: [], error: null },
      previous: { data: [], error: null },
    })

    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockClient as never)

    const result = await getReportData('h1', '2026-05')

    expect(result.expenseBreakdown).toHaveLength(0)
    expect(result.monthlyTotals.totalIncome).toBe(0)
    expect(result.monthlyTotals.totalExpenses).toBe(0)
    expect(result.comparison).toBeNull()
  })

  it('handles single category spend (100% segment)', async () => {
    const currentData = [
      { type: 'expense', amount: 500000, category_id: 'c1', categories: [{ name: 'Groceries', color: '#3b82f6' }] },
    ]

    const mockClient = mockSupabaseClient({
      current: { data: currentData, error: null },
      previous: { data: [], error: null },
    })

    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockClient as never)

    const result = await getReportData('h1', '2026-05')

    expect(result.expenseBreakdown).toHaveLength(1)
    expect(result.expenseBreakdown[0].percentage).toBe(100)
  })
})
