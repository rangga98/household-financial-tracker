# Quickstart: Emergency Fund Management

## Prerequisites

- Next.js 14+ project with App Router
- Supabase database with RLS enabled
- Shadcn/ui and Tremor installed
- Vitest configured for testing

## Database Setup

Run the following SQL to set up the required tables:

```sql
-- 1. Add columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married')),
ADD COLUMN IF NOT EXISTS dependents INTEGER CHECK (dependents >= 0),
ADD COLUMN IF NOT EXISTS monthly_living_expense_estimate NUMERIC(14,2) CHECK (monthly_living_expense_estimate >= 0),
ADD COLUMN IF NOT EXISTS emergency_fund_target NUMERIC(14,2) CHECK (emergency_fund_target >= 0),
ADD COLUMN IF NOT EXISTS emergency_fund_target_override NUMERIC(14,2),
ADD COLUMN IF NOT EXISTS emergency_fund_target_overridden BOOLEAN DEFAULT FALSE;

-- 2. Create financial_goals table
CREATE TABLE IF NOT EXISTS financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('emergency', 'sinking', 'savings', 'debt')),
  name VARCHAR(255) NOT NULL,
  target_amount NUMERIC(14,2) NOT NULL CHECK (target_amount >= 0),
  current_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 3. Add goal_id to transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES financial_goals(id) ON DELETE SET NULL;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_financial_goals_household_type ON financial_goals(household_id, goal_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_goal ON transactions(goal_id) WHERE goal_id IS NOT NULL;

-- 5. Enable RLS on financial_goals
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own household goals"
  ON financial_goals FOR ALL
  USING (household_id IN (
    SELECT household_id FROM user_profiles WHERE id = auth.uid()
  ));
```

## Installation

No additional packages required. Uses existing dependencies:
- `@tremor/react` (for ProgressBar)
- `zustand` (for state management)
- `@supabase/supabase-js` (for database)

## Implementation Order

1. **Create TypeScript types** (`/src/types/emergency-fund.ts`)
2. **Create utility functions** (`/src/lib/utils/financial.ts`)
3. **Create database queries** (`/src/lib/supabase/emergency-fund.ts`)
4. **Create Zustand store** (`/src/hooks/useEmergencyFund.ts`)
5. **Create UI components** (`/src/components/features/emergency-fund/`)
6. **Write tests** (TDD - tests first!)

## Key Functions

### Target Calculation

```typescript
// Calculate based on household composition
const target = calculateEmergencyFundTarget('married', 2, 5000);
// Returns: 60000 (12 * 5000)
```

### Progress Calculation

```typescript
// Calculate progress percentage
const progress = calculateEmergencyFundProgress(30000, 60000);
// Returns: 50
```

### Available Balance

```typescript
// Virtual bucket: Total - Emergency Fund
const available = calculateAvailableBalance(10000, 5000);
// Returns: 5000
```

## Testing

```bash
# Run unit tests
npm test -- emergency-fund

# Run with coverage
npm test -- --coverage emergency-fund
```

## Component Structure

```
src/components/features/emergency-fund/
├── EmergencyFundCard.tsx       # Main Bento-style card
├── EmergencyFundSetup.tsx      # Setup wizard (marital status, dependents, estimate)
├── EmergencyFundProgress.tsx   # Tremor ProgressBar visualization
├── EmergencyFundForm.tsx       # Add/withdraw from emergency fund
└── index.ts                    # Barrel exports
```

## Environment Variables

Ensure `.env.local` contains:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Verification

After implementation, verify:

- [ ] User can set marital status and dependents
- [ ] User can enter Monthly Living Expense Estimate
- [ ] Target calculates correctly (6x or 12x)
- [ ] User can manually override target
- [ ] Progress bar shows correct percentage
- [ ] Available balance = Total - Emergency Fund
- [ ] Warning shown when withdrawing from emergency fund
- [ ] Tremor ProgressBar renders in Bento card
- [ ] All tests pass
