# Component & Action Contracts: Education Costs & Sinking Funds Module

**Phase**: 1 | **Date**: 2026-05-12 | **Feature**: Education Costs & Sinking Funds

---

## Server Actions (`src/lib/actions/sinking-funds.ts`)

All Server Actions are Next.js App Router Server Actions. They return a discriminated union `ActionResult`.

```typescript
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### `createSinkingFund`

```typescript
async function createSinkingFund(payload: {
  name: string;
  targetAmount: number;
  targetDate: string | null;
  description: string | null;
}): Promise<ActionResult<SinkingFund>>;
```

- Inserts a row in `financial_goals` with `goal_type = 'sinking'` and `current_amount = 0`.
- Validates: `name` non-empty, `targetAmount > 0`.
- Returns the newly created `SinkingFund`.

### `updateSinkingFund`

```typescript
async function updateSinkingFund(
  id: string,
  payload: {
    name: string;
    targetAmount: number;
    targetDate: string | null;
    description: string | null;
  }
): Promise<ActionResult<SinkingFund>>;
```

- Updates name, target_amount, target_date, description on the given goal row.
- Validates same rules as `createSinkingFund`.
- Returns the updated `SinkingFund`.

### `deleteSinkingFund`

```typescript
async function deleteSinkingFund(id: string): Promise<ActionResult>;
```

- Sets `deleted_at = now()` on the goal row (soft delete).
- Does **not** touch linked `transactions` rows.
- Returns `{ success: true }` on success.

### `recordContribution`

```typescript
async function recordContribution(payload: {
  goalId: string;
  amount: number;
  transactionDate: string;
  notes: string | null;
}): Promise<ActionResult<SinkingFundContribution>>;
```

- Inserts a row in `transactions` with `goal_id`, `amount`, `transaction_date`, and `notes`.
- Increments `financial_goals.current_amount` by `amount` in the same DB operation.
- Validates: `amount > 0`, `goalId` non-empty, `transactionDate` valid ISO date.

---

## Database Query Functions (`src/lib/supabase/queries/sinking-funds.ts`)

```typescript
async function getSinkingFunds(householdId: string): Promise<SinkingFund[]>;
// Returns all active (deleted_at IS NULL) sinking funds for the household, ordered by created_at DESC.

async function getSinkingFundById(id: string): Promise<SinkingFund | null>;
// Returns a single fund by ID, or null if not found / soft-deleted.

async function getContributionsByGoal(goalId: string): Promise<SinkingFundContribution[]>;
// Returns all transactions with the given goal_id, ordered by transaction_date DESC.
```

---

## Component Props

### `SinkingFundsDashboard` (Client Component)

```typescript
interface SinkingFundsDashboardProps {
  initialFunds: SinkingFund[];
}
```

### `SinkingFundCard`

```typescript
interface SinkingFundCardProps {
  fund: SinkingFund;
  onEdit: (fund: SinkingFund) => void;
  onDelete: (id: string) => void;
  onAddContribution: (fund: SinkingFund) => void;
}
```

Renders:
- Fund name and description
- `ProgressBar` (Tremor) showing `progressPercentage`
- Amount saved / target amount
- Target date with "Overdue" badge if applicable
- Action buttons: Edit, Delete, Add Contribution

### `SinkingFundForm`

```typescript
interface SinkingFundFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<SinkingFund>;
  onSuccess: (fund: SinkingFund) => void;
  onCancel: () => void;
}
```

Fields: `name` (required), `targetAmount` (required, > 0), `targetDate` (optional date picker), `description` (optional textarea).

### `ContributionForm`

```typescript
interface ContributionFormProps {
  goalId: string;
  goalName: string;
  onSuccess: (contribution: SinkingFundContribution) => void;
  onCancel: () => void;
}
```

Fields: `amount` (required, > 0), `transactionDate` (required, defaults to today), `notes` (optional).

### `EducationCalculator`

```typescript
interface EducationCalculatorProps {
  onCreateFund: (prefillAmount: number) => void;
}
```

Fields: `currentCost` (required, > 0), `inflationRate` (required, default 0.05), `years` (required, >= 1).
After calculation, displays computed `futureValue` and renders "Create Fund" button that calls `onCreateFund(futureValue)`.

### `FundList`

```typescript
interface FundListProps {
  funds: SinkingFund[];
  onEdit: (fund: SinkingFund) => void;
  onDelete: (id: string) => void;
  onAddContribution: (fund: SinkingFund) => void;
}
```

Renders an empty-state CTA when `funds.length === 0`.

---

## TypeScript Types (`src/types/sinking-funds.ts`)

```typescript
export interface SinkingFund {
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

export interface SinkingFundContribution {
  id: string;
  goalId: string;
  amount: number;
  transactionDate: string;
  notes: string | null;
}

export interface EducationEstimate {
  currentCost: number;
  inflationRate: number;
  years: number;
  futureValue: number;
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```
