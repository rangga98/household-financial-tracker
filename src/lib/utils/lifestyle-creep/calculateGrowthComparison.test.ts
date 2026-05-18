import { describe, it, expect } from 'vitest';
import { calculateGrowthComparison, type MonthlyAggregate } from './calculateGrowthComparison';

describe('calculateGrowthComparison', () => {
  it('should calculate 3-month average comparison for 6+ months data', () => {
    const data: MonthlyAggregate[] = [
      { month: '2024-01', income: 1000, expenses: 800 },
      { month: '2024-02', income: 1100, expenses: 850 },
      { month: '2024-03', income: 1200, expenses: 900 },
      { month: '2024-04', income: 1300, expenses: 1000 },
      { month: '2024-05', income: 1400, expenses: 1100 },
      { month: '2024-06', income: 1500, expenses: 1200 },
    ];

    const result = calculateGrowthComparison(data);

    // First 3 months avg income: (1000+1100+1200)/3 = 1100
    // Last 3 months avg income: (1300+1400+1500)/3 = 1400
    // Growth: ((1400-1100)/1100)*100 = 27.27%
    expect(result.incomeGrowth).toBeCloseTo(27.27, 2);

    // First 3 months avg expenses: (800+850+900)/3 = 850
    // Last 3 months avg expenses: (1000+1100+1200)/3 = 1100
    // Growth: ((1100-850)/850)*100 = 29.41%
    expect(result.expenseGrowth).toBeCloseTo(29.41, 2);

    // Lifestyle creep detected (expenses grew faster)
    expect(result.hasLifestyleCreep).toBe(true);
  });

  it('should use single month comparison for 3-5 months data', () => {
    const data: MonthlyAggregate[] = [
      { month: '2024-01', income: 1000, expenses: 800 },
      { month: '2024-02', income: 1100, expenses: 850 },
      { month: '2024-03', income: 1200, expenses: 900 },
    ];

    const result = calculateGrowthComparison(data);

    // Single month comparison: first vs last
    // Income growth: ((1200-1000)/1000)*100 = 20%
    expect(result.incomeGrowth).toBe(20);

    // Expense growth: ((900-800)/800)*100 = 12.5%
    expect(result.expenseGrowth).toBe(12.5);

    // No lifestyle creep (income grew faster)
    expect(result.hasLifestyleCreep).toBe(false);
  });

  it('should handle no lifestyle creep scenario', () => {
    const data: MonthlyAggregate[] = [
      { month: '2024-01', income: 1000, expenses: 800 },
      { month: '2024-02', income: 1100, expenses: 850 },
      { month: '2024-03', income: 1200, expenses: 900 },
      { month: '2024-04', income: 1300, expenses: 950 },
      { month: '2024-05', income: 1400, expenses: 1000 },
      { month: '2024-06', income: 1500, expenses: 1050 },
    ];

    const result = calculateGrowthComparison(data);

    // Income grew faster than expenses
    expect(result.hasLifestyleCreep).toBe(false);
    expect(result.creepDelta).toBeLessThan(0);
  });

  it('should handle equal growth scenario', () => {
    const data: MonthlyAggregate[] = [
      { month: '2024-01', income: 1000, expenses: 800 },
      { month: '2024-02', income: 1100, expenses: 880 },
      { month: '2024-03', income: 1200, expenses: 960 },
      { month: '2024-04', income: 1300, expenses: 1040 },
      { month: '2024-05', income: 1400, expenses: 1120 },
      { month: '2024-06', income: 1500, expenses: 1200 },
    ];

    const result = calculateGrowthComparison(data);

    // Both grew at same rate (income +50%, expenses +50% from 800 to 1200)
    expect(result.hasLifestyleCreep).toBe(false);
    expect(result.creepDelta).toBe(0);
  });

  it('should return null growth when baseline is zero', () => {
    const data: MonthlyAggregate[] = [
      { month: '2024-01', income: 0, expenses: 0 },
      { month: '2024-02', income: 1000, expenses: 800 },
    ];

    const result = calculateGrowthComparison(data);

    expect(result.incomeGrowth).toBeNull();
    expect(result.expenseGrowth).toBeNull();
    expect(result.creepDelta).toBeNull();
  });

  it('should handle insufficient data gracefully', () => {
    const data: MonthlyAggregate[] = [
      { month: '2024-01', income: 1000, expenses: 800 },
    ];

    const result = calculateGrowthComparison(data);

    expect(result.isInsufficientData).toBe(true);
  });

  it('should determine warning levels correctly', () => {
    // Critical: negative income growth + positive expense growth
    const criticalData: MonthlyAggregate[] = [
      { month: '2024-01', income: 2000, expenses: 800 },
      { month: '2024-02', income: 1800, expenses: 900 },
      { month: '2024-03', income: 1600, expenses: 1000 },
    ];

    const criticalResult = calculateGrowthComparison(criticalData);
    expect(criticalResult.warningLevel).toBe('critical');

    // Warning: expenses grew more than income (but creep delta < 10%)
    const warningData: MonthlyAggregate[] = [
      { month: '2024-01', income: 1000, expenses: 800 },
      { month: '2024-02', income: 1050, expenses: 880 },
      { month: '2024-03', income: 1100, expenses: 940 },
    ];

    const warningResult = calculateGrowthComparison(warningData);
    // Income: +10%, Expenses: +17.5%, Delta: +7.5% -> warning (not critical)
    expect(warningResult.warningLevel).toBe('warning');
  });
});
