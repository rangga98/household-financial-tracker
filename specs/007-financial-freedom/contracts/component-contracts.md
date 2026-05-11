# Component & Server Action Contracts: Financial Freedom Module

**Feature**: Financial Freedom Module | **Date**: 2026-05-11

## Server Actions → UI Contracts

### `getFIProfile(userId: string): Promise<FIProfile | null>`

Fetches the user's FI configuration from the `profiles` table.

**Called by**: `app/financial-freedom/page.tsx` (Server Component)
**Returns**: `FIProfile` or `null` if no data

---

### `updateFIProfile(userId: string, updates: Partial<FIProfileInput>): Promise<FIProfile>`

Updates the user's FI configuration fields in the `profiles` table.

**Called by**: `FIInputForm.tsx` (Client Component via `useTransition`/`useActionState`)
**Input**: Partial object with any of: `fiAnnualExpenses`, `fiSavingsRate`, `fiCurrentAge`, `fiCurrentNetWorth`, `fiExpectedReturn`
**Returns**: Updated `FIProfile`
**Error handling**: Returns `{ error: string }` on validation failure

---

### `getBudgetBasedAnnualExpenses(householdId: string): Promise<number | null>`

Sums the monthly limits from the `categories` table (fixed + variable) to suggest an annual expense pre-population value.

**Called by**: `app/financial-freedom/page.tsx` on first load when `fi_annual_expenses` is NULL
**Returns**: Annual expense estimate or `null` if no budget data

## Component Props Contracts

### `FinancialFreedomDashboard`

```typescript
interface FinancialFreedomDashboardProps {
  profile: FIProfile;
  suggestedAnnualExpenses?: number | null;
}
```

**Responsibilities**:
- Compute `FIProjection` via `computeFIProjection(profile)`
- Render `FIProgressCard`, `FIProjectionChart`, `FIInputForm`
- Handle celebratory state when `isAlreadyFI = true`
- Handle unreachable state when `savingsRate <= 0`

---

### `FIProgressCard`

```typescript
interface FIProgressCardProps {
  fiNumber: number;
  currentNetWorth: number;
  progressPercentage: number;
  isAlreadyFI: boolean;
}
```

**Renders**: Tremor `Card` + `ProgressBar` + KPI text (FI Number, Current Net Worth)

---

### `FIProjectionChart`

```typescript
interface FIProjectionChartProps {
  trajectory: FIYearProjection[];
  fiNumber: number;
}
```

**Renders**: Tremor `AreaChart` with:
- X-axis: `year`
- Y-axis: `netWorth`
- Horizontal reference line at `fiNumber`
- Tooltip showing `age` and formatted `netWorth`

---

### `FIInputForm`

```typescript
interface FIInputFormProps {
  profile: FIProfile;
  suggestedAnnualExpenses?: number | null;
  onUpdate: (updatedProfile: FIProfile) => void;
}
```

**Renders**: Shadcn `Form` with inputs for:
- Annual Expenses (number, pre-filled from `suggestedAnnualExpenses` or `profile.fiAnnualExpenses`)
- Savings Rate (slider 0-100%, displayed as percentage)
- Current Age (number)
- Current Net Worth (number)
- Expected Return (slider with default 7%)

**Behavior**: Updates via Server Action `updateFIProfile`; on success, calls `onUpdate` to trigger parent re-render with new projection.
