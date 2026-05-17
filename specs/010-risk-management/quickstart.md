# Quickstart: Risk Management Module (Protection Layer)

**Feature**: Risk Management Module | **Date**: 2026-05-17

---

## Prerequisites

- Supabase project configured (same as existing features)
- Base schema (`001-cash-flow-tracker`) applied
- Emergency Fund migration (`003-emergency-fund.sql`) applied — creates `financial_goals` and adds `goal_id` to `transactions`
- Simple Budgeting migration (`004-simple-budgeting.sql`) applied — adds `monthly_limit` to `categories`
- Sinking Funds migration (`008-sinking-funds.sql`) applied — adds `target_date`, `description` to `financial_goals`

---

## 1. Apply Database Migration

Run `src/lib/supabase/migrations/010-risk-management.sql` in the Supabase SQL Editor:

```sql
-- 1. Create insurance_policies table
CREATE TABLE IF NOT EXISTS insurance_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  insurance_type VARCHAR(50) NOT NULL CHECK (insurance_type IN ('life','health','property','vehicle','other')),
  insurer VARCHAR(255) NOT NULL,
  coverage_amount NUMERIC(14,2) NOT NULL CHECK (coverage_amount >= 0),
  premium_amount NUMERIC(14,2) NOT NULL CHECK (premium_amount > 0),
  payment_frequency VARCHAR(20) NOT NULL CHECK (payment_frequency IN ('monthly','quarterly','semi-annual','annual','one-time')),
  start_date DATE NOT NULL,
  next_due_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 2. Add policy_id to transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS policy_id UUID REFERENCES insurance_policies(id) ON DELETE SET NULL;

-- 3. Extend financial_goals goal_type CHECK
ALTER TABLE financial_goals
DROP CONSTRAINT IF EXISTS financial_goals_goal_type_check;

ALTER TABLE financial_goals
ADD CONSTRAINT financial_goals_goal_type_check
CHECK (goal_type IN ('emergency', 'sinking', 'savings', 'debt', 'protection_target'));

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_insurance_policies_household_active
  ON insurance_policies(household_id, is_active)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_insurance_policies_next_due
  ON insurance_policies(household_id, next_due_date)
  WHERE deleted_at IS NULL AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_transactions_policy
  ON transactions(policy_id)
  WHERE policy_id IS NOT NULL;

-- 5. Enable RLS
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for demo" ON insurance_policies;
CREATE POLICY "Allow all for demo" ON insurance_policies FOR ALL USING (true) WITH CHECK (true);
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
```

---

## 4. Development Workflow (TDD — Mandatory)

Per the Constitution, write tests **before** implementation:

```bash
# Step 1: Create insurance utility test file and run — should FAIL (Red)
npx vitest run src/lib/utils/insurance.test.ts

# Step 2: Implement calculateNextPremiumDueDate, calculateCoverageGap,
#          derivePremiumStatus, getDaysUntilDue in src/lib/utils/insurance.ts (Green)

# Step 3: Refactor if needed

# Step 4: Create and run Server Action tests — should FAIL (Red)
npx vitest run src/app/actions/risk-management.test.ts

# Step 5: Implement Server Actions (Green)

# Step 6: Create and run component tests — should FAIL (Red)
npx vitest run src/components/features/risk-management/

# Step 7: Implement components (Green)
```

---

## 5. Local Development

```bash
npm run dev
# Navigate to: http://localhost:3000/risk-management
```

---

## 6. File Checklist

After implementation, the following files should exist:

```text
src/
├── app/
│   ├── risk-management/
│   │   └── page.tsx                              # Server Component page
│   └── actions/
│       ├── risk-management.ts                    # Server Actions
│       └── risk-management.test.ts              # Integration tests
│
├── components/features/
│   └── risk-management/
│       ├── RiskManagementDashboard.tsx
│       ├── RiskManagementDashboard.test.tsx
│       ├── InsuranceSummaryCard.tsx
│       ├── InsuranceSummaryCard.test.tsx
│       ├── PolicyCard.tsx
│       ├── PolicyCard.test.tsx
│       ├── PolicyList.tsx
│       ├── PolicyList.test.tsx
│       ├── PolicyForm.tsx
│       ├── PolicyForm.test.tsx
│       ├── MarkPaidForm.tsx
│       ├── MarkPaidForm.test.tsx
│       ├── ProtectionTargetForm.tsx
│       ├── ProtectionTargetForm.test.tsx
│       ├── HealthBudgetTab.tsx
│       └── HealthBudgetTab.test.tsx
│
├── lib/
│   ├── utils/
│   │   ├── insurance.ts                          # Pure functions (calculateNextPremiumDueDate, etc.)
│   │   └── insurance.test.ts                    # Vitest tests (MUST exist before utils)
│   ├── supabase/
│   │   ├── queries/
│   │   │   └── risk-management.ts               # getInsurancePolicies, getTotalCoverage, etc.
│   │   └── migrations/
│   │       └── 010-risk-management.sql          # Migration SQL
│
├── hooks/
│   └── useRiskManagement.ts                     # Client state hook
│
└── types/
    └── risk-management.ts                        # InsurancePolicy, CoverageStatus, etc.
```

---

## 7. Testing Commands

```bash
# Run all tests
npm run test:run

# Run pure utility function tests only
npx vitest run src/lib/utils/insurance.test.ts

# Run all risk-management component tests
npx vitest run src/components/features/risk-management/

# Run Server Action tests
npx vitest run src/app/actions/risk-management.test.ts

# Watch mode for TDD
npx vitest src/lib/utils/insurance.test.ts
```

---

## 8. Key Constraints to Verify

- `calculateNextPremiumDueDate('2026-01-31', 'monthly')` must return `'2026-02-28'` (month-end clamping)
- `calculateNextPremiumDueDate('2026-01-15', 'quarterly')` must return `'2026-04-15'`
- `calculateNextPremiumDueDate('2026-01-15', 'one-time')` must return `null`
- `calculateCoverageGap(1_500_000_000, 2_000_000_000)` must return `{ gap: 500_000_000, percentage: 75, isAdequate: false, color: 'yellow' }`
- `calculateCoverageGap(2_000_000_000, 2_000_000_000)` must return `{ gap: 0, percentage: 100, isAdequate: true, color: 'green' }`
- `calculateCoverageGap(500_000_000, null)` must return `{ gap: 0, percentage: 0, isAdequate: false, color: 'gray' }`
- `deactivateInsurancePolicy` must set `deleted_at`; must NOT delete any `transactions` rows
- `markPremiumPaid` must insert an `expense` transaction AND update `insurance_policies.next_due_date`
- All monetary values must use `NUMERIC(14,2)` in DB; no floating-point errors in coverage gap display
