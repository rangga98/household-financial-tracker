'use client';

import type { PeriodType } from '@/app/(dashboard)/analytics/lifestyle-creep/actions';

interface TimePeriodSelectorProps {
  value: PeriodType;
  onChange: (value: PeriodType) => void;
}

const periods: { value: PeriodType; label: string }[] = [
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: '12months', label: 'Last 12 Months' },
];

export function TimePeriodSelector({ value, onChange }: TimePeriodSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="period-select" className="text-sm font-medium text-gray-700">
        Analysis Period
      </label>
      <select
        id="period-select"
        value={value}
        onChange={(e) => onChange(e.target.value as PeriodType)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   min-w-[150px] cursor-pointer touch-manipulation"
        style={{ minHeight: '44px' }} // Mobile touch target
      >
        {periods.map((period) => (
          <option key={period.value} value={period.value}>
            {period.label}
          </option>
        ))}
      </select>
    </div>
  );
}
