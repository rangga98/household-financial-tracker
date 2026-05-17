# Component & Action Contracts: Risk Management Module (Protection Layer)

**Phase**: 1 | **Date**: 2026-05-17 | **Feature**: Risk Management Module

---

## Server Actions (`src/app/actions/risk-management.ts`)

All actions are Next.js App Router Server Actions returning `ActionResult<T>`.

```typescript
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

---

### Insurance Tracker Actions

#### `createInsurancePolicy`

```typescript
async function createInsurancePolicy(payload: {
  householdId: string
  name: string
  insuranceType: InsuranceType
  insurer: string
  coverageAmount: number
  premiumAmount: number
  paymentFrequency: PaymentFrequency
  startDate: string
  nextDueDate: string | null
  notes: string | null
}): Promise<ActionResult<InsurancePolicy>>
```

- Validates: `name`, `insurer` non-empty; `coverageAmount >= 0`; `premiumAmount > 0`; `nextDueDate` required unless `paymentFrequency === 'one-time'`.
- Inserts into `insurance_policies`.
- Calls `revalidatePath('/risk-management')`.

---

#### `updateInsurancePolicy`

```typescript
async function updateInsurancePolicy(
  id: string,
  payload: {
    name: string
    insuranceType: InsuranceType
    insurer: string
    coverageAmount: number
    premiumAmount: number
    paymentFrequency: PaymentFrequency
    startDate: string
    nextDueDate: string | null
    notes: string | null
  }
): Promise<ActionResult<InsurancePolicy>>
```

- Same validation as create.
- Updates the `insurance_policies` row. Sets `updated_at`.

---

#### `deactivateInsurancePolicy`

```typescript
async function deactivateInsurancePolicy(id: string): Promise<ActionResult>
```

- Sets `deleted_at = now()` (soft delete). Does **not** touch linked `transactions`.

---

#### `markPremiumPaid`

```typescript
async function markPremiumPaid(payload: {
  policyId: string
  householdId: string
  paymentDate: string
  amount: number
}): Promise<ActionResult<InsurancePremiumRecord>>
```

- Inserts an `expense` transaction into `transactions` with `policy_id = policyId`, `category_id` = Insurance category (find-or-create, same pattern as `recordContribution` in sinking-funds), `type = 'expense'`, `amount`, `transaction_date = paymentDate`.
- Calls `calculateNextPremiumDueDate(policy.nextDueDate, policy.paymentFrequency)` to compute the new due date.
- Updates `insurance_policies.next_due_date` to the computed next due date.
- Returns the created transaction as `InsurancePremiumRecord`.

---

#### `setProtectionTarget`

```typescript
async function setProtectionTarget(payload: {
  householdId: string
  targetAmount: number
  existingGoalId: string | null
}): Promise<ActionResult<ProtectionTarget>>
```

- If `existingGoalId` is null: inserts a `financial_goals` row with `goal_type = 'protection_target'`, `name = 'Family Protection Target'`, `target_amount = targetAmount`, `current_amount = 0`.
- If `existingGoalId` is provided: updates the existing row's `target_amount`.
- Validates: `targetAmount > 0`.

---

### Health Budgeting Actions

Health budgeting reuses **existing Server Actions** — no new action files required:

| Action Needed | Existing Action to Reuse |
|---|---|
| Set/update monthly health budget (`monthly_limit`) | `src/app/actions/budgeting.ts` → `updateCategoryBudget` |
| Log healthcare expense | `src/app/actions/` (cash flow transaction create action — reuse existing transaction creation flow) |
| Edit/delete healthcare expense | Existing transaction update/delete actions |

> The Health Budgeting tab surfaces existing budgeting + transaction infrastructure scoped to healthcare categories. No new action code is required.

---

## Database Query Functions (`src/lib/supabase/queries/risk-management.ts`)

```typescript
// Returns all active (non-soft-deleted) policies for the household, ordered by created_at DESC
async function getInsurancePolicies(householdId: string): Promise<InsurancePolicy[]>

// Returns a single policy by ID (null if not found or deleted)
async function getInsurancePolicyById(id: string): Promise<InsurancePolicy | null>

// Returns total SUM(coverage_amount) across active, non-deleted policies
async function getTotalCoverage(householdId: string): Promise<number>

// Returns the latest premium transaction for a given policy_id (to derive 'Paid' status)
async function getLastPremiumPayment(policyId: string): Promise<InsurancePremiumRecord | null>

// Returns the protection_target financial_goals row for the household (null if not set)
async function getProtectionTarget(householdId: string): Promise<ProtectionTarget | null>

// Returns full dashboard data: policies with derived status + coverage status
async function getInsuranceDashboardData(householdId: string): Promise<InsuranceDashboardData>
```

---

## Pure Utility Functions (`src/lib/utils/insurance.ts`)

```typescript
/**
 * Calculate the next premium due date from the current due date and frequency.
 * Returns null for one-time frequency.
 * Handles month-end edge cases (e.g., Jan 31 + 1 month = Feb 28/29).
 *
 * @param currentDueDate  ISO date string 'YYYY-MM-DD'
 * @param frequency       PaymentFrequency
 * @returns               ISO date string or null
 */
function calculateNextPremiumDueDate(
  currentDueDate: string,
  frequency: PaymentFrequency
): string | null

/**
 * Calculate coverage gap and adequacy status.
 * Returns color: 'gray' if no target, 'red' if coverage < 50% of target,
 * 'yellow' if 50%–99%, 'green' if >= 100%.
 *
 * @param totalCoverage     SUM of active policy coverage amounts
 * @param protectionTarget  User-defined target (null = not set)
 * @returns                 CoverageStatus
 */
function calculateCoverageGap(
  totalCoverage: number,
  protectionTarget: number | null
): CoverageStatus

/**
 * Derive the premium payment status for a single policy.
 *
 * @param nextDueDate      ISO date string or null (null → one-time)
 * @param lastPaymentDate  ISO date string of the most recent transaction, or null
 * @param today            Date object (injected for testability)
 * @returns                PremiumStatus
 */
function derivePremiumStatus(
  nextDueDate: string | null,
  lastPaymentDate: string | null,
  today: Date
): PremiumStatus

/**
 * Calculate days until premium is due.
 * Returns null if paid, one-time, or no due date.
 *
 * @param nextDueDate  ISO date string or null
 * @param today        Date object (injected for testability)
 * @returns            number (can be negative if overdue) or null
 */
function getDaysUntilDue(
  nextDueDate: string | null,
  today: Date
): number | null
```

---

## Component Props

### `RiskManagementPage` (`src/app/risk-management/page.tsx`)

Server Component. Fetches `getInsuranceDashboardData(householdId)` and `getProtectionTarget(householdId)`. Renders `<RiskManagementDashboard />`.

---

### `RiskManagementDashboard` (Client Component)

```typescript
interface RiskManagementDashboardProps {
  initialData: InsuranceDashboardData
  initialTarget: ProtectionTarget | null
}
```

Orchestrates tabs: "Insurance Tracker" | "Health Budget".

---

### `InsuranceSummaryCard`

```typescript
interface InsuranceSummaryCardProps {
  coverageStatus: CoverageStatus
  protectionTarget: ProtectionTarget | null
  onSetTarget: () => void
}
```

Renders:
- Total coverage amount (large, tabular-nums typography)
- Tremor `ProgressBar` showing `coverageStatus.percentage` with `coverageStatus.color`
- Gap or surplus amount
- "Set Target" / "Edit Target" button (opens `ProtectionTargetForm`)

---

### `PolicyCard`

```typescript
interface PolicyCardProps {
  policy: PolicyWithStatus
  onEdit: (policy: InsurancePolicy) => void
  onDeactivate: (id: string) => void
  onMarkPaid: (policy: InsurancePolicy) => void
}
```

Renders:
- Policy name, insurer, insurance type
- Coverage amount (tabular-nums)
- Premium amount + frequency
- Shadcn `Badge` for `premiumStatus` (destructive=overdue, default=upcoming, outline=paid, secondary=one-time)
- Days until due (if upcoming)
- Action buttons: Edit | Deactivate | Mark as Paid

---

### `PolicyForm`

```typescript
interface PolicyFormProps {
  mode: 'create' | 'edit'
  initialValues?: Partial<InsurancePolicy>
  onSuccess: (policy: InsurancePolicy) => void
  onCancel: () => void
}
```

Fields: `name`*, `insuranceType`* (Select), `insurer`*, `coverageAmount`*, `premiumAmount`*, `paymentFrequency`* (Select), `startDate`*, `nextDueDate` (hidden/disabled when `one-time`), `notes`.

---

### `MarkPaidForm`

```typescript
interface MarkPaidFormProps {
  policy: InsurancePolicy
  onSuccess: (record: InsurancePremiumRecord) => void
  onCancel: () => void
}
```

Fields: `paymentDate` (defaults to today), `amount` (pre-filled from `policy.premiumAmount`, editable).

---

### `ProtectionTargetForm`

```typescript
interface ProtectionTargetFormProps {
  existingTarget: ProtectionTarget | null
  onSuccess: (target: ProtectionTarget) => void
  onCancel: () => void
}
```

Fields: `targetAmount`* (> 0). Single-field form rendered in a Shadcn `Dialog`.

---

### `HealthBudgetTab`

```typescript
interface HealthBudgetTabProps {
  householdId: string
  healthcareCategories: Array<{ id: string; name: string; monthlyLimit: number | null }>
  currentMonthSpending: Record<string, number>  // categoryId → total spent this month
}
```

Renders a Tremor `ProgressBar` per healthcare category (reuses `getProgressColor` from `budgeting.ts`). "Log Expense" button navigates to or opens the existing transaction entry flow filtered to healthcare categories.

---

## TypeScript Types (`src/types/risk-management.ts`)

See full type definitions in `data-model.md` → "TypeScript Interfaces" section.
