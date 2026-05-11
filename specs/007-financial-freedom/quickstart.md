# Quickstart: Financial Freedom Module

**Feature**: Financial Freedom Module | **Date**: 2026-05-11

## Prerequisites

- Supabase project configured (same as existing features)
- Database schema from `001-cash-flow-tracker` applied
- Emergency Fund migration (`003-emergency-fund.sql`) applied

## 1. Apply Database Migration

Run the following SQL in the Supabase SQL Editor to add FI fields to the `profiles` table:

```sql
-- Financial Freedom Module Migration
-- Add FI-related columns to the existing profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS fi_annual_expenses NUMERIC(14,2) CHECK (fi_annual_expenses >= 0),
ADD COLUMN IF NOT EXISTS fi_savings_rate NUMERIC(5,4) CHECK (fi_savings_rate >= 0 AND fi_savings_rate <= 1),
ADD COLUMN IF NOT EXISTS fi_current_age INTEGER CHECK (fi_current_age >= 0),
ADD COLUMN IF NOT EXISTS fi_current_net_worth NUMERIC(14,2) CHECK (fi_current_net_worth >= 0),
ADD COLUMN IF NOT EXISTS fi_expected_return NUMERIC(5,4) CHECK (fi_expected_return >= 0);

-- Set sensible default for expected return
UPDATE profiles SET fi_expected_return = 0.07 WHERE fi_expected_return IS NULL;
```

## 2. Environment Variables

No new environment variables required. Reuses existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 3. Verify Tremor Availability

Confirm `@tremor/react` is installed (already in `package.json`):

```bash
npm list @tremor/react
```

Expected: `@tremor/react@^3.18.7`

## 4. Development Workflow (TDD)

Per the Constitution, write tests **before** implementation:

```bash
# 1. Create and run the financial calculation tests (should fail / Red)
vitest run src/lib/utils/finance.test.ts

# 2. Implement the pure functions in src/lib/utils/finance.ts (Green)

# 3. Refactor if needed

# 4. Create and run the dashboard component tests
vitest run src/components/features/financial-freedom/FinancialFreedomDashboard.test.tsx

# 5. Implement the dashboard component
```

## 5. Local Development

```bash
npm run dev
# Navigate to: http://localhost:3000/financial-freedom
```

## 6. File Checklist

After implementation, the following files should exist:

```text
src/
├── app/
│   └── financial-freedom/
│       └── page.tsx                    # Financial Freedom page (Server Component)
│
├── components/features/
│   └── financial-freedom/
│       ├── FinancialFreedomDashboard.tsx   # Main dashboard (Client Component)
│       ├── FinancialFreedomDashboard.test.tsx
│       ├── FIProjectionChart.tsx           # Tremor AreaChart wrapper
│       ├── FIProgressCard.tsx              # Tremor ProgressBar + KPI cards
│       ├── FIInputForm.tsx                 # Form for editing FI parameters
│       └── FIInputForm.test.tsx
│
├── lib/
│   ├── utils/
│   │   ├── finance.ts                    # Pure financial calculation functions
│   │   └── finance.test.ts               # Vitest unit tests (MUST exist before finance.ts)
│   │
│   └── supabase/
│       └── queries/
│           └── financial-freedom.ts      # CRUD for FI profile fields
│
└── types/
    └── financial-freedom.ts              # FIProfile, FIProjection, FIYearProjection
```

## 7. Testing Commands

```bash
# Run all tests
npm run test:run

# Run financial calculation tests only
npx vitest run src/lib/utils/finance.test.ts

# Run component tests
npx vitest run src/components/features/financial-freedom/

# Watch mode for TDD
npx vitest src/lib/utils/finance.test.ts
```
