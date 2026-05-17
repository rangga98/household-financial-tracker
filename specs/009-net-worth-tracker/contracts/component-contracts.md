# Component & Action Contracts: Net Worth Tracker

**Phase**: 1 | **Date**: 2026-05-12 | **Feature**: Net Worth Tracker

---

## Server Actions (`src/lib/actions/net-worth.ts`)

All Server Actions are Next.js App Router Server Actions. They return a discriminated union `ActionResult`.

```typescript
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### `createNetWorthItem`

```typescript
async function createNetWorthItem(payload: {
  name: string;
  amount: number;
  type: 'CURRENT_ASSET' | 'NON_CURRENT_ASSET' | 'LIABILITY';
}): Promise<ActionResult<NetWorthItem>>;
```

- Inserts a row in `net_worth_items` with `is_active = true`.
- Validates: `name` non-empty, `amount > 0`, `type` is valid enum value.
- Triggers snapshot upsert for current date after creation.
- Returns the newly created `NetWorthItem`.

### `updateNetWorthItem`

```typescript
async function updateNetWorthItem(
  id: string,
  payload: {
    name?: string;
    amount?: number;
    type?: 'CURRENT_ASSET' | 'NON_CURRENT_ASSET' | 'LIABILITY';
  }
): Promise<ActionResult<NetWorthItem>>;
```

- Updates the specified fields on the item row.
- Validates same rules as `createNetWorthItem` for any provided field.
- Triggers snapshot upsert for current date after update.
- Returns the updated `NetWorthItem`.

### `deleteNetWorthItem`

```typescript
async function deleteNetWorthItem(id: string): Promise<ActionResult>;
```

- Sets `is_active = false` on the item row (soft delete).
- Does **not** delete any `net_worth_snapshots` rows.
- Triggers snapshot upsert for current date to reflect the change.
- Returns `{ success: true }` on success.

### `recordSnapshot`

```typescript
async function recordSnapshot(householdId: string): Promise<ActionResult<NetWorthSnapshot>>;
```

- Computes totals from all active `net_worth_items` for the household.
- Upserts a row into `net_worth_snapshots` for today's date (`ON CONFLICT DO UPDATE`).
- Returns the snapshot row.

---

## Database Query Functions (`src/lib/supabase/queries/net-worth.ts`)

```typescript
async function getNetWorthItems(householdId: string): Promise<NetWorthItem[]>;
// Returns all active (is_active = true) net worth items for the household, ordered by type ASC, created_at DESC.

async function getNetWorthItemById(id: string): Promise<NetWorthItem | null>;
// Returns a single item by ID, or null if not found / inactive.

async function getNetWorthSummary(householdId: string): Promise<NetWorthSummary>;
// Returns aggregated totals computed via SQL SUM(CASE WHEN ...).

async function getNetWorthSnapshots(householdId: string, limit?: number): Promise<NetWorthSnapshot[]>;
// Returns snapshot history ordered by snapshot_date ASC, optional limit (default 365).
```

---

## Component Props

### `NetWorthDashboard` (Client Component)

```typescript
interface NetWorthDashboardProps {
  initialItems: NetWorthItem[];
  initialSummary: NetWorthSummary;
  initialSnapshots: NetWorthSnapshot[];
}
```

Renders:
- `NetWorthSummaryCard` grid (Current Assets, Non-Current Assets, Total Assets, Total Liabilities, Net Worth)
- `NetWorthItemList` grouped by type
- `NetWorthHistoryChart` (Tremor AreaChart)
- FAB or action buttons for add/edit

### `NetWorthSummaryCard`

```typescript
interface NetWorthSummaryCardProps {
  summary: NetWorthSummary;
}
```

Renders:
- 5 Tremor `Card` / `Metric` components in a responsive grid
- Net Worth displayed with color indicator (green if >= 0, red if < 0)
- `tabular-nums` class for aligned figures

### `NetWorthItemForm`

```typescript
interface NetWorthItemFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<NetWorthItem>;
  onSuccess: (item: NetWorthItem) => void;
  onCancel: () => void;
}
```

Fields: `name` (required), `amount` (required, > 0), `type` (required, radio/select with three options).
Uses Shadcn `Form`, `Input`, `Select`/`RadioGroup`.

### `NetWorthItemList`

```typescript
interface NetWorthItemListProps {
  items: NetWorthItem[];
  onEdit: (item: NetWorthItem) => void;
  onDelete: (id: string) => void;
}
```

Renders:
- Items grouped by type: CURRENT_ASSET, NON_CURRENT_ASSET, LIABILITY
- Each group has a header with type label and subtotal
- Each item row shows name, formatted amount, edit/delete actions
- Empty state CTA when no items exist

### `NetWorthHistoryChart`

```typescript
interface NetWorthHistoryChartProps {
  snapshots: NetWorthSnapshot[];
}
```

Renders:
- Tremor `AreaChart` with `snapshotDate` on x-axis, `netWorth` on y-axis
- Optional toggle to show `totalAssets` and `totalLiabilities` as additional series (stacked area or multi-line)
- Empty state helper text when < 2 data points

---

## TypeScript Types (`src/types/net-worth.ts`)

```typescript
export interface NetWorthItem {
  id: string;
  householdId: string;
  name: string;
  amount: number;
  type: 'CURRENT_ASSET' | 'NON_CURRENT_ASSET' | 'LIABILITY';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NetWorthSnapshot {
  id: string;
  householdId: string;
  snapshotDate: string;
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  createdAt: string;
}

export interface NetWorthSummary {
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  isPositive: boolean;
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```
