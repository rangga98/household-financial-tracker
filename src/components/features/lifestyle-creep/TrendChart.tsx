'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCompactRp, formatRp } from '@/lib/utils/currency';

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
      <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No trend data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Income vs Expenses Trend</h3>
      <div className="h-80 w-full rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 p-4 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} vertical={false} />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatCompactRp(value)}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatRp(value), 
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
              labelStyle={{ color: '#9ca3af', fontWeight: 600, marginBottom: '8px' }}
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#10b981' }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#f43f5e' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
