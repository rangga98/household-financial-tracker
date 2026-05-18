# Quickstart: Social & Religious Allocation Module (Giving)

## Prerequisites

- Supabase project with base schema applied
- Node.js 18+ with pnpm
- Existing household and user created

## Setup Steps

### 1. Database Migration

Run the migration in Supabase SQL Editor:

```sql
-- Add giving columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS zakat_auto_rate NUMERIC(5,2) CHECK (zakat_auto_rate >= 0 AND zakat_auto_rate <= 100),
ADD COLUMN IF NOT EXISTS compassion_fixed_amount NUMERIC(14,2) CHECK (compassion_fixed_amount >= 0),
ADD COLUMN IF NOT EXISTS donation_auto_rate NUMERIC(5,2) CHECK (donation_auto_rate >= 0 AND donation_auto_rate <= 100);

-- Extend financial_goals goal_type constraint
ALTER TABLE financial_goals DROP CONSTRAINT IF EXISTS financial_goals_goal_type_check;
ALTER TABLE financial_goals ADD CONSTRAINT financial_goals_goal_type_check
  CHECK (goal_type IN ('emergency', 'sinking', 'savings', 'debt', 'giving_zakat', 'giving_compassion', 'giving_donation'));
```

### 2. Install Dependencies

No new dependencies required. All required packages already in project:
- `@tremor/react` (dashboard visualization)
- `vitest` (testing)
- `zod` (validation)

### 3. Create Giving Goals

The three giving goals should be created when user first accesses the Giving module:

```typescript
// In giving initialization logic
const givingGoals = [
  { goal_type: 'giving_zakat', name: 'Zakat' },
  { goal_type: 'giving_compassion', name: 'Compassion Fund' },
  { goal_type: 'giving_donation', name: 'Donation' }
];
```

---

## Usage Guide

### Zakat Calculator

1. Navigate to Giving module
2. Select "Zakat Calculator"
3. Choose "Zakat Maal" or "Zakat Fitrah"
4. Enter required values
5. View calculated amount

**Zakat Maal Formula**:
```
If (nisabEligibleAssets > nisabThreshold):
  Zakat Due = (nisabEligibleAssets - nisabThreshold) * 0.025
Else:
  Zakat Due = 0
```

**Zakat Fitrah Formula**:
```
Zakat Due = familyMembers * shaWeightKg * stapleFoodPricePerKg
(1 sha' ≈ 2.5 kg)
```

### Setting Up Auto-Allocation

1. Go to Profile Settings
2. Find "Giving Allocation" section
3. Set `zakat_auto_rate` (e.g., 2.5 for 2.5%)
4. Set `compassion_fixed_amount` (e.g., 500000 for Rp 500,000/month)
5. Optionally set `donation_auto_rate`
6. Save

### Recording a Disbursement

1. Navigate to Compassion Fund
2. Click "Record Disbursement"
3. Enter amount and description (e.g., "Monthly allowance — Mom")
4. Confirm

### Viewing Dashboard

1. Navigate to Giving module
2. View summary cards for each category
3. Use date filter to view specific periods
4. View transaction history

---

## Testing

### Unit Tests (TDD First)

Create test file before implementation:

```bash
# Run Zakat calculation tests
pnpm test -- src/lib/utils/calculations/zakat.test.ts
```

Test cases to implement:
- Zakat Maal above nisab
- Zakat Maal below nisab (returns 0)
- Zakat Maal exactly at nisab
- Zakat Fitrah calculation
- Edge cases: zero values, negative values

---

## API Reference

### Server Actions

```typescript
// Calculate Zakat
calculateZakatMaal(nisabEligibleAssets: number, nisabThreshold: number): number
calculateZakatFitrah(familyMembers: number, stapleFoodPricePerSha: number, shaWeightKg?: number): number

// Update allocation settings
updateGivingSettings(userId: string, settings: GivingSettings): Promise<Profile>

// Get giving summary
getGivingSummary(householdId: string, startDate: Date, endDate: Date): Promise<GivingSummary>

// Record disbursement
recordDisbursement(goalId: string, amount: number, description: string): Promise<Transaction>
```

### Hooks

```typescript
// Main hook for Giving module
const {
  summary,
  goals,
  settings,
  isLoading,
  calculateZakatMaal,
  calculateZakatFitrah,
  updateSettings,
  recordDisbursement
} = useGiving(householdId)
```

---

## File Structure

```
src/
├── app/(dashboard)/giving/
│   ├── page.tsx              # Main Giving dashboard
│   ├── calculator/
│   │   └── page.tsx          # Zakat calculator
│   ├── settings/
│   │   └── page.tsx          # Allocation settings
│   └── history/
│       └── page.tsx          # Transaction history
├── components/features/giving/
│   ├── GivingDashboard.tsx   # Main dashboard with Tremor charts
│   ├── ZakatCalculator.tsx   # Calculator form + results
│   ├── CompassionFund.tsx    # Compassion Fund balance + history
│   ├── GivingSettings.tsx    # Allocation settings form
│   └── GivingSummary.tsx     # Summary cards
├── hooks/
│   └── useGiving.ts          # Main hook for giving logic
├── lib/utils/calculations/
│   ├── zatam.ts              # Zakat Maal calculation (TDD first)
│   ├── zakaat.test.ts        # Tests (TDD first)
│   └── index.ts              # Exports
└── lib/supabase/queries/
    └── giving.ts             # Database queries
```

---

## Troubleshooting

### "No Zakat due" message
- This is correct when savings are below nisab threshold
- Verify nisab threshold is correct (85g gold ≈ Rp X in IDR)

### Auto-allocation not triggering
- Verify `zakat_auto_rate` > 0 in profile
- Check that income transaction was created successfully
- Verify giving goals exist for the household

### Compassion Fund shows negative balance
- This is intentional for tracking "debt-of-intention"
- User will see warning but can proceed

### Dashboard shows Rp 0
- Check that date filter covers the period with transactions
- Verify transactions have correct goal_id set
