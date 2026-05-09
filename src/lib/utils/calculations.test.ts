import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateBalance, calculateRunningBalance, savingsRate, expensePercentChange } from '@/lib/utils/calculations'
import type { Transaction } from '@/types'

const mockTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: '1',
  householdId: 'h1',
  userId: 'u1',
  categoryId: 'c1',
  type: 'expense',
  amount: 100000,
  transactionDate: new Date('2024-01-15'),
  isScheduled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe('balance calculations', () => {
  describe('calculateBalance', () => {
    it('calculates positive balance with income', () => {
      const transactions = [
        mockTransaction({ type: 'income', amount: 500000 }),
        mockTransaction({ type: 'expense', amount: 200000 }),
      ]
      
      const result = calculateBalance(transactions)
      
      expect(result.balance).toBe(300000)
      expect(result.totalIn).toBe(500000)
      expect(result.totalOut).toBe(200000)
    })

    it('calculates negative balance', () => {
      const transactions = [
        mockTransaction({ type: 'income', amount: 100000 }),
        mockTransaction({ type: 'expense', amount: 300000 }),
      ]
      
      const result = calculateBalance(transactions)
      
      expect(result.balance).toBe(-200000)
    })

    it('filters by date', () => {
      const transactions = [
        mockTransaction({ type: 'income', amount: 500000, transactionDate: new Date('2024-01-01') }),
        mockTransaction({ type: 'expense', amount: 200000, transactionDate: new Date('2024-01-20') }),
      ]
      
      const result = calculateBalance(transactions, new Date('2024-01-15'))
      
      expect(result.balance).toBe(500000)
    })

    it('handles empty transactions', () => {
      const result = calculateBalance([])
      
      expect(result.balance).toBe(0)
      expect(result.totalIn).toBe(0)
      expect(result.totalOut).toBe(0)
    })
  })

  describe('calculateRunningBalance', () => {
    it('calculates running balance in chronological order', () => {
      const transactions = [
        mockTransaction({ id: '1', type: 'income', amount: 1000000, transactionDate: new Date('2024-01-01') }),
        mockTransaction({ id: '2', type: 'expense', amount: 300000, transactionDate: new Date('2024-01-05') }),
        mockTransaction({ id: '3', type: 'expense', amount: 200000, transactionDate: new Date('2024-01-10') }),
      ]
      
      const result = calculateRunningBalance(transactions)
      
      expect(result.get('1')).toBe(1000000)
      expect(result.get('2')).toBe(700000)
      expect(result.get('3')).toBe(500000)
    })

    it('handles unsorted transactions', () => {
      const transactions = [
        mockTransaction({ id: '3', type: 'expense', amount: 200000, transactionDate: new Date('2024-01-10') }),
        mockTransaction({ id: '1', type: 'income', amount: 1000000, transactionDate: new Date('2024-01-01') }),
        mockTransaction({ id: '2', type: 'expense', amount: 300000, transactionDate: new Date('2024-01-05') }),
      ]
      
      const result = calculateRunningBalance(transactions)
      
      expect(result.get('1')).toBe(1000000)
      expect(result.get('2')).toBe(700000)
      expect(result.get('3')).toBe(500000)
    })
  })
})

describe('savingsRate', () => {
  it('calculates healthy savings rate (>20%)', () => {
    expect(savingsRate(10000000, 7000000)).toBe(30)
  })

  it('calculates caution savings rate (10-20%)', () => {
    expect(savingsRate(10000000, 8500000)).toBe(15)
  })

  it('calculates needs attention savings rate (<10%)', () => {
    expect(savingsRate(10000000, 9500000)).toBe(5)
  })

  it('returns null when totalIncome is zero', () => {
    expect(savingsRate(0, 500000)).toBeNull()
  })

  it('handles negative savings rate', () => {
    expect(savingsRate(10000000, 12000000)).toBe(-20)
  })

  it('rounds to 2 decimal places', () => {
    expect(savingsRate(10000000, 3333333)).toBe(66.67)
  })
})

describe('expensePercentChange', () => {
  it('calculates increase percentage', () => {
    expect(expensePercentChange(5500000, 5000000)).toBe(10)
  })

  it('calculates decrease percentage', () => {
    expect(expensePercentChange(4500000, 5000000)).toBe(-10)
  })

  it('returns 0 when previous is zero', () => {
    expect(expensePercentChange(5000000, 0)).toBe(0)
  })

  it('returns 0 when current equals previous', () => {
    expect(expensePercentChange(5000000, 5000000)).toBe(0)
  })

  it('rounds to 2 decimal places', () => {
    expect(expensePercentChange(5333333, 5000000)).toBe(6.67)
  })
})
