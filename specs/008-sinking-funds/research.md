# Research: Education Costs & Sinking Funds Module

**Phase**: 0 | **Date**: 2026-05-12 | **Feature**: Education Costs & Sinking Funds

---

## Decision 1: Storage — Reuse `financial_goals` Table

**Decision**: Do not create a new `sinking_funds` table. Reuse the existing `financial_goals` table introduced in migration `003-emergency-fund.sql`.

**Rationale**: The `financial_goals` table already supports `goal_type IN ('emergency', 'sinking', 'savings', 'debt')`. A sinking fund is simply a `financial_goals` row with `goal_type = 'sinking'`. The table already has `target_amount`, `current_amount`, `deleted_at` (soft delete), `household_id` (RLS boundary), and UUID primary key — all required by the Constitution.

**Required Extension**: Two columns are missing from `financial_goals` and must be added via `008-sinking-funds.sql`:
- `target_date DATE` — the deadline for reaching the fund's target
- `description TEXT` — optional notes about the goal

**Alternatives Considered**:
- New `sinking_funds` table: Rejected — violates YAGNI. Duplicates existing schema for no added value.
- Store in `profiles`: Rejected — goals are multi-row entities, not singleton config.

---

## Decision 2: Contribution Tracking — Reuse `transactions` Table

**Decision**: Record sinking fund contributions as rows in the existing `transactions` table, linked via `goal_id` (already a foreign key column added in `003-emergency-fund.sql`).

**Rationale**: Virtual Bucket pattern: money is "earmarked" for a goal by tagging transactions with `goal_id`. The `transactions` table already supports this pattern for Emergency Fund contributions. Using it for sinking funds is consistent and requires no schema change.

**Soft Delete on Goal**: When a goal is soft-deleted (`deleted_at` set), linked transactions remain untouched. `goal_id` on orphaned transactions becomes a historical reference — the money is not removed from the accounting ledger.

**Alternatives Considered**:
- Separate `sinking_fund_contributions` table: Rejected — YAGNI violation; duplicates `transactions` capability.

---

## Decision 3: Education Inflation Formula — Pure Utility Function

**Decision**: Implement the inflation formula as a standalone pure function in `src/lib/utils/sinking-funds.ts`:

```typescript
function computeFutureValue(currentCost: number, inflationRate: number, years: number): number {
  return currentCost * Math.pow(1 + inflationRate, years);
}
```

**Rationale**: Constitution §III mandates TDD. A pure function has no UI or database side effects, enabling complete Vitest unit test coverage before any UI is written. Constitution §VI (KISS) also forbids embedding math logic inside components.

**Precision**: Input `currentCost` and output are monetary values stored as `NUMERIC(14,2)`. Results rounded to 2 decimal places at the boundary (before display or persistence).

**Alternatives Considered**:
- Inline calculation inside component: Rejected — untestable, violates Single Responsibility (Constitution §VI).

---

## Decision 4: Progress Visualization — Tremor `ProgressBar`

**Decision**: Use Tremor's `ProgressBar` component for fund progress display inside `SinkingFundCard`.

**Rationale**: Constitution §II mandates Tremor for all data visualization. `ProgressBar` is the semantically correct Tremor primitive for percentage-based progress. No custom CSS progress bars.

**Overdue State**: When `target_date < today` and `current_amount < target_amount`, the `ProgressBar` renders in a warning/red color variant. A visual badge "Overdue" is shown.

---

## Decision 5: CRUD UI Architecture — Shadcn Dialog + Form

**Decision**: Fund creation and editing are handled via a Shadcn `Dialog` containing a `Form` (react-hook-form + zod validation). Contributions use a separate lighter `Dialog`.

**Rationale**: Constitution §II mandates Shadcn for interactive components. Dialog pattern avoids full-page navigation for quick CRUD operations, consistent with the existing patterns in budgeting and categories modules.

**Delete Flow**: Uses Shadcn `AlertDialog` for confirmation before soft-deleting the goal.

---

## Decision 6: Education Calculator → Fund Creation Bridge

**Decision**: The `EducationCalculator` component renders inline on the sinking-funds page. After calculation, a "Create Fund" button pre-fills `SinkingFundForm` with the computed future value as the target amount, passed via local component state (no URL params needed at MVP).

**Rationale**: Simple prop-passing pattern; avoids over-engineering with URL state or global store for a two-step flow.
