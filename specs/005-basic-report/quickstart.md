# Quickstart: Basic Report (The Insight)

**Feature**: Basic Report  
**Date**: 2026-05-10  
**Prerequisites**: Cash Flow Tracker module implemented (transactions & categories tables populated)

---

## 1. Verify Prerequisites

Ensure the following exist in your project:

- [ ] `transactions` table with `household_id`, `type`, `amount`, `transaction_date`, `category_id` columns
- [ ] `categories` table with `id`, `household_id`, `name`, `color` columns
- [ ] Supabase client configured at `src/lib/supabase/`
- [ ] `@tremor/react` installed (`npm list @tremor/react`)
- [ ] Shadcn `<Select>` component available (`npx shadcn@latest add select` if missing)

---

## 2. Run Tests

All test files must be written **before** implementation (TDD).

```bash
# Run report-specific tests
npm test -- src/components/features/report/

# Run all tests
npm run test:run
```

Expected test files (colocated with components):
- `src/components/features/report/ExpenseBreakdown.test.tsx`
- `src/components/features/report/MonthlyComparison.test.tsx`
- `src/components/features/report/SavingsRate.test.tsx`
- `src/components/features/report/ReportHeader.test.tsx`
- `src/app/actions/report.test.ts`

---

## 3. Add Report Route

Create the report page:

```bash
mkdir -p src/app/report
```

Create `src/app/report/page.tsx` (Server Component) and `src/app/actions/report.ts` (Server Action).

---

## 4. Navigation Link

Add a link to the report page in your app's navigation (bottom nav on mobile, sidebar on desktop):

```tsx
<Link href="/report?month=2026-05">
  <BarChart3Icon /> {/* Lucide icon */}
  Report
</Link>
```

---

## 5. Verify Data Flow

1. Record at least one income and one expense transaction in the current month via the Cash Flow Tracker.
2. Navigate to `/report`.
3. Verify:
   - [ ] Expense breakdown pie chart renders with correct categories
   - [ ] Savings rate displays with correct percentage
   - [ ] Month-over-month comparison shows current vs. previous month
   - [ ] Month selector changes the displayed data

---

## 6. Edge Case Checks

| Scenario | Expected Behavior |
|----------|-------------------|
| No transactions this month | Empty state messages in all sections |
| No income recorded | Savings rate shows "N/A" |
| Single category spend | Pie chart shows one 100% segment |
| No previous month data | Comparison shows "No data" for previous month |
| Expenses increased >10% | Visual alert on comparison card |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Chart not rendering | Verify `@tremor/react` is installed and imported correctly |
| RLS error on queries | Ensure Supabase auth token includes `household_id` claim |
| Month selector not updating URL | Verify `useRouter` from `next/navigation` is used in Client Component wrapper |
| "N/A" shows incorrectly | Check that `totalIncome === 0` guard is applied before division |
