# Research: Tax Management & Compliance Module

**Phase**: 0 | **Date**: 2026-05-17 | **Feature**: Tax Management & Compliance

---

## Decision 1: TaxObligation → Reuse `financial_goals` (no new table)

**Decision**: Annual tax obligations (Vehicle Registration, Property Tax) are stored as rows in the existing `financial_goals` table with a new `goal_type = 'tax_obligation'`. A new optional column `tax_type` is added via `ALTER TABLE`.

**Rationale**: Tax obligations are semantically equivalent to sinking funds: a household must accumulate a target amount by a specific date. The existing `financial_goals` schema (`target_amount`, `target_date`, `name`, `current_amount`, `deleted_at`) covers 100% of the required fields with no gaps. Precedent is already established: Feature 010 extended `financial_goals` with `goal_type = 'protection_target'` using the same pattern. Introducing a separate `tax_obligations` table would duplicate this structure in violation of YAGNI.

**Alternatives considered**:
- **New `tax_obligations` table**: Rejected. Duplicates `financial_goals` schema exactly; violates YAGNI; increases migration surface.
- **Subtype with separate joined table**: Rejected. Over-engineering for a simple type discriminator; violates KISS.

**Implementation**: Extend `financial_goals.goal_type` CHECK constraint to include `'tax_obligation'`. Add `tax_type VARCHAR(50)` column (nullable, only populated for `goal_type = 'tax_obligation'`) via `ALTER TABLE`.

---

## Decision 2: TaxInstallment → Derived State Only (no table)

**Decision**: Monthly installment amounts are never persisted. They are always computed in real-time from `remaining_target_amount ÷ remaining_full_months_until_due` (minimum 1). The logic lives exclusively in a pure utility function `computeTaxInstallments()` in `src/lib/utils/tax-planning.ts`.

**Rationale**: Persisting computed installments creates a cache-invalidation problem: any update to `target_amount` or `target_date` would require re-generating and bulk-deleting stored installment rows. Derived state is simpler, always accurate, and aligned with the KISS principle. The pattern is precedented in Feature 008 (Sinking Funds): `SinkingFundProgress` is always derived, never stored.

**Rounding rule**: `baseInstallment = Math.floor(remainingAmount / remainingMonths)`. The remainder (`remainingAmount % remainingMonths`) is added to the first installment of the schedule. This ensures the sum of all installments always equals `remainingAmount` exactly.

**Alternatives considered**:
- **`tax_installments` table with recalculation trigger**: Rejected. Adds a table, triggers, and cache invalidation complexity. Pure function achieves the same outcome at zero DB cost.
- **Storing only the computed monthly amount scalar**: Rejected. Insufficient — the full month-by-month schedule is needed for the installment schedule UI.

---

## Decision 3: TaxDeductionRecord → Reuse `transactions` (no new table)

**Decision**: Tax-deductible expenses are ordinary expense transactions flagged with two new columns on the existing `transactions` table: `is_tax_deductible BOOLEAN DEFAULT false` and `fiscal_year INTEGER NULL`. Deduction queries filter `WHERE is_tax_deductible = true AND fiscal_year = :year`.

**Rationale**: Every deductible expense is already an expense transaction (medical visit → expense, donation → expense). Creating a separate `tax_deduction_records` table would duplicate `transactions` columns (amount, date, category, description) and create the same ledger entry twice. Adding two lightweight nullable columns to `transactions` follows the precedent set by Feature 008 (`notes TEXT`) and Feature 010 (`policy_id UUID`). Total schema additions: 2 columns, 0 new tables.

**Alternatives considered**:
- **New `tax_deduction_records` table**: Rejected. Doubles data entry for the same real-world expense; creates a reconciliation burden; violates YAGNI.
- **Dedicated deduction category + query filter**: Rejected. Categories are user-defined and mutable; a boolean flag is a more reliable discriminator.

**Implementation**: `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_tax_deductible BOOLEAN DEFAULT false` and `ADD COLUMN IF NOT EXISTS fiscal_year INTEGER`.

---

## Decision 4: TaxFilingDeadline → New Table (justified exception)

**Decision**: Filing deadlines are stored in a new `tax_filing_deadlines` table. This is the only new table introduced by this feature.

**Rationale**: A filing deadline is a fundamentally distinct entity from goals, transactions, or insurance policies. It has unique attributes (`fiscal_year`, `status: pending|filed`, `filed_at`, `tax_type for filing`) that do not map cleanly onto any existing table. The uniqueness constraint `(household_id, tax_type, fiscal_year)` — required by FR-011 — cannot be enforced on `financial_goals` without contaminating that table's semantics. This exception is justified by the YAGNI principle's own caveat: "only build what's needed" — and this entity's unique constraints mean building it on top of an existing table would require more workarounds than a clean new table.

**Alternatives considered**:
- **Reuse `financial_goals` for filing deadlines**: Rejected. Filing deadlines have `fiscal_year`, `status`, `filed_at` attributes with no natural mapping to `goal_type`, `target_amount`, `current_amount`. Semantic corruption.
- **Store as profile-level metadata**: Rejected. Multi-year and multi-type deadlines per household make a single column or JSONB blob insufficient.

---

## Decision 5: Filing Lock Enforcement → Application Level (not DB constraint)

**Decision**: When a `tax_filing_deadlines` row has `status = 'filed'`, the UI and Server Actions block adding or editing `is_tax_deductible = true` transactions for that `fiscal_year`. This is enforced in Server Action business logic, not via a DB trigger or RLS policy.

**Rationale**: DB-level enforcement would require a trigger that joins `transactions.fiscal_year` to `tax_filing_deadlines.status` — a cross-table trigger that is complex, hard to test, and outside the project's zero-complexity DB philosophy. Application-level enforcement via a `checkFiscalYearLocked(householdId, fiscalYear)` helper is simpler, fully testable with Vitest, and consistent with how Feature 010 enforces "one protection target per household" at application level (not via UNIQUE constraint).

**Alternatives considered**:
- **DB trigger**: Rejected. Over-engineering; difficult to unit-test; inconsistent with existing pattern.
- **RLS policy**: Rejected. RLS is for row-level data isolation, not business-rule enforcement.

---

## Decision 6: In-App Reminder → Derived at Query Time (no background job)

**Decision**: The "30-day filing reminder" alert is derived in real-time: `daysUntilDeadline = computeDaysUntilDeadline(filingDeadline, today)`. If `daysUntilDeadline ≤ 30 AND status = 'pending'`, an in-app alert badge is rendered. No cron job, no push notification, no email.

**Rationale**: The Zero-Cost Serverless Architecture principle (Constitution §V) prohibits background jobs or third-party notification services. An in-app badge/banner computed on page load is the standard pattern across existing features (e.g., insurance premium `daysUntilDue` badge in Feature 010). No new infrastructure required.

**Alternatives considered**:
- **Supabase Edge Function cron + email**: Rejected. Requires paid Supabase plan or third-party email service; violates Zero-Cost constraint.
- **Push notification via Web Push API**: Rejected. Requires service worker and push subscription management; out of scope for MVP per constitution §VI (YAGNI).

---

## Decision 7: UI Components — Tremor Dashboard + Shadcn Forms

**Decision**: The Tax Obligations Dashboard uses Tremor `Metric`, `BadgeDelta`, and `ProgressBar` components. All data-entry forms (create tax obligation, set filing deadline, flag deduction) use Shadcn/ui `Dialog` + `Form` with `react-hook-form` + `zod` validation.

**Rationale**: Mandated by the project constitution (§II) and explicitly required by FR-015 and FR-016. This is consistent with all preceding features (008, 009, 010). No decision needed — this is a constraint.

---

## Decision 8: Installment Calculation Utility — TDD-First

**Decision**: `computeTaxInstallments`, `computeRemainingMonths`, `isTaxObligationOverdue`, and `computeDaysUntilDeadline` are implemented as pure functions in `src/lib/utils/tax-planning.ts`. The test file `src/lib/utils/tax-planning.test.ts` is written first (Red), before implementation (Green), as mandated by the Constitution (§III).

**Rationale**: The installment calculation has several edge cases (due date in the past, < 1 month remaining, rounding remainder, fiscal year boundary) that are highly prone to off-by-one errors. TDD isolation ensures these are caught before any UI interaction. Pattern matches `insurance.ts` / `insurance.test.ts` from Feature 010.

**Key test cases that must pass**:
- `computeRemainingMonths('2026-12-01', new Date('2026-01-01'))` → `11`
- `computeRemainingMonths('2026-01-15', new Date('2026-01-20'))` → `1` (less than 1 month → clamped to 1)
- `computeTaxInstallments(1_200_000, '2026-12-01', new Date('2026-01-01'))` → 11 months of `109_091` + first month `109_099` (sum = 1_200_000)
- `computeTaxInstallments(1_000_000, '2026-01-05', new Date('2026-01-01'))` → 1 installment of `1_000_000` (< 1 month remaining)
- `isTaxObligationOverdue('2025-12-01')` → `true`
- `computeDaysUntilDeadline('2027-03-31', new Date('2027-03-01'))` → `30`

---

## Decision 9: Overdue Status → Derived, Displayed at Render Time

**Decision**: A tax obligation is "Overdue" when `financial_goals.target_date < today` (server-side date comparison at query time). No status column is persisted. The `status` field on `TaxObligation` TypeScript interface is computed when building the dashboard data object.

**Rationale**: Storing a `status` column would require either a background job to flip it or a trigger, both of which violate KISS. Computed at query time is zero-maintenance and always accurate — same pattern as `isOverdue` in Feature 008 Sinking Funds.

**Alternatives considered**:
- **`status` column in `financial_goals`**: Rejected. Requires cron or trigger to keep current; stale data risk.
- **Separate overdue tracking table**: Rejected. Massively over-engineered for a simple date comparison.

---

## Summary of All Decisions

| # | Topic | Decision |
|---|-------|----------|
| 1 | TaxObligation storage | Reuse `financial_goals` + `goal_type = 'tax_obligation'` |
| 2 | TaxInstallment | Derived state — `computeTaxInstallments()` pure function, never persisted |
| 3 | TaxDeductionRecord | Reuse `transactions` + `is_tax_deductible` + `fiscal_year` columns |
| 4 | TaxFilingDeadline | New `tax_filing_deadlines` table (justified — unique constraints + lifecycle) |
| 5 | Filing lock | Application-level in Server Actions, not DB trigger |
| 6 | 30-day reminder | Derived at query time, in-app badge only — no background jobs |
| 7 | UI stack | Tremor dashboard, Shadcn/ui forms (constitution mandate) |
| 8 | Installment utility | TDD-first `tax-planning.ts` / `tax-planning.test.ts` |
| 9 | Overdue status | Derived at render time from `target_date < today` |
