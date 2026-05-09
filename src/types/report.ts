export interface ExpenseBreakdownItem {
  categoryId: string;
  categoryName: string;
  categoryColor: string | null;
  totalAmount: number;
  percentage: number;
}

export interface MonthlyTotals {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number | null;
  netSavings: number;
}

export interface MonthOverMonthComparison {
  currentMonth: MonthlyTotals;
  previousMonth: MonthlyTotals;
  expenseDifference: number;
  expensePercentChange: number;
  isIncrease: boolean;
  isSignificantIncrease: boolean;
}

export type SavingsHealthStatus = 'healthy' | 'caution' | 'needs_attention';

export interface ReportData {
  selectedMonth: string;
  expenseBreakdown: ExpenseBreakdownItem[];
  monthlyTotals: MonthlyTotals;
  comparison: MonthOverMonthComparison | null;
}
