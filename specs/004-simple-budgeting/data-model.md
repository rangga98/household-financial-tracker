# Data Model: Simple Budgeting (The Guardrail)

**Phase**: 1 | **Date**: 2026-05-09 | **Feature**: Simple Budgeting

## Overview

This feature adds exactly one nullable column to the existing `categories` table. All budget metrics are derived from existing `transactions` via aggregation queries. No new tables are created.

## Schema Change

### `categories` (MODIFIED — Add Column)

```sql
ALTER TABLE categories
ADD COLUMN monthly_limit NUMERIC(14,2) CHECK (monthly_limit > 0);
```

**Fields:**
- `monthly_limit`: Optional positive spending cap for the category. NULL means no budget limit is configured.

## Derived States (Not Stored)

### Monthly Category Spending

```sql
-- Calculated on demand
SELECT 
  category_id,
  COALESCE(SUM(amount), 0) as total_spent
FROM transactions
WHERE household_id = $1
  AND type = 'expense'
  AND category_id = $2
  AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
  AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY category_id;
```

### Daily Spending Power

```typescript
// Pure utility — calculated client-side
function calculateDailySpendingPower(
  monthlyLimit: number,
  totalSpent: number,
  currentDate: Date
): number {
  const remainingBudget = monthlyLimit - totalSpent;
  if (remainingBudget <= 0) return 0;

  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const remainingDays = lastDayOfMonth.getDate() - currentDate.getDate() + 1;

  return Math.max(0, remainingBudget / remainingDays);
}
```

### Overbudget Alert Trigger

```typescript
// Pure utility — derived UI state
function isOverbudget(totalSpent: number, monthlyLimit: number | null): boolean {
  if (!monthlyLimit || monthlyLimit <= 0) return false;
  return totalSpent / monthlyLimit > 0.8;
}
```

### Progress Bar Color

```typescript
// Pure utility — color mapping for Tremor ProgressBar
function getProgressColor(spent: number, limit: number | null): string {
  if (!limit || limit <= 0) return 'gray';
  const pct = spent / limit;
  if (pct >= 1.0) return 'red';
  if (pct >= 0.8) return 'yellow';
  return 'green';
}
```

## TypeScript Interface Update

```typescript
// src/types/index.ts — extend existing Category interface
export interface Category {
  id: string;
  householdId: string;
  name: string;
  type: 'fixed' | 'variable';
  icon?: string;
  color?: string;
  isActive: boolean;
  monthlyLimit?: number;        // NEW: nullable budget limit
  createdAt: Date;
  updatedAt: Date;
}

// NEW: Budget metrics returned from queries
export interface BudgetMetrics {
  categoryId: string;
  categoryName: string;
  monthlyLimit: number | null;
  totalSpent: number;
  remainingBudget: number;
  percentageUsed: number;
  dailySpendingPower: number;
  isOverbudget: boolean;
  progressColor: 'green' | 'yellow' | 'red' | 'gray';
}
```

## Validation Rules

| Field | Rule |
|-------|------|
| `categories.monthly_limit` | Must be > 0 if provided; nullable |

## Indexes

No new indexes required. The existing `idx_transactions_household_date` and `idx_transactions_category` indexes already support the monthly aggregation query efficiently.

## Relationships

```
households (1) ─────< categories (many) [now with monthly_limit]
     │
     └────< transactions (many) ─────> categories
```
