import { calculateAverage, calculateGrowthPercentage } from './calculateGrowthPercentage';

export interface MonthlyAggregate {
  month: string;
  income: number;
  expenses: number;
}

export interface GrowthComparisonResult {
  incomeGrowth: number | null;
  expenseGrowth: number | null;
  creepDelta: number | null;
  hasLifestyleCreep: boolean;
  warningLevel: 'none' | 'warning' | 'critical';
  isInsufficientData: boolean;
}

/**
 * Calculate growth comparison between income and expenses
 * Uses 3-month average for 6+ months data, single month for 3-5 months
 */
export function calculateGrowthComparison(
  data: MonthlyAggregate[]
): GrowthComparisonResult {
  // Need at least 2 data points for comparison
  if (data.length < 2) {
    return {
      incomeGrowth: null,
      expenseGrowth: null,
      creepDelta: null,
      hasLifestyleCreep: false,
      warningLevel: 'none',
      isInsufficientData: true
    };
  }

  // Determine split point: 3 months for 6+ months data, 1 month otherwise
  const splitPoint = data.length >= 6 ? 3 : 1;

  const firstPeriod = data.slice(0, splitPoint);
  const lastPeriod = data.slice(-splitPoint);

  // Calculate averages
  const firstIncomeAvg = calculateAverage(firstPeriod.map(d => d.income));
  const firstExpenseAvg = calculateAverage(firstPeriod.map(d => d.expenses));
  const lastIncomeAvg = calculateAverage(lastPeriod.map(d => d.income));
  const lastExpenseAvg = calculateAverage(lastPeriod.map(d => d.expenses));

  // Calculate growth percentages
  const incomeGrowth = calculateGrowthPercentage(firstIncomeAvg, lastIncomeAvg);
  const expenseGrowth = calculateGrowthPercentage(firstExpenseAvg, lastExpenseAvg);

  // Determine creep delta
  let creepDelta: number | null = null;
  if (incomeGrowth !== null && expenseGrowth !== null) {
    creepDelta = expenseGrowth - incomeGrowth;
  }

  // Determine if lifestyle creep exists
  const hasLifestyleCreep = creepDelta !== null && creepDelta > 0;

  // Determine warning level
  let warningLevel: 'none' | 'warning' | 'critical' = 'none';
  if (hasLifestyleCreep) {
    // Critical: negative income growth + positive expense growth
    // Or creep delta > 10%
    if ((incomeGrowth !== null && incomeGrowth < 0 && expenseGrowth !== null && expenseGrowth > 0) ||
        (creepDelta !== null && creepDelta > 10)) {
      warningLevel = 'critical';
    } else {
      warningLevel = 'warning';
    }
  }

  return {
    incomeGrowth,
    expenseGrowth,
    creepDelta,
    hasLifestyleCreep,
    warningLevel,
    isInsufficientData: false
  };
}
