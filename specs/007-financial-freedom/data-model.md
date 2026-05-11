# Data Model: Financial Freedom Module

**Phase**: 1 | **Date**: 2026-05-11 | **Feature**: Financial Freedom Module

## Database Schema (Supabase/PostgreSQL)

### Tables

#### 1. `profiles` — Extended with FI Fields (Existing Table)

Per the YAGNI/KISS principle, FI input variables are added as columns to the existing `profiles` table. No new table is created.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Existing — User/Profile ID |
| `household_id` | UUID | NOT NULL, FK | Existing — Links to household |
| `name` | VARCHAR(100) | NOT NULL | Existing — Display name |
| `avatar_url` | TEXT | NULLABLE | Existing — Profile image |
| `is_active` | BOOLEAN | DEFAULT true | Existing — Soft delete |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Existing — Audit trail |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Existing — Audit trail |
| `fi_annual_expenses` | NUMERIC(14,2) | NULLABLE, CHECK >= 0 | Annual living expenses for FI calc |
| `fi_savings_rate` | NUMERIC(5,4) | NULLABLE, CHECK 0..1 | Savings rate as decimal (e.g., 0.50) |
| `fi_current_age` | INTEGER | NULLABLE, CHECK >= 0 | User's current age |
| `fi_current_net_worth` | NUMERIC(14,2) | NULLABLE, CHECK >= 0 | Current total net worth |
| `fi_expected_return` | NUMERIC(5,4) | NULLABLE, CHECK >= 0 | Expected annual return (default 0.07) |

**Migration Pattern**: Follows the same `ALTER TABLE profiles ADD COLUMN` approach used by the Emergency Fund feature (`003-emergency-fund.sql`).

**RLS Policy**: Inherits existing profiles table policies (scoped by `household_id`).

---

## Relationships

```
households (1) ─────< profiles (many) [extended with FI fields]
```

## TypeScript Interfaces

### Input (Persisted in Database)

```typescript
interface FIProfile {
  id: string;
  householdId: string;
  fiAnnualExpenses: number | null;
  fiSavingsRate: number | null;
  fiCurrentAge: number | null;
  fiCurrentNetWorth: number | null;
  fiExpectedReturn: number | null;
}
```

### Derived State (Computed in Real-Time, Never Persisted)

```typescript
interface FIProjection {
  fiNumber: number;
  yearsToFI: number | null; // null when unreachable
  projectedFIAge: number | null;
  progressPercentage: number; // 0-100, capped at 100
  isAlreadyFI: boolean;
  trajectory: FIYearProjection[];
}

interface FIYearProjection {
  year: number; // calendar year
  age: number;
  netWorth: number;
}
```

### Combined View (UI Consumes This)

```typescript
interface FIDashboardData {
  profile: FIProfile;
  projection: FIProjection;
}
```

## Financial Calculation Logic

### Pure Functions (to be implemented in `lib/utils/finance.ts`)

```typescript
/**
 * Calculate FI Number using the 4% Rule.
 * FI Number = Annual Expenses × 25
 */
function calculateFINumber(annualExpenses: number): number;

/**
 * Calculate annual savings from expenses and savings rate.
 * annualIncome = annualExpenses / (1 - savingsRate)
 * annualSavings = annualIncome × savingsRate
 */
function calculateAnnualSavings(annualExpenses: number, savingsRate: number): number;

/**
 * Calculate Years to FI using compound interest with contributions.
 * Formula: ln((r × FI + savings) / (r × NW + savings)) / ln(1 + r)
 * Returns null if savingsRate <= 0 or currentNetWorth >= fiNumber.
 */
function calculateYearsToFI(
  currentNetWorth: number,
  annualSavings: number,
  fiNumber: number,
  expectedReturn: number
): number | null;

/**
 * Generate year-by-year net worth trajectory.
 * Returns array of { year, age, netWorth } until FI is reached.
 */
function generateTrajectory(
  currentNetWorth: number,
  annualSavings: number,
  fiNumber: number,
  expectedReturn: number,
  currentAge: number,
  currentYear: number
): FIYearProjection[];

/**
 * Master function: compute full FI projection from raw inputs.
 */
function computeFIProjection(profile: FIProfile): FIProjection;
```

## Edge Case Handling

| Condition | Behavior |
|-----------|----------|
| `savingsRate <= 0` | `yearsToFI = null`, display "unreachable" message |
| `currentNetWorth >= fiNumber` | `isAlreadyFI = true`, `yearsToFI = 0`, celebratory UI |
| `annualExpenses === 0` | `fiNumber = 0`, `yearsToFI = 0` (already FI by definition) |
| `expectedReturn === 0` | Falls back to linear division: `(fiNumber - currentNetWorth) / annualSavings` |
| Missing any input field | Prompt user to complete profile; do not show partial projections |
