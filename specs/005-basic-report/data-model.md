# Data Model: Basic Report (The Insight)

**Phase**: 1 | **Date**: 2026-05-10 | **Feature**: Basic Report

## Overview

This feature requires **zero new database tables or columns**. All report data is derived on-the-fly from the existing `transactions` and `categories` tables via aggregation queries. This document defines the derived data shapes and the TypeScript interfaces used by the report components.

## Existing Tables (Read-Only)

### 1. `transactions` — Financial Entries

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Transaction ID |
| `household_id` | UUID | NOT NULL, FK | Household scope (RLS) |
| `user_id` | UUID | NOT NULL, FK | Who recorded it |
| `category_id` | UUID | NOT NULL, FK | Transaction category |
| `type` | VARCHAR(10) | NOT NULL | `'income'` or `'expense'` |
| `amount` | NUMERIC(14,2) | NOT NULL, CHECK > 0 | Monetary value |
| `description` | VARCHAR(255) | NULLABLE | Short description |
| `transaction_date` | DATE | NOT NULL | Date of transaction |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |

**RLS Policy**: `household_id = auth.jwt() -> 'household_id'`

### 2. `categories` — Transaction Categories

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Category ID |
| `household_id` | UUID | NOT NULL, FK | Household scope (RLS) |
| `name` | VARCHAR(100) | NOT NULL | Category name |
| `type` | VARCHAR(20) | NOT NULL | `'fixed'` or `'variable'` |
| `icon` | VARCHAR(50) | NULLABLE | Lucide icon name |
| `color` | VARCHAR(7) | NULLABLE | Hex color code |
| `is_active` | BOOLEAN | DEFAULT true | Soft delete |

**RLS Policy**: `household_id = auth.jwt() -> 'household_id'`

---

## Derived Aggregations (No New DB Tables)

### 1. Expense Breakdown by Category

**Derived via**:
```sql
SELECT
  c.id AS category_id,
  c.name AS category_name,
  c.color AS category_color,
  SUM(t.amount) AS total_amount
FROM transactions t
JOIN categories c ON c.id = t.category_id
WHERE t.household_id = $household_id
  AND t.type = 'expense'
  AND t.transaction_date >= $month_start
  AND t.transaction_date < $next_month_start
GROUP BY c.id, c.name, c.color
ORDER BY total_amount DESC;
```

**TypeScript Interface**:
```typescript
interface ExpenseBreakdownItem {
  categoryId: string;
  categoryName: string;
  categoryColor: string | null;
  totalAmount: number;
  percentage: number; // calculated: (totalAmount / totalExpenses) * 100
}
```

### 2. Monthly Totals (Income & Expenses)

**Derived via**:
```sql
SELECT
  COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
  COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses
FROM transactions
WHERE household_id = $household_id
  AND transaction_date >= $month_start
  AND transaction_date < $next_month_start;
```

**TypeScript Interface**:
```typescript
interface MonthlyTotals {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number | null; // null when totalIncome === 0 (division by zero guard)
  netSavings: number;         // totalIncome - totalExpenses
}
```

### 3. Month-over-Month Comparison

**Derived via**: Execute the Monthly Totals query twice — once for the selected month, once for the previous month — then compute deltas client-side.

**TypeScript Interface**:
```typescript
interface MonthOverMonthComparison {
  currentMonth: MonthlyTotals;
  previousMonth: MonthlyTotals;
  expenseDifference: number;     // current.expenses - previous.expenses
  expensePercentChange: number;   // (difference / previous.expenses) * 100, or 0 if previous === 0
  isIncrease: boolean;
  isSignificantIncrease: boolean; // expensePercentChange > 10%
}
```

---

## Health Status Enum

```typescript
type SavingsHealthStatus = 'healthy' | 'caution' | 'needs_attention';

function getHealthStatus(savingsRate: number | null): SavingsHealthStatus {
  if (savingsRate === null) return 'needs_attention';
  if (savingsRate > 20) return 'healthy';
  if (savingsRate >= 10) return 'caution';
  return 'needs_attention';
}
```

**Tremor Color Mapping**:
| Status | Tremor Color |
|--------|--------------|
| `healthy` | `"emerald"` |
| `caution` | `"yellow"` |
| `needs_attention` | `"red"` |

---

## Complete Report Data Shape

```typescript
interface ReportData {
  selectedMonth: string; // "YYYY-MM" format
  expenseBreakdown: ExpenseBreakdownItem[];
  monthlyTotals: MonthlyTotals;
  comparison: MonthOverMonthComparison | null; // null if no previous month data
}
```

---

## Query Patterns (Supabase/PostgREST)

### Category Aggregation
```typescript
const { data, error } = await supabase
  .from('transactions')
  .select('category_id, amount.sum(), categories(name, color)')
  .eq('household_id', householdId)
  .eq('type', 'expense')
  .gte('transaction_date', '2026-05-01')
  .lt('transaction_date', '2026-06-01')
  .group('category_id, categories.name, categories.color')
  .order('amount.sum()', { ascending: false });
```

### Monthly Income / Expense Totals
```typescript
const { data, error } = await supabase
  .from('transactions')
  .select('type, amount.sum()')
  .eq('household_id', householdId)
  .gte('transaction_date', '2026-05-01')
  .lt('transaction_date', '2026-06-01')
  .group('type');
```

**Note**: Supabase PostgREST returns aggregated results as `{ type: 'income' | 'expense', sum: number }[]`. The client must pivot this into `totalIncome` and `totalExpenses`.
