'use client';

import { LineChart } from '@tremor/react';

interface TrendChartProps {
  data: Array<{
    monthLabel: string;
    income: number;
    expenses: number;
  }>;
}

export function TrendChart({ data }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg border">
        <p className="text-gray-500 text-sm">No trend data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Income vs Expenses Trend</h3>
      <LineChart
        className="h-80"
        data={data}
        index="monthLabel"
        categories={['income', 'expenses']}
        colors={['emerald', 'rose']}
        yAxisWidth={80}
        valueFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
      />
    </div>
  );
}
