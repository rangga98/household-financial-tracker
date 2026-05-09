import { describe, it, expect, vi } from 'vitest'
import { getBudgetMetrics } from '@/lib/supabase/queries/budgeting'

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: vi.fn(),
}))

import { getSupabaseClient } from '@/lib/supabase/client'

const mockSupabaseClient = (overrides: {
  categories?: Record<string, unknown>[]
  transactions?: Record<string, unknown>[]
} = {}) => {
  const { categories = [], transactions = [] } = overrides

  const mockFrom = vi.fn().mockImplementation((table: string) => {
    const builder: Record<string, unknown> = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    }

    if (table === 'categories') {
      builder.select = vi.fn().mockImplementation(() => ({
        ...builder,
        data: categories,
        error: null,
      }))
    }

    if (table === 'transactions') {
      builder.select = vi.fn().mockImplementation((cols: string) => {
        if (cols === 'category_id, amount') {
          return {
            ...builder,
            data: transactions,
            error: null,
          }
        }
        return builder
      })
    }

    return builder
  })

  return {
    from: mockFrom,
  }
}

describe('getBudgetMetrics', () => {
  it('returns metrics for categories with limits', async () => {
    const client = mockSupabaseClient({
      categories: [
        {
          id: 'cat-1',
          household_id: 'hh-1',
          name: 'Dining Out',
          type: 'variable',
          monthly_limit: 2000000,
          is_active: true,
        },
      ],
      transactions: [
        { category_id: 'cat-1', amount: 500000 },
        { category_id: 'cat-1', amount: 300000 },
      ],
    })

    vi.mocked(getSupabaseClient).mockReturnValue(client as never)

    const result = await getBudgetMetrics('hh-1', '2024-01')

    expect(result).toHaveLength(1)
    expect(result[0].categoryId).toBe('cat-1')
    expect(result[0].monthlyLimit).toBe(2000000)
    expect(result[0].totalSpent).toBe(800000)
    expect(result[0].isOverbudget).toBe(false)
    expect(result[0].progressColor).toBe('green')
  })

  it('marks overbudget when spending exceeds 80%', async () => {
    const client = mockSupabaseClient({
      categories: [
        {
          id: 'cat-1',
          household_id: 'hh-1',
          name: 'Dining Out',
          type: 'variable',
          monthly_limit: 1000000,
          is_active: true,
        },
      ],
      transactions: [
        { category_id: 'cat-1', amount: 850000 },
      ],
    })

    vi.mocked(getSupabaseClient).mockReturnValue(client as never)

    const result = await getBudgetMetrics('hh-1', '2024-01')

    expect(result[0].isOverbudget).toBe(true)
    expect(result[0].progressColor).toBe('yellow')
  })

  it('returns null monthlyLimit when not set', async () => {
    const client = mockSupabaseClient({
      categories: [
        {
          id: 'cat-1',
          household_id: 'hh-1',
          name: 'Electricity',
          type: 'fixed',
          monthly_limit: null,
          is_active: true,
        },
      ],
      transactions: [
        { category_id: 'cat-1', amount: 500000 },
      ],
    })

    vi.mocked(getSupabaseClient).mockReturnValue(client as never)

    const result = await getBudgetMetrics('hh-1', '2024-01')

    expect(result[0].monthlyLimit).toBeNull()
    expect(result[0].isOverbudget).toBe(false)
    expect(result[0].progressColor).toBe('gray')
  })

  it('returns empty array when no categories exist', async () => {
    const client = mockSupabaseClient({
      categories: [],
      transactions: [],
    })

    vi.mocked(getSupabaseClient).mockReturnValue(client as never)

    const result = await getBudgetMetrics('hh-1')

    expect(result).toHaveLength(0)
  })
})
