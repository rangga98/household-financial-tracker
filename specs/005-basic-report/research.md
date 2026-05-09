# Research: Basic Report (The Insight)

**Date**: 2026-05-10  
**Feature**: Basic Report  
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## Research Areas

### 1. Tremor DonutChart for Expense Breakdown

**Decision**: Use `@tremor/react` `<DonutChart>` component.

**Rationale**:
- Already installed (`@tremor/react@^3.18.7` in `package.json`)
- Supports `data` prop with `{ name: string; value: number }[]` shaped array
- `showTooltip={true}` enables hover tooltips showing exact values
- `categoryColors` prop accepts a string array of hex colors matching category colors from DB
- Responsive by default; auto-sizes within parent container

**Usage Pattern**:
```tsx
<DonutChart
  data={categoryData}
  category="value"
  index="name"
  showTooltip={true}
  colors={["blue", "red", "green"]}
/>
```

**Alternatives considered**:
- Recharts PieChart — Rejected: Tremor is constitution-mandated for data visualization. Recharts is only a transitive dependency.
- Custom SVG — Rejected: Violates KISS; Tremor handles responsiveness and accessibility.

---

### 2. Tremor Badge/Callout for Savings Rate Health Indicator

**Decision**: Use `<Badge>` for inline status and `<Callout>` for the prominent savings rate card.

**Rationale**:
- `<Badge>` supports `color` prop with values: `"emerald"`, `"yellow"`, `"red"` mapping directly to Healthy/Caution/Needs Attention
- `<Callout>` provides a larger visual container with `icon` and `title` props, suitable for the primary metric display
- Both are fully typed in `@tremor/react`

**Color Mapping**:
| Health Status | Threshold | Tremor Color |
|---------------|-----------|--------------|
| Healthy | > 20% | `"emerald"` |
| Caution | 10% – 20% | `"yellow"` |
| Needs Attention | < 10% or negative | `"red"` |

---

### 3. Supabase Month-Boundary Aggregation Queries

**Decision**: Use Supabase `.gte()` / `.lt()` date range filters with `YEAR-MONTH-01` and `NEXT_YEAR-NEXT_MONTH-01` boundaries.

**Rationale**:
- PostgreSQL `date` columns support direct string comparison in ISO format (`YYYY-MM-DD`)
- `.gte('transaction_date', startOfMonth).lt('transaction_date', startOfNextMonth)` correctly captures all dates in the target month
- Grouping by `category_id` with `.select('category_id, amount.sum()')` leverages Supabase RPC or standard query API

**Query Pattern**:
```typescript
// Expense aggregation by category for a given month
supabase
  .from('transactions')
  .select('category_id, amount.sum()')
  .eq('type', 'expense')
  .eq('household_id', householdId)
  .gte('transaction_date', '2026-05-01')
  .lt('transaction_date', '2026-06-01')
  .group('category_id')
```

**Note**: Supabase `.select()` with aggregation requires the PostgREST syntax `amount.sum()` which returns `{ sum: number }`.

---

### 4. Month Selection UI

**Decision**: Use a Shadcn `<Select>` component (or `<Popover>` + custom month grid) for month selection.

**Rationale**:
- Shadcn `<Select>` is already available in the project (installed via `components.json`)
- Options populated as "May 2026", "April 2026", etc. — last 12 months
- Default value: current month
- On change: triggers URL search param update or client state update, re-fetching report data

**State Strategy**:
- Server Component (`app/report/page.tsx`) receives `searchParams.month` (YYYY-MM format)
- If no param, default to current month
- Month change navigates to `?month=2026-04` using `router.push()` in a Client Component wrapper

---

## Consolidated Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Chart library | Tremor DonutChart | Constitution-mandated; already installed |
| Health badges | Tremor Badge + Callout | Constitution-mandated; direct color prop support |
| Date filtering | `.gte()` / `.lt()` on `transaction_date` | KISS; no date functions needed; ISO string comparison is precise |
| Month selector | Shadcn Select | Already available; familiar pattern |
| Data fetching | Server Action + Server Component | Constitution V; zero client bundle for data logic |
| No new tables | Pure aggregation | Constitution VI (YAGNI); all data exists in `transactions` |
