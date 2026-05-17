# Data Model: Net Worth Tracker

**Phase**: 1 | **Date**: 2026-05-12 | **Feature**: Net Worth Tracker

## Database Schema (Supabase/PostgreSQL)

### New Tables

#### 1. `net_worth_items` — Single Table for Assets & Liabilities

Per the KISS principle, both assets and liabilities are stored in one table differentiated by `type`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique item identifier |
| `household_id` | UUID | NOT NULL, FK → households | RLS boundary; scopes to household |
| `name` | VARCHAR(255) | NOT NULL | Item name (e.g., "Emergency Savings", "Home Mortgage") |
| `amount` | NUMERIC(14,2) | NOT NULL, CHECK > 0 | Current estimated value of the asset/liability |
| `type` | VARCHAR(50) | NOT NULL, CHECK IN ('CURRENT_ASSET', 'NON_CURRENT_ASSET', 'LIABILITY') | Classification determining how the item contributes to net worth |
| `is_active` | BOOLEAN | DEFAULT true | Soft delete flag; false = hidden from active list |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |

**Migration**: `src/lib/supabase/migrations/009-net-worth-tracker.sql` creates the table, indexes, and RLS policies.

**RLS Policy**: Inherits household-scoped pattern. Example:
```sql
CREATE POLICY "Allow all for demo" ON net_worth_items FOR ALL USING (true) WITH CHECK (true);
```

---

#### 2. `net_worth_snapshots` — Daily Aggregated History

Stores one aggregated snapshot per day for historical trend visualization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Snapshot identifier |
| `household_id` | UUID | NOT NULL, FK → households | RLS boundary |
| `snapshot_date` | DATE | NOT NULL | The date this snapshot represents |
| `total_current_assets` | NUMERIC(14,2) | NOT NULL, DEFAULT 0 | Sum of all CURRENT_ASSET items on this date |
| `total_non_current_assets` | NUMERIC(14,2) | NOT NULL, DEFAULT 0 | Sum of all NON_CURRENT_ASSET items on this date |
| `total_assets` | NUMERIC(14,2) | NOT NULL, DEFAULT 0 | total_current_assets + total_non_current_assets |
| `total_liabilities` | NUMERIC(14,2) | NOT NULL, DEFAULT 0 | Sum of all LIABILITY items on this date |
| `net_worth` | NUMERIC(14,2) | NOT NULL, DEFAULT 0 | total_assets - total_liabilities |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |

**Unique Constraint**: `(household_id, snapshot_date)` — ensures only one snapshot per household per day.

**Upsert Behavior**: When any item is updated, compute totals and `INSERT ... ON CONFLICT (household_id, snapshot_date) DO UPDATE` for the current date.

**RLS Policy**: Same household-scoped pattern as `net_worth_items`.

---

### Relationships

```
households (1) ─────< net_worth_items (many)   [filtered by is_active = true for current view]
households (1) ─────< net_worth_snapshots (many) [ordered by snapshot_date DESC for history]
```

---

## TypeScript Interfaces

### Database Row (snake_case, from Supabase)

```typescript
interface NetWorthItemRow {
  id: string;
  household_id: string;
  name: string;
  amount: number;       // NUMERIC(14,2) → number
  type: 'CURRENT_ASSET' | 'NON_CURRENT_ASSET' | 'LIABILITY';
  is_active: boolean;
  created_at: string;   // ISO 8601
  updated_at: string;
}

interface NetWorthSnapshotRow {
  id: string;
  household_id: string;
  snapshot_date: string; // ISO date 'YYYY-MM-DD'
  total_current_assets: number;
  total_non_current_assets: number;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  created_at: string;
}
```

### Application Model (camelCase, consumed by UI)

```typescript
interface NetWorthItem {
  id: string;
  householdId: string;
  name: string;
  amount: number;
  type: 'CURRENT_ASSET' | 'NON_CURRENT_ASSET' | 'LIABILITY';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NetWorthSnapshot {
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
```

### Derived State (Computed in Real-Time, Never Persisted in Items Table)

```typescript
interface NetWorthSummary {
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  isPositive: boolean; // netWorth >= 0
}
```

---

## Financial Calculation Logic

### Pure Functions (implemented in `src/lib/utils/net-worth.ts`)

```typescript
/**
 * Calculate net worth summary from a list of active items.
 * @param items  Active net worth items (is_active = true)
 * @returns Aggregated summary with all totals
 */
function calculateNetWorthSummary(items: NetWorthItem[]): NetWorthSummary;

/**
 * Create a snapshot object from a list of active items for the given date.
 * @param items  Active net worth items
 * @param date   Snapshot date (defaults to today)
 * @returns NetWorthSnapshot-ready object
 */
function createSnapshotFromItems(
  items: NetWorthItem[],
  date?: string
): Omit<NetWorthSnapshot, 'id' | 'householdId' | 'createdAt'>;

/**
 * Determine the color indicator for net worth value.
 * @param netWorth  The computed net worth value
 * @returns 'green' if >= 0, 'red' if < 0
 */
function getNetWorthColor(netWorth: number): 'green' | 'red';
```

### SQL Computation (Server-Side)

```sql
-- Active items summary for a household
SELECT
  SUM(CASE WHEN type = 'CURRENT_ASSET' THEN amount ELSE 0 END) AS total_current_assets,
  SUM(CASE WHEN type = 'NON_CURRENT_ASSET' THEN amount ELSE 0 END) AS total_non_current_assets,
  SUM(CASE WHEN type IN ('CURRENT_ASSET', 'NON_CURRENT_ASSET') THEN amount ELSE 0 END) AS total_assets,
  SUM(CASE WHEN type = 'LIABILITY' THEN amount ELSE 0 END) AS total_liabilities,
  SUM(CASE WHEN type IN ('CURRENT_ASSET', 'NON_CURRENT_ASSET') THEN amount ELSE 0 END)
    - SUM(CASE WHEN type = 'LIABILITY' THEN amount ELSE 0 END) AS net_worth
FROM net_worth_items
WHERE household_id = :household_id AND is_active = true;

-- Snapshot history for chart
SELECT snapshot_date, net_worth, total_assets, total_liabilities
FROM net_worth_snapshots
WHERE household_id = :household_id
ORDER BY snapshot_date ASC;
```

---

## Edge Case Handling

| Condition | Behaviour |
|-----------|-----------|
| No items exist | Dashboard shows empty state with "Add your first asset or liability" CTA; all totals = 0 |
| Net worth < 0 | Displayed in red (`getNetWorthColor` returns 'red'); label indicates "underwater" |
| Large values (billions) | `NUMERIC(14,2)` accommodates up to 99,999,999,999,999.99 without precision loss |
| Soft-deleted item (`is_active = false`) | Excluded from all real-time calculations and active lists; preserved in DB for potential v2 drill-down |
| Same-day multiple updates | Snapshot table uses `ON CONFLICT (household_id, snapshot_date) DO UPDATE` — latest values win |
| First-ever snapshot | History chart shows single data point with helper text: "Track your progress over time by updating your assets and liabilities." |
| Duplicate item names | Allowed; UI may append subtle index or display both without restriction |
| Zero or negative amount input | Validation error: "Amount must be greater than 0" |

---

## Indexes

```sql
-- Active items by household and type (covers all summary queries)
CREATE INDEX idx_net_worth_items_household_active_type
  ON net_worth_items(household_id, is_active, type);

-- Snapshot history lookup
CREATE INDEX idx_net_worth_snapshots_household_date
  ON net_worth_snapshots(household_id, snapshot_date);
```
