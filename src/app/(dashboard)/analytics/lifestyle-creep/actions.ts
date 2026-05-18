'use server';

import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getMonthlyAggregates } from '@/lib/supabase/queries/lifestyleCreepQueries';
import { calculateGrowthComparison } from '@/lib/utils/lifestyle-creep/calculateGrowthComparison';
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';

export type PeriodType = '3months' | '6months' | '12months' | 'custom';

export interface LifestyleCreepAnalysisRequest {
  periodType: PeriodType;
  customStartDate?: string;
  customEndDate?: string;
}

export interface LifestyleCreepAnalysisResponse {
  success: boolean;
  error?: string;
  data?: {
    period: {
      startDate: string;
      endDate: string;
      monthsAnalyzed: number;
    };
    income: {
      firstPeriodAverage: number;
      lastPeriodAverage: number;
      growthPercent: number | null;
    };
    expenses: {
      firstPeriodAverage: number;
      lastPeriodAverage: number;
      growthPercent: number | null;
    };
    comparison: {
      creepDeltaPercent: number | null;
      hasLifestyleCreep: boolean;
      warningLevel: 'none' | 'warning' | 'critical';
    };
    trendData: Array<{
      monthLabel: string;
      income: number;
      expenses: number;
    }>;
  };
}

/**
 * Calculate date range based on period type
 */
function getPeriodDates(periodType: PeriodType, customStart?: string, customEnd?: string): { start: string; end: string } {
  const now = new Date();

  switch (periodType) {
    case '3months':
      return {
        start: format(startOfMonth(subMonths(now, 3)), 'yyyy-MM-dd'),
        end: format(endOfMonth(now), 'yyyy-MM-dd')
      };
    case '6months':
      return {
        start: format(startOfMonth(subMonths(now, 6)), 'yyyy-MM-dd'),
        end: format(endOfMonth(now), 'yyyy-MM-dd')
      };
    case '12months':
      return {
        start: format(startOfMonth(subMonths(now, 12)), 'yyyy-MM-dd'),
        end: format(endOfMonth(now), 'yyyy-MM-dd')
      };
    case 'custom':
      if (!customStart || !customEnd) {
        throw new Error('Custom dates required for custom period type');
      }
      return { start: customStart, end: customEnd };
    default:
      // Default to 6 months
      return {
        start: format(startOfMonth(subMonths(now, 6)), 'yyyy-MM-dd'),
        end: format(endOfMonth(now), 'yyyy-MM-dd')
      };
  }
}

/**
 * Format month for display (e.g., "Jan 2024")
 */
function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(Number(year), Number(monthNum) - 1, 1);
  return format(date, 'MMM yyyy');
}

/**
 * Get lifestyle creep analysis for the authenticated user
 */
export async function getLifestyleCreepAnalysis(
  request: LifestyleCreepAnalysisRequest
): Promise<LifestyleCreepAnalysisResponse> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    // Get user's household
    const { data: profile } = await supabase
      .from('profiles')
      .select('household_id')
      .eq('id', user.id)
      .single();

    if (!profile?.household_id) {
      return { success: false, error: 'NO_HOUSEHOLD' };
    }

    // Calculate date range
    const { start, end } = getPeriodDates(
      request.periodType,
      request.customStartDate,
      request.customEndDate
    );

    // Fetch monthly aggregates
    const monthlyData = await getMonthlyAggregates(profile.household_id, start, end);

    // Check for insufficient data
    if (monthlyData.length < 2) {
      return {
        success: true,
        data: {
          period: { startDate: start, endDate: end, monthsAnalyzed: monthlyData.length },
          income: { firstPeriodAverage: 0, lastPeriodAverage: 0, growthPercent: null },
          expenses: { firstPeriodAverage: 0, lastPeriodAverage: 0, growthPercent: null },
          comparison: { creepDeltaPercent: null, hasLifestyleCreep: false, warningLevel: 'none' },
          trendData: []
        }
      };
    }

    // Calculate growth comparison
    const comparison = calculateGrowthComparison(monthlyData);

    // Prepare trend data with formatted labels
    const trendData = monthlyData.map(item => ({
      monthLabel: formatMonthLabel(item.month),
      income: item.income,
      expenses: item.expenses
    }));

    // Calculate averages for display
    const splitPoint = monthlyData.length >= 6 ? 3 : 1;
    const firstPeriod = monthlyData.slice(0, splitPoint);
    const lastPeriod = monthlyData.slice(-splitPoint);

    const firstIncomeAvg = firstPeriod.reduce((sum, m) => sum + m.income, 0) / firstPeriod.length;
    const lastIncomeAvg = lastPeriod.reduce((sum, m) => sum + m.income, 0) / lastPeriod.length;
    const firstExpenseAvg = firstPeriod.reduce((sum, m) => sum + m.expenses, 0) / firstPeriod.length;
    const lastExpenseAvg = lastPeriod.reduce((sum, m) => sum + m.expenses, 0) / lastPeriod.length;

    return {
      success: true,
      data: {
        period: { startDate: start, endDate: end, monthsAnalyzed: monthlyData.length },
        income: {
          firstPeriodAverage: Math.round(firstIncomeAvg * 100) / 100,
          lastPeriodAverage: Math.round(lastIncomeAvg * 100) / 100,
          growthPercent: comparison.incomeGrowth
        },
        expenses: {
          firstPeriodAverage: Math.round(firstExpenseAvg * 100) / 100,
          lastPeriodAverage: Math.round(lastExpenseAvg * 100) / 100,
          growthPercent: comparison.expenseGrowth
        },
        comparison: {
          creepDeltaPercent: comparison.creepDelta,
          hasLifestyleCreep: comparison.hasLifestyleCreep,
          warningLevel: comparison.warningLevel
        },
        trendData
      }
    };
  } catch (error) {
    console.error('Lifestyle creep analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
}
