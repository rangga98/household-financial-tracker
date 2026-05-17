# Quickstart: Net Worth Tracker

**Feature**: Net Worth Tracker | **Date**: 2026-05-12

## Prerequisites

- Supabase project configured (same as existing features)
- Base schema from `001-cash-flow-tracker` applied
- Existing households, profiles, categories, and transactions tables in place

## 1. Apply Database Migration

Run the following SQL in the Supabase SQL Editor:

```sql
-- Migration 009: Net Worth Tracker
-- Creates net_worth_items (single table for assets + liabilities)
-- Creates net_worth_snapshots (daily aggregated history)

CREATE TABLE IF NOT EXISTS net_worth_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  type VARCHAR(50) NOT NULL CHECK (type IN ('CURRENT_ASSET', 'NON_CURRENT_ASSET', 'LIABILITY')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_current_assets NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_non_current_assets NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_assets NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_liabilities NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_worth NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (household_id, snapshot_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_net_worth_items_household_active_type
  ON net_worth_items(household_id, is_active, type);

CREATE INDEX IF NOT EXISTS idx_net_worth_snapshots_household_date
  ON net_worth_snapshots(household_id, snapshot_date);

-- RLS
ALTER TABLE net_worth_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for demo" ON net_worth_items;
CREATE POLICY "Allow all for demo" ON net_worth_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for demo" ON net_worth_snapshots;
CREATE POLICY "Allow all for demo" ON net_worth_snapshots FOR ALL USING (true) WITH CHECK (true);
```

## 2. Environment Variables

No new environment variables required. Reuses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Verify Dependencies

Confirm required packages are installed:

```bash
npm list @tremor/react
npm list @hookform/resolvers
npm list zod
```

Expected versions match existing `package.json` entries.

## 4. Development Workflow (TDD — Mandatory)

Per the Constitution, write tests **before** implementation:

```bash
# Step 1: Create and run pure function tests (should FAIL — Red)
npx vitest run src/lib/utils/net-worth.test.ts

# Step 2: Implement calculateNetWorthSummary, createSnapshotFromItems, getNetWorthColor (Green)
# src/lib/utils/net-worth.ts

# Step 3: Refactor if needed

# Step 4: Create and run component tests (should FAIL — Red)
npx vitest run src/components/features/net-worth/

# Step 5: Implement components (Green)
```

## 5. Local Development

```bash
npm run dev
# Navigate to: http://localhost:3000/net-worth
```

## 6. File Checklist

After implementation, the following files should exist:

```text
src/
├── app/
│   └── net-worth/
│       └── page.tsx                         # Server Component page
│
├── components/features/
│   └── net-worth/
│       ├── NetWorthDashboard.tsx            # Client Component — summary + lists + chart
│       ├── NetWorthDashboard.test.tsx
│       ├── NetWorthSummaryCard.tsx          # Tremor KPI cards for totals
│       ├── NetWorthSummaryCard.test.tsx
│       ├── NetWorthItemForm.tsx             # Shadcn form for create/edit item
│       ├── NetWorthItemForm.test.tsx
│       ├── NetWorthItemList.tsx             # Lists items grouped by type
│       ├── NetWorthItemList.test.tsx
│       ├── NetWorthHistoryChart.tsx         # Tremor AreaChart for snapshot history
│       └── NetWorthHistoryChart.test.tsx
│
├── lib/
│   ├── utils/
│   │   ├── net-worth.ts                     # Pure functions: calculateNetWorthSummary, createSnapshotFromItems, getNetWorthColor
│   │   └── net-worth.test.ts              # Vitest tests (MUST exist before utils)
│   ├── supabase/
│   │   ├── queries/
│   │   │   └── net-worth.ts               # getNetWorthItems, getNetWorthSnapshots, getNetWorthSummary
│   │   └── migrations/
│   │       └── 009-net-worth-tracker.sql    # CREATE TABLE migration
│   └── actions/
│       └── net-worth.ts                     # createNetWorthItem, updateNetWorthItem, deleteNetWorthItem, recordSnapshot
│
├── hooks/
│   └── useNetWorth.ts                       # Zustand store or React state hook
│
└── types/
    └── net-worth.ts                         # NetWorthItem, NetWorthSnapshot, NetWorthSummary
```

## 7. Testing Commands

```bash
# Run all tests
npm run test:run

# Run pure function tests only
npx vitest run src/lib/utils/net-worth.test.ts

# Run all net worth component tests
npx vitest run src/components/features/net-worth/

# Watch mode for TDD
npx vitest src/lib/utils/net-worth.test.ts
```

## 8. Key Constraints to Verify

- `calculateNetWorthSummary` with items `[{type:'CURRENT_ASSET', amount:50_000_000}, {type:'LIABILITY', amount:20_000_000}]` must return `{ totalCurrentAssets: 50_000_000, totalNonCurrentAssets: 0, totalAssets: 50_000_000, totalLiabilities: 20_000_000, netWorth: 30_000_000, isPositive: true }`
- `getNetWorthColor(0)` returns `'green'`; `getNetWorthColor(-1)` returns `'red'`
- `deleteNetWorthItem` must set `is_active = false`; must NOT delete any `net_worth_snapshots` rows
- `recordSnapshot` must use `ON CONFLICT (household_id, snapshot_date) DO UPDATE`
- `net_worth` in snapshot table must always equal `total_assets - total_liabilities`
