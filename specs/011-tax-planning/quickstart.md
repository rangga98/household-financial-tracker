# Quickstart: Tax Management & Compliance Module

**Feature**: Tax Planning | **Date**: 2026-05-17

---

## Prerequisites

- Supabase project configured (same as existing features)
- Base schema (`001-cash-flow-tracker`) applied
- Emergency Fund migration (`003-emergency-fund.sql`) applied — creates `financial_goals`, adds `goal_id` to `transactions`
- Sinking Funds migration (`008-sinking-funds.sql`) applied — adds `target_date`, `description` to `financial_goals`
- Risk Management migration (`010-risk-management.sql`) applied — extends `financial_goals.goal_type` CHECK to include `'protection_target'`

---

## 1. Apply Database Migration

Run `src/lib/supabase/migrations/011-tax-planning.sql` in the Supabase SQL Editor:

```sql
-- 1. Add tax_type to financial_goals
ALTER TABLE financial_goals
ADD COLUMN IF NOT EXISTS tax_type VARCHAR(50)
CHECK (tax_type IN ('vehicle_registration', 'property_tax', 'custom'));

-- 2. Extend financial_goals.goal_type CHECK to include 'tax_obligation'
ALTER TABLE financial_goals
DROP CONSTRAINT IF EXISTS financial_goals_goal_type_check;

ALTER TABLE financial_goals
ADD CONSTRAINT financial_goals_goal_type_check
CHECK (goal_type IN ('emergency', 'sinking', 'savings', 'debt', 'protection_target', 'tax_obligation'));

-- 3. Extend transactions with tax deductibility columns
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS is_tax_deductible BOOLEAN DEFAULT false;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS fiscal_year INTEGER;

-- 4. Create tax_filing_deadlines table
CREATE TABLE IF NOT EXISTS tax_filing_deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  tax_type VARCHAR(50) NOT NULL CHECK (tax_type IN ('income_tax', 'custom')),
  fiscal_year INTEGER NOT NULL,
  filing_deadline DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'filed')),
  filed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_filing_deadline_household_type_year
    UNIQUE(household_id, tax_type, fiscal_year)
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_financial_goals_tax_obligation
  ON financial_goals(household_id, goal_type, target_date)
  WHERE deleted_at IS NULL AND goal_type = 'tax_obligation';

CREATE INDEX IF NOT EXISTS idx_transactions_tax_deductible
  ON transactions(household_id, fiscal_year, is_tax_deductible)
  WHERE is_tax_deductible = true;

CREATE INDEX IF NOT EXISTS idx_tax_filing_deadlines_household
  ON tax_filing_deadlines(household_id, status, filing_deadline);

-- 6. Enable RLS on tax_filing_deadlines
ALTER TABLE tax_filing_deadlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for demo" ON tax_filing_deadlines;
CREATE POLICY "Allow all for demo" ON tax_filing_deadlines FOR ALL USING (true) WITH CHECK (true);
```

---

## 2. Environment Variables

No new environment variables required. Reuses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 3. Verify Dependencies

No new packages required. Confirm existing packages are present:

```bash
npm list @tremor/react
npm list @hookform/resolvers
npm list zod
npm list vitest
```

---

## 4. Development Workflow (TDD — Mandatory)

Per the Constitution, write tests **before** implementation:

```bash
# Step 1: Create utility test file and run — should FAIL (Red)
npx vitest run src/lib/utils/tax-planning.test.ts

# Step 2: Implement computeRemainingMonths, computeTaxInstallments,
#          isTaxObligationOverdue, computeDaysUntilDeadline,
#          isFilingDeadlineUrgent, buildObligationWithSchedule
#          in src/lib/utils/tax-planning.ts (Green)

# Step 3: Refactor if needed

# Step 4: Create and run Server Action tests — should FAIL (Red)
npx vitest run src/app/actions/tax-planning.test.ts

# Step 5: Implement Server Actions (Green)

# Step 6: Create and run component tests — should FAIL (Red)
npx vitest run src/components/features/tax-planning/

# Step 7: Implement components (Green)
```

---

## 5. Local Development

```bash
npm run dev
# Navigate to: http://localhost:3000/tax-planning
```

---

## 6. File Checklist

After implementation, the following files should exist:

```text
src/
├── app/
│   ├── tax-planning/
│   │   └── page.tsx                                    # Server Component page
│   └── actions/
│       ├── tax-planning.ts                             # Server Actions
│       └── tax-planning.test.ts                        # Integration tests
│
├── components/features/
│   └── tax-planning/
│       ├── TaxPlanningDashboard.tsx
│       ├── TaxPlanningDashboard.test.tsx
│       ├── TaxObligationSummaryCard.tsx
│       ├── TaxObligationSummaryCard.test.tsx
│       ├── TaxObligationCard.tsx
│       ├── TaxObligationCard.test.tsx
│       ├── TaxObligationList.tsx
│       ├── TaxObligationList.test.tsx
│       ├── TaxObligationForm.tsx
│       ├── TaxObligationForm.test.tsx
│       ├── InstallmentScheduleTable.tsx
│       ├── InstallmentScheduleTable.test.tsx
│       ├── FilingDeadlineList.tsx
│       ├── FilingDeadlineList.test.tsx
│       ├── FilingDeadlineForm.tsx
│       ├── FilingDeadlineForm.test.tsx
│       ├── DeductionList.tsx
│       ├── DeductionList.test.tsx
│       ├── FlagDeductionForm.tsx
│       └── FlagDeductionForm.test.tsx
│
├── lib/
│   ├── utils/
│   │   ├── tax-planning.ts                             # Pure functions (computeTaxInstallments, etc.)
│   │   └── tax-planning.test.ts                        # Vitest unit tests (MUST exist before utils)
│   └── supabase/
│       ├── queries/
│       │   └── tax-planning.ts                         # getTaxObligations, getFilingDeadlines, etc.
│       └── migrations/
│           └── 011-tax-planning.sql                    # Schema changes + new table
│
├── hooks/
│   └── useTaxPlanning.ts                               # Client state hook
│
└── types/
    └── tax-planning.ts                                  # All TypeScript interfaces and types
```

---

## 7. Testing Commands

```bash
# Run all tests
npm run test:run

# Run pure utility function tests only (START HERE — TDD)
npx vitest run src/lib/utils/tax-planning.test.ts

# Run all tax-planning component tests
npx vitest run src/components/features/tax-planning/

# Run Server Action tests
npx vitest run src/app/actions/tax-planning.test.ts

# Watch mode for TDD cycle
npx vitest src/lib/utils/tax-planning.test.ts
```

---

## 8. Key Constraints to Verify

**Installment calculation**:
- `computeRemainingMonths('2026-12-01', new Date('2026-01-01'))` → `11`
- `computeRemainingMonths('2026-01-15', new Date('2026-01-20'))` → `1` (clamped to minimum 1)
- `computeTaxInstallments(1_200_000, '2026-12-01', new Date('2026-01-01'))` → 11 installments; `installments[0].amount > installments[1].amount` (remainder in first); `sum === 1_200_000`
- `computeTaxInstallments(1_000_000, '2026-01-05', new Date('2026-01-01'))` → 1 installment of `1_000_000`
- `computeTaxInstallments(7, '2026-04-01', new Date('2026-01-01'))` → 3 installments: `[3, 2, 2]` (sum = 7)

**Filing deadline**:
- `computeDaysUntilDeadline('2027-03-31', new Date('2027-03-01'))` → `30`
- `isFilingDeadlineUrgent('2027-03-31', 'pending', new Date('2027-03-01'))` → `true`
- `isFilingDeadlineUrgent('2027-03-31', 'filed', new Date('2027-03-01'))` → `false`

**Overdue**:
- `isTaxObligationOverdue('2025-12-01', new Date('2026-01-01'))` → `true`
- `isTaxObligationOverdue('2026-12-01', new Date('2026-01-01'))` → `false`

**Duplicate deadline prevention**:
- `createFilingDeadline` for `(household_id, 'income_tax', 2026)` when one already exists → `{ success: false, error: 'Duplicate filing deadline' }`

**Filing lock**:
- `flagTransactionAsDeductible` when fiscal year is filed → `{ success: false, error: 'Fiscal year 2026 is archived. Unarchive to make changes.' }`

**Soft delete**:
- `deleteTaxObligation` must set `deleted_at`; must NOT delete any `transactions` rows
- Deleted obligations excluded from `getTaxObligations` response (`WHERE deleted_at IS NULL`)
