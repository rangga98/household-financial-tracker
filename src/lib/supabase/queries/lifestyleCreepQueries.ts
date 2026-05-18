import { getSupabaseServerClient } from '@/lib/supabase/server';

export interface MonthlyAggregate {
  month: string;
  income: number;
  expenses: number;
}

/**
 * Get monthly income and expense aggregates for a date range
 * Excludes transfer transactions to avoid double-counting
 * Uses JavaScript aggregation for compatibility with Supabase client
 */
export async function getMonthlyAggregates(
  householdId: string,
  startDate: string,
  endDate: string
): Promise<MonthlyAggregate[]> {
  const supabase = await getSupabaseServerClient();

  // Fetch all transactions for the period
  const { data, error } = await supabase
    .from('transactions')
    .select('transaction_date, amount, type')
    .eq('household_id', householdId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .neq('type', 'transfer') // Exclude transfers
    .order('transaction_date');

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Aggregate by month in JavaScript
  const monthlyData = new Map<string, { income: number; expenses: number }>();

  for (const transaction of data) {
    const month = transaction.transaction_date.substring(0, 7); // YYYY-MM format

    if (!monthlyData.has(month)) {
      monthlyData.set(month, { income: 0, expenses: 0 });
    }

    const monthData = monthlyData.get(month)!;

    if (transaction.type === 'income') {
      monthData.income += Number(transaction.amount);
    } else if (transaction.type === 'expense') {
      monthData.expenses += Number(transaction.amount);
    }
  }

  // Convert to array and sort by month
  const result: MonthlyAggregate[] = Array.from(monthlyData.entries())
    .map(([month, values]) => ({
      month,
      income: Math.round(values.income * 100) / 100, // 2 decimal precision
      expenses: Math.round(values.expenses * 100) / 100
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return result;
}
