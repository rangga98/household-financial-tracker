import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExpenseBreakdown } from './ExpenseBreakdown'

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-container">{children}</div>
    ),
  }
})

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

const mockData = [
  { categoryId: 'c1', categoryName: 'Groceries', categoryColor: '#3b82f6', totalAmount: 500000, percentage: 50 },
  { categoryId: 'c2', categoryName: 'Transportation', categoryColor: '#ef4444', totalAmount: 300000, percentage: 30 },
  { categoryId: 'c3', categoryName: 'Dining Out', categoryColor: '#22c55e', totalAmount: 200000, percentage: 20 },
]

describe('ExpenseBreakdown', () => {
  it('renders chart container with category data', () => {
    render(<ExpenseBreakdown data={mockData} totalExpenses={1000000} />)
    expect(screen.getByTestId('recharts-container')).toBeInTheDocument()
  })

  it('displays empty state when no data', () => {
    render(<ExpenseBreakdown data={[]} totalExpenses={0} />)
    expect(screen.getByText(/no expenses recorded/i)).toBeInTheDocument()
  })

  it('renders legend items for each category', () => {
    render(<ExpenseBreakdown data={mockData} totalExpenses={1000000} />)
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.getByText('Transportation')).toBeInTheDocument()
    expect(screen.getByText('Dining Out')).toBeInTheDocument()
  })

  it('renders chart with grouped data when more than 6 categories', () => {
    const manyCategories = Array.from({ length: 8 }, (_, i) => ({
      categoryId: `c${i}`,
      categoryName: `Category ${i}`,
      categoryColor: '#333333',
      totalAmount: i === 0 ? 900000 : 5000,
      percentage: i === 0 ? 90 : 0.5,
    }))
    render(<ExpenseBreakdown data={manyCategories} totalExpenses={1000000} />)
    expect(screen.getByTestId('recharts-container')).toBeInTheDocument()
    expect(screen.getByText('Category 0')).toBeInTheDocument()
  })
})
