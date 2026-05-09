# Research: Simple Budgeting (The Guardrail)

**Phase**: 0 | **Date**: 2026-05-09

## Unknowns Resolved

There were no unresolved technical unknowns from the Technical Context. All technology choices were inherited from the existing project constitution and prior features.

## Technology Decisions

### Derived State vs. Materialized Views

- **Decision**: All budget metrics (Daily Spending Power, spent amount, percentage) are calculated on-the-fly in TypeScript utilities, not materialized in the database.
- **Rationale**: YAGNI/KISS. Transaction volume is low (~100/month). A single `SELECT SUM(amount) ...` per category is trivial for PostgreSQL and avoids schema complexity.
- **Alternative considered**: PostgreSQL materialized view `monthly_category_spending` refreshed on transaction insert. **Rejected**: adds unnecessary infrastructure; the query is fast enough without it.

### ProgressBar Color Logic

- **Decision**: Color thresholds defined in a pure utility function `getProgressColor(spent: number, limit: number)`.
- **Rationale**: Keeps UI logic testable and avoids prop-drilling colors. Constitution mandates pure, independently testable utility functions for business logic.
- **Mapping**:
  - `< 80%` → green (Tailwind `emerald-500` / Tremor default)
  - `>= 80% and < 100%` → yellow (`amber-500`)
  - `>= 100%` → red (`rose-500`)

### Daily Spending Power Clamping

- **Decision**: When `Remaining Budget <= 0`, DSP is clamped to exactly `0` (not negative).
- **Rationale**: User feedback explicitly requested this for better UX. Negative values are confusing as "spending power." Overbudget magnitude can be shown separately.

### Zero New Tables

- **Decision**: Only schema change is `ALTER TABLE categories ADD COLUMN monthly_limit NUMERIC(14,2)`.
- **Rationale**: Spec feedback explicitly rejected `OverbudgetAlert` and `MonthlySpending` as entities. The existing `transactions` table already holds all required spending data.

## Consolidated Findings

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Monthly spending aggregation | `SELECT SUM` query per category | Derived; no new table |
| Alert state persistence | None (derived UI state) | No DB table; re-evaluated on render |
| Budget limit storage | `categories.monthly_limit` column | Reuses existing entity; simple migration |
| DSP calculation | Pure TS utility | Testable, instant client-side feedback |
| Progress visualization | Tremor `<ProgressBar>` + Tailwind color classes | Constitution mandates Tremor for data viz |
| Alert component | Shadcn `<Alert>` | Constitution mandates Shadcn for interactive components |
