import type { Transaction, Balance } from '@/types'

export function savingsRate(totalIncome: number, totalExpenses: number): number | null {
  if (totalIncome === 0) return null
  const rate = ((totalIncome - totalExpenses) / totalIncome) * 100
  return Math.round(rate * 100) / 100
}

export function expensePercentChange(current: number, previous: number): number {
  if (previous === 0) return 0
  const change = ((current - previous) / previous) * 100
  return Math.round(change * 100) / 100
}

export function calculateBalance(
  transactions: Transaction[],
  asOfDate?: Date
): Balance {
  const filteredTransactions = asOfDate
    ? transactions.filter(
        (t) => new Date(t.transactionDate) <= asOfDate
      )
    : transactions

  const totalIn = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalOut = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    balance: totalIn - totalOut,
    totalIn,
    totalOut,
  }
}

export function calculateRunningBalance(
  transactions: Transaction[]
): Map<string, number> {
  const sorted = [...transactions].sort(
    (a, b) =>
      new Date(a.transactionDate).getTime() -
      new Date(b.transactionDate).getTime()
  )

  const running = new Map<string, number>()
  let balance = 0

  for (const t of sorted) {
    const change = t.type === 'income' ? t.amount : -t.amount
    balance += change
    running.set(t.id, balance)
  }

  return running
}
