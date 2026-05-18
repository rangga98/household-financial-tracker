'use client';

import { useState, useEffect } from 'react';
import { GrowthComparisonCard } from './GrowthComparisonCard';
import { CreepWarning } from './CreepWarning';
import { getLifestyleCreepAnalysis, type PeriodType } from '@/app/(dashboard)/analytics/lifestyle-creep/actions';

export function LifestyleCreepTracker() {
  const [periodType, setPeriodType] = useState<PeriodType>('6months');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof getLifestyleCreepAnalysis>>['data'] | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getLifestyleCreepAnalysis({ periodType });
        
        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to load analysis');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [periodType]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
        <div className="h-48 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-gray-500">
        No data available.
      </div>
    );
  }

  const isInsufficientData = data.period.monthsAnalyzed < 2;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-4">
        <label htmlFor="period-select" className="text-sm font-medium text-gray-700">
          Analysis Period:
        </label>
        <select
          id="period-select"
          value={periodType}
          onChange={(e) => setPeriodType(e.target.value as PeriodType)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
        >
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="12months">Last 12 Months</option>
        </select>
      </div>

      {/* Warning Section */}
      <CreepWarning
        hasLifestyleCreep={data.comparison.hasLifestyleCreep}
        warningLevel={data.comparison.warningLevel}
        incomeGrowth={data.income.growthPercent}
        expenseGrowth={data.expenses.growthPercent}
        creepDelta={data.comparison.creepDeltaPercent}
      />

      {/* Growth Comparison Card */}
      <GrowthComparisonCard
        incomeGrowth={data.income.growthPercent}
        expenseGrowth={data.expenses.growthPercent}
        incomeFirstAvg={data.income.firstPeriodAverage}
        incomeLastAvg={data.income.lastPeriodAverage}
        expenseFirstAvg={data.expenses.firstPeriodAverage}
        expenseLastAvg={data.expenses.lastPeriodAverage}
        isInsufficientData={isInsufficientData}
      />

      {/* Period Info */}
      <div className="text-xs text-gray-500">
        Analysis period: {data.period.startDate} to {data.period.endDate} 
        ({data.period.monthsAnalyzed} months)
      </div>
    </div>
  );
}
