# Contract: Budget Dashboard Components

**Date**: 2026-05-09 | **Feature**: 004-simple-budgeting

## Component: BudgetCard

**Purpose**: Bento-style dashboard card displaying a single category's budget status.

**Props Interface**:

```typescript
interface BudgetCardProps {
  categoryName: string;
  monthlyLimit: number;
  totalSpent: number;
  dailySpendingPower: number;
  isOverbudget: boolean;
  progressColor: 'green' | 'yellow' | 'red';
}
```

**Render Requirements**:
- Must display `categoryName` as card title.
- Must include a Tremor `<ProgressBar>` showing `totalSpent / monthlyLimit` with `progressColor`.
- Must display `dailySpendingPower` in `tabular-nums` with high-contrast typography.
- When `isOverbudget === true`, must render an `<OverbudgetAlert>` component.
- Must be responsive: single column on mobile, multi-column Bento grid on `md:` and `lg:` breakpoints.

**Accessibility**:
- ProgressBar must have `aria-label` describing "{categoryName} budget progress".
- Overbudget Alert must have `role="alert"` and `aria-live="polite"`.

---

## Component: BudgetLimitForm

**Purpose**: Allow user to set or update `monthly_limit` for a Variable category.

**Props Interface**:

```typescript
interface BudgetLimitFormProps {
  categoryId: string;
  currentLimit?: number;
  onSave: (categoryId: string, limit: number) => void | Promise<void>;
}
```

**Behavior**:
- Input must accept only positive numbers (reject 0 and negative values).
- Input must format currency with thousands separator (e.g., "Rp 2.000.000").
- On save, must call `onSave(categoryId, limit)` and clear local loading state.
- Must show validation error if input is non-positive.

---

## Component: DailySpendingPower

**Purpose**: Display the calculated daily safe-to-spend amount.

**Props Interface**:

```typescript
interface DailySpendingPowerProps {
  amount: number;
  isOverbudget: boolean;
}
```

**Render Requirements**:
- Must display `amount` formatted as currency.
- When `amount === 0` and `isOverbudget === true`, must display "Rp 0" in red/high-contrast style and optionally show overbudget magnitude (e.g., "-Rp 50.000 over budget") as secondary text.
- Must use `tabular-nums` for perfect vertical alignment.

---

## Component: OverbudgetAlert

**Purpose**: Visual warning when category spending exceeds 80% of limit.

**Props Interface**:

```typescript
interface OverbudgetAlertProps {
  categoryName: string;
  percentageUsed: number;
}
```

**Render Requirements**:
- Must use Shadcn `<Alert variant="destructive">`.
- Must display text: "{categoryName} spending is at {percentageUsed}% of your monthly limit."
- Must have `role="alert"`.

---

## Server Action: updateCategoryLimit

**Signature**:

```typescript
async function updateCategoryLimit(
  categoryId: string,
  monthlyLimit: number
): Promise<{ success: boolean; error?: string }>
```

**Contract**:
- Must validate `monthlyLimit > 0` before database update.
- Must update `categories.monthly_limit` where `id = categoryId`.
- Must enforce RLS (row-level security) via Supabase client.
- Must return `{ success: true }` on update or `{ success: false, error: string }` on failure.

---

## Query: getBudgetMetrics

**Signature**:

```typescript
async function getBudgetMetrics(
  householdId: string,
  yearMonth?: string // e.g., "2026-05"; defaults to current month
): Promise<BudgetMetrics[]>
```

**Contract**:
- Must return one `BudgetMetrics` per category in the household.
- `totalSpent` must be `SUM(amount)` of all `expense` transactions for that category in the specified month.
- `monthlyLimit` must be `null` if not set.
- All derived fields (`remainingBudget`, `dailySpendingPower`, `isOverbudget`, `progressColor`) must be calculated in TypeScript, not in the SQL query.

---

## Utility: calculateDailySpendingPower

**Signature**:

```typescript
function calculateDailySpendingPower(
  monthlyLimit: number,
  totalSpent: number,
  currentDate: Date
): number
```

**Contract**:
- Returns `0` if `monthlyLimit - totalSpent <= 0`.
- Returns `MAX(0, (monthlyLimit - totalSpent) / remainingDays)` otherwise.
- `remainingDays` includes the current day.
