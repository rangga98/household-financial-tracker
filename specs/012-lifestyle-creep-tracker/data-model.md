# Data Model: Lifestyle Creep Tracker

**Purpose**: Derived state TypeScript interfaces - NO DATABASE TABLES  
**Status**: Phase 1 Output  
**⚠️ CRITICAL**: All entities below are DERIVED STATE calculated at runtime from the existing `transactions` table. Do NOT create database tables for these.

---

## Source of Truth

All data originates from the existing **`transactions`** table with the following relevant columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `household_id` | UUID | Row Level Security scope |
| `transaction_date` | DATE | Date of transaction |
| `amount` | NUMERIC(14,2) | Transaction amount (positive for income, negative for expenses) |
| `type` | ENUM | `'income'`, `'expense'`, or `'transfer'` |
| `created_at` | TIMESTAMP | Audit field |
| `updated_at` | TIMESTAMP | Audit field |

---

## Derived State Interfaces

### 1. MonthlyAggregate

Represents aggregated income and expenses for a single month. Calculated via SQL GROUP BY.

```typescript
interface MonthlyAggregate {
  /** Month in ISO format (YYYY-MM) */
  month: string;
  
  /** Total income for the month (sum of all income transactions) */
  income: number;
  
  /** Total expenses for the month (absolute sum of expense transactions) */
  expenses: number;
  
  /** Net cash flow (income - expenses) */
  netCashFlow: number;
}
```

**Calculation Logic**:
```sql
SELECT 
  TO_CHAR(transaction_date, 'YYYY-MM') as month,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
  ABS(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) as expenses
FROM transactions
WHERE type IN ('income', 'expense')  -- Exclude transfers
GROUP BY month
```

---

### 2. TrendDataPoint

Individual data point for the Tremor LineChart. Derived from MonthlyAggregate.

```typescript
interface TrendDataPoint {
  /** Month label for chart display (e.g., "Jan 2024", "Feb 2024") */
  monthLabel: string;
  
  /** Income amount for this month */
  income: number;
  
  /** Expense amount for this month */
  expenses: number;
}
```

**Transformation Logic**:
```typescript
function toTrendDataPoint(aggregate: MonthlyAggregate): TrendDataPoint {
  return {
    monthLabel: formatMonthLabel(aggregate.month), // "Jan 2024"
    income: aggregate.income,
    expenses: aggregate.expenses
  };
}
```

---

### 3. GrowthComparison

Core analysis result comparing first-half average vs last-half average.

```typescript
interface GrowthComparison {
  /** Start date of the analysis period */
  periodStart: string; // ISO date
  
  /** End date of the analysis period */
  periodEnd: string; // ISO date
  
  /** Number of months in the analysis period */
  monthsAnalyzed: number;
  
  /** Average income for first 3 months (or first month if period < 6 months) */
  firstPeriodAvgIncome: number;
  
  /** Average expenses for first 3 months (or first month if period < 6 months) */
  firstPeriodAvgExpenses: number;
  
  /** Average income for last 3 months (or last month if period < 6 months) */
  lastPeriodAvgIncome: number;
  
  /** Average expenses for last 3 months (or last month if period < 6 months) */
  lastPeriodAvgExpenses: number;
  
  /** Income growth percentage (e.g., 15.5 for 15.5% increase) */
  incomeGrowthPercent: number | null; // null if division by zero
  
  /** Expense growth percentage (e.g., 20.2 for 20.2% increase) */
  expenseGrowthPercent: number | null; // null if division by zero
  
  /** Difference between expense and income growth (expense - income) */
  creepDeltaPercent: number | null; // null if either growth is null
  
  /** Flag indicating if expenses grew faster than income */
  hasLifestyleCreep: boolean;
  
  /** Warning severity level */
  warningLevel: 'none' | 'warning' | 'critical';
  
  /** Monthly trend data for chart visualization */
  trendData: TrendDataPoint[];
}
```

**Calculation Logic**:
```typescript
function calculateGrowthComparison(
  aggregates: MonthlyAggregate[],
  periodStart: string,
  periodEnd: string
): GrowthComparison {
  const months = aggregates.length;
  const splitPoint = months >= 6 ? 3 : 1;
  
  const firstHalf = aggregates.slice(0, splitPoint);
  const secondHalf = aggregates.slice(-splitPoint);
  
  const firstIncomeAvg = average(firstHalf.map(a => a.income));
  const firstExpenseAvg = average(firstHalf.map(a => a.expenses));
  const lastIncomeAvg = average(secondHalf.map(a => a.income));
  const lastExpenseAvg = average(secondHalf.map(a => a.expenses));
  
  const incomeGrowth = calculateGrowthPercentage(firstIncomeAvg, lastIncomeAvg);
  const expenseGrowth = calculateGrowthPercentage(firstExpenseAvg, lastExpenseAvg);
  
  return {
    // ... other fields
    incomeGrowthPercent: incomeGrowth,
    expenseGrowthPercent: expenseGrowth,
    creepDeltaPercent: incomeGrowth !== null && expenseGrowth !== null
      ? expenseGrowth - incomeGrowth
      : null,
    hasLifestyleCreep: (expenseGrowth ?? 0) > (incomeGrowth ?? 0),
    warningLevel: determineWarningLevel(expenseGrowth, incomeGrowth)
  };
}
```

---

### 4. TimePeriodSelection

UI state for user's selected analysis window. Stored in React state only - no persistence.

```typescript
type PeriodType = '3months' | '6months' | '12months' | 'custom';

interface TimePeriodSelection {
  /** Selected period type */
  periodType: PeriodType;
  
  /** Custom start date (only when periodType = 'custom') */
  customStartDate?: string; // ISO date
  
  /** Custom end date (only when periodType = 'custom') */
  customEndDate?: string; // ISO date
}
```

**Date Calculation**:
```typescript
function getPeriodDates(selection: TimePeriodSelection): { start: string; end: string } {
  const end = new Date();
  
  switch (selection.periodType) {
    case '3months':
      return { start: subMonths(end, 3), end };
    case '6months':
      return { start: subMonths(end, 6), end };
    case '12months':
      return { start: subMonths(end, 12), end };
    case 'custom':
      return { 
        start: selection.customStartDate!, 
        end: selection.customEndDate! 
      };
  }
}
```

---

## Validation Rules

1. **Minimum Data Requirement**: At least 3 months of data required for meaningful analysis
2. **Division by Zero**: If `firstPeriodAvg` is 0, growth percentage returns `null` (not Infinity)
3. **Missing Months**: Gaps in data are treated as 0 income/expense for that month (consistent with query behavior)
4. **Transfer Exclusion**: Transactions with `type = 'transfer'` are excluded from all calculations

---

## State Flow Diagram

```
┌─────────────────┐
│  transactions   │  ← Source of Truth (existing table)
│     table       │
└────────┬────────┘
         │ SQL GROUP BY
         ▼
┌─────────────────┐
│ MonthlyAggregate│  ← Derived via Supabase query
│   (interface)   │
└────────┬────────┘
         │ TypeScript aggregation
         ▼
┌─────────────────┐
│ GrowthComparison│  ← Core analysis result
│   (interface)   │
└────────┬────────┘
         │ UI rendering
         ▼
┌─────────────────┐
│  UI Components  │  ← Tremor LineChart, Shadcn/ui Alert
└─────────────────┘
```

---

## No Database Tables Required

**REMINDER**: The following are NOT database tables - they are TypeScript interfaces representing runtime-calculated data:

- ❌ NO `lifestyle_creep_analysis` table
- ❌ NO `trend_data_points` table  
- ❌ NO `time_period_selections` table

All data flows from `transactions` → SQL aggregation → TypeScript interfaces → UI components.
