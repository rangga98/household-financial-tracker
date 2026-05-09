# UI Component Contracts: Basic Report

**Feature**: Basic Report (The Insight)  
**Date**: 2026-05-10

---

## Component Contract 1: ExpenseBreakdown

**File**: `src/components/features/report/ExpenseBreakdown.tsx`

**Props Interface**:
```typescript
interface ExpenseBreakdownProps {
  data: Array<{
    categoryName: string;
    totalAmount: number;
    percentage: number;
    categoryColor: string | null;
  }>;
  totalExpenses: number;
}
```

**Rendering Requirements**:
- MUST render a `<DonutChart>` from `@tremor/react`
- MUST display category names, absolute amounts (IDR), and percentages
- MUST sort categories by `totalAmount` descending
- MUST show a friendly empty state when `data.length === 0`
- MUST group categories below 1% into an "Other" slice when there are more than 6 categories

**Accessibility**:
- Chart must have `aria-label="Expense breakdown by category"`
- Tooltip content must be keyboard-accessible on focus

---

## Component Contract 2: MonthlyComparison

**File**: `src/components/features/report/MonthlyComparison.tsx`

**Props Interface**:
```typescript
interface MonthlyComparisonProps {
  currentMonthTotal: number;
  previousMonthTotal: number;
  currentMonthLabel: string;   // e.g., "May 2026"
  previousMonthLabel: string;  // e.g., "April 2026"
}
```

**Rendering Requirements**:
- MUST display both month totals in IDR format
- MUST show absolute difference: `currentMonthTotal - previousMonthTotal`
- MUST show percentage change with directional arrow (▲ / ▼)
- MUST highlight the percentage change in red when `percentChange > 10%`
- MUST show "No data" for previous month when `previousMonthTotal === 0` and no historical data exists

---

## Component Contract 3: SavingsRate

**File**: `src/components/features/report/SavingsRate.tsx`

**Props Interface**:
```typescript
interface SavingsRateProps {
  savingsRate: number | null;  // null when totalIncome === 0
  totalIncome: number;
  totalExpenses: number;
}
```

**Rendering Requirements**:
- MUST display the savings rate as a percentage (2 decimal places) or "N/A" when null
- MUST use `<Badge>` or `<Callout>` from `@tremor/react` with dynamic coloring:
  - `savingsRate > 20` → `"emerald"` label "Healthy"
  - `savingsRate >= 10` → `"yellow"` label "Caution"
  - `savingsRate < 10` or `null` or negative → `"red"` label "Needs Attention"
- MUST show `totalIncome` and `totalExpenses` as supporting context

---

## Component Contract 4: ReportHeader

**File**: `src/components/features/report/ReportHeader.tsx`

**Props Interface**:
```typescript
interface ReportHeaderProps {
  selectedMonth: string; // "YYYY-MM" format
  onMonthChange: (month: string) => void;
  availableMonths: string[]; // Last 12 months as "YYYY-MM"
}
```

**Rendering Requirements**:
- MUST display the selected month in human-readable format (e.g., "May 2026")
- MUST provide a month selector using Shadcn `<Select>` with last 12 months as options
- MUST call `onMonthChange` when a new month is selected
- MUST default to the current month if no selection is active

---

## Component Contract 5: ReportPage (Server Component)

**File**: `src/app/report/page.tsx`

**Interface**:
```typescript
interface ReportPageProps {
  searchParams: Promise<{ month?: string }>;
}
```

**Behavior**:
- MUST be a Next.js Server Component
- MUST read `searchParams.month` (format: `YYYY-MM`); default to current month if absent
- MUST call the report Server Action with `householdId` and selected month
- MUST pass derived data to child components (`ReportHeader`, `ExpenseBreakdown`, `MonthlyComparison`, `SavingsRate`)
- MUST handle empty data states gracefully

---

## Component Contract 6: Server Action — getReportData

**File**: `src/app/actions/report.ts`

**Interface**:
```typescript
async function getReportData(
  householdId: string,
  yearMonth: string // "YYYY-MM"
): Promise<{
  expenseBreakdown: ExpenseBreakdownItem[];
  monthlyTotals: MonthlyTotals;
  comparison: MonthOverMonthComparison | null;
}>;
```

**Behavior**:
- MUST execute three Supabase queries:
  1. Expense aggregation by category (selected month)
  2. Income & expense totals (selected month)
  3. Income & expense totals (previous month)
- MUST calculate savings rate as `(totalIncome - totalExpenses) / totalIncome * 100`
- MUST return `savingsRate: null` when `totalIncome === 0` to prevent division by zero
- MUST scope all queries to `household_id` (RLS-enforced)
- MUST return empty arrays / zero values when no transactions exist
