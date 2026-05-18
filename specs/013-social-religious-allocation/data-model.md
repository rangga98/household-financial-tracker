# Data Model: Social & Religious Allocation Module (Giving)

## Entity: Profile (Extended)

Reuses existing `profiles` table. Extended with giving-allocation columns.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `zakat_auto_rate` | NUMERIC(5,2) | CHECK (zakat_auto_rate >= 0 AND zakat_auto_rate <= 100) | Percentage of income auto-allocated to Zakat (0 = disabled) |
| `compassion_fixed_amount` | NUMERIC(14,2) | CHECK (compassion_fixed_amount >= 0) | Fixed monthly amount for Compassion Fund |
| `donation_auto_rate` | NUMERIC(5,2) | CHECK (donation_auto_rate >= 0 AND donation_auto_rate <= 100) | Percentage of income auto-allocated to donations |

**Validation** (FR-010):
- `zakat_auto_rate`: 0 (disabled) or 0.01-100 (active)
- `donation_auto_rate`: 0 (disabled) or 0.01-100 (active)
- `compassion_fixed_amount`: >= 0

---

## Entity: FinancialGoal (Giving Goals)

Reuses existing `financial_goals` table. Three giving goals exist by convention.

| goal_type | name | Description |
|-----------|------|-------------|
| `giving_zakat` | Zakat | Virtual Bucket for Zakat savings |
| `giving_compassion` | Compassion Fund | Virtual Bucket for family support |
| `giving_donation` | Donation | Virtual Bucket for general donations |

**Fields** (from existing schema):
- `id`: UUID (primary key)
- `household_id`: UUID (foreign key)
- `goal_type`: VARCHAR(50) - extended with new CHECK values
- `name`: VARCHAR(255)
- `target_amount`: NUMERIC(14,2) - optional for giving goals
- `current_amount`: NUMERIC(14,2) - tracked automatically via transactions
- `is_locked`: BOOLEAN
- `created_at`, `updated_at`, `deleted_at`: TIMESTAMPTZ

---

## Entity: Transaction (Extended)

Reuses existing `transactions` table. Extended with `goal_id` for Virtual Bucket tracking.

**Existing fields** (relevant):
- `id`: UUID (primary key)
- `household_id`: UUID (foreign key)
- `user_id`: UUID (foreign key)
- `category_id`: UUID (foreign key)
- `type`: VARCHAR(10) - 'income', 'expense', or **'transfer'**
- `amount`: NUMERIC(14,2)
- `description`: VARCHAR(255)
- `transaction_date`: DATE
- `goal_id`: UUID (foreign key to financial_goals) - **NEW usage for giving**

**Giving transaction patterns**:

| Action | type | goal_id | Effect |
|--------|------|---------|--------|
| Auto-earmark to Zakat | `transfer` | giving_zakat goal | Increases Zakat bucket balance |
| Auto-earmark to Compassion | `transfer` | giving_compassion goal | Increases Compassion bucket balance |
| Auto-earmark to Donation | `transfer` | giving_donation goal | Increases Donation bucket balance |
| Disburse from Compassion | `expense` | giving_compassion goal | Decreases Compassion bucket balance |

---

## Value Object: ZakatCalculatorInput

Transient, non-persisted value object used to compute Zakat amounts.

### Zakat Maal Input
```typescript
interface ZakatMaalInput {
  nisabEligibleAssets: number  // Total nisab-eligible savings/assets in IDR
  nisabThreshold: number       // Current nisab threshold in IDR (e.g., 85g gold equivalent)
}
```

### Zakat Fitrah Input
```typescript
interface ZakatFitrahInput {
  familyMembers: number        // Number of family members
  stapleFoodPricePerSha: number // Local price per sha' (1 sha' ≈ 2.5 kg)
  shaWeightKg?: number         // Optional override for sha' weight (default: 2.5)
}
```

---

## Value Object: GivingSummary

Computed aggregate (not stored). Derived from transactions filtered by giving goal_ids.

```typescript
interface GivingSummary {
  period: {
    startDate: Date
    endDate: Date
  }
  categories: {
    kategori: 'Zakat' | 'Compassion Fund' | 'Donation'
    totalEarmarked: number
    totalDisbursed: number
    currentBalance: number
  }[]
  totals: {
    totalEarmarked: number
    totalDisbursed: number
    netBalance: number
  }
}
```

---

## Relationships

```
household (1) ─────< profiles (1)
      │
      └────< financial_goals (M)
      │           │
      │           └── goal_type IN ('giving_zakat', 'giving_compassion', 'giving_donation')
      │
      └────< transactions (M)
                  │
                  └── goal_id ─────> financial_goals (Virtual Bucket)
```

---

## State Transitions

### Compassion Fund Balance
- **Earmark** (transfer IN): Balance += amount
- **Disbursement** (expense OUT): Balance -= amount (allows negative for "deficit" tracking)

### Zakat / Donation Goals
- **Earmark** (transfer IN): Balance += amount
- **Disbursement** (expense OUT): Balance -= amount

---

## Indexes

```sql
-- Existing: idx_financial_goals_household_type
-- Extend to include new goal types

-- Existing: idx_transactions_goal
-- Already indexes goal_id for Virtual Bucket queries
```

---

## Migration Required

```sql
-- 1. Add giving columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS zakat_auto_rate NUMERIC(5,2) CHECK (zakat_auto_rate >= 0 AND zakat_auto_rate <= 100),
ADD COLUMN IF NOT EXISTS compassion_fixed_amount NUMERIC(14,2) CHECK (compassion_fixed_amount >= 0),
ADD COLUMN IF NOT EXISTS donation_auto_rate NUMERIC(5,2) CHECK (donation_auto_rate >= 0 AND donation_auto_rate <= 100);

-- 2. Extend financial_goals goal_type check constraint
ALTER TABLE financial_goals DROP CONSTRAINT financial_goals_goal_type_check;
ALTER TABLE financial_goals ADD CONSTRAINT financial_goals_goal_type_check
  CHECK (goal_type IN ('emergency', 'sinking', 'savings', 'debt', 'giving_zakat', 'giving_compassion', 'giving_donation'));

-- 3. Create giving goals for new households (via application logic, not trigger)
```
