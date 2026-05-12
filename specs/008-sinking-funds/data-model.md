# Data Model: Education Costs & Sinking Funds Module

**Phase**: 1 | **Date**: 2026-05-12 | **Feature**: Education Costs & Sinking Funds

## Database Schema (Supabase/PostgreSQL)

### Reused Tables

#### 1. `financial_goals` — Extended with Sinking Fund Fields

Per the YAGNI/KISS principle, sinking funds are stored as rows in the existing `financial_goals` table (`goal_type = 'sinking'`). Two new columns are added via migration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Existing — Goal ID |
| `household_id` | UUID | NOT NULL, FK → households | Existing — RLS boundary |
| `goal_type` | VARCHAR(50) | NOT NULL, CHECK IN ('emergency','sinking','savings','debt') | **`'sinking'`** for this feature |
| `name` | VARCHAR(255) | NOT NULL | Fund name (e.g., "New Car", "Child's University") |
| `target_amount` | NUMERIC(14,2) | NOT NULL, CHECK >= 0 | Target savings goal |
| `current_amount` | NUMERIC(14,2) | NOT NULL, DEFAULT 0, CHECK >= 0 | Derived from linked transactions (updated via trigger or server action) |
| `is_locked` | BOOLEAN | DEFAULT FALSE | Existing — not used for sinking funds |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Existing — audit trail |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Existing — audit trail |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | Existing — soft delete |
| `target_date` | DATE | NULLABLE | **NEW** — deadline for reaching the target |
| `description` | TEXT | NULLABLE | **NEW** — optional notes |

**Migration**: `src/lib/supabase/migrations/008-sinking-funds.sql` adds `target_date` and `description` via `ALTER TABLE`.

**RLS Policy**: Inherits existing `financial_goals` RLS (scoped by `household_id`).

---

#### 2. `transactions` — Reused for Contributions (No Schema Change)

Contributions to a sinking fund are recorded as transactions tagged with `goal_id`. Column `goal_id` was added in migration `003-emergency-fund.sql`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `household_id` | UUID | RLS boundary |
| `goal_id` | UUID | FK → financial_goals, nullable — links transaction to a fund |
| `amount` | NUMERIC(14,2) | Positive for contribution (inflow to bucket) |
| `type` | VARCHAR | `'expense'` or `'transfer'` — depends on implementation choice |
| `transaction_date` | DATE | Date of contribution |
| `notes` | TEXT | Optional note about contribution |

**Soft Delete Behaviour**: When a `financial_goals` row is soft-deleted (`deleted_at` set), linked `transactions.goal_id` is **not cleared** (FK is `ON DELETE SET NULL` only on hard deletes, which never happen). Historical transactions retain their `goal_id` for audit purposes.

---

### Relationships

```
households (1) ─────< financial_goals (many)  [goal_type = 'sinking']
financial_goals (1) ─────< transactions (many) [via goal_id]
```

---

## TypeScript Interfaces

### Database Row (snake_case, from Supabase)

```typescript
interface SinkingFundRow {
  id: string;
  householdId: string;
  goalType: 'sinking';
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;   // ISO date string 'YYYY-MM-DD'
  description: string | null;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### Application Model (camelCase, consumed by UI)

```typescript
interface SinkingFund {
  id: string;
  householdId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SinkingFundContribution {
  id: string;
  goalId: string;
  amount: number;
  transactionDate: string;
  notes: string | null;
}

interface EducationEstimate {
  currentCost: number;
  inflationRate: number;
  years: number;
  futureValue: number;
}
```

### Derived State (Computed in Real-Time, Never Persisted)

```typescript
interface SinkingFundProgress {
  fund: SinkingFund;
  progressPercentage: number;   // 0–100+, not capped (allows >100%)
  amountRemaining: number;      // targetAmount - currentAmount (can be negative if over-funded)
  isOverdue: boolean;           // targetDate < today && currentAmount < targetAmount
  isComplete: boolean;          // currentAmount >= targetAmount
}
```

---

## Financial Calculation Logic

### Pure Functions (implemented in `src/lib/utils/sinking-funds.ts`)

```typescript
/**
 * Education cost inflation projection.
 * FV = currentCost × (1 + inflationRate)^years
 * @param currentCost  Current cost in monetary units (e.g., 50_000_000)
 * @param inflationRate  Annual inflation rate as decimal (e.g., 0.05 for 5%)
 * @param years  Number of years until needed (must be >= 0)
 * @returns Future value rounded to 2 decimal places
 */
function computeFutureValue(currentCost: number, inflationRate: number, years: number): number;

/**
 * Sinking fund progress as a percentage.
 * @param currentAmount  Amount saved so far
 * @param targetAmount   Target amount (must be > 0)
 * @returns Percentage (0–100+, NOT capped to allow over-funded state)
 */
function computeProgress(currentAmount: number, targetAmount: number): number;

/**
 * Determine if a fund is overdue.
 * @param targetDate  ISO date string or null
 * @param isComplete  Whether fund has reached its target
 * @returns true if targetDate is in the past and fund is not complete
 */
function isFundOverdue(targetDate: string | null, isComplete: boolean): boolean;
```

---

## Edge Case Handling

| Condition | Behaviour |
|-----------|-----------|
| `currentAmount > targetAmount` | `progressPercentage > 100`, `amountRemaining < 0`, `isComplete = true` |
| `targetDate` in the past, not complete | `isOverdue = true`, card shows "Overdue" badge in red |
| `inflationRate` is negative | `computeFutureValue` returns a value < `currentCost` (valid deflation scenario) |
| `years = 0` | `computeFutureValue` returns `currentCost` (anything^0 = 1) |
| `targetAmount = 0` | `computeProgress` returns 100 (edge guard: treat as already complete) |
| No sinking funds exist | Dashboard shows empty state with "Create your first fund" CTA |
| Goal soft-deleted | Filtered from active list by `WHERE deleted_at IS NULL`; transactions preserved |
