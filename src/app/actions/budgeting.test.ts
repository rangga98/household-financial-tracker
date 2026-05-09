import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateCategoryLimit } from './budgeting'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: vi.fn(),
}))

import { getSupabaseServerClient } from '@/lib/supabase/server'

describe('updateCategoryLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns success with updated category', async () => {
    const mockData = {
      id: 'cat-1',
      household_id: 'hh-1',
      name: 'Dining Out',
      type: 'variable',
      monthly_limit: 2000000,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
          }),
        }),
      }),
    }

    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockSupabase as never)

    const result = await updateCategoryLimit('cat-1', 2000000)

    expect(result.success).toBe(true)
    expect(result.category).toBeDefined()
    expect(result.category?.monthlyLimit).toBe(2000000)
    expect(result.error).toBeUndefined()
  })

  it('returns error for non-positive limit', async () => {
    const result = await updateCategoryLimit('cat-1', 0)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Monthly limit must be a positive number')
    expect(result.category).toBeUndefined()
  })

  it('returns error for negative limit', async () => {
    const result = await updateCategoryLimit('cat-1', -1000)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Monthly limit must be a positive number')
    expect(result.category).toBeUndefined()
  })

  it('returns error on database failure', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database connection failed' },
              }),
            }),
          }),
        }),
      }),
    }

    vi.mocked(getSupabaseServerClient).mockResolvedValue(mockSupabase as never)

    const result = await updateCategoryLimit('cat-1', 2000000)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Database connection failed')
    expect(result.category).toBeUndefined()
  })
})
