# Data Model: Cash Flow Tracker

**Phase**: 1 | **Date**: 2026-05-09 | **Feature**: Cash Flow Tracker

## Database Schema (Supabase/PostgreSQL)

### Tables

#### 1. `profiles` - User Accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | User ID |
| `household_id` | UUID | NOT NULL, FK | Links to household |
| `name` | VARCHAR(100) | NOT NULL | Display name (Husband/Wife) |
| `avatar_url` | TEXT | NULLABLE | Profile image |
| `is_active` | BOOLEAN | DEFAULT true | Soft delete |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |

**RLS Policy**: `household_id = auth.jwt() -> 'household_id'`

---

#### 2. `categories` - Transaction Categories

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Category ID |
| `household_id` | UUID | NOT NULL, FK | Links to household |
| `name` | VARCHAR(100) | NOT NULL | Category name |
| `type` | VARCHAR(20) | NOT NULL | 'fixed' or 'variable' |
| `icon` | VARCHAR(50) | NULLABLE | Icon name (Lucide) |
| `color` | VARCHAR(7) | NULLABLE | Hex color |
| `is_active` | BOOLEAN | DEFAULT true | Soft delete |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |

**Default Categories**:
- **Fixed**: Installments, Electricity, Children's School Fees, Insurance
- **Variable**: Dining Out, Hobbies, Impulse Purchases, Groceries, Transportation

**RLS Policy**: `household_id = auth.jwt() -> 'household_id'`

---

#### 3. `transactions` - Financial Entries

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Transaction ID |
| `household_id` | UUID | NOT NULL, FK | Links to household |
| `user_id` | UUID | NOT NULL, FK | Who recorded (husband/wife) |
| `category_id` | UUID | NOT NULL, FK | Transaction category |
| `type` | VARCHAR(10) | NOT NULL | 'income' or 'expense' |
| `amount` | NUMERIC(14,2) | NOT NULL, CHECK > 0 | Monetary value |
| `description` | VARCHAR(255) | NULLABLE | Short description |
| `transaction_date` | DATE | NOT NULL | Date of transaction |
| `is_scheduled` | BOOLEAN | DEFAULT false | Future-dated flag |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |

**Constraints**:
- `amount > 0` - Positive values only, type determines direction
- `transaction_date` can be future (treated as scheduled)

**Indexes**:
- `idx_transactions_household_date` on `(household_id, transaction_date)`
- `idx_transactions_user` on `(user_id)`

**RLS Policy**: `household_id = auth.jwt() -> 'household_id'`

---

#### 4. `households` - Household Container

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Household ID |
| `name` | VARCHAR(100) | NOT NULL | Household name |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Audit trail |

---

## Relationships

```
households (1) ─────< profiles (2)
     │
     └────< categories (many)
     │
     └────< transactions (many)
                         │
                         └────> profiles (user_id)
                         └────> categories (category_id)
```

## Running Balance Calculation

```sql
-- Calculate household balance at any point in time
SELECT 
  COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as balance
FROM transactions
WHERE household_id = $1 
  AND transaction_date <= $2;
```

## TypeScript Interfaces

```typescript
interface Transaction {
  id: string;
  householdId: string;
  userId: string;
  categoryId: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  transactionDate: Date;
  isScheduled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  householdId: string;
  name: string;
  type: 'fixed' | 'variable';
  icon?: string;
  color?: string;
  isActive: boolean;
}

interface Profile {
  id: string;
  householdId: string;
  name: string;
  avatarUrl?: string;
  isActive: boolean;
}
```
