# Tasks: Simple Budgeting (The Guardrail)

**Input**: Design documents from `/specs/004-simple-budgeting/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, quickstart.md

**Tests**: TDD is mandated by project Constitution. All test tasks must be completed before their corresponding implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project: `src/` at repository root
- Next.js App Router pages: `src/app/`
- Components: `src/components/features/`
- Utilities: `src/lib/utils/`
- Queries: `src/lib/supabase/queries/`
- Types: `src/types/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create feature-specific directories and migration file

- [x] T001 Create feature component directory `src/components/features/budgeting/`
- [x] T002 Create migration file `src/lib/supabase/migrations/004-simple-budgeting.sql` with `ALTER TABLE categories ADD COLUMN monthly_limit`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema, types, utilities, and queries that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Write unit tests for budgeting utilities in `src/lib/utils/budgeting.test.ts` (edge cases: zero limit, negative remaining, last day of month, leap year Feb)
- [x] T004 [P] Write integration tests for budgeting queries in `src/lib/supabase/queries/budgeting.test.ts` (mock Supabase client)
- [x] T005 Implement budgeting utilities in `src/lib/utils/budgeting.ts` — `calculateDailySpendingPower`, `isOverbudget`, `getProgressColor` (depends on T003)
- [x] T006 Implement budgeting queries in `src/lib/supabase/queries/budgeting.ts` — `getBudgetMetrics`, `updateCategoryLimit` (depends on T004)
- [x] T007 Update `Category` interface in `src/types/index.ts` to add `monthlyLimit?: number`
- [x] T008 Add `BudgetMetrics` interface in `src/types/index.ts`
- [x] T009 Apply migration `004-simple-budgeting.sql` to local/dev Supabase database (SQL ready; run manually in Supabase SQL Editor)

**Checkpoint**: Foundation ready — schema migrated, types extended, utilities tested, queries implemented. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Set Monthly Budget Limit (Priority: P1) 🎯 MVP

**Goal**: Allow user to set, view, and update a positive monthly spending limit for the Variable category.

**Independent Test**: Navigate to budgeting page, set a Variable category limit (e.g., Rp 2,000,000), save, and confirm the limit persists on reload.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T010 [P] [US1] Write component test for BudgetLimitForm in `src/components/features/budgeting/BudgetLimitForm.test.tsx`
- [x] T011 [P] [US1] Write test for updateCategoryLimit server action in `src/app/actions/budgeting.test.ts`

### Implementation for User Story 1

- [x] T012 [US1] Implement BudgetLimitForm component in `src/components/features/budgeting/BudgetLimitForm.tsx` (depends on T010, T007)
- [x] T013 [US1] Implement updateCategoryLimit server action in `src/app/actions/budgeting.ts` (depends on T011, T006, T007)
- [x] T014 [US1] Create initial budgeting page at `src/app/budgeting/page.tsx` rendering BudgetLimitForm (depends on T012)

**Checkpoint**: User Story 1 fully functional. User can set a monthly limit and see it persisted.

---

## Phase 4: User Story 2 - View Daily Spending Power (Priority: P2)

**Goal**: Calculate and display how much money is "safe" to spend today, clamped to 0 when over-budget.

**Independent Test**: With a limit set, record an expense and confirm the Daily Spending Power updates. When spending exceeds the limit, confirm DSP shows 0 in red.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T015 [P] [US2] Write component test for DailySpendingPower in `src/components/features/budgeting/DailySpendingPower.test.tsx`
- [x] T016 [P] [US2] Write component test for BudgetCard in `src/components/features/budgeting/BudgetCard.test.tsx`

### Implementation for User Story 2

- [x] T017 [US2] Implement DailySpendingPower component in `src/components/features/budgeting/DailySpendingPower.tsx` (depends on T015, T005)
- [x] T018 [US2] Implement BudgetCard component in `src/components/features/budgeting/BudgetCard.tsx` with Tremor ProgressBar (depends on T016, T017, T005)
- [x] T019 [US2] Add BudgetCard and DailySpendingPower to `src/app/budgeting/page.tsx` (depends on T018)

**Checkpoint**: User Stories 1 AND 2 both work independently. User sees DSP and progress bar.

---

## Phase 5: User Story 3 - Receive Overbudget Alert (Priority: P3)

**Goal**: Display a persistent visual Shadcn Alert when spending in a category exceeds 80% of its limit.

**Independent Test**: Spend past 80% of a category limit and confirm the Alert component appears. Verify it persists until month rollover.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T020 [P] [US3] Write component test for OverbudgetAlert in `src/components/features/budgeting/OverbudgetAlert.test.tsx`

### Implementation for User Story 3

- [x] T021 [US3] Implement OverbudgetAlert component in `src/components/features/budgeting/OverbudgetAlert.tsx` using Shadcn Alert (depends on T020)
- [x] T022 [US3] Integrate OverbudgetAlert into BudgetCard in `src/components/features/budgeting/BudgetCard.tsx` (depends on T021, T018)

**Checkpoint**: All user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Responsive layout, state management, and final validation

- [x] T023 [P] Add responsive Bento grid layout to `src/app/budgeting/page.tsx` (mobile → md → lg breakpoints per Constitution)
- [x] T024 [P] Create `useBudgeting` Zustand hook in `src/hooks/useBudgeting.ts` for client-side budget state — SKIPPED: server components with `revalidatePath` provide sufficient real-time updates, per YAGNI principle
- [x] T025 Run full test suite: `npx vitest run src/components/features/budgeting src/lib/utils/budgeting.test.ts src/lib/supabase/queries/budgeting.test.ts` — **45/45 passed**
- [x] T026 Validate quickstart.md steps against implemented feature — all steps verified

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend on Foundational phase completion
  - Stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2). No dependencies on other stories.
- **User Story 2 (P2)**: Can start after Foundational (Phase 2). Depends on US1 components (BudgetCard composes DailySpendingPower) but should be independently testable.
- **User Story 3 (P3)**: Can start after Foundational (Phase 2). Depends on US2 (BudgetCard) for integration but alert logic is independently testable.

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Constitution TDD mandate)
- Components before page wiring
- Pure utilities and queries before components

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models/components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Write component test for DailySpendingPower in src/components/features/budgeting/DailySpendingPower.test.tsx"
Task: "Write component test for BudgetCard in src/components/features/budgeting/BudgetCard.test.tsx"

# Launch component creation in parallel:
Task: "Implement DailySpendingPower component in src/components/features/budgeting/DailySpendingPower.tsx"
Task: "Implement BudgetCard component in src/components/features/budgeting/BudgetCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (limit form + server action)
   - Developer B: User Story 2 (DSP + BudgetCard)
   - Developer C: User Story 3 (alert component)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (Red-Green-Refactor)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
