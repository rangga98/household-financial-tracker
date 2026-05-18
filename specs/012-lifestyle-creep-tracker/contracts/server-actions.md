# Server Actions Contract: Lifestyle Creep Tracker

**Purpose**: API contract for Next.js Server Actions used by this feature
**Type**: Internal Server Actions (not public API endpoints)
**Authentication**: Requires authenticated user with household access

---

## Server Action: `getLifestyleCreepAnalysis`

**File**: `app/(dashboard)/analytics/lifestyle-creep/actions.ts`

**Purpose**: Fetches aggregated transaction data and returns growth comparison analysis

### Request

```typescript
interface GetLifestyleCreepAnalysisRequest {
  /** Period type selection */
  periodType: '3months' | '6months' | '12months' | 'custom';
  
  /** Required if periodType = 'custom' */
  customStartDate?: string; // ISO date format (YYYY-MM-DD)
  
  /** Required if periodType = 'custom' */
  customEndDate?: string; // ISO date format (YYYY-MM-DD)
}
```

### Response

```typescript
interface GetLifestyleCreepAnalysisResponse {
  /** Success flag */
  success: boolean;
  
  /** Error message if success = false */
  error?: string;
  
  /** Analysis result (null if insufficient data) */
  data?: {
    /** Period metadata */
    period: {
      startDate: string;
      endDate: string;
      monthsAnalyzed: number;
    };
    
    /** Income analysis */
    income: {
      firstPeriodAverage: number;
      lastPeriodAverage: number;
      growthPercent: number | null;
    };
    
    /** Expense analysis */
    expenses: {
      firstPeriodAverage: number;
      lastPeriodAverage: number;
      growthPercent: number | null;
    };
    
    /** Comparison results */
    comparison: {
      creepDeltaPercent: number | null;
      hasLifestyleCreep: boolean;
      warningLevel: 'none' | 'warning' | 'critical';
    };
    
    /** Monthly trend data for chart */
    trendData: Array<{
      monthLabel: string;
      income: number;
      expenses: number;
    }>;
  };
}
```

### Error Codes

| Error | HTTP Status | Description |
|-------|-------------|-------------|
| `UNAUTHORIZED` | 401 | User not authenticated |
| `INSUFFICIENT_DATA` | 400 | Less than 3 months of data available |
| `INVALID_DATE_RANGE` | 400 | Custom date range is invalid (end before start) |
| `DATABASE_ERROR` | 500 | Supabase query failed |

### Example Usage

```typescript
// Client component
'use client';

import { getLifestyleCreepAnalysis } from './actions';

async function loadAnalysis() {
  const result = await getLifestyleCreepAnalysis({
    periodType: '6months'
  });
  
  if (result.success && result.data) {
    console.log('Income growth:', result.data.income.growthPercent);
    console.log('Has lifestyle creep:', result.data.comparison.hasLifestyleCreep);
  }
}
```

---

## Implementation Notes

1. **Row Level Security**: The Server Action automatically filters by the authenticated user's `household_id` via Supabase RLS
2. **Caching**: Consider React `cache()` for identical period requests within the same render
3. **Transfer Exclusion**: Internal SQL query excludes `type = 'transfer'` transactions
4. **Currency**: All amounts returned in the currency stored in the database (no conversion)

---

## Database Query Contract

**Internal function**: `lib/supabase/queries/lifestyleCreepQueries.ts`

### Function: `getMonthlyAggregates`

**Input**:
```typescript
{
  householdId: string;
  startDate: string; // ISO date
  endDate: string;   // ISO date
}
```

**Output**:
```typescript
Array<{
  month: string;      // "2024-01"
  income: number;     // SUM of income transactions
  expenses: number;   // SUM of expense transactions (positive value)
}>
```

**Query Implementation**:
```typescript
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
  .not('type', 'eq', 'transfer')  // Exclude transfers
  .group('month')
  .order('month');
```
