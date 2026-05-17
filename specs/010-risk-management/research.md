# Research: Risk Management Module (Protection Layer)

**Phase**: 0 | **Date**: 2026-05-17 | **Feature**: Risk Management Module

---

## Decision 1: Insurance Policies — New Table (Justified Exception to YAGNI)

**Decision**: Create a new `insurance_policies` table. This is the **only** new table for this feature.

**Rationale**: Insurance policies carry domain-specific attributes (coverage amount, payment frequency, insurer name, next-due date) that cannot be mapped cleanly onto any existing table without misusing its schema intent:
- `financial_goals`: Models savings/accumulation goals. An insurance policy is a liability obligation, not an accumulation goal. Cramming policy metadata into `financial_goals` would corrupt its semantics.
- `transactions`: Single-row financial events. A policy is a persistent, stateful entity with a lifecycle.
- `categories`: Taxonomy, not entity state.

A new table is the correct, minimal-overhead solution. It carries full YAGNI justification.

**Alternatives Considered**:
- Re-use `financial_goals` with `goal_type = 'insurance'`: Rejected — semantically incorrect; `target_amount` and `current_amount` do not map to coverage/premium; would require overloading columns with different meanings.
- Store policy metadata in a JSONB column on an existing table: Rejected — violates structured query and RLS audit requirements (Constitution §VII).

---

## Decision 2: Premium Payments — Reuse `transactions` Table (Add `policy_id` Column)

**Decision**: Record premium payments as standard `expense` transactions in the existing `transactions` table. Add a single nullable `policy_id UUID FK → insurance_policies` column via migration.

**Rationale**: A premium payment is fundamentally an expense — money leaving the household. The `transactions` table already handles expenses with `type = 'expense'`, `amount`, `transaction_date`, `category_id`, and `household_id`. Adding `policy_id` as an optional FK gives us a clean join between a premium payment and its policy without a separate payment table.

This follows the exact same pattern as `transactions.goal_id` (introduced in `003-emergency-fund.sql`): optional FK on `transactions` to link a transaction to a domain entity.

**Status derivation**: Premium payment status (Upcoming / Overdue / Paid) is **derived** from `insurance_policies.next_due_date` compared to today and whether a `transactions` row with `policy_id` exists on or after the due date. No status column is stored — it is always computed to stay consistent with actual data.

**Alternatives Considered**:
- Separate `premium_payments` table: Rejected — YAGNI violation; duplicates `transactions` for no added value; breaks unified expense ledger.
- Status column on `insurance_policies`: Rejected — derived state must not be persisted (Constitution §VII pattern from net-worth / FI modules).

---

## Decision 3: Family Protection Target — Reuse `financial_goals` (Extend `goal_type`)

**Decision**: Store the family protection target as a `financial_goals` row with `goal_type = 'protection_target'`. Extend the CHECK constraint via migration.

**Rationale**: The protection target is a single household-level target amount — exactly what `financial_goals.target_amount` represents. The `goal_type` discriminator already controls which application feature "owns" a given row (e.g., `'emergency'`, `'sinking'`). Adding `'protection_target'` is a one-line migration change and requires no new table, no new columns.

**Note on CHECK constraint evolution**: PostgreSQL does not support `ALTER CONSTRAINT`. To change the `IN (...)` list, the migration must `ALTER TABLE financial_goals DROP CONSTRAINT ... ADD CONSTRAINT ...`. This is a safe DDL operation with no data migration required.

**Current constraint** (from `003-emergency-fund.sql`):
```sql
goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('emergency', 'sinking', 'savings', 'debt'))
```
**After migration 010**:
```sql
goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('emergency', 'sinking', 'savings', 'debt', 'protection_target'))
```

**Alternatives Considered**:
- New `family_protection_targets` table: Rejected — single-row, single-field entity; extreme YAGNI violation.
- Column on `profiles` table: Rejected — profiles already carry FI fields; target is household-level, not per-profile.

---

## Decision 4: Health Budgeting — Fully Reuse Existing Infrastructure (No New Tables)

**Decision**: Health budgeting reuses `categories` (with `monthly_limit`) and `transactions` entirely. No new tables, no new columns for health budgeting.

**Rationale**: Healthcare categories (Doctor, Pharmacy, Dental, Vision, Lab) are standard `categories` rows. The Simple Budgeting feature (`004`) already added `categories.monthly_limit NUMERIC(14,2)` — this is the health budget. Healthcare expenses are standard `expense` transactions tagged to these categories. The existing `budgeting.ts` utility functions (`getProgressColor`, `isOverbudget`) and `queries/budgeting.ts` already support this use case without modification.

**Seeding**: Healthcare categories will be seeded during migration with `INSERT ... ON CONFLICT DO NOTHING` to avoid duplicates if a household already manually created them.

**Alternatives Considered**:
- Separate `health_expenses` table: Rejected — YAGNI violation; duplicates `transactions` for a domain-specific subset.
- Separate `health_budgets` table: Rejected — YAGNI violation; `categories.monthly_limit` already provides per-category monthly budget.

---

## Decision 5: Next-Due Date Calculation — Pure Utility Function

**Decision**: Implement `calculateNextPremiumDueDate(currentDueDate: string, frequency: PaymentFrequency): string` as a pure function in `src/lib/utils/insurance.ts`. Tests written first with Vitest (TDD Red-Green-Refactor).

**Rationale**: Constitution §III mandates TDD. Constitution §VI (KISS) forbids embedding date math in components. A pure function is trivially testable, has no side effects, and can be called from both Server Actions (when marking paid) and UI components (for preview).

**Frequency mapping**:
- `'monthly'` → add 1 month
- `'quarterly'` → add 3 months
- `'semi-annual'` → add 6 months
- `'annual'` → add 12 months
- `'one-time'` → returns `null` (no next due date)

**Precision**: Uses JavaScript `Date` arithmetic. Day-of-month edge cases (e.g., Jan 31 + 1 month = Feb 28/29) are handled by clamping to the last day of the target month, consistent with standard financial industry conventions.

---

## Decision 6: Coverage Gap Calculation — Pure Utility Function

**Decision**: Implement `calculateCoverageGap(totalCoverage: number, protectionTarget: number): CoverageStatus` as a pure function in `src/lib/utils/insurance.ts`.

**Rationale**: Constitution §III (TDD) and §VI (KISS). The coverage gap is derived state; it must never be persisted. Same pattern as `computeProgress` in `sinking-funds.ts`.

**Return type**:
```typescript
interface CoverageStatus {
  gap: number;          // protectionTarget - totalCoverage (positive = gap, negative = surplus)
  percentage: number;   // (totalCoverage / protectionTarget) * 100, capped at 100 for ProgressBar
  isAdequate: boolean;  // totalCoverage >= protectionTarget
  color: ProgressColor; // reuses ProgressColor from budgeting.ts
}
```

---

## Decision 7: Coverage Adequacy Visualization — Tremor `ProgressBar`

**Decision**: Use Tremor `ProgressBar` (same component as Simple Budgeting) for total coverage vs. protection target. Color coding: green (≥100%), amber (≥50%), red (<50%).

**Rationale**: Constitution §II mandates Tremor for all data visualization. `ProgressBar` is semantically correct. Reusing the same component and color convention as Simple Budgeting minimizes new UI code.

---

## Decision 8: Premium Status UI — Tremor `Badge` / Shadcn `Badge`

**Decision**: Premium payment status (Upcoming / Overdue / Paid) is displayed as a colored badge per policy card. Use Shadcn `Badge` with `variant` prop (`default` / `destructive` / `outline`).

**Rationale**: Status badges are interactive UI elements — Shadcn is the mandated library for these (Constitution §II). Overdue → `destructive` (red), Upcoming → `default` (blue), Paid → `outline` (gray/green).

---

## Decision 9: CRUD UI Architecture — Shadcn Dialog + Form (Consistent with Existing Pattern)

**Decision**: Policy creation/edit uses Shadcn `Dialog` + react-hook-form + zod. Same pattern as Sinking Funds, Categories, and Budgeting modules.

**Rationale**: Consistency with existing codebase. Dialog avoids full-page navigation for CRUD. Constitution §II mandates Shadcn for interactive components.
