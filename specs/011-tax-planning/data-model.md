# Data Model: Tax Management & Compliance Module

**Phase**: 1 | **Date**: 2026-05-17 | **Feature**: Tax Planning

---

## Overview

This feature introduces **one new table** (`tax_filing_deadlines`) and **three minimal alterations** to existing tables. No new table is created for tax obligations or deduction records.

| Change | Type | Table |
|--------|------|-------|
| Add `goal_type = 'tax_obligation'` + `tax_type` column | ALTER | `financial_goals` |
| Add `is_tax_deductible` + `fiscal_year` columns | ALTER | `transactions` |
| New table | CREATE | `tax_filing_deadlines` |

---

## Database Schema (Supabase/PostgreSQL)

### New Table

#### `tax_filing_deadlines`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Deadline ID |
| `household_id` | UUID | NOT NULL, FK → households ON DELETE CASCADE | RLS boundary |
| `tax_type` | VARCHAR(50) | NOT NULL, CHECK IN ('income_tax', 'custom') | Filing type |
| `fiscal_year` | INTEGER | NOT NULL | Calendar year (e.g., 2026) |
| `filing_deadline` | DATE | NOT NULL | Deadline date (e.g., 2027-03-31 for FY2026) |
| `status` | VARCHAR(20) | NOT NULL DEFAULT 'pending', CHECK IN ('pending', 'filed') | Filing lifecycle status |
| `filed_at` | TIMESTAMPTZ | NULLABLE | Timestamp when marked as filed |
| `notes` | TEXT | NULLABLE | Optional freeform notes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |

**Unique constraint**: `UNIQUE(household_id, tax_type, fiscal_year)` — enforces FR-011 (no duplicate deadlines for same type + year).

**RLS**: Enable RLS. Policy: `Allow all for demo` (consistent with other tables).

---

### Modified Existing Tables

#### `financial_goals` (Migration 011)

```sql
-- 1. Add tax_type column (only populated when goal_type = 'tax_obligation')
ALTER TABLE financial_goals
ADD COLUMN IF NOT EXISTS tax_type VARCHAR(50)
CHECK (tax_type IN ('vehicle_registration', 'property_tax', 'custom'));

-- 2. Extend goal_type CHECK to include 'tax_obligation'
ALTER TABLE financial_goals
DROP CONSTRAINT IF EXISTS financial_goals_goal_type_check;

ALTER TABLE financial_goals
ADD CONSTRAINT financial_goals_goal_type_check
CHECK (goal_type IN ('emergency', 'sinking', 'savings', 'debt', 'protection_target', 'tax_obligation'));
```

**How tax obligations map to existing columns**:

| `financial_goals` column | Tax Obligation meaning |
|--------------------------|------------------------|
| `goal_type` | `'tax_obligation'` |
| `name` | User-defined label (e.g., "Honda Beat B 1234 XY") |
| `tax_type` | `'vehicle_registration'` / `'property_tax'` / `'custom'` (NEW column) |
| `target_amount` | Total annual tax bill |
| `current_amount` | Amount set aside so far (via linked transactions) |
| `target_date` | Annual due date (added by Feature 008 migration) |
| `description` | Optional notes (added by Feature 008 migration) |
| `deleted_at` | Soft-delete timestamp |

**RLS Policy**: Inherits existing `financial_goals` RLS (scoped by `household_id`).

---

#### `transactions` (Migration 011)

```sql
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS is_tax_deductible BOOLEAN DEFAULT false;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS fiscal_year INTEGER;
```

- `is_tax_deductible` defaults to `false` for all existing rows — backward-compatible, no data migration needed.
- `fiscal_year` is `NULL` for non-deductible transactions; populated only when `is_tax_deductible = true`.
- Pattern mirrors `policy_id` (Feature 010) and `notes` (Feature 008) — non-breaking nullable column additions.

---

## Migration File

**Path**: `src/lib/supabase/migrations/011-tax-planning.sql`

```sql
-- Migration 011: Tax Management & Compliance Module
-- Creates tax_filing_deadlines table
-- Extends financial_goals with tax_type column and updated goal_type CHECK
-- Extends transactions with is_tax_deductible and fiscal_year columns
-- Run after 010-risk-management.sql is applied

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

## Indexes Summary

| Index | Table | Columns | Condition |
|-------|-------|---------|-----------|
| `idx_financial_goals_tax_obligation` | `financial_goals` | `(household_id, goal_type, target_date)` | `WHERE deleted_at IS NULL AND goal_type = 'tax_obligation'` |
| `idx_transactions_tax_deductible` | `transactions` | `(household_id, fiscal_year, is_tax_deductible)` | `WHERE is_tax_deductible = true` |
| `idx_tax_filing_deadlines_household` | `tax_filing_deadlines` | `(household_id, status, filing_deadline)` | — |

---

## TypeScript Interfaces

**File**: `src/types/tax-planning.ts`

```typescript
export type TaxObligationType = 'vehicle_registration' | 'property_tax' | 'custom'
export type FilingStatus = 'pending' | 'filed'
export type TaxFilingType = 'income_tax' | 'custom'

// ─── Tax Obligation (backed by financial_goals, goal_type = 'tax_obligation') ───

export interface TaxObligation {
  id: string
  householdId: string
  name: string                      // financial_goals.name (e.g., "Honda Beat B 1234 XY")
  taxType: TaxObligationType        // financial_goals.tax_type
  targetAmount: number              // financial_goals.target_amount (total annual tax bill)
  currentAmount: number             // financial_goals.current_amount (amount set aside so far)
  targetDate: string                // financial_goals.target_date (annual due date, ISO 'YYYY-MM-DD')
  notes: string | null              // financial_goals.description
  createdAt: string
  updatedAt: string
}

// ─── Tax Filing Deadline ────────────────────────────────────────────────────────

export interface TaxFilingDeadline {
  id: string
  householdId: string
  taxType: TaxFilingType
  fiscalYear: number
  filingDeadline: string            // ISO date 'YYYY-MM-DD'
  status: FilingStatus
  filedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ─── Tax Deduction (backed by transactions, is_tax_deductible = true) ──────────

export interface TaxDeductionRecord {
  id: string                        // transactions.id
  amount: number                    // transactions.amount
  transactionDate: string           // transactions.transaction_date
  description: string | null        // transactions.description
  categoryId: string                // transactions.category_id
  categoryName: string              // joined from categories.name
  fiscalYear: number                // transactions.fiscal_year
}

// ─── Action Input Types ─────────────────────────────────────────────────────────

export interface CreateTaxObligationInput {
  householdId: string
  name: string
  taxType: TaxObligationType
  targetAmount: number
  targetDate: string
  notes: string | null
}

export interface UpdateTaxObligationInput {
  name: string
  taxType: TaxObligationType
  targetAmount: number
  targetDate: string
  notes: string | null
}

export interface CreateFilingDeadlineInput {
  householdId: string
  taxType: TaxFilingType
  fiscalYear: number
  filingDeadline: string
  notes: string | null
}

export interface FlagDeductionInput {
  transactionId: string
  fiscalYear: number
}

// ─── Derived State (Never Persisted) ──────────────────────────────────────────

export interface TaxInstallment {
  month: string                     // 'YYYY-MM'
  amount: number                    // installment for this month (first month gets remainder)
  cumulativeAmount: number          // running total through this month
}

export interface TaxObligationWithSchedule {
  obligation: TaxObligation
  remainingAmount: number           // targetAmount - currentAmount
  remainingMonths: number           // computed from targetDate and today
  monthlyInstallment: number        // base = floor(remainingAmount / remainingMonths)
  installmentSchedule: TaxInstallment[]
  isOverdue: boolean                // targetDate < today
}

export interface TaxFilingDeadlineWithCountdown extends TaxFilingDeadline {
  daysUntilDeadline: number         // positive = future, 0 = today, negative = past
  isUrgent: boolean                 // daysUntilDeadline <= 30 AND status = 'pending'
}

export interface TaxDashboardData {
  obligations: TaxObligationWithSchedule[]
  filingDeadlines: TaxFilingDeadlineWithCountdown[]
  currentMonthInstallmentTotal: number   // sum of this month's installment across all obligations
  overdueObligationCount: number
  urgentDeadlineCount: number            // deadlines within 30 days
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

---

## Derived State (Never Persisted)

### Installment Calculation

```typescript
// src/lib/utils/tax-planning.ts

/**
 * Compute remaining full months between today and the due date.
 * Returns at minimum 1.
 * A "full month" = any month that begins on or before the dueDate month.
 */
function computeRemainingMonths(dueDate: string, today: Date): number

/**
 * Compute full installment schedule.
 * - baseInstallment = Math.floor(remainingAmount / remainingMonths)
 * - remainder = remainingAmount % remainingMonths
 * - First month installment = baseInstallment + remainder
 * - Sum of all installments always equals remainingAmount exactly.
 */
function computeTaxInstallments(
  remainingAmount: number,
  dueDate: string,
  today: Date
): TaxInstallment[]

/**
 * Determine if a tax obligation is overdue (target_date < today).
 */
function isTaxObligationOverdue(targetDate: string, today?: Date): boolean

/**
 * Compute days until a filing deadline.
 * Positive = future, 0 = today, negative = overdue.
 */
function computeDaysUntilDeadline(filingDeadline: string, today?: Date): number
```

### Overdue Status

Computed at query time when building `TaxObligationWithSchedule`:
```typescript
isOverdue = new Date(obligation.targetDate) < today
```

No status column is stored; no trigger or background job is needed.

---

## Relationships

```
households (1) ─────< financial_goals (many) [goal_type = 'tax_obligation']
households (1) ─────< transactions (many)   [is_tax_deductible = true for deductions]
households (1) ─────< tax_filing_deadlines (many)
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| `financial_goals.target_amount` (tax_obligation) | Must be > 0 (FR-012) |
| `financial_goals.target_date` (tax_obligation) | Must be a valid future or current date |
| `financial_goals.name` | Non-empty string, max 255 chars |
| `financial_goals.tax_type` | Must be one of `'vehicle_registration'`, `'property_tax'`, `'custom'` |
| `transactions.fiscal_year` | Required when `is_tax_deductible = true`; must be a valid 4-digit year |
| `tax_filing_deadlines.fiscal_year` | Positive integer; together with `tax_type` must be unique per household |
| `tax_filing_deadlines.filing_deadline` | Valid date; must be >= Jan 1 of `fiscal_year` |
| Deduction flag | Cannot be set when `tax_filing_deadlines.status = 'filed'` for that fiscal year (application-level) |
