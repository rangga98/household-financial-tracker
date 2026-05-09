# Data Model: Emergency Fund Management

## Overview

This document defines the database schema changes required to implement the Emergency Fund Management feature using the Virtual Bucket (Sinking Fund) approach.

## Entity Relationship

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   households    │────<│  user_profiles   │────<│ financial_goals │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                                                          │ (goal_type = 'emergency')
                                                          ▼
                                                   ┌─────────────────┐
                                                   │   transactions  │
                                                   │ (virtual bucket)│
                                                   └─────────────────┘
```

## New/Modified Tables

### 1. `user_profiles` (MODIFIED - Add columns)

Add household composition fields for emergency fund target calculation.

```sql
ALTER TABLE user_profiles
ADD COLUMN marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married')),
ADD COLUMN dependents INTEGER CHECK (dependents >= 0),
ADD COLUMN monthly_living_expense_estimate NUMERIC(14,2) CHECK (monthly_living_expense_estimate >= 0),
ADD COLUMN emergency_fund_target NUMERIC(14,2) CHECK (emergency_fund_target >= 0),
ADD COLUMN emergency_fund_target_override NUMERIC(14,2),
ADD COLUMN emergency_fund_target_overridden BOOLEAN DEFAULT FALSE;
```

**Fields:**
- `marital_status`: 'single' or 'married'
- `dependents`: Number of dependents (0, 1, 2, 3+)
- `monthly_living_expense_estimate`: Static value entered by user (NOT actual expenses)
- `emergency_fund_target`: Calculated target (6× or 12× estimate)
- `emergency_fund_target_override`: User's manual override value
- `emergency_fund_target_overridden`: Boolean flag if user manually set target

### 2. `financial_goals` (NEW TABLE)

Track financial goals including emergency fund using Virtual Bucket approach.

```sql
CREATE TABLE financial_goals (
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

-- Index for efficient lookups
CREATE INDEX idx_financial_goals_household_type ON financial_goals(household_id, goal_type) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own household goals"
  ON financial_goals FOR ALL
  USING (household_id IN (
    SELECT household_id FROM user_profiles WHERE id = auth.uid()
  ));
```

**Fields:**
- `goal_type`: Type of goal ('emergency' for emergency fund)
- `name`: Display name (e.g., "Emergency Fund")
- `target_amount`: Target amount (from user_profiles.emergency_fund_target)
- `current_amount`: Virtual balance (sum of transactions to this goal)
- `is_locked`: Whether withdrawals require confirmation

### 3. `transactions` (MODIFIED - Add column)

Add goal reference for Virtual Bucket tracking.

```sql
ALTER TABLE transactions
ADD COLUMN goal_id UUID REFERENCES financial_goals(id) ON DELETE SET NULL;
```

**Fields:**
- `goal_id`: Optional reference to financial_goals (for emergency fund contributions)

## Target Calculation Logic

```typescript
// FR-002: Calculate emergency fund target
function calculateEmergencyFundTarget(
  maritalStatus: 'single' | 'married',
  dependents: number,
  monthlyExpenseEstimate: number
): number {
  const hasChildren = dependents > 0;
  const multiplier = (maritalStatus === 'married' && hasChildren) ? 12 : 6;
  return monthlyExpenseEstimate * multiplier;
}

// FR-010: Target is static until user manually updates
// FR-011: User can override the calculated target
function getEffectiveTarget(profile: UserProfile): number {
  return profile.emergency_fund_target_overridden
    ? profile.emergency_fund_target_override
    : profile.emergency_fund_target;
}
```

## Virtual Bucket Calculation

```typescript
// FR-005 & FR-006: Virtual Bucket approach
function calculateAvailableBalance(
  totalFunds: number,
  emergencyFundCurrentAmount: number
): number {
  return totalFunds - emergencyFundCurrentAmount;
}

function calculateEmergencyFundProgress(
  currentAmount: number,
  targetAmount: number
): number {
  if (targetAmount <= 0) return 0;
  return Math.min((currentAmount / targetAmount) * 100, 150); // Cap at 150% for display
}
```

## Validation Rules

| Field | Rule |
|-------|------|
| `marital_status` | Must be 'single' or 'married' |
| `dependents` | Must be >= 0 |
| `monthly_living_expense_estimate` | Must be >= 0, max 99,999,999,999 |
| `emergency_fund_target` | Must be >= 0, max 99,999,999,999 |
| `emergency_fund_target_override` | Must be >= 0, max 99,999,999,999 |
| `financial_goals.target_amount` | Must be >= 0, max 99,999,999,999 |
| `financial_goals.current_amount` | Must be >= 0 |

## State Transitions

```
┌─────────────────┐
│  User Profile   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Enter marital   │────>│ Enter dependents│
│ status          │     │                 │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Enter Monthly Living    │
                    │ Expense Estimate        │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Calculate target (6x or │
                    │ 12x) or manual override │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Create financial_goals  │
                    │ record with goal_type   │
                    │ = 'emergency'           │
                    └─────────────────────────┘
```

## Indexes

```sql
-- Efficient queries for emergency fund dashboard
CREATE INDEX idx_user_profiles_household ON user_profiles(household_id);
CREATE INDEX idx_financial_goals_household_type ON financial_goals(household_id, goal_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_goal ON transactions(goal_id) WHERE goal_id IS NOT NULL;
```
