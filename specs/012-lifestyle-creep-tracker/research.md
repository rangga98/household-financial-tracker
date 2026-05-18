# Research: Lifestyle Creep Tracker

**Date**: May 18, 2026  
**Purpose**: Resolve technical decisions for implementation planning

---

## Decision 1: Chart Library Selection

**Question**: Should we use Tremor LineChart as mandated, or consider alternatives like Recharts?

**Decision**: Use **Tremor LineChart** as explicitly required by FR-007 and Constitution II.

**Rationale**:
- Constitution II mandates Tremor for all data visualization
- Tremor is already used elsewhere in the project for consistency
- Tremor provides good TypeScript support and integrates well with Tailwind
- No additional dependency cost (already in project)

**Alternatives Considered**:
- Recharts: Popular React charting library, but violates Constitution stack requirements
- Chart.js with react-chartjs-2: Another alternative, but also violates Constitution

---

## Decision 2: Average-Based vs Point-to-Point Calculation

**Question**: The spec changed from simple (End - Start) / Start to average-based calculation. How to implement this efficiently?

**Decision**: Implement **3-month rolling average** comparison as specified in FR-001/FR-002.

**Implementation Strategy**:
1. For 6+ month periods: Split into two halves, calculate average of first 3 months vs average of last 3 months
2. For 3-5 month periods: Compare first month vs last month (fallback)
3. SQL query will use window functions or multiple queries to get the aggregations

**Rationale**:
- Outlier-resistant (one-time laptop purchase won't skew the whole analysis)
- More representative of actual lifestyle trends vs one-off events
- Aligns with financial best practices for trend analysis

**SQL Approach**:
```sql
-- Get monthly aggregates first
SELECT 
  DATE_TRUNC('month', transaction_date) as month,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
FROM transactions
WHERE household_id = ? AND transaction_date BETWEEN ? AND ?
GROUP BY month
ORDER BY month;
```
Then calculate averages in TypeScript utility functions.

---

## Decision 3: Server Component vs Client Component Strategy

**Question**: Which parts should be Server Components vs Client Components?

**Decision**:
- **Server Component**: Main page (`page.tsx`) - fetches aggregated data via Supabase
- **Server Component**: Data fetching logic in `lifestyleCreepQueries.ts`
- **Client Component**: `LifestyleCreepTracker.tsx` - needs interactivity for period selection
- **Client Component**: `TimePeriodSelector.tsx` - uses Shadcn/ui Select with state
- **Client Component**: `TrendChart.tsx` - Tremor charts need client-side rendering

**Rationale**:
- Follows Next.js App Router best practices
- Minimizes client bundle size by keeping data fetching server-side
- Interactive elements (selectors, charts) need client hydration

---

## Decision 4: TDD Strategy for Math Utilities

**Question**: How to structure tests for `calculateGrowthPercentage()` to achieve 100% coverage?

**Decision**: Create comprehensive test matrix covering:

1. **Normal cases**: Positive growth, negative growth, zero growth
2. **Division by zero**: Zero baseline (should return null or throw specific error)
3. **Negative values**: Negative income/expense scenarios (edge case)
4. **Floating point**: Precision tests to 0.01% accuracy (SC-003)
5. **Array averaging**: Tests for the 3-month average calculation itself

**Test File Structure**:
```typescript
// calculateGrowthPercentage.test.ts
describe('calculateGrowthPercentage', () => {
  describe('normal operations', () => { ... });
  describe('division by zero', () => { ... });
  describe('negative values', () => { ... });
  describe('precision', () => { ... });
  describe('average calculation', () => { ... });
});
```

---

## Decision 5: Query Strategy for Monthly Aggregation

**Question**: Single complex SQL query vs multiple simpler queries?

**Decision**: **Single optimized Supabase query** with PostgreSQL aggregation.

**Implementation**:
```typescript
// lib/supabase/queries/lifestyleCreepQueries.ts
export async function getMonthlyAggregates(
  householdId: string,
  startDate: string,
  endDate: string
) {
  return supabase
    .from('transactions')
    .select(`
      month:date_trunc('month', transaction_date),
      income:sum(amount).filter(type.eq.income),
      expenses:sum(amount).filter(type.eq.expense)
    `)
    .eq('household_id', householdId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .group('month')
    .order('month');
}
```

**Rationale**:
- Single round-trip to database (performance per SC-001)
- PostgreSQL is optimized for these aggregations
- Less network overhead than multiple queries

---

## Decision 6: Transfer Transaction Exclusion

**Question**: How to identify and exclude transfer transactions per FR-010?

**Decision**: Query based on existing `type` column in transactions table.

**Implementation**:
- Income: `type = 'income'`
- Expenses: `type = 'expense'`
- Transfers: `type = 'transfer'` (excluded from both calculations)

**Assumption**: The existing `transactions` table already has a `type` column with these values. If not, this needs clarification during implementation.

---

## Decision 7: Currency Handling

**Question**: How to handle transactions in different currencies?

**Decision**: **Defer to existing system** - use amounts as stored in database.

**Rationale**:
- Currency conversion is out of scope for this feature
- The spec assumes "existing transaction data" - conversion already handled elsewhere
- Consistency: If user's transactions are in IDR, analysis stays in IDR

---

## Summary of Research Findings

| Area | Decision | Status |
|------|----------|--------|
| Chart Library | Tremor LineChart (mandated) | Ready |
| Calculation Method | 3-month average comparison | Ready |
| Component Split | Server for data, Client for UI | Ready |
| TDD Strategy | 100% coverage on math utility | Ready |
| Query Strategy | Single Supabase aggregation query | Ready |
| Transfer Exclusion | Filter by `type` column | Ready (verify schema) |
| Currency | Use stored amounts as-is | Ready |

**No blocking clarifications needed** - All technical decisions resolved. Ready for Phase 1 Design.
