# Quickstart: Simple Budgeting (The Guardrail)

**Date**: 2026-05-09 | **Feature**: 004-simple-budgeting

## Prerequisites

- Existing Cash Flow Tracker is set up and running (features 001 and 003)
- Supabase project is connected and migrations 001-003 have been applied
- `categories` table has default Variable categories seeded

## 1. Apply Database Migration

Run in the Supabase SQL Editor:

```sql
-- Migration 004: Add monthly_limit to categories
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS monthly_limit NUMERIC(14,2) CHECK (monthly_limit > 0);
```

Verify:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'categories' AND column_name = 'monthly_limit';
```

## 2. Update TypeScript Types

Add `monthlyLimit?: number` to the `Category` interface in `src/types/index.ts`.

Add the `BudgetMetrics` interface to `src/types/index.ts` (see `data-model.md`).

## 3. Seed a Budget Limit (Optional)

```sql
UPDATE categories
SET monthly_limit = 2000000
WHERE household_id = '<your-household-id>'
  AND type = 'variable'
  AND name = 'Dining Out';
```

## 4. Run Tests

```bash
npx vitest run src/components/features/budgeting
npx vitest run src/lib/utils/budgeting.test.ts
npx vitest run src/lib/supabase/queries/budgeting.test.ts
```

## 5. Verify in UI

1. Navigate to the budgeting dashboard.
2. Set a monthly limit for a Variable category.
3. Record an expense in that category.
4. Confirm the Daily Spending Power updates and the ProgressBar reflects the correct color.
5. Spend past 80% of the limit and confirm the Shadcn Alert appears.
