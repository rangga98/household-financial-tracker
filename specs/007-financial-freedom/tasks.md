# Tasks: Financial Freedom Module

**Input**: Design documents from `/specs/007-financial-freedom/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/component-contracts.md, quickstart.md

**Tests**: TDD is mandatory per Constitution Article III and spec FR-011. All `.test.ts` / `.test.tsx` files must be written and failing (RED) before their corresponding implementation files are created (GREEN).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration and project scaffolding for the feature

- [x] T001 Create migration SQL file `src/lib/supabase/migrations/007-financial-freedom.sql` with ALTER TABLE profiles ADD COLUMN for fi_annual_expenses, fi_savings_rate, fi_current_age, fi_current_net_worth, fi_expected_return
- [x] T002 [P] Create TypeScript types `src/types/financial-freedom.ts` with FIProfile, FIProjection, FIYearProjection, FIDashboardData interfaces

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### TDD — Financial Calculation Utilities (RED → GREEN)

- [x] T003 Apply migration `007-financial-freedom.sql` to Supabase database
- [x] T004 Write Vitest unit tests `src/lib/utils/finance.test.ts` covering calculateFINumber, calculateAnnualSavings, calculateYearsToFI, generateTrajectory, computeFIProjection — including edge cases (0% savings, already FI, 0% return, negative inputs) — tests MUST fail before T005
- [x] T005 Implement pure financial calculation functions `src/lib/utils/finance.ts` (calculateFINumber, calculateAnnualSavings, calculateYearsToFI, generateTrajectory, computeFIProjection) — make T004 tests pass
- [x] T006 [P] Create Supabase query functions `src/lib/supabase/queries/financial-freedom.ts` (getFIProfile, updateFIProfile, getBudgetBasedAnnualExpenses) with snake_case ↔ camelCase mapping per existing project convention
- [x] T007 Create Next.js Server Actions `src/lib/actions/financial-freedom.ts` (getFIProfile, updateFIProfile, getBudgetBasedAnnualExpenses) with validation and structured JSON error logging

**Checkpoint**: Foundation ready — `npm run test:run src/lib/utils/finance.test.ts` passes; database has FI columns; Server Actions return valid FIProfile objects.

---

## Phase 3: User Story 1 - Calculate and Display FI Age (Priority: P1) 🎯 MVP

**Goal**: As a user, I want to see at what age I will achieve financial freedom so I can plan my long-term financial future.

**Independent Test**: Input annual expenses $40,000, savings rate 50%, age 30, net worth $100,000, return 7% → verify FI Number = $1,000,000 and projected FI age is displayed. Verify celebratory state when net worth >= FI Number.

### Tests for User Story 1 (TDD — write FIRST, ensure FAIL) ⚠️

- [x] T008 [P] [US1] Write integration test `src/components/features/financial-freedom/FinancialFreedomDashboard.test.tsx` verifying FI Number, projected age, and celebratory state are rendered from mocked profile data
- [x] T009 [P] [US1] Write test `src/app/financial-freedom/page.test.tsx` verifying Server Component fetches profile via Server Action and passes it to dashboard

### Implementation for User Story 1

- [x] T010 [US1] Implement App Router Server Component `src/app/financial-freedom/page.tsx` — fetches FI profile via Server Action, computes projection via `computeFIProjection`, passes data to dashboard; handles missing profile state with onboarding prompt
- [x] T011 [US1] Implement `src/components/features/financial-freedom/FinancialFreedomDashboard.tsx` — Client Component that receives `FIProfile` + `FIProjection`, renders FI Number, Years to FI, Projected FI Age in KPI cards; handles `isAlreadyFI` celebratory state and `yearsToFI === null` unreachable state
- [x] T012 [US1] Add edge case UI handling in FinancialFreedomDashboard: celebratory banner when `isAlreadyFI = true`, warning message when `yearsToFI = null` (zero/negative savings rate), prompt to complete profile when any input is null

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Navigate to `/financial-freedom`, enter data, and see projected FI age.

---

## Phase 4: User Story 2 - View FI Projection Dashboard (Priority: P2)

**Goal**: As a user, I want a visual dashboard showing my progress toward financial freedom so I can stay motivated and track my trajectory.

**Independent Test**: Verify Tremor ProgressBar shows correct percentage and Tremor AreaChart renders year-by-year trajectory with FI Number reference line.

### Tests for User Story 2 (TDD — write FIRST, ensure FAIL) ⚠️

- [x] T013 [P] [US2] Write test `src/components/features/financial-freedom/FIProgressCard.test.tsx` verifying Tremor ProgressBar renders with correct progressPercentage and KPI values
- [x] T014 [P] [US2] Write test `src/components/features/financial-freedom/FIProjectionChart.test.tsx` verifying Tremor AreaChart renders trajectory data points and FI Number reference line

### Implementation for User Story 2

- [x] T015 [US2] Implement `src/components/features/financial-freedom/FIProgressCard.tsx` — Tremor Card + ProgressBar displaying FI Number, Current Net Worth, and progress percentage; celebratory variant when `isAlreadyFI = true`
- [x] T016 [US2] Implement `src/components/features/financial-freedom/FIProjectionChart.tsx` — Tremor AreaChart with `year` on x-axis, `netWorth` on y-axis, horizontal reference line at FI Number, tooltip showing `age` and formatted `netWorth`; responsive height for mobile
- [x] T017 [US2] Integrate FIProgressCard and FIProjectionChart into FinancialFreedomDashboard, passing computed projection data

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Dashboard shows numbers + visual progress + trajectory chart.

---

## Phase 5: User Story 3 - Adjust Financial Assumptions (Priority: P3)

**Goal**: As a user, I want to adjust assumptions like expected return rate and see how changes affect my FI timeline so I can model different scenarios.

**Independent Test**: Modify expected return from 7% to 5% and verify projected FI age and chart update immediately after save.

### Tests for User Story 3 (TDD — write FIRST, ensure FAIL) ⚠️

- [x] T018 [P] [US3] Write test `src/components/features/financial-freedom/FIInputForm.test.tsx` verifying form renders all 5 inputs, validates ranges, and calls onUpdate with correct values on submit

### Implementation for User Story 3

- [x] T019 [US3] Implement `src/components/features/financial-freedom/FIInputForm.tsx` — Shadcn Form with inputs: Annual Expenses (number), Savings Rate (slider 0-100%), Current Age (number), Current Net Worth (number), Expected Return (slider 2-12%, default 7%); pre-fills from profile data
- [x] T020 [US3] Wire FIInputForm to `updateFIProfile` Server Action using `useTransition` / `useActionState` for optimistic UI; on success, parent dashboard re-renders with updated projection
- [x] T021 [US3] Implement budget-based expense pre-population in `src/app/financial-freedom/page.tsx` — when `fi_annual_expenses` is null, call `getBudgetBasedAnnualExpenses` and pass suggested value to FIInputForm as initial value

**Checkpoint**: All user stories should now be independently functional. User can input data, see projections, adjust assumptions, and view visual dashboard.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Integration validation, edge case verification, and file completeness

- [x] T022 [P] Run `npm run test:run` — all unit and integration tests pass (finance.test.ts, component tests)
- [x] T023 [P] Verify quickstart.md file checklist — confirm all 10 source files exist at correct paths
- [x] T024 Verify edge cases handled end-to-end: already FI (celebration), 0% savings (unreachable message), missing data (onboarding prompt), very low savings (< 10% contextual note)
- [x] T025 [P] Verify responsive layout — mobile single column, tablet 2-col Bento, desktop 3-col with sidebar per Constitution Article I

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001, T002) — BLOCKS all user stories
  - T003 depends on T001
  - T004 depends on T002
  - T005 depends on T004 (TDD: RED before GREEN)
  - T006 depends on T003
  - T007 depends on T006
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1, US2, US3 can proceed in parallel (if staffed) after T007
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (T007) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (T007) — Integrates with US1 dashboard but is independently testable
- **User Story 3 (P3)**: Can start after Foundational (T007) — Integrates with US1/US2 but is independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Implementation tasks depend on their corresponding test tasks
- Story complete before moving to next priority

### Parallel Opportunities

- T002 (types) can run in parallel with T001 (migration SQL)
- T004 (finance tests) can run in parallel with T006 (queries) after T003
- T008, T009 (US1 tests) can run in parallel with each other
- T013, T014 (US2 tests) can run in parallel with each other
- T015, T016 (US2 components) can run in parallel with each other (after their tests)
- T022, T023, T025 (polish) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch both tests for US1 together (must fail first):
vitest run src/components/features/financial-freedom/FinancialFreedomDashboard.test.tsx
vitest run src/app/financial-freedom/page.test.tsx

# Then implement page and dashboard:
# T010: app/financial-freedom/page.tsx
# T011: FinancialFreedomDashboard.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: Foundational (T003–T007) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T008–T012)
4. **STOP and VALIDATE**: Test User Story 1 independently — enter data, verify FI age calculation
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
   - Developer A: User Story 1 (calculation + display)
   - Developer B: User Story 2 (visual dashboard components)
   - Developer C: User Story 3 (input form + scenario modeling)
3. Stories complete and integrate independently

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 25 |
| **Setup Tasks** | 2 |
| **Foundational Tasks** | 5 |
| **US1 Tasks** | 5 (P1 — MVP) |
| **US2 Tasks** | 5 (P2) |
| **US3 Tasks** | 4 (P3) |
| **Polish Tasks** | 4 |
| **Test Tasks** | 8 (all TDD, written before implementation) |
| **Parallel Opportunities** | 12 tasks marked [P] |
| **Suggested MVP Scope** | Phases 1–3 (Setup + Foundational + US1) = 12 tasks |

---

## Notes

- `[P]` tasks = different files, no dependencies
- `[Story]` label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
