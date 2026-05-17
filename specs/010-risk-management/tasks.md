# Tasks: Risk Management Module (Protection Layer)

**Input**: Design documents from `specs/010-risk-management/`  
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅ · quickstart.md ✅

**Tests**: Included — Constitution §III mandates TDD (Vitest + RTL). Tests MUST be written and FAILING before any implementation task begins.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story this task belongs to (US1–US4)
- Exact file paths included in every task description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Types and migration file — no logic yet, just scaffolding.

- [ ] T001 Create TypeScript interfaces file `src/types/risk-management.ts` (InsurancePolicy, PaymentFrequency, InsuranceType, PremiumStatus, PolicyWithStatus, CoverageStatus, ProtectionTarget, InsuranceDashboardData, InsurancePremiumRecord, ActionResult — per contracts/component-contracts.md)
- [ ] T002 [P] Create migration file `src/lib/supabase/migrations/010-risk-management.sql` (creates insurance_policies, adds policy_id to transactions, extends financial_goals goal_type CHECK — per data-model.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database, pure utility functions, and query layer — MUST be complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 Apply migration `src/lib/supabase/migrations/010-risk-management.sql` in Supabase SQL Editor (per quickstart.md §1)
- [ ] T004 [P] Write failing Vitest tests for `calculateNextPremiumDueDate` in `src/lib/utils/insurance.test.ts` (RED — cover: monthly, quarterly, semi-annual, annual, one-time→null, month-end clamping Jan31→Feb28)
- [ ] T005 [P] Write failing Vitest tests for `calculateCoverageGap` in `src/lib/utils/insurance.test.ts` (RED — cover: adequate/gap/surplus, null target→gray, percentage capped at 100, color thresholds)
- [ ] T006 [P] Write failing Vitest tests for `derivePremiumStatus` and `getDaysUntilDue` in `src/lib/utils/insurance.test.ts` (RED — cover: upcoming, overdue, paid, one-time, negative days)
- [ ] T007 Implement all four pure utility functions in `src/lib/utils/insurance.ts` — `calculateNextPremiumDueDate`, `calculateCoverageGap`, `derivePremiumStatus`, `getDaysUntilDue` — confirm all T004–T006 tests turn GREEN
- [ ] T008 Create DB query functions in `src/lib/supabase/queries/risk-management.ts` (`getInsurancePolicies`, `getInsurancePolicyById`, `getTotalCoverage`, `getLastPremiumPayment`, `getProtectionTarget`, `getInsuranceDashboardData` — per contracts/component-contracts.md)

**Checkpoint**: Migration applied, pure functions tested and passing, query layer ready — user story phases can now begin.

---

## Phase 3: User Story 1 — Manage Insurance Policies & View Total Coverage (Priority: P1) 🎯 MVP

**Goal**: Users can register insurance policies, view total coverage vs. a user-defined protection target, and edit/deactivate policies.

**Independent Test**: Add 2 policies (Rp 1B + Rp 500M coverage), set protection target Rp 2B → coverage summary shows Rp 1.5B / Rp 2B (75%, amber). Deactivate one policy → total drops to Rp 1B.

### Tests for User Story 1 ⚠️ Write FIRST — must FAIL before implementation

- [ ] T009 [P] [US1] Write failing integration tests for `createInsurancePolicy`, `updateInsurancePolicy`, `deactivateInsurancePolicy`, `setProtectionTarget` Server Actions in `src/app/actions/risk-management.test.ts` (RED — mock Supabase; verify row insert/update, soft-delete sets deleted_at, validation errors)
- [ ] T010 [P] [US1] Write failing RTL tests for `InsuranceSummaryCard` in `src/components/features/risk-management/InsuranceSummaryCard.test.tsx` (RED — renders total coverage, ProgressBar color, gap/surplus amount, "Set Target" button)
- [ ] T011 [P] [US1] Write failing RTL tests for `PolicyForm` in `src/components/features/risk-management/PolicyForm.test.tsx` (RED — renders all fields, disables nextDueDate when one-time selected, submits with valid data, shows validation errors)
- [ ] T012 [P] [US1] Write failing RTL tests for `PolicyCard` in `src/components/features/risk-management/PolicyCard.test.tsx` (RED — renders policy name/insurer/coverage, shows correct Badge variant per status, Edit/Deactivate buttons present)
- [ ] T013 [P] [US1] Write failing RTL tests for `ProtectionTargetForm` in `src/components/features/risk-management/ProtectionTargetForm.test.tsx` (RED — renders amount input, validates >0, calls setProtectionTarget on submit)

### Implementation for User Story 1

- [ ] T014 [US1] Implement `createInsurancePolicy`, `updateInsurancePolicy`, `deactivateInsurancePolicy`, `setProtectionTarget` Server Actions in `src/app/actions/risk-management.ts` — confirm T009 tests turn GREEN
- [ ] T015 [P] [US1] Implement `InsuranceSummaryCard` in `src/components/features/risk-management/InsuranceSummaryCard.tsx` (Tremor ProgressBar, IDR formatted amounts, gap/surplus line, "Set / Edit Target" trigger) — confirm T010 GREEN
- [ ] T016 [P] [US1] Implement `PolicyCard` in `src/components/features/risk-management/PolicyCard.tsx` (Shadcn Badge for PremiumStatus, Edit/Deactivate/Mark-as-Paid buttons, tabular-nums for amounts) — confirm T012 GREEN
- [ ] T017 [P] [US1] Implement `PolicyForm` (Shadcn Dialog + react-hook-form + zod) in `src/components/features/risk-management/PolicyForm.tsx` (all fields per contracts; nextDueDate disabled when frequency=one-time) — confirm T011 GREEN
- [ ] T018 [P] [US1] Implement `PolicyList` in `src/components/features/risk-management/PolicyList.tsx` (renders PolicyCard list, empty state with "Add Policy" CTA)
- [ ] T019 [US1] Implement `ProtectionTargetForm` (Shadcn Dialog, single amount field) in `src/components/features/risk-management/ProtectionTargetForm.tsx` — confirm T013 GREEN
- [ ] T020 [US1] Write failing RTL tests for `RiskManagementDashboard` (Insurance tab) in `src/components/features/risk-management/RiskManagementDashboard.test.tsx` (RED — renders InsuranceSummaryCard, PolicyList, tab structure)
- [ ] T021 [US1] Implement `RiskManagementDashboard` with Insurance tab in `src/components/features/risk-management/RiskManagementDashboard.tsx` — confirm T020 GREEN
- [ ] T022 [US1] Implement `src/app/risk-management/page.tsx` Server Component (fetches `getInsuranceDashboardData`, renders RiskManagementDashboard)
- [ ] T023 [US1] Create `src/hooks/useRiskManagement.ts` client state hook (optimistic UI state for policy list and coverage status updates)

**Checkpoint**: Policy CRUD, total coverage summary, and protection target all functional. Navigate to `/risk-management`, add 2+ policies and set a target — coverage adequacy indicator must display correctly.

---

## Phase 4: User Story 2 — Track Premium Payment Status & Due Dates (Priority: P2)

**Goal**: Each policy card shows Upcoming / Overdue / Paid badge and days-until-due. User can mark a premium as paid, which records an expense transaction and advances the next due date.

**Independent Test**: Add a monthly policy with next_due_date = yesterday → badge shows "Overdue". Click "Mark as Paid" → a transaction is inserted, next_due_date advances by 1 month, badge changes to "Paid".

### Tests for User Story 2 ⚠️ Write FIRST — must FAIL before implementation

- [ ] T024 [P] [US2] Write failing RTL tests for `MarkPaidForm` in `src/components/features/risk-management/MarkPaidForm.test.tsx` (RED — renders paymentDate pre-filled with today, amount pre-filled from policy, validates >0, calls markPremiumPaid on submit)
- [ ] T025 [P] [US2] Add failing integration tests for `markPremiumPaid` Server Action to `src/app/actions/risk-management.test.ts` (RED — verify transaction inserted with policy_id, next_due_date updated, find-or-create Insurance category)

### Implementation for User Story 2

- [ ] T026 [US2] Implement `markPremiumPaid` Server Action in `src/app/actions/risk-management.ts` (inserts expense transaction with policy_id, calls `calculateNextPremiumDueDate`, updates `insurance_policies.next_due_date`, find-or-create Insurance category using sinking-funds pattern) — confirm T025 GREEN
- [ ] T027 [US2] Implement `MarkPaidForm` component (Shadcn Dialog) in `src/components/features/risk-management/MarkPaidForm.tsx` — confirm T024 GREEN
- [ ] T028 [US2] Wire `PolicyCard` "Mark as Paid" button to open `MarkPaidForm` dialog; update `PolicyCard` to derive and display `premiumStatus` Badge (overdue→destructive, upcoming→default, paid→outline, one-time→secondary) and `daysUntilDue` (uses `derivePremiumStatus` + `getDaysUntilDue` from `insurance.ts`)
- [ ] T029 [US2] Update `PolicyList` to sort policies by premium urgency: overdue first, then upcoming (ascending days), then paid, then one-time

**Checkpoint**: All premium statuses display correctly. Marking a payment as paid inserts a transaction and advances the due date. Overdue policies appear at top of list.

---

## Phase 5: User Story 3 — Set Health Budget & Log Healthcare Expenses (Priority: P3)

**Goal**: Users can configure a monthly health budget per healthcare category and log out-of-pocket expenses. A Tremor ProgressBar per category shows current spending vs. budget in real time.

**Independent Test**: Set monthly_limit = Rp 500,000 on Pharmacy category. Log 2 pharmacy transactions totaling Rp 350,000. ProgressBar shows 70% (green). Log another Rp 200,000 → ProgressBar shows red (>100%).

### Tests for User Story 3 ⚠️ Write FIRST — must FAIL before implementation

- [ ] T030 [US3] Write failing RTL tests for `HealthBudgetTab` in `src/components/features/risk-management/HealthBudgetTab.test.tsx` (RED — renders ProgressBar per category, correct color from getProgressColor, over-budget indicator, "Log Expense" action present, empty state when no categories)

### Implementation for User Story 3

- [ ] T031 [US3] Implement `seedHealthcareCategories(householdId)` Server Action in `src/app/actions/risk-management.ts` (lazy-seeds Doctor, Pharmacy, Dental, Vision, Lab categories using INSERT … ON CONFLICT DO NOTHING pattern — called on first load of Health Budget tab)
- [ ] T032 [US3] Implement `HealthBudgetTab` in `src/components/features/risk-management/HealthBudgetTab.tsx` (Tremor ProgressBar per healthcare category reusing `getProgressColor` from `src/lib/utils/budgeting.ts`; "Edit Budget" triggers inline category monthly_limit update via existing `updateCategoryBudget` action; "Log Expense" navigates to or opens existing transaction entry form scoped to healthcare categories) — confirm T030 GREEN
- [ ] T033 [US3] Add Health Budget tab to `RiskManagementDashboard` in `src/components/features/risk-management/RiskManagementDashboard.tsx` (tab label "Kesehatan / Health", renders HealthBudgetTab with health category data)
- [ ] T034 [US3] Update `src/app/risk-management/page.tsx` to also fetch healthcare categories with monthly spend for the current month (reuse existing budgeting query infrastructure from `src/lib/supabase/queries/budgeting.ts`)

**Checkpoint**: Navigate to Risk Management → Health Budget tab. Verify 5 healthcare categories appear. Set a monthly_limit, log a transaction in that category, confirm ProgressBar updates.

---

## Phase 6: User Story 4 — Review Healthcare Expense History (Priority: P4)

**Goal**: Users can filter healthcare expenses by month/year and category to see subtotals and spending patterns over time.

**Independent Test**: Log 3 pharmacy + 2 dental expenses across 2 months. Filter by last month → only that month's 5 expenses shown with correct subtotal. Filter by "Dental" within that month → only 2 dental expenses shown.

### Tests for User Story 4 ⚠️ Write FIRST — must FAIL before implementation

- [ ] T035 [US4] Add failing RTL tests for expense history filter scenarios to `src/components/features/risk-management/HealthBudgetTab.test.tsx` (RED — month filter shows correct subset + subtotal; category filter works; empty state shown when no results)

### Implementation for User Story 4

- [ ] T036 [US4] Add month/year selector and category filter controls to `HealthBudgetTab` in `src/components/features/risk-management/HealthBudgetTab.tsx` (Shadcn Select components; defaults to current month + all categories)
- [ ] T037 [US4] Add filtered expense history list to `HealthBudgetTab` (fetches transactions for selected month/category using existing transaction filtering from `src/lib/supabase/queries/transactions.ts`; displays date, amount, category, description; shows per-filter subtotal)
- [ ] T038 [US4] Render empty state message in `HealthBudgetTab` expense history when no transactions match the active filter (consistent with empty-state patterns used in sinking-funds and net-worth features) — confirm T035 GREEN

**Checkpoint**: All four user stories fully functional. Filter expense history by month and category — correct subsets and subtotals appear. Empty state shows when filter returns no results.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final wiring, navigation, and full test validation.

- [ ] T039 [P] Add Risk Management entry to Bottom Navigation Bar (`src/components/` — navigation component used by existing features; icon: `shield` from Lucide)
- [ ] T040 [P] Verify `markPremiumPaid` find-or-create Insurance category logic matches the sinking-funds `recordContribution` pattern exactly (find by `name = 'Insurance'` + `household_id`, create if absent, consistent icon/color)
- [ ] T041 Run full test suite and fix any failures: `npm run test:run`
- [ ] T042 Run quickstart.md §8 key constraint verification tests (month-end clamping, coverage gap values, soft-delete audit preservation, NUMERIC precision)
- [ ] T043 [P] Mobile responsiveness pass — verify all policy card action buttons meet 44×44px touch target minimum; verify ProgressBar is visible on 375px viewport

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — no dependency on US2–US4
- **US2 (Phase 4)**: Depends on Phase 2 + Phase 3 (PolicyCard "Mark as Paid" button wiring)
- **US3 (Phase 5)**: Depends on Phase 2 — no dependency on US1 or US2
- **US4 (Phase 6)**: Depends on Phase 5 (adds filters to HealthBudgetTab)
- **Polish (Phase 7)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2. No dependency on other stories.
- **US2 (P2)**: Starts after Phase 2. Wires into PolicyCard from US1 — implement US1 first.
- **US3 (P3)**: Starts after Phase 2. Fully independent from US1/US2.
- **US4 (P4)**: Starts after US3 — adds filter UI to HealthBudgetTab.

### Within Each User Story

- Test tasks (T00x) MUST be written and FAIL before implementation tasks
- Types → pure functions → queries → actions → components → page
- Each story's checkpoint must be manually verified before moving to next priority

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T004, T005, T006 (test writing) can run in parallel (same file — write sequentially or split into describe blocks)
- T009–T013 (US1 test writing) can all run in parallel
- T015–T018 (US1 component implementation) can run in parallel
- T024 and T025 (US2 test writing) can run in parallel
- T039 and T040 (Polish) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Write all US1 tests in parallel (different describe blocks):
T009: "Integration tests for Server Actions in src/app/actions/risk-management.test.ts"
T010: "RTL tests for InsuranceSummaryCard in InsuranceSummaryCard.test.tsx"
T011: "RTL tests for PolicyForm in PolicyForm.test.tsx"
T012: "RTL tests for PolicyCard in PolicyCard.test.tsx"
T013: "RTL tests for ProtectionTargetForm in ProtectionTargetForm.test.tsx"

# Then implement US1 components in parallel (after T014 Server Actions are done):
T015: "InsuranceSummaryCard.tsx"
T016: "PolicyCard.tsx"
T017: "PolicyForm.tsx"
T018: "PolicyList.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T008) — CRITICAL, blocks everything
3. Complete Phase 3: User Story 1 (T009–T023)
4. **STOP and VALIDATE**: Add 2 policies, set a protection target, verify coverage adequacy display
5. Demo or deploy MVP

### Incremental Delivery

1. Setup + Foundational → infrastructure ready
2. US1 → Insurance policy management + coverage adequacy (MVP)
3. US2 → Premium payment tracking + overdue detection
4. US3 → Health budget per category + expense logging
5. US4 → Expense history filtering
6. Polish → Navigation + final validation

---

## Notes

- **TDD is non-negotiable** (Constitution §III): every RED task must produce failing tests before the paired GREEN implementation task begins
- `[P]` tasks = different files or independent describe blocks, safe to run in parallel
- `[Story]` label maps each task to its user story for traceability and independent delivery
- Soft-delete only for `insurance_policies` and linked `transactions` — never hard-delete financial records
- `markPremiumPaid` must find-or-create the Insurance `category` row (same pattern as `recordContribution` in sinking-funds)
- Health Budgeting reuses `getProgressColor` from `src/lib/utils/budgeting.ts` — do not duplicate this logic
- All monetary display must use IDR formatting with `tabular-nums` utility class
