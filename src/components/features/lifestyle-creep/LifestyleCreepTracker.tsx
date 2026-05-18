'use client';

import { useState, useEffect } from 'react';
import { GrowthComparisonCard } from './GrowthComparisonCard';
import { CreepWarning } from './CreepWarning';
import { TrendChart } from './TrendChart';
import { TimePeriodSelector } from './TimePeriodSelector';
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
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-700 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400">
        No data available.
      </div>
    );
  }

  const isInsufficientData = data.period.monthsAnalyzed < 2;

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <TimePeriodSelector value={periodType} onChange={setPeriodType} />

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

      {/* Trend Chart */}
      {!isInsufficientData && (
        <TrendChart data={data.trendData} />
      )}

      {/* Period Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t dark:border-gray-700">
        Analysis period: {data.period.startDate} to {data.period.endDate}
        ({data.period.monthsAnalyzed} months analyzed)
      </div>
    </div>
  );
}
