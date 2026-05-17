# Research: Net Worth Tracker

**Phase**: 0 | **Date**: 2026-05-12 | **Feature**: Net Worth Tracker

## Decisions

### 1. Single Table Design for Assets and Liabilities

**Decision**: Store both assets and liabilities in a single `net_worth_items` table with a `type` enum column (`CURRENT_ASSET`, `NON_CURRENT_ASSET`, `LIABILITY`).

**Rationale**: Per KISS principle and user feedback, both entities share identical attributes (name, amount, soft-delete flag, timestamps). A single table eliminates duplicated schema, API routes, state management, and UI components. Calculations filter by `type` — no JOINs required.

**Alternatives considered**:
- Separate `assets` and `liabilities` tables: Rejected — identical schemas, double the boilerplate, harder to maintain.
- Polymorphic association table: Rejected — over-engineered for a simple 3-type classification.

### 2. Soft Delete Strategy

**Decision**: Use `is_active BOOLEAN DEFAULT true` for soft deletes on `net_worth_items`.

**Rationale**: Aligns with the existing `categories` table pattern (`is_active`) and the user's explicit feedback. Historical snapshots preserve item values at the time of recording, so `is_active` only affects the current active list view. The `net_worth_snapshots` table stores computed totals per day, ensuring auditability even if items are later deactivated.

**Alternatives considered**:
- `deleted_at` timestamp (Constitution VII): Rejected — user's explicit feedback requests `is_active = false` consistency with Category/Goal patterns. Snapshots already provide full audit trail.

### 3. History Visualization Component

**Decision**: Tremor `AreaChart` as the primary history visualization, with `BarChart` as an acceptable alternative.

**Rationale**: The spec (FR-012) explicitly mandates Tremor AreaChart or BarChart. `AreaChart` is ideal for showing wealth-building trends over time (area fill emphasizes magnitude). `BarChart` works well for discrete monthly comparisons. Both are available in `@tremor/react` which is already a project dependency.

**Alternatives considered**:
- Recharts or Chart.js: Rejected — spec explicitly locks to Tremor to maintain UI stack consistency and avoid extra bundle weight.
- Custom SVG chart: Rejected — violates Constitution II (Tremor for all data visualization).

### 4. Snapshot Strategy for Historical Tracking

**Decision**: Dedicated `net_worth_snapshots` table storing computed daily totals.

**Rationale**: Instead of storing every item value per day (which would create N rows per day where N = number of items), store one aggregated snapshot row per day. This is space-efficient and keeps historical queries fast. When any item is updated, the system computes totals and upserts into `net_worth_snapshots` for the current date.

**Alternatives considered**:
- Full-item history table (item_id, date, amount): Rejected — overkill for the MVP. Would create many rows per day. Can be added in v2 if per-item historical drill-down is needed.
- No snapshots, compute on-the-fly: Rejected — impossible to show past net worth if items have been edited or deactivated.

### 5. Snapshot Upsert Behavior

**Decision**: One snapshot per day; multiple updates on the same day overwrite the day's snapshot.

**Rationale**: Matches the spec assumption. Daily granularity is sufficient for net worth trend tracking. Prevents snapshot table bloat from rapid editing.

**Alternatives considered**:
- Snapshot on every edit (multiple per day): Rejected — unnecessary granularity; would clutter the chart with micro-fluctuations.
- Snapshot only on explicit "Save Snapshot" button: Rejected — adds user friction; automatic snapshots align better with the "set it and forget it" mental model of net worth tracking.

### 6. Net Worth Calculation Location

**Decision**: Compute net worth in SQL queries (SUM with CASE) and pure utility functions. Do not persist a `net_worth` computed column on the items table.

**Rationale**: Per Constitution VII (Derived State Not Persisted) and financial precision requirements. Computing on-demand from `net_worth_items` ensures the value is always accurate. The `net_worth_snapshots` table stores historical derived values (this is an exception — snapshots are inherently derived/persisted for historical reference).

**Alternatives considered**:
- Trigger to maintain a `current_net_worth` column: Rejected — derived state should not be persisted in real-time; computation is cheap (single-table SUM).

### 7. Page Route

**Decision**: `app/net-worth/page.tsx` following existing feature-page convention (`app/sinking-funds/page.tsx`, `app/emergency-fund/page.tsx`).

**Rationale**: Consistent with existing Next.js App Router structure. No routing ambiguity.

## Resolved Unknowns

- **NEEDS CLARIFICATION**: None. All technical choices are resolved based on existing codebase patterns, Constitution, and spec requirements.
