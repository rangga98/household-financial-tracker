# Quickstart: Education Costs & Sinking Funds Module

**Feature**: Education Costs & Sinking Funds | **Date**: 2026-05-12

## Prerequisites

- Supabase project configured (same as existing features)
- Base schema from `001-cash-flow-tracker` applied
- Emergency Fund migration (`003-emergency-fund.sql`) applied — this created `financial_goals` and added `goal_id` to `transactions`

## 1. Apply Database Migration

Run the following SQL in the Supabase SQL Editor:

```sql
-- Migration 008: Education Costs & Sinking Funds
-- Extends financial_goals table with target_date and description columns
-- No new tables — reuses existing Virtual Bucket pattern

ALTER TABLE financial_goals
ADD COLUMN IF NOT EXISTS target_date DATE,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Index for sinking fund queries by household
CREATE INDEX IF NOT EXISTS idx_financial_goals_sinking
  ON financial_goals(household_id, goal_type, target_date)
  WHERE deleted_at IS NULL AND goal_type = 'sinking';
```

## 2. Environment Variables

No new environment variables required. Reuses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Verify Dependencies

Confirm required packages are installed:

```bash
npm list @tremor/react
npm list @hookform/resolvers
npm list zod
```

Expected versions match existing `package.json` entries.

## 4. Development Workflow (TDD — Mandatory)

Per the Constitution, write tests **before** implementation:

```bash
# Step 1: Create and run pure function tests (should FAIL — Red)
npx vitest run src/lib/utils/sinking-funds.test.ts

# Step 2: Implement computeFutureValue, computeProgress, isFundOverdue (Green)
# src/lib/utils/sinking-funds.ts

# Step 3: Refactor if needed

# Step 4: Create and run component tests (should FAIL — Red)
npx vitest run src/components/features/sinking-funds/

# Step 5: Implement components (Green)
```

## 5. Local Development

```bash
npm run dev
# Navigate to: http://localhost:3000/sinking-funds
```

## 6. File Checklist

After implementation, the following files should exist:

```text
src/
├── app/
│   └── sinking-funds/
│       └── page.tsx                         # Server Component page
│
├── components/features/
│   └── sinking-funds/
│       ├── SinkingFundsDashboard.tsx
│       ├── SinkingFundsDashboard.test.tsx
│       ├── SinkingFundCard.tsx
│       ├── SinkingFundCard.test.tsx
│       ├── SinkingFundForm.tsx
│       ├── SinkingFundForm.test.tsx
│       ├── ContributionForm.tsx
│       ├── ContributionForm.test.tsx
│       ├── EducationCalculator.tsx
│       ├── EducationCalculator.test.tsx
│       ├── FundList.tsx
│       └── FundList.test.tsx
│
├── lib/
│   ├── utils/
│   │   ├── sinking-funds.ts                 # computeFutureValue, computeProgress, isFundOverdue
│   │   └── sinking-funds.test.ts            # Vitest tests (MUST exist before utils)
│   ├── supabase/
│   │   ├── queries/
│   │   │   └── sinking-funds.ts             # getSinkingFunds, getSinkingFundById, getContributionsByGoal
│   │   └── migrations/
│   │       └── 008-sinking-funds.sql        # ALTER TABLE migration
│   └── actions/
│       └── sinking-funds.ts                 # createSinkingFund, updateSinkingFund, deleteSinkingFund, recordContribution
│
├── hooks/
│   └── useSinkingFunds.ts
│
└── types/
    └── sinking-funds.ts                     # SinkingFund, SinkingFundContribution, EducationEstimate
```

## 7. Testing Commands

```bash
# Run all tests
npm run test:run

# Run pure function tests only
npx vitest run src/lib/utils/sinking-funds.test.ts

# Run all sinking funds component tests
npx vitest run src/components/features/sinking-funds/

# Watch mode for TDD
npx vitest src/lib/utils/sinking-funds.test.ts
```

## 8. Key Constraints to Verify

- `computeFutureValue(50_000_000, 0.05, 10)` must return `81_444_731.47` (rounded to 2 dp)
- `computeProgress(0, 100_000)` must return `0`
- `computeProgress(150_000, 100_000)` must return `150` (over-funded, not capped)
- `deleteSinkingFund` must set `deleted_at`; must NOT delete any `transactions` rows
- `recordContribution` must increment `financial_goals.current_amount` atomically
