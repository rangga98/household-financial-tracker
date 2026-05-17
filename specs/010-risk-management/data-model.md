# Data Model: Risk Management Module (Protection Layer)

**Phase**: 1 | **Date**: 2026-05-17 | **Feature**: Risk Management Module

---

## Overview

This feature requires **one new table** (`insurance_policies`) and **three minimal changes** to existing tables. Health budgeting requires zero schema changes — it fully reuses existing `categories` and `transactions` infrastructure.

---

## Database Schema (Supabase/PostgreSQL)

### New Table

#### `insurance_policies`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Policy ID |
| `household_id` | UUID | NOT NULL, FK → households ON DELETE CASCADE | RLS boundary |
| `name` | VARCHAR(255) | NOT NULL | Policy display name (e.g., "Jiwa AIA") |
| `insurance_type` | VARCHAR(50) | NOT NULL, CHECK IN ('life','health','property','vehicle','other') | Policy type |
| `insurer` | VARCHAR(255) | NOT NULL | Insurance company name |
| `coverage_amount` | NUMERIC(14,2) | NOT NULL, CHECK >= 0 | Total coverage/sum assured |
| `premium_amount` | NUMERIC(14,2) | NOT NULL, CHECK > 0 | Premium amount per payment cycle |
| `payment_frequency` | VARCHAR(20) | NOT NULL, CHECK IN ('monthly','quarterly','semi-annual','annual','one-time') | Payment schedule |
| `start_date` | DATE | NOT NULL | Policy start date |
| `next_due_date` | DATE | NULLABLE | Next premium due date (NULL for one-time) |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Active flag — false = soft-deactivated |
| `notes` | TEXT | NULLABLE | Optional freeform notes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | Soft delete timestamp |

**RLS**: Enable RLS. Policy: `Allow all for demo` (consistent with other tables).

---

### Modified Existing Tables

#### `transactions` (Add Column — Migration 010)

```sql
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS policy_id UUID REFERENCES insurance_policies(id) ON DELETE SET NULL;
```

- `policy_id` is NULL for all non-premium transactions.
- When a user marks a premium as paid, a `transactions` row is inserted with `type = 'expense'`, `amount = premium_amount`, `transaction_date = payment date`, `category_id = <Insurance category>`, and `policy_id = <policy id>`.
- Follows the identical pattern as `transactions.goal_id` (introduced in `003-emergency-fund.sql`).

---

#### `financial_goals` (Extend `goal_type` CHECK — Migration 010)

```sql
ALTER TABLE financial_goals
DROP CONSTRAINT IF EXISTS financial_goals_goal_type_check;

ALTER TABLE financial_goals
ADD CONSTRAINT financial_goals_goal_type_check
CHECK (goal_type IN ('emergency', 'sinking', 'savings', 'debt', 'protection_target'));
```

- The family protection target is stored as a single row with `goal_type = 'protection_target'`, `name = 'Family Protection Target'`, `target_amount = <user-set coverage goal>`, `current_amount = 0` (not used for this type).
- One row per household (enforced at application level; not a DB UNIQUE constraint in v1 per KISS).

---

### Reused Tables (No Schema Change)

#### `categories` (Reused)

Healthcare categories are seeded in Migration 010 with `INSERT ... ON CONFLICT DO NOTHING`:

| Category Name | Type | Icon | Color |
|---|---|---|---|
| Dokter / Doctor | `variable` | `stethoscope` | `#0ea5e9` |
| Farmasi / Pharmacy | `variable` | `pill` | `#10b981` |
| Gigi / Dental | `variable` | `smile` | `#f59e0b` |
| Mata / Vision | `variable` | `eye` | `#8b5cf6` |
| Lab & Diagnostik | `variable` | `flask-conical` | `#ef4444` |

Monthly health budget for each category is configured via the existing `categories.monthly_limit` column (added by `004-simple-budgeting.sql`).

#### `transactions` (Reused for Health Expenses)

Out-of-pocket healthcare expenses are inserted as standard `expense` transactions:
- `type = 'expense'`
- `category_id` → one of the healthcare category IDs above
- `policy_id = NULL`
- `goal_id = NULL`

No schema change required.

---

## Migration File

**Path**: `src/lib/supabase/migrations/010-risk-management.sql`

```sql
-- Migration 010: Risk Management Module (Protection Layer)
-- Creates insurance_policies table
-- Adds policy_id to transactions
-- Extends financial_goals.goal_type to include 'protection_target'
-- Seeds default healthcare categories
-- Run after 009-net-worth-tracker.sql is applied

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

-- 2. Add policy_id to transactions (mirrors the goal_id pattern from 003-emergency-fund.sql)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS policy_id UUID REFERENCES insurance_policies(id) ON DELETE SET NULL;

-- 3. Extend financial_goals.goal_type CHECK to include 'protection_target'
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

-- 6. Seed default healthcare categories (idempotent — ON CONFLICT DO NOTHING)
-- Note: household_id is intentionally omitted; healthcare categories are global defaults
-- In a real multi-tenant setup, these would be seeded per-household at signup.
-- For demo purposes, they are inserted as household-agnostic seeds.
-- Implementors: insert these per-household during onboarding or use a "seed" household_id.
```

> **Note**: The healthcare category seed SQL requires a `household_id` value, which is runtime data. The actual INSERT is handled in the `seedHealthcareCategories(householdId)` Server Action called during first use of the Risk Management module (lazy seeding pattern, consistent with how Sinking Funds creates the "Sinking Fund" category on first contribution).

---

## Indexes Summary

| Index | Table | Columns | Condition |
|---|---|---|---|
| `idx_insurance_policies_household_active` | `insurance_policies` | `(household_id, is_active)` | `WHERE deleted_at IS NULL` |
| `idx_insurance_policies_next_due` | `insurance_policies` | `(household_id, next_due_date)` | `WHERE deleted_at IS NULL AND is_active = true` |
| `idx_transactions_policy` | `transactions` | `(policy_id)` | `WHERE policy_id IS NOT NULL` |

---

## TypeScript Interfaces

### `src/types/risk-management.ts` (New File)

```typescript
export type InsuranceType = 'life' | 'health' | 'property' | 'vehicle' | 'other'
export type PaymentFrequency = 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'one-time'
export type PremiumStatus = 'upcoming' | 'overdue' | 'paid' | 'one-time'

export interface InsurancePolicy {
  id: string
  householdId: string
  name: string
  insuranceType: InsuranceType
  insurer: string
  coverageAmount: number
  premiumAmount: number
  paymentFrequency: PaymentFrequency
  startDate: string              // ISO date 'YYYY-MM-DD'
  nextDueDate: string | null     // null for one-time policies
  isActive: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface InsurancePremiumRecord {
  id: string                     // transactions.id
  policyId: string
  amount: number
  transactionDate: string
  notes: string | null
}

export interface ProtectionTarget {
  id: string                     // financial_goals.id
  householdId: string
  targetAmount: number           // financial_goals.target_amount
}

export interface CoverageStatus {
  totalCoverage: number
  protectionTarget: number | null
  gap: number                    // target - total (positive = gap, negative = surplus, 0 = exact match)
  percentage: number             // (totalCoverage / protectionTarget) * 100, 0 if no target set
  isAdequate: boolean            // totalCoverage >= protectionTarget (false if no target set)
  color: 'green' | 'yellow' | 'red' | 'gray'
}

export interface PolicyWithStatus extends InsurancePolicy {
  premiumStatus: PremiumStatus
  daysUntilDue: number | null    // null if paid or one-time
}

export interface InsuranceDashboardData {
  policies: PolicyWithStatus[]
  coverageStatus: CoverageStatus
  protectionTarget: ProtectionTarget | null
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

---

## Derived State (Never Persisted)

### Premium Status

```typescript
// Derived from insurance_policies.next_due_date and transactions with policy_id
function derivePremiumStatus(
  policy: InsurancePolicy,
  lastPaymentDate: string | null,
  today: Date
): PremiumStatus
```

Logic:
- `'one-time'` → `payment_frequency === 'one-time'`
- `'paid'` → `lastPaymentDate` exists AND `lastPaymentDate >= next_due_date (previous cycle)`
- `'overdue'` → `next_due_date < today` AND not paid
- `'upcoming'` → `next_due_date >= today`

### Coverage Status

```typescript
// From calculateCoverageGap() pure function in src/lib/utils/insurance.ts
function calculateCoverageGap(totalCoverage: number, protectionTarget: number): CoverageStatus
```

### Total Coverage

```typescript
// Derived from SUM of coverage_amount WHERE is_active = true AND deleted_at IS NULL
// Computed server-side in query, never stored
```

---

## Relationships

```
households (1) ─────< insurance_policies (many)
insurance_policies (1) ─────< transactions (many) [via policy_id]

households (1) ─────< financial_goals (many)
financial_goals [goal_type = 'protection_target'] ── 1 per household

households (1) ─────< categories (many) [healthcare categories]
categories (1) ─────< transactions (many) [health expenses]
```

---

## Validation Rules

| Field | Rule |
|---|---|
| `insurance_policies.coverage_amount` | Must be ≥ 0 |
| `insurance_policies.premium_amount` | Must be > 0 |
| `insurance_policies.name` | Non-empty string |
| `insurance_policies.insurer` | Non-empty string |
| `insurance_policies.next_due_date` | NULL only if `payment_frequency = 'one-time'` |
| `financial_goals.target_amount` (protection_target) | Must be > 0 |
| `transactions.amount` (premium) | Must be > 0; must equal `insurance_policies.premium_amount` |
