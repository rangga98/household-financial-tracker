# Tasks: Tax Management & Compliance Module

**Input**: Design documents from `specs/011-tax-planning/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: TDD is mandatory per the project constitution. Test tasks are written first and MUST fail (Red) before implementation (Green).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in every description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration, TypeScript types — foundations that all subsequent phases depend on.

- [ ] T001 Apply database migration `src/lib/supabase/migrations/011-tax-planning.sql` — ADD `tax_type` column to `financial_goals`; extend `goal_type` CHECK to include `'tax_obligation'`; ADD `is_tax_deductible BOOLEAN DEFAULT false` and `fiscal_year INTEGER` to `transactions`; CREATE `tax_filing_deadlines` table with UNIQUE(household_id, tax_type, fiscal_year); create indexes; enable RLS with demo policy
- [ ] T002 [P] Create TypeScript types and interfaces file `src/types/tax-planning.ts` — define `TaxObligationType`, `FilingStatus`, `TaxFilingType`, `TaxObligation`, `TaxFilingDeadline`, `TaxDeductionRecord`, `CreateTaxObligationInput`, `UpdateTaxObligationInput`, `CreateFilingDeadlineInput`, `FlagDeductionInput`, `TaxInstallment`, `TaxObligationWithSchedule`, `TaxFilingDeadlineWithCountdown`, `TaxDashboardData`, `ActionResult<T>` as specified in `data-model.md`

**Checkpoint**: Migration applied in Supabase SQL Editor; types file compiles with `tsc --noEmit`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure utility functions and DB queries — MUST be complete before any user story component can be built.

**⚠️ CRITICAL**: No user story work can begin until T003 and T004 are complete (utility TDD cycle), and T005 is complete (queries).

- [ ] T003 Write failing Vitest unit tests (RED) for all pure utility functions in `src/lib/utils/tax-planning.test.ts` — cover `computeRemainingMonths` (including clamping to 1), `computeTaxInstallments` (sum integrity, remainder in first month, single-installment edge case, rounding with odd amounts), `isTaxObligationOverdue` (past/future/today), `computeDaysUntilDeadline` (positive/zero/negative), `isFilingDeadlineUrgent` (pending+≤30d, pending+>30d, filed+≤30d), `buildObligationWithSchedule` — run `npx vitest run src/lib/utils/tax-planning.test.ts` and confirm ALL tests FAIL before proceeding
- [ ] T004 Implement pure utility functions (GREEN) in `src/lib/utils/tax-planning.ts` to pass all T003 tests — implement `computeRemainingMonths`, `computeTaxInstallments` (floor + remainder-to-first-month rounding), `isTaxObligationOverdue`, `computeDaysUntilDeadline`, `isFilingDeadlineUrgent`, `buildObligationWithSchedule` — run `npx vitest run src/lib/utils/tax-planning.test.ts` and confirm ALL tests PASS
- [ ] T005 Create Supabase query functions in `src/lib/supabase/queries/tax-planning.ts` — implement `getTaxObligations(householdId)` (financial_goals WHERE goal_type = 'tax_obligation' AND deleted_at IS NULL, ordered by target_date ASC), `getFilingDeadlines(householdId)` (ordered by filing_deadline ASC), `getDeductibleTransactions(householdId, fiscalYear)` (transactions WHERE is_tax_deductible = true AND fiscal_year = :year, joined to categories for categoryName, ordered by transaction_date DESC), `getDeductionTotalsByCategory(householdId, fiscalYear)`, `getTaxDashboardData(householdId, today?)` (aggregates all above + enriches with derived state using T004 utility functions)

**Checkpoint**: `npx vitest run src/lib/utils/tax-planning.test.ts` → all green; `tsc --noEmit` → no errors

---

## Phase 3: User Story 1 — Annual Tax Installment Planner (Priority: P1) 🎯 MVP

**Goal**: Users can create Vehicle Registration / Property Tax obligations and see the full monthly installment schedule in real-time.

**Independent Test**: Create one tax obligation (type: vehicle_registration, amount: Rp 1,200,000, due: 2026-12-01) → verify installment schedule shows correct monthly amounts summing to Rp 1,200,000 → edit the due date → verify schedule recalculates → soft-delete → verify it disappears from list.

> **⚠️ TDD: Write tests first (RED) and verify they FAIL before implementing (GREEN)**

- [ ] T006 Write failing Server Action integration tests (RED) for tax obligation CRUD in `src/app/actions/tax-planning.test.ts` — test `createTaxObligation` (valid input inserts to financial_goals with goal_type='tax_obligation'; zero/negative amount rejected; missing name rejected), `updateTaxObligation` (updates name/amount/date; validation errors), `deleteTaxObligation` (sets deleted_at; linked transactions untouched), `renewTaxObligation` (updates target_date + target_amount, resets current_amount to 0) — mock Supabase client with `vi.mock`; confirm all tests FAIL before T007
- [ ] T007 [US1] Implement tax obligation Server Actions (GREEN) in `src/app/actions/tax-planning.ts` — implement `createTaxObligation`, `updateTaxObligation`, `deleteTaxObligation`, `renewTaxObligation` per contracts in `contracts/component-contracts.md`; include `revalidatePath('/tax-planning')` after each mutation; run `npx vitest run src/app/actions/tax-planning.test.ts` and confirm obligation tests PASS
- [ ] T008 [P] [US1] Write failing RTL test (RED) for TaxObligationForm in `src/components/features/tax-planning/TaxObligationForm.test.tsx` — test: renders create form with Name, Tax Type select, Total Amount, Annual Due Date, Notes fields; submit with valid data calls `createTaxObligation`; submit with zero amount shows validation error; submit with empty name shows validation error; cancel calls `onCancel`
- [ ] T009 [P] [US1] Write failing RTL test (RED) for InstallmentScheduleTable in `src/components/features/tax-planning/InstallmentScheduleTable.test.tsx` — test: renders correct number of rows for 11-month schedule; first row amount includes remainder; all amounts sum to `remainingAmount`; first row is visually highlighted; single-row schedule for <1 month remaining shows full amount
- [ ] T010 [US1] Implement TaxObligationForm component (GREEN) in `src/components/features/tax-planning/TaxObligationForm.tsx` — Shadcn `Dialog` + `Form` with `react-hook-form` + `zod`; fields: Name (text), Tax Type (Shadcn Select: Vehicle Registration / Property Tax / Custom), Total Amount (number, IDR), Annual Due Date (date), Notes (textarea); supports `mode: 'create' | 'edit'` with `initialValues`; calls `createTaxObligation` or `updateTaxObligation` Server Action; inline validation errors; run T008 tests to GREEN
- [ ] T011 [US1] Implement InstallmentScheduleTable component (GREEN) in `src/components/features/tax-planning/InstallmentScheduleTable.tsx` — table columns: Month (YYYY-MM), Amount (IDR formatted), Cumulative Total; first row highlighted with Tailwind bg-muted; shows `monthlyInstallment` in footer as "Monthly allocation"; run T009 tests to GREEN
- [ ] T012 [US1] Write failing RTL test (RED) for TaxObligationCard in `src/components/features/tax-planning/TaxObligationCard.test.tsx` — test: renders obligation name, tax type badge, total amount, due date; isOverdue = true shows red "Overdue" badge and renew button; installment schedule table hidden by default, toggles on expand; Edit/Delete/Renew dropdown actions call respective callbacks
- [ ] T013 [US1] Implement TaxObligationCard component (GREEN) in `src/components/features/tax-planning/TaxObligationCard.tsx` — displays name, TaxObligationType badge (Shadcn `Badge`), formatted total amount, target date; red Overdue badge when `isOverdue`; expandable `InstallmentScheduleTable`; Shadcn `DropdownMenu` with Edit / Delete / Renew (Renew shown only when overdue); 44×44px touch targets; run T012 tests to GREEN
- [ ] T014 [US1] Write failing RTL test (RED) for TaxObligationList in `src/components/features/tax-planning/TaxObligationList.test.tsx` — test: renders empty state with CTA when obligations array is empty; renders list of TaxObligationCard for each obligation sorted by target_date; Add Obligation button opens TaxObligationForm dialog
- [ ] T015 [US1] Implement TaxObligationList component (GREEN) in `src/components/features/tax-planning/TaxObligationList.tsx` — renders list of `TaxObligationCard` sorted by `targetDate ASC`; empty state with "Add your first tax obligation" CTA; FAB / Add button opens `TaxObligationForm` dialog in create mode; run T014 tests to GREEN

**Checkpoint**: `npx vitest run src/components/features/tax-planning/TaxObligationList.test.tsx` → green; create a Vehicle Registration obligation → schedule renders correctly; soft-delete → disappears from list

---

## Phase 4: User Story 2 — Annual Tax Filing Reminder & Deduction Records (Priority: P2)

**Goal**: Users can set a filing deadline, see a countdown, flag transactions as deductible, view category totals, and mark filing as complete (locking deductions).

**Independent Test**: Set SPT 2026 deadline (March 31, 2027) → verify countdown shows ~318 days → flag 2 transactions as deductible for FY2026 → verify deduction total reflects both → mark as filed → verify deductions locked → attempt to flag another transaction → blocked with error message.

> **⚠️ TDD: Write tests first (RED) and verify they FAIL before implementing (GREEN)**

- [ ] T016 [US2] Write failing Server Action integration tests (RED) for filing + deduction actions in `src/app/actions/tax-planning.test.ts` (extend existing file) — test `createFilingDeadline` (inserts with status='pending'; duplicate type+year returns error; invalid fiscalYear rejected), `markFilingDeadlineAsFiled` (sets status='filed', filed_at=now), `unarchiveFilingDeadline` (resets status='pending', filed_at=null), `flagTransactionAsDeductible` (sets is_tax_deductible=true and fiscal_year; rejected when year is filed), `unflagTransactionAsDeductible` (clears flag; rejected when year is filed) — confirm all FAIL before T017/T018
- [ ] T017 [US2] Implement filing deadline Server Actions (GREEN) in `src/app/actions/tax-planning.ts` — implement `createFilingDeadline`, `markFilingDeadlineAsFiled`, `unarchiveFilingDeadline`; include duplicate-check for `(household_id, tax_type, fiscal_year)` unique constraint; add `checkFiscalYearLocked(householdId, fiscalYear)` helper that queries `tax_filing_deadlines`; all call `revalidatePath('/tax-planning')` — run filing deadline tests to GREEN
- [ ] T018 [US2] Implement deduction Server Actions (GREEN) in `src/app/actions/tax-planning.ts` — implement `flagTransactionAsDeductible`, `unflagTransactionAsDeductible`; both call `checkFiscalYearLocked` first and return `{ success: false, error: 'Fiscal year X is archived. Unarchive to make changes.' }` if locked — run deduction action tests to GREEN
- [ ] T019 [P] [US2] Write failing RTL test (RED) for FilingDeadlineForm in `src/components/features/tax-planning/FilingDeadlineForm.test.tsx` — test: renders Tax Type select, Fiscal Year input, Filing Deadline date, Notes; submit with valid data calls `createFilingDeadline`; duplicate error from action shown as form-level error; invalid fiscal year (non-integer, negative) shows validation error
- [ ] T020 [P] [US2] Write failing RTL test (RED) for FilingDeadlineList in `src/components/features/tax-planning/FilingDeadlineList.test.tsx` — test: renders empty state when no deadlines; shows countdown badge with correct days; isUrgent=true shows amber alert banner; 'filed' status shows green "Filed" badge and unarchive button; 'pending' status shows "Mark as Filed" button; overdue pending deadline highlighted in red
- [ ] T021 [P] [US2] Write failing RTL test (RED) for DeductionList in `src/components/features/tax-planning/DeductionList.test.tsx` — test: renders list of deductions with date, description, category, amount; isLocked=true disables unflag buttons with tooltip text; category totals section sums correctly; empty state shown when no deductions
- [ ] T022 [P] [US2] Write failing RTL test (RED) for FlagDeductionForm in `src/components/features/tax-planning/FlagDeductionForm.test.tsx` — test: renders pre-filled fiscal year and transaction summary (amount + description); submit calls `flagTransactionAsDeductible`; fiscal_year field is editable; locked year error from action is shown inline
- [ ] T023 [US2] Implement FilingDeadlineForm component (GREEN) in `src/components/features/tax-planning/FilingDeadlineForm.tsx` — Shadcn `Dialog` + `Form`; fields: Tax Type (Select: income_tax / custom), Fiscal Year (number input), Filing Deadline (date), Notes; calls `createFilingDeadline`; server-side duplicate errors surfaced as form error; run T019 tests to GREEN
- [ ] T024 [US2] Implement FilingDeadlineList component (GREEN) in `src/components/features/tax-planning/FilingDeadlineList.tsx` — sorted by filing_deadline ASC; urgency alert banner (Shadcn `Alert` with amber styling) when `isUrgent`; countdown Shadcn `Badge` (red if overdue, amber if ≤30d, default otherwise); status badge (green "Filed" / default "Pending"); Mark as Filed / Unarchive / Delete actions; run T020 tests to GREEN
- [ ] T025 [US2] Implement DeductionList component (GREEN) in `src/components/features/tax-planning/DeductionList.tsx` — list of deductible transactions with transaction_date, description, categoryName, amount; category totals table at top; unflag button per row (disabled with tooltip when `isLocked`); Fiscal Year selector to switch between years; run T021 tests to GREEN
- [ ] T026 [US2] Implement FlagDeductionForm component (GREEN) in `src/components/features/tax-planning/FlagDeductionForm.tsx` — Shadcn `Dialog` + `Form`; shows transaction preview (amount + description); fiscal year input pre-filled; calls `flagTransactionAsDeductible`; shows fiscal year lock error inline; run T022 tests to GREEN

**Checkpoint**: `npx vitest run src/components/features/tax-planning/` → all green for US2 components; flag 2 transactions → totals correct → mark as filed → flag attempt blocked

---

## Phase 5: User Story 3 — Tax Obligations Dashboard Overview (Priority: P3)

**Goal**: A single unified view shows KPI cards (this month's allocation, overdue count, urgent deadline count), the obligation list, and the filing panel — all in one page.

**Independent Test**: With 2 active obligations and 1 urgent filing deadline, open `/tax-planning` → verify KPI card shows correct `currentMonthInstallmentTotal` → verify urgent deadline count badge → verify obligations sorted by due date soonest first → empty state when no data.

> **⚠️ TDD: Write tests first (RED) and verify they FAIL before implementing (GREEN)**

- [ ] T027 [US3] Write failing RTL test (RED) for TaxObligationSummaryCard in `src/components/features/tax-planning/TaxObligationSummaryCard.test.tsx` — test: renders "This Month's Allocation" Tremor Metric card with correct IDR-formatted value; renders "Overdue Obligations" count (red BadgeDelta when > 0); renders "Urgent Deadlines" count (amber BadgeDelta when > 0); renders all zeros/empty correctly
- [ ] T028 [US3] Implement TaxObligationSummaryCard component (GREEN) in `src/components/features/tax-planning/TaxObligationSummaryCard.tsx` — three Tremor `Metric` cards: "This Month's Allocation" (IDR formatted), "Overdue Obligations" (Tremor `BadgeDelta` red when > 0), "Urgent Deadlines" (Tremor `BadgeDelta` amber when > 0); responsive grid: 1-col mobile, 3-col desktop; run T027 tests to GREEN
- [ ] T029 [US3] Write failing RTL test (RED) for TaxPlanningDashboard in `src/components/features/tax-planning/TaxPlanningDashboard.test.tsx` — test: renders TaxObligationSummaryCard with correct props; two tabs render (Tax Obligations | Filing & Deductions); Tax Obligations tab shows TaxObligationList; Filing & Deductions tab shows FilingDeadlineList and DeductionList; switching tabs preserves state; empty data shows empty states on both tabs
- [ ] T030 [US3] Implement TaxPlanningDashboard component (GREEN) in `src/components/features/tax-planning/TaxPlanningDashboard.tsx` — Client Component; `TaxObligationSummaryCard` always visible above tabs; Shadcn `Tabs` with "Tax Obligations" tab (renders `TaxObligationList`) and "Filing & Deductions" tab (renders `FilingDeadlineList` + `DeductionList` side-by-side on desktop, stacked on mobile); manages `router.refresh()` after mutations via `useTaxPlanning` hook; run T029 tests to GREEN
- [ ] T031 [US3] Create client state hook `src/hooks/useTaxPlanning.ts` — `useTaxPlanning(initialData: TaxDashboardData)` wraps Server Action calls with `useTransition` for loading state; exposes `isPending` and `refresh` (calls `router.refresh()`); used by `TaxPlanningDashboard` to trigger re-fetch after mutations
- [ ] T032 [US3] Create App Router Server Component page `src/app/tax-planning/page.tsx` — `async` Server Component; calls `getTaxDashboardData(householdId)` server-side; passes `initialData` and `householdId` to `TaxPlanningDashboard`; handles empty state when no household; exports `metadata` with page title "Tax Planning"

**Checkpoint**: `npm run dev` → navigate to `http://localhost:3000/tax-planning` → dashboard loads with KPI cards, both tabs functional, obligations sorted by due date, filing countdown correct

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Navigation integration, mobile layout verification, and constraint validation.

- [ ] T033 [P] Add Tax Planning entry to the Bottom Navigation Bar component (locate existing nav component in `src/` or `src/components/`) — add route `/tax-planning` with a "Receipt Tax" or "FileText" Lucide icon and label "Pajak / Tax"
- [ ] T034 [P] Run all quickstart.md key constraint verification tests manually — verify: `computeRemainingMonths('2026-12-01', new Date('2026-01-01'))` → 11; `computeTaxInstallments(1_200_000, '2026-12-01', new Date('2026-01-01'))` sum === 1_200_000; duplicate `createFilingDeadline` returns error; `flagTransactionAsDeductible` when filed returns lock error; `deleteTaxObligation` sets deleted_at without deleting transactions — document results
- [ ] T035 Verify mobile-first responsive layout across all new components — check: Bottom Nav visibility on mobile, 44×44px touch targets on TaxObligationCard actions, Bento grid transitions at `md:` and `lg:` breakpoints, TaxObligationSummaryCard stacks 1-col on mobile / 3-col on desktop, InstallmentScheduleTable scrolls horizontally on small screens

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001, T002) — BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Phase 2 completion (T003, T004, T005)
  - Phase 3 and Phase 4 can proceed in parallel once Phase 2 is done
  - Phase 5 depends on Phase 3 and Phase 4 components existing (aggregates them)
- **Polish (Phase 6)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependency on US2 or US3
- **US2 (P2)**: Can start after Foundational — no dependency on US1
- **US3 (P3)**: Depends on US1 (TaxObligationList, TaxObligationCard) and US2 (FilingDeadlineList, DeductionList) — aggregates their components

### Within Each User Story (TDD Order)

1. Write test file (RED) → confirm FAIL
2. Implement source (GREEN) → confirm PASS
3. Repeat for each component
4. Checkpoint: full story testable independently

### Parallel Opportunities

- T001 + T002 can run in parallel (different files)
- T003 → T004 are sequential (TDD Red-Green)
- T005 can run in parallel with T003/T004 (different file, no dependency on utility results)
- T008 + T009 (test files for US1 components) can run in parallel
- T019 + T020 + T021 + T022 (test files for US2 components) can all run in parallel
- T033 + T034 can run in parallel (Polish phase)

---

## Parallel Example: User Story 1

```bash
# Write all US1 component tests in parallel (all different files):
Task T008: TaxObligationForm.test.tsx
Task T009: InstallmentScheduleTable.test.tsx

# After T008 passes, implement in parallel with T009 tests being written:
Task T010: TaxObligationForm.tsx (after T008 RED confirmed)
Task T011: InstallmentScheduleTable.tsx (after T009 RED confirmed)
```

## Parallel Example: User Story 2

```bash
# Write all US2 component tests in parallel:
Task T019: FilingDeadlineForm.test.tsx
Task T020: FilingDeadlineList.test.tsx
Task T021: DeductionList.test.tsx
Task T022: FlagDeductionForm.test.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: Foundational (T003 → T004 → T005)
3. Complete Phase 3: User Story 1 (T006 → T015)
4. **STOP and VALIDATE**: Create Vehicle Registration obligation → schedule renders → edit → recalculates → delete → gone
5. Ship MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready (T001–T005)
2. User Story 1 → Tax Installment Planner live (T006–T015)
3. User Story 2 → Filing & Deductions live (T016–T026)
4. User Story 3 → Full dashboard live (T027–T032)
5. Polish → Navigation + mobile verified (T033–T035)

---

## Notes

- **[P]** = different files, no blocking dependencies between them
- **[Story]** label maps each task to a specific user story for traceability
- TDD cycle is non-negotiable: run tests and confirm RED before writing implementation
- Each user story has an independent checkpoint — verify before moving to next
- `src/app/actions/tax-planning.test.ts` is extended across Phases 3 and 4 (same file, sequential tasks)
- Soft-delete: `deleteTaxObligation` sets `deleted_at` only — never deletes `transactions` rows
