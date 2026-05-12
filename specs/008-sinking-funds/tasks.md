# Tasks: Education Costs & Sinking Funds Module

**Input**: Design documents from `/specs/008-sinking-funds/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/component-contracts.md, research.md, quickstart.md

**Tests**: TDD is mandatory per Constitution Article III and spec FR-011. All `.test.ts` / `.test.tsx` files must be written and failing (RED) before their corresponding implementation files are created (GREEN).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration and project scaffolding for the feature

- [x] T001 Create migration SQL file `src/lib/supabase/migrations/008-sinking-funds.sql` with `ALTER TABLE financial_goals ADD COLUMN IF NOT EXISTS target_date DATE` and `ALTER TABLE financial_goals ADD COLUMN IF NOT EXISTS description TEXT`, plus index `idx_financial_goals_sinking` per data-model.md
- [x] T002 [P] Create TypeScript types `src/types/sinking-funds.ts` with `SinkingFund`, `SinkingFundContribution`, `EducationEstimate`, and `ActionResult<T>` interfaces per contracts/component-contracts.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### TDD — Pure Utility Functions (RED → GREEN)

- [x] T003 Apply migration `008-sinking-funds.sql` to Supabase database (depends on T001)
- [x] T004 Write Vitest unit tests `src/lib/utils/sinking-funds.test.ts` covering `computeFutureValue` (including 5%/10yr/Rp50M → Rp81,444,731.47, negative inflation, years=0), `computeProgress` (0%, 100%, >100% over-funded), and `isFundOverdue` (past date incomplete, past date complete, future date, null date) — tests MUST fail before T005
- [x] T005 Implement pure utility functions `src/lib/utils/sinking-funds.ts` (`computeFutureValue`, `computeProgress`, `isFundOverdue`) — make T004 tests pass (depends on T004)
- [x] T006 [P] Create Supabase query functions `src/lib/supabase/queries/sinking-funds.ts` (`getSinkingFunds`, `getSinkingFundById`, `getContributionsByGoal`) with snake_case ↔ camelCase mapping, filtering `deleted_at IS NULL` for active funds (depends on T003)
- [x] T007 Create Next.js Server Actions `src/lib/actions/sinking-funds.ts` (`createSinkingFund`, `updateSinkingFund`, `deleteSinkingFund`, `recordContribution`) returning `ActionResult<T>`, with zod validation and structured JSON error logging (depends on T006)

**Checkpoint**: Foundation ready — `npx vitest run src/lib/utils/sinking-funds.test.ts` passes; database has `target_date` and `description` columns; Server Actions return valid objects.

---

## Phase 3: User Story 1 - Create a Sinking Fund (Priority: P1) 🎯 MVP

**Goal**: A user can open the sinking funds page, click "Create Fund," fill in name/target amount/target date, and see the new fund appear in the list.

**Independent Test**: Navigate to `/sinking-funds`, click "Create Fund," enter name "New Car" / target Rp 150,000,000 / date 2028-12-31 → fund appears in list with 0% progress and correct target amount.

### Tests for User Story 1 (TDD — write FIRST, ensure FAIL) ⚠️

- [x] T008 [P] [US1] Write integration test `src/components/features/sinking-funds/SinkingFundForm.test.tsx` verifying form renders name/targetAmount/targetDate/description fields, rejects empty required fields with validation errors, and calls `createSinkingFund` action on valid submit
- [x] T009 [P] [US1] Write integration test `src/components/features/sinking-funds/SinkingFundsDashboard.test.tsx` verifying empty state renders "Create your first fund" CTA when `initialFunds = []`, and newly created fund appears in the list after successful form submission

### Implementation for User Story 1

- [x] T010 [US1] Implement `src/components/features/sinking-funds/SinkingFundForm.tsx` — Shadcn `Form` (react-hook-form + zod) with fields: `name` (required), `targetAmount` (required, > 0), `targetDate` (optional date picker), `description` (optional textarea); accepts `mode='create'|'edit'` and optional `initialValues` prop (depends on T008)
- [x] T011 [US1] Implement `src/components/features/sinking-funds/SinkingFundsDashboard.tsx` — Client Component receiving `initialFunds: SinkingFund[]`, manages Dialog open state for `SinkingFundForm`, renders `FundList` or empty-state CTA; handles `createSinkingFund` action result with toast success/error (depends on T009, T010)
- [x] T012 [US1] Implement App Router Server Component `src/app/sinking-funds/page.tsx` — fetches all active sinking funds via `getSinkingFunds`, passes to `SinkingFundsDashboard` as `initialFunds`; handles auth and loading state (depends on T011)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Navigate to `/sinking-funds`, create a fund, and see it in the list.

---

## Phase 4: User Story 2 - Track Sinking Fund Progress (Priority: P1)

**Goal**: A user can see all sinking funds at a glance with progress bar, percentage complete, amount remaining, and overdue indicator.

**Independent Test**: A fund with target Rp 50,000,000 and current Rp 10,000,000 shows 20% progress, Rp 40,000,000 remaining. A fund past its target date and not complete shows an "Overdue" badge.

### Tests for User Story 2 (TDD — write FIRST, ensure FAIL) ⚠️

- [x] T013 [P] [US2] Write test `src/components/features/sinking-funds/SinkingFundCard.test.tsx` verifying Tremor `ProgressBar` renders with correct `progressPercentage`, amount remaining is displayed, "Overdue" badge appears when `isOverdue = true`, and ">100%" label appears when `progressPercentage > 100`
- [x] T014 [P] [US2] Write test `src/components/features/sinking-funds/FundList.test.tsx` verifying list renders correct number of `SinkingFundCard` items and shows empty-state CTA when `funds = []`

### Implementation for User Story 2

- [x] T015 [US2] Implement `src/components/features/sinking-funds/SinkingFundCard.tsx` — Tremor `Card` containing: fund name, `ProgressBar` with `value={progressPercentage}`, amount saved / target formatted in IDR, days/date until target, "Overdue" Shadcn `Badge` (red) when `isOverdue`, action buttons (Edit, Delete, Add Contribution); uses `computeProgress` and `isFundOverdue` from utils (depends on T013)
- [x] T016 [US2] Implement `src/components/features/sinking-funds/FundList.tsx` — maps `funds` array to `SinkingFundCard` components; renders empty state with "Create your first fund" CTA button when `funds.length === 0` (depends on T014)
- [x] T017 [US2] Integrate `FundList` into `SinkingFundsDashboard.tsx`, replacing placeholder rendering; pass `onEdit`, `onDelete`, `onAddContribution` callbacks from dashboard to each card via FundList (depends on T015, T016)

**Checkpoint**: User Stories 1 and 2 both work. Fund list displays progress bars, overdue badges, and correct amounts.

---

## Phase 5: User Story 3 - Calculate Education Costs with Inflation (Priority: P2)

**Goal**: A user enters current education cost, years until needed, and inflation rate, and sees the computed future cost with an option to create a fund pre-filled with that amount.

**Independent Test**: Enter Rp 50,000,000 / 10 years / 5% inflation → result shows Rp 81,444,731.47. Click "Create Fund" → `SinkingFundForm` opens with targetAmount pre-filled to Rp 81,444,731.47.

### Tests for User Story 3 (TDD — write FIRST, ensure FAIL) ⚠️

- [x] T018 [P] [US3] Write test `src/components/features/sinking-funds/EducationCalculator.test.tsx` verifying: form renders currentCost/inflationRate/years inputs, empty fields show validation errors, submit with valid inputs calls `computeFutureValue` and displays result, "Create Fund" button calls `onCreateFund(futureValue)` with correct computed value

### Implementation for User Story 3

- [x] T019 [US3] Implement `src/components/features/sinking-funds/EducationCalculator.tsx` — Shadcn `Form` with fields: `currentCost` (required, > 0), `inflationRate` (required, default 0.05, accepts negative), `years` (required, >= 1); on submit, calls `computeFutureValue` from utils and displays result in Tremor `Card`; renders "Create Fund" button that calls `onCreateFund(futureValue)` prop (depends on T018)
- [x] T020 [US3] Wire `EducationCalculator` into `SinkingFundsDashboard.tsx` — render calculator in a collapsible section or tab; when `onCreateFund(amount)` fires, open `SinkingFundForm` in create mode with `initialValues={{ targetAmount: amount }}` (depends on T019)

**Checkpoint**: Education calculator computes inflation-adjusted future costs and bridges directly into fund creation with prefilled amount.

---

## Phase 6: User Story 4 - Record Contributions to a Sinking Fund (Priority: P2)

**Goal**: A user can tap "Add Contribution" on any fund card, enter an amount and date, and see the fund's current balance and progress update.

**Independent Test**: Fund starts at Rp 0. Add contribution of Rp 5,000,000 → fund balance updates to Rp 5,000,000 and progress recalculates.

### Tests for User Story 4 (TDD — write FIRST, ensure FAIL) ⚠️

- [x] T021 [P] [US4] Write test `src/components/features/sinking-funds/ContributionForm.test.tsx` verifying form renders amount/transactionDate/notes fields, rejects negative or zero amounts, calls `recordContribution` action on valid submit, and shows success toast on completion

### Implementation for User Story 4

- [x] T022 [US4] Implement `src/components/features/sinking-funds/ContributionForm.tsx` — Shadcn `Form` with fields: `amount` (required, > 0), `transactionDate` (required, defaults to today), `notes` (optional); calls `recordContribution` Server Action; accepts `goalId` and `goalName` props (depends on T021)
- [x] T023 [US4] Wire `ContributionForm` into `SinkingFundsDashboard.tsx` via Shadcn `Dialog` — `onAddContribution` callback on each card opens `ContributionForm` Dialog with correct `goalId`; on success, optimistically updates `currentAmount` in local state and shows toast (depends on T022)

**Checkpoint**: Users can record contributions; fund progress updates immediately after contribution is saved.

---

## Phase 7: User Story 5 - Manage (Edit/Delete) Sinking Funds (Priority: P3)

**Goal**: A user can edit a fund's name/target/date and delete a fund with confirmation. Deleting a fund soft-deletes the goal row; all linked transactions are preserved.

**Independent Test**: Edit fund target from Rp 100,000,000 to Rp 120,000,000 → card updates. Delete a fund → it disappears from the active list; the linked transactions still exist in the database.

### Tests for User Story 5 (TDD — write FIRST, ensure FAIL) ⚠️

- [x] T024 [P] [US5] Extend `src/components/features/sinking-funds/SinkingFundCard.test.tsx` with tests verifying: "Edit" button fires `onEdit(fund)`, "Delete" button opens `AlertDialog`, confirming delete calls `onDelete(id)`, cancelling delete leaves fund in list

### Implementation for User Story 5

- [x] T025 [US5] Add edit mode to `SinkingFundForm.tsx` — when `mode='edit'` and `initialValues` provided, form pre-fills all fields and calls `updateSinkingFund` action on submit instead of `createSinkingFund`; no new file needed (depends on T024)
- [x] T026 [US5] Add Shadcn `AlertDialog` delete confirmation to `SinkingFundCard.tsx` — "Delete" button opens AlertDialog; on confirm, calls `onDelete(fund.id)` callback; on cancel, dismisses with no state change (depends on T024)
- [x] T027 [US5] Wire edit and delete flows in `SinkingFundsDashboard.tsx` — `onEdit(fund)` opens `SinkingFundForm` in edit mode with fund data; `onDelete(id)` calls `deleteSinkingFund` action and on success removes the fund from local state via optimistic update + toast (depends on T025, T026)

**Checkpoint**: All five user stories are independently functional. Full CRUD on sinking funds works. Soft delete preserves transaction history.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Hook abstraction, integration validation, responsive layout, edge case verification

- [x] T028 [P] Implement `src/hooks/useSinkingFunds.ts` — encapsulates local sinking fund state (add, update, remove fund; add contribution) so `SinkingFundsDashboard` delegates state mutations through the hook rather than inline handlers
- [x] T029 [P] Run `npm run test:run` — confirm all unit tests (`sinking-funds.test.ts`) and integration tests (all `*.test.tsx` in `features/sinking-funds/`) pass
- [x] T030 [P] Verify responsive layout per Constitution Article I — mobile single-column fund cards with bottom nav, tablet 2-col Bento grid, desktop 3-col with sidebar; all touch targets ≥ 44×44px
- [x] T031 [P] Verify quickstart.md file checklist — confirm all 16 source files exist at correct paths (`page.tsx`, all 6 component pairs, `sinking-funds.ts` utils + test, queries, actions, hook, types, migration)
- [x] T032 Verify edge cases end-to-end: over-funded fund (>100% progress, no crash), overdue fund (red badge), empty state (CTA visible), zero inflation in calculator, negative inflation in calculator

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001, T002) — BLOCKS all user stories
  - T003 depends on T001
  - T004 can start after T002
  - T005 depends on T004 (TDD: RED before GREEN)
  - T006 depends on T003
  - T007 depends on T006
- **User Stories (Phases 3–7)**: All depend on Foundational phase (T007 complete)
  - US1, US2, US3, US4 can proceed in parallel after T007
  - US5 (edit/delete) can also start after T007 independently
- **Polish (Phase 8)**: Depends on all desired user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after T007 — no dependency on other stories
- **US2 (P1)**: Can start after T007 — integrates into `SinkingFundsDashboard` (US1), but components are independently testable
- **US3 (P2)**: Can start after T007 — bridges into US1 form but independently testable
- **US4 (P2)**: Can start after T007 — independently testable; integrates into dashboard
- **US5 (P3)**: Can start after T007 — reuses `SinkingFundForm` from US1 (edit mode)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Types and utils before components
- Components before integration into dashboard
- Story complete before moving to next priority

### Parallel Opportunities

- T001 and T002 (setup) can run in parallel
- T004 (utils tests) and T006 (queries) can run in parallel after T003
- T008 and T009 (US1 tests) can run in parallel
- T013 and T014 (US2 tests) can run in parallel
- T015 and T016 (US2 components) can run in parallel after their tests
- T028, T029, T030, T031 (polish) can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch both US1 tests together (must fail first):
npx vitest run src/components/features/sinking-funds/SinkingFundForm.test.tsx
npx vitest run src/components/features/sinking-funds/SinkingFundsDashboard.test.tsx

# Then implement in dependency order:
# T010: SinkingFundForm.tsx
# T011: SinkingFundsDashboard.tsx (depends on T010)
# T012: app/sinking-funds/page.tsx (depends on T011)
```

## Parallel Example: User Story 2

```bash
# Launch both US2 tests together (must fail first):
npx vitest run src/components/features/sinking-funds/SinkingFundCard.test.tsx
npx vitest run src/components/features/sinking-funds/FundList.test.tsx

# Then implement in parallel:
# T015: SinkingFundCard.tsx
# T016: FundList.tsx
# Then integrate:
# T017: Wire into SinkingFundsDashboard.tsx
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: Foundational (T003–T007) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T008–T012)
4. Complete Phase 4: User Story 2 (T013–T017)
5. **STOP and VALIDATE**: Navigate to `/sinking-funds`, create a fund, verify progress bar renders
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → create funds → test independently → deploy (MVP)
3. US2 → progress tracking → test independently → deploy
4. US3 → education calculator → test independently → deploy
5. US4 → contributions → test independently → deploy
6. US5 → edit/delete → test independently → deploy

### Parallel Team Strategy

With multiple developers (after Foundational complete):

- Developer A: US1 + US2 (core fund list)
- Developer B: US3 (education calculator)
- Developer C: US4 + US5 (contributions + management)

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 32 |
| **Setup Tasks** | 2 |
| **Foundational Tasks** | 5 |
| **US1 Tasks (P1)** | 5 — Create Fund (MVP) |
| **US2 Tasks (P1)** | 5 — Progress Tracking |
| **US3 Tasks (P2)** | 3 — Education Calculator |
| **US4 Tasks (P2)** | 3 — Contributions |
| **US5 Tasks (P3)** | 4 — Edit/Delete |
| **Polish Tasks** | 5 |
| **TDD Test Tasks** | 10 (all written before implementation) |
| **Parallel Opportunities** | 14 tasks marked [P] |
| **Suggested MVP Scope** | Phases 1–4 (Setup + Foundational + US1 + US2) = 17 tasks |

---

## Notes

- `[P]` tasks = different files, no dependencies on incomplete tasks
- `[Story]` label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (TDD Red-Green-Refactor)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- `deleteSinkingFund` MUST use soft delete (`deleted_at`); NEVER hard-delete `financial_goals` or `transactions` rows
