# Research: Cash Flow Tracker

**Phase**: 0 | **Date**: 2026-05-09 | **Feature**: Cash Flow Tracker

## Technical Research

### Supabase Real-Time for Concurrent Updates

**Finding**: Supabase Postgres Changes subscription handles concurrent writes natively.

**Implementation**:
```typescript
// Subscribe to transaction changes
const channel = supabase
  .channel('transactions')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, 
    (payload) => {
      // Update balance in real-time
    }
  )
  .subscribe()
```

**Source**: Supabase documentation - Postgres Changes

---

### Tremor for Balance Display

**Finding**: Tremor provides KPI cards and metric components ideal for financial dashboards.

**Components**:
- `KpiCard` - Balance display with trend
- `AreaChart` - Monthly cash flow visualization
- `DonutChart` - Fixed vs. Variable breakdown

**Source**: Tremor.sh documentation

---

### Mobile-First Transaction Entry

**Finding**: FAB (Floating Action Button) + Bottom Sheet pattern provides frictionless entry on mobile.

**Pattern**:
1. FAB on dashboard opens Bottom Sheet
2. Minimal form: Amount (auto-focus), Category (dropdown), Date (defaults to today), Description (optional)
3. Save button triggers Supabase insert
4. Real-time subscription updates balance

**Source**: Mobile UX best practices

---

### Currency Formatting for Large Numbers

**Finding**: Use Intl.NumberFormat with compact notation for dashboard, full format for details.

**Implementation**:
```typescript
// Dashboard: Rp 1.5M
new Intl.NumberFormat('id-ID', { 
  notation: 'compact', 
  maximumFractionDigits: 1 
}).format(amount)

// Details: Rp 1.500.000.000
new Intl.NumberFormat('id-ID').format(amount)
```

**Source**: MDN Intl.NumberFormat

---

## Alternatives Considered

| Approach | Rejected Because |
|----------|------------------|
| Firebase Realtime Database | Supabase provides PostgreSQL with RLS - better for financial data |
| LocalStorage + manual sync | Real-time sync between husband/wife requires cloud DB |
| REST API | Supabase auto-generated APIs + real-time subscriptions are simpler |

---

## Key Takeaways

1. **Supabase is the right choice** - provides PostgreSQL, Auth, and real-time in one platform
2. **Tremor + Shadcn/ui** - covers all UI needs per Constitution
3. **FAB + Bottom Sheet** - optimal mobile UX for quick entry
4. **NUMERIC(14,2)** - handles trillions without precision issues
