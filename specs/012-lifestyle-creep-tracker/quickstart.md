# Quick Start: Lifestyle Creep Tracker

**Purpose**: Developer setup guide for implementing this feature  
**Prerequisites**: Familiar with Next.js App Router, Supabase, Tremor, and Shadcn/ui

---

## 1. Verify Prerequisites

Ensure the following are already in the project (per Constitution):

```bash
# Check package.json for these dependencies
- @tremor/react (Tremor charts)
- @radix-ui/react-select (Shadcn/ui Select dependency)
- @radix-ui/react-alert-dialog (Shadcn/ui Alert dependency)
- vitest (testing)
- @testing-library/react (RTL)
```

If missing, install:
```bash
npm install @tremor/react
npx shadcn add alert
npx shadcn add select
```

---

## 2. TDD: Write Tests First

**CRITICAL**: Per Constitution III and FR-011/FR-012, tests MUST be written before implementation.

### Step 2.1: Create test file

Create `/lib/utils/lifestyle-creep/calculateGrowthPercentage.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateGrowthPercentage, calculateAverage } from './calculateGrowthPercentage';

describe('calculateAverage', () => {
  it('should calculate average of positive numbers', () => {
    expect(calculateAverage([10, 20, 30])).toBe(20);
  });
  
  it('should return 0 for empty array', () => {
    expect(calculateAverage([])).toBe(0);
  });
});

describe('calculateGrowthPercentage', () => {
  it('should calculate positive growth', () => {
    expect(calculateGrowthPercentage(100, 150)).toBe(50);
  });
  
  it('should calculate negative growth', () => {
    expect(calculateGrowthPercentage(100, 75)).toBe(-25);
  });
  
  it('should return null for zero baseline (division by zero)', () => {
    expect(calculateGrowthPercentage(0, 100)).toBeNull();
  });
  
  it('should handle zero growth', () => {
    expect(calculateGrowthPercentage(100, 100)).toBe(0);
  });
  
  it('should handle negative values', () => {
    expect(calculateGrowthPercentage(-100, -50)).toBe(50);
  });
  
  it('should be precise to 0.01%', () => {
    const result = calculateGrowthPercentage(1000, 1234.56);
    expect(result).toBeCloseTo(23.456, 2);
  });
});
```

### Step 2.2: Run tests (they should fail)

```bash
npm test calculateGrowthPercentage
# Expect: FAIL - functions don't exist yet
```

---

## 3. Implement Math Utilities

Create `/lib/utils/lifestyle-creep/calculateGrowthPercentage.ts`:

```typescript
/**
 * Calculate average of an array of numbers
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate growth percentage between baseline and current value
 * Returns null if baseline is 0 (division by zero)
 */
export function calculateGrowthPercentage(
  baseline: number,
  current: number
): number | null {
  if (baseline === 0) return null;
  const growth = ((current - baseline) / baseline) * 100;
  return Math.round(growth * 100) / 100; // 2 decimal precision
}
```

Run tests again:
```bash
npm test calculateGrowthPercentage
# Expect: PASS
```

---

## 4. Create Supabase Query

Create `/lib/supabase/queries/lifestyleCreepQueries.ts`:

```typescript
import { supabase } from '@/lib/supabase/client';

export interface MonthlyAggregate {
  month: string;
  income: number;
  expenses: number;
}

export async function getMonthlyAggregates(
  householdId: string,
  startDate: string,
  endDate: string
): Promise<MonthlyAggregate[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      month:date_trunc('month', transaction_date),
      income:sum(amount).filter(type.eq.income),
      expenses:sum(amount.abs()).filter(type.eq.expense)
    `)
    .eq('household_id', householdId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .not('type', 'eq', 'transfer')
    .group('month')
    .order('month');

  if (error) throw error;
  
  return data?.map(row => ({
    month: row.month,
    income: Number(row.income) || 0,
    expenses: Number(row.expenses) || 0
  })) || [];
}
```

---
## 5. Create Server Action

Create `app/(dashboard)/analytics/lifestyle-creep/actions.ts`:

```typescript
'use server';

import { getMonthlyAggregates } from '@/lib/supabase/queries/lifestyleCreepQueries';
import { calculateGrowthPercentage, calculateAverage } from '@/lib/utils/lifestyle-creep/calculateGrowthPercentage';
import { createClient } from '@/lib/supabase/server';

export async function getLifestyleCreepAnalysis(request: {
  periodType: '3months' | '6months' | '12months' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'UNAUTHORIZED' };
  }
  
  // ... implementation continues
  // Calculate date range based on periodType
  // Fetch monthly aggregates
  // Calculate growth percentages
  // Return formatted response
}
```

---

## 6. Create UI Components

### Component Order (all need tests per TDD):

1. `TimePeriodSelector.tsx` - Shadcn/ui Select wrapper
2. `TrendChart.tsx` - Tremor LineChart wrapper
3. `GrowthComparisonCard.tsx` - Display percentages
4. `CreepWarning.tsx` - Shadcn/ui Alert for warnings
5. `LifestyleCreepTracker.tsx` - Main container

### Example: TrendChart.tsx

```typescript
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
  return (
    <LineChart
      className="h-80"
      data={data}
      index="monthLabel"
      categories={['income', 'expenses']}
      colors={['emerald', 'rose']}
      yAxisWidth={60}
    />
  );
}
```

---

## 7. Create Page

Create `app/(dashboard)/analytics/lifestyle-creep/page.tsx`:

```typescript
import { LifestyleCreepTracker } from '@/components/features/lifestyle-creep/LifestyleCreepTracker';

export default function LifestyleCreepPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Lifestyle Creep Tracker</h1>
      <LifestyleCreepTracker />
    </div>
  );
}
```

---

## 8. Verify Implementation

### Checklist:

- [ ] `calculateGrowthPercentage.test.ts` has 100% coverage (run `npm test --coverage`)
- [ ] All edge cases tested: division by zero, negative values, precision
- [ ] Tremor LineChart displays correctly
- [ ] Shadcn/ui Alert shows when expenses > income
- [ ] Period selector updates analysis correctly
- [ ] Mobile responsive (44x44px touch targets)
- [ ] No new database tables created
- [ ] All amounts use NUMERIC(14,2) precision

### Run Full Test Suite:

```bash
npm test
# All tests should pass
```

### Manual Verification:

1. Navigate to `/analytics/lifestyle-creep`
2. Select 6-month period
3. Verify percentages match expected calculations
4. Trigger lifestyle creep warning by simulating higher expense growth
5. Verify chart renders correctly on mobile and desktop

---

## Common Pitfalls

1. **Floating Point Errors**: Always use NUMERIC(14,2) in SQL, not FLOAT
2. **Division by Zero**: Return `null` from `calculateGrowthPercentage`, not `Infinity`
3. **Transfer Exclusion**: Double-check `type = 'transfer'` is excluded
4. **Mobile Touch Targets**: Ensure all interactive elements are ≥44x44px
5. **Test Coverage**: Math utilities must have 100% coverage before proceeding

---

## Next Steps

After implementation is complete:
1. Run `/speckit.checklist` to verify quality
2. Run `/speckit.tasks` to generate task breakdown
3. Run `/speckit.implement` for guided implementation (if needed)
