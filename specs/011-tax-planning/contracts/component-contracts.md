# Component & Action Contracts: Tax Management & Compliance Module

**Phase**: 1 | **Date**: 2026-05-17 | **Feature**: Tax Planning

---

## Server Actions (`src/app/actions/tax-planning.ts`)

All actions are Next.js App Router Server Actions returning `ActionResult<T>`.

```typescript
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

---

### Tax Obligation Actions (via `financial_goals`)

#### `createTaxObligation`

```typescript
async function createTaxObligation(
  payload: CreateTaxObligationInput
): Promise<ActionResult<TaxObligation>>
```

- Validates: `name` non-empty; `targetAmount > 0`; `targetDate` is a valid date; `taxType` is a valid enum value.
- Inserts into `financial_goals` with `goal_type = 'tax_obligation'`, `current_amount = 0`.
- Calls `revalidatePath('/tax-planning')`.

---

#### `updateTaxObligation`

```typescript
async function updateTaxObligation(
  id: string,
  payload: UpdateTaxObligationInput
): Promise<ActionResult<TaxObligation>>
```

- Same validation as create.
- Updates the `financial_goals` row. Sets `updated_at`.
- Calls `revalidatePath('/tax-planning')`.

---

#### `deleteTaxObligation`

```typescript
async function deleteTaxObligation(id: string): Promise<ActionResult>
```

- Sets `deleted_at = now()` (soft delete). Does **not** touch linked `transactions`.
- Calls `revalidatePath('/tax-planning')`.

---

#### `renewTaxObligation`

```typescript
async function renewTaxObligation(
  id: string,
  payload: { newTargetDate: string; newTargetAmount: number }
): Promise<ActionResult<TaxObligation>>
```

- Updates `target_date` and `target_amount` to the new cycle values.
- Resets `current_amount = 0` for the new cycle.
- Used when a user renews an overdue obligation for the next year.
- Calls `revalidatePath('/tax-planning')`.

---

### Filing Deadline Actions

#### `createFilingDeadline`

```typescript
async function createFilingDeadline(
  payload: CreateFilingDeadlineInput
): Promise<ActionResult<TaxFilingDeadline>>
```

- Validates: `fiscalYear` is a 4-digit positive integer; `filingDeadline` is a valid date; `taxType` is valid.
- Checks for duplicate: if a row with `(household_id, tax_type, fiscal_year)` already exists, returns `{ success: false, error: 'Duplicate filing deadline' }`.
- Inserts into `tax_filing_deadlines` with `status = 'pending'`.
- Calls `revalidatePath('/tax-planning')`.

---

#### `markFilingDeadlineAsFiled`

```typescript
async function markFilingDeadlineAsFiled(id: string): Promise<ActionResult<TaxFilingDeadline>>
```

- Sets `status = 'filed'`, `filed_at = now()`, `updated_at = now()`.
- After this, the Server Actions `flagTransactionAsDeductible` and `unflagTransactionAsDeductible` will reject operations for the same `fiscal_year` with an error message.
- Calls `revalidatePath('/tax-planning')`.

---

#### `unarchiveFilingDeadline`

```typescript
async function unarchiveFilingDeadline(id: string): Promise<ActionResult<TaxFilingDeadline>>
```

- Sets `status = 'pending'`, `filed_at = null`, `updated_at = now()`.
- Unlocks deduction editing for the fiscal year.
- Calls `revalidatePath('/tax-planning')`.

---

### Tax Deduction Actions (via `transactions`)

#### `flagTransactionAsDeductible`

```typescript
async function flagTransactionAsDeductible(
  payload: FlagDeductionInput
): Promise<ActionResult>
```

- Validates `fiscalYear` is a valid 4-digit integer.
- Checks that the fiscal year is not locked (`tax_filing_deadlines.status != 'filed'` for this household + year). Returns error if locked.
- Updates `transactions` row: `is_tax_deductible = true`, `fiscal_year = payload.fiscalYear`, `updated_at = now()`.
- Calls `revalidatePath('/tax-planning')`.

---

#### `unflagTransactionAsDeductible`

```typescript
async function unflagTransactionAsDeductible(transactionId: string): Promise<ActionResult>
```

- Checks that the fiscal year is not locked.
- Updates `transactions` row: `is_tax_deductible = false`, `fiscal_year = null`, `updated_at = now()`.
- Calls `revalidatePath('/tax-planning')`.

---

## Query Functions (`src/lib/supabase/queries/tax-planning.ts`)

```typescript
/**
 * Fetch all active (non-deleted) tax obligations for a household.
 * Returns financial_goals rows where goal_type = 'tax_obligation' AND deleted_at IS NULL.
 * Sorted by target_date ASC.
 */
async function getTaxObligations(householdId: string): Promise<TaxObligation[]>

/**
 * Fetch all filing deadlines for a household.
 * Sorted by filing_deadline ASC.
 */
async function getFilingDeadlines(householdId: string): Promise<TaxFilingDeadline[]>

/**
 * Fetch all deductible transactions for a household in a given fiscal year.
 * Joins categories to get categoryName.
 * WHERE is_tax_deductible = true AND fiscal_year = :year AND household_id = :householdId.
 * Sorted by transaction_date DESC.
 */
async function getDeductibleTransactions(
  householdId: string,
  fiscalYear: number
): Promise<TaxDeductionRecord[]>

/**
 * Aggregate deduction totals by category for a fiscal year.
 * Returns array of { categoryId, categoryName, total } sorted by total DESC.
 */
async function getDeductionTotalsByCategory(
  householdId: string,
  fiscalYear: number
): Promise<Array<{ categoryId: string; categoryName: string; total: number }>>

/**
 * Build full TaxDashboardData for the page Server Component.
 * Internally calls getTaxObligations + getFilingDeadlines, then enriches
 * with derived state (installment schedule, overdue status, countdown).
 */
async function getTaxDashboardData(
  householdId: string,
  today?: Date
): Promise<TaxDashboardData>
```

---

## Pure Utility Functions (`src/lib/utils/tax-planning.ts`)

```typescript
/**
 * Compute remaining full months between today and the due date.
 * Returns minimum 1.
 * @param dueDate  ISO date string 'YYYY-MM-DD'
 * @param today    Reference date (defaults to new Date())
 */
export function computeRemainingMonths(dueDate: string, today?: Date): number

/**
 * Compute monthly installment schedule.
 * baseInstallment = Math.floor(remainingAmount / remainingMonths)
 * remainder = remainingAmount % remainingMonths
 * installments[0].amount = baseInstallment + remainder  (first month absorbs remainder)
 * Sum of all installment amounts === remainingAmount exactly.
 * @param remainingAmount  targetAmount - currentAmount (must be > 0)
 * @param dueDate          ISO date string 'YYYY-MM-DD'
 * @param today            Reference date
 */
export function computeTaxInstallments(
  remainingAmount: number,
  dueDate: string,
  today?: Date
): TaxInstallment[]

/**
 * Determine if a tax obligation is overdue (target_date < today).
 */
export function isTaxObligationOverdue(targetDate: string, today?: Date): boolean

/**
 * Compute days until a filing deadline.
 * Positive = future, 0 = today, negative = past (overdue).
 */
export function computeDaysUntilDeadline(filingDeadline: string, today?: Date): number

/**
 * Determine if a filing deadline is urgent (within 30 days and status = pending).
 */
export function isFilingDeadlineUrgent(
  filingDeadline: string,
  status: FilingStatus,
  today?: Date
): boolean

/**
 * Build TaxObligationWithSchedule from a TaxObligation and a reference date.
 */
export function buildObligationWithSchedule(
  obligation: TaxObligation,
  today?: Date
): TaxObligationWithSchedule
```

---

## Component Prop Interfaces

### `TaxPlanningDashboard` (`src/components/features/tax-planning/TaxPlanningDashboard.tsx`)

```typescript
interface TaxPlanningDashboardProps {
  initialData: TaxDashboardData
  householdId: string
}
```

- Client Component with two tabs: **Tax Obligations** | **Filing & Deductions**.
- Manages optimistic UI state for CRUD actions.

---

### `TaxObligationSummaryCard` (`src/components/features/tax-planning/TaxObligationSummaryCard.tsx`)

```typescript
interface TaxObligationSummaryCardProps {
  currentMonthInstallmentTotal: number
  overdueCount: number
  urgentDeadlineCount: number
}
```

- Tremor `Metric` cards: "This Month's Allocation", "Overdue Obligations", "Urgent Deadlines".
- No interactions — display only.

---

### `TaxObligationCard` (`src/components/features/tax-planning/TaxObligationCard.tsx`)

```typescript
interface TaxObligationCardProps {
  obligationWithSchedule: TaxObligationWithSchedule
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onRenew: (id: string) => void
}
```

- Displays obligation name, tax type badge, annual amount, next due date.
- Shows overdue badge in red when `isOverdue = true`.
- Inline expandable installment schedule (`InstallmentScheduleTable`).
- Edit / Delete / Renew actions (Shadcn `DropdownMenu`).

---

### `InstallmentScheduleTable` (`src/components/features/tax-planning/InstallmentScheduleTable.tsx`)

```typescript
interface InstallmentScheduleTableProps {
  installments: TaxInstallment[]
  monthlyInstallment: number
}
```

- Table: Month | Amount | Cumulative Total.
- First row highlighted (includes rounding remainder).

---

### `TaxObligationForm` (`src/components/features/tax-planning/TaxObligationForm.tsx`)

```typescript
interface TaxObligationFormProps {
  mode: 'create' | 'edit'
  initialValues?: Partial<CreateTaxObligationInput>
  householdId: string
  onSuccess: () => void
  onCancel: () => void
}
```

- Shadcn `Dialog` + `Form` with `react-hook-form` + `zod`.
- Fields: Name, Tax Type (select), Total Amount, Annual Due Date, Notes.
- Validation errors shown inline.

---

### `FilingDeadlineList` (`src/components/features/tax-planning/FilingDeadlineList.tsx`)

```typescript
interface FilingDeadlineListProps {
  deadlines: TaxFilingDeadlineWithCountdown[]
  onMarkAsFiled: (id: string) => void
  onUnarchive: (id: string) => void
  onDelete: (id: string) => void
}
```

- Sorted by `filingDeadline ASC`.
- Urgency alert banner for deadlines with `isUrgent = true`.
- Each item shows: Tax Type, Fiscal Year, Deadline Date, Status badge, Days Countdown.

---

### `FilingDeadlineForm` (`src/components/features/tax-planning/FilingDeadlineForm.tsx`)

```typescript
interface FilingDeadlineFormProps {
  householdId: string
  onSuccess: () => void
  onCancel: () => void
}
```

- Shadcn `Dialog` + `Form`.
- Fields: Tax Type (select), Fiscal Year (number), Filing Deadline (date), Notes.

---

### `DeductionList` (`src/components/features/tax-planning/DeductionList.tsx`)

```typescript
interface DeductionListProps {
  deductions: TaxDeductionRecord[]
  categoryTotals: Array<{ categoryId: string; categoryName: string; total: number }>
  isLocked: boolean
  onUnflag: (transactionId: string) => void
}
```

- Shows deduction records grouped or listed, with category totals.
- When `isLocked = true`, unflag button is disabled with a tooltip "Filing archived — unarchive to edit".

---

### `FlagDeductionForm` (`src/components/features/tax-planning/FlagDeductionForm.tsx`)

```typescript
interface FlagDeductionFormProps {
  transactionId: string
  currentFiscalYear: number
  householdId: string
  onSuccess: () => void
  onCancel: () => void
}
```

- Shadcn `Dialog` + `Form`.
- Single field: Fiscal Year (pre-filled with `currentFiscalYear`).
- Confirms the transaction being flagged (shows amount + description).

---

## Page Component (`src/app/tax-planning/page.tsx`)

```typescript
// Server Component — fetches data server-side
export default async function TaxPlanningPage() {
  const householdId = await getHouseholdId()  // from session/auth
  const data = await getTaxDashboardData(householdId)

  return <TaxPlanningDashboard initialData={data} householdId={householdId} />
}
```

---

## Client Hook (`src/hooks/useTaxPlanning.ts`)

```typescript
interface UseTaxPlanningReturn {
  data: TaxDashboardData
  isLoading: boolean
  refresh: () => void
}

function useTaxPlanning(initialData: TaxDashboardData): UseTaxPlanningReturn
```

- Wraps Server Action calls with loading state.
- Used to trigger `router.refresh()` after mutations for Server Component re-fetch.
