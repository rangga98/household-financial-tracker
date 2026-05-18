'use client';

import { formatPercentageWithIndicator } from '@/lib/utils/lifestyle-creep/formatPercentage';

interface GrowthComparisonCardProps {
  incomeGrowth: number | null;
  expenseGrowth: number | null;
  incomeFirstAvg: number;
  incomeLastAvg: number;
  expenseFirstAvg: number;
  expenseLastAvg: number;
  isInsufficientData?: boolean;
}

export function GrowthComparisonCard({
  incomeGrowth,
  expenseGrowth,
  incomeFirstAvg,
  incomeLastAvg,
  expenseFirstAvg,
  expenseLastAvg,
  isInsufficientData
}: GrowthComparisonCardProps) {
  if (isInsufficientData) {
    return (
      <div className="w-full rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Income vs Expense Growth</h3>
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">Insufficient data available.</p>
          <p className="text-xs mt-1">At least 3 months of transaction data is required for analysis.</p>
        </div>
      </div>
    );
  }

  const incomeFormatted = formatPercentageWithIndicator(incomeGrowth);
  const expenseFormatted = formatPercentageWithIndicator(expenseGrowth);

  return (
    <div className="w-full rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Income vs Expense Growth</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Income Column */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-gray-500">Income</span>
          </div>
          <div className={`text-3xl font-bold tabular-nums ${incomeFormatted.colorClass}`}>
            {incomeFormatted.text}
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <p>From: Rp {incomeFirstAvg.toLocaleString('id-ID')}</p>
            <p>To: Rp {incomeLastAvg.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Expense Column */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-sm font-medium text-gray-500">Expenses</span>
          </div>
          <div className={`text-3xl font-bold tabular-nums ${expenseFormatted.colorClass}`}>
            {expenseFormatted.text}
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <p>From: Rp {expenseFirstAvg.toLocaleString('id-ID')}</p>
            <p>To: Rp {expenseLastAvg.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
