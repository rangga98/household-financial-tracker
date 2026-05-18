# Tasks: Lifestyle Creep Tracker

**Input**: Design documents from `/specs/012-lifestyle-creep-tracker/`  
**Branch**: `012-lifestyle-creep-tracker`  
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/server-actions.md, quickstart.md

**TDD Required**: Yes - FR-011, FR-012, SC-006 mandate 100% test coverage on math utilities before implementation

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)

---

## Phase 1: Setup (Minimal - Project Already Initialized)

**Purpose**: Ensure directory structure exists per implementation plan

- [ ] T001 [P] Create feature component directory: `mkdir -p components/features/lifestyle-creep`
- [ ] T002 [P] Create utility directory: `mkdir -p lib/utils/lifestyle-creep`
- [ ] T003 [P] Create page directory: `mkdir -p app/(dashboard)/analytics/lifestyle-creep`
- [ ] T004 [P] Create queries directory: `mkdir -p lib/supabase/queries`

---

## Phase 2: Foundational - TDD Math Utilities (CRITICAL)

**Purpose**: Core calculation logic with 100% test coverage - BLOCKS all user stories

**⚠️ CRITICAL**: These tasks MUST be completed before ANY user story implementation. Tests MUST be written first and FAIL before implementation.

### Tests First (TDD - Write These Before Implementation)

- [ ] T005 Create test file with all test cases: `lib/utils/lifestyle-creep/calculateGrowthPercentage.test.ts` (division by zero, negative values, precision, averaging)
- [ ] T006 Run tests and confirm they FAIL: `npm test calculateGrowthPercentage` (expected: functions don't exist)

### Implementation (After Tests Exist and Fail)

- [ ] T007 [P] Implement `calculateAverage()` function in `lib/utils/lifestyle-creep/calculateGrowthPercentage.ts`
- [ ] T008 [P] Implement `calculateGrowthPercentage()` function with null return for division by zero
- [ ] T009 Run tests and confirm they PASS: `npm test calculateGrowthPercentage -- --coverage` (verify 100% coverage)
- [ ] T010 Implement `formatPercentage()` display utility in `lib/utils/lifestyle-creep/formatPercentage.ts`

**Checkpoint**: Math utilities complete with 100% test coverage. Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - View Income vs Expense Growth Comparison (Priority: P1) 🎯 MVP

**Goal**: Enable users to view percentage growth comparison between income and expenses over selected time periods

**Independent Test**: Navigate to `/analytics/lifestyle-creep`, select 6-month period, verify percentage values are calculated and displayed correctly using average-based methodology

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [P] [US1] Unit test for `getMonthlyAggregates` query: `lib/supabase/queries/lifestyleCreepQueries.test.ts`
- [ ] T012 [P] [US1] Unit test for growth comparison calculation logic: `lib/utils/lifestyle-creep/calculateGrowthComparison.test.ts`
- [ ] T013 [P] [US1] Component test for `GrowthComparisonCard`: `components/features/lifestyle-creep/GrowthComparisonCard.test.tsx`

### Implementation for User Story 1

- [ ] T014 [US1] Create Supabase query: `lib/supabase/queries/lifestyleCreepQueries.ts` with `getMonthlyAggregates()` function
- [ ] T015 [US1] Create growth comparison utility: `lib/utils/lifestyle-creep/calculateGrowthComparison.ts` (uses calculateGrowthPercentage, implements 3-month average logic)
- [ ] T016 [US1] Create Server Action: `app/(dashboard)/analytics/lifestyle-creep/actions.ts` with `getLifestyleCreepAnalysis()`
- [ ] T017 [US1] Create `GrowthComparisonCard` component: `components/features/lifestyle-creep/GrowthComparisonCard.tsx` (displays income %, expense %, side-by-side layout)
- [ ] T018 [US1] Add insufficient data message handling in `GrowthComparisonCard` (for <3 months data)
- [ ] T019 [US1] Create main page: `app/(dashboard)/analytics/lifestyle-creep/page.tsx` (Server Component, default 6-month view)
- [ ] T020 [US1] Implement default 6-month period calculation in page.tsx

**Checkpoint**: User Story 1 functional. Users can navigate to page and view income vs expense growth comparison. MVP ready for demo.

---

## Phase 4: User Story 2 - Receive Lifestyle Creep Warning (Priority: P1)

**Goal**: Display clear visual warning when expenses grow faster than income

**Independent Test**: Simulate data where expense growth (15%) > income growth (5%), verify Shadcn/ui Alert with destructive variant appears prominently

### Tests for User Story 2 ⚠️

- [ ] T021 [P] [US2] Component test for `CreepWarning`: `components/features/lifestyle-creep/CreepWarning.test.tsx`
- [ ] T022 [P] [US2] Unit test for warning level determination logic (none/warning/critical)

### Implementation for User Story 2

- [ ] T023 [US2] Create `CreepWarning` component: `components/features/lifestyle-creep/CreepWarning.tsx` using Shadcn/ui Alert with variant="destructive"
- [ ] T024 [US2] Implement warning level logic (none/warning/critical) based on creep delta percentage
- [ ] T025 [US2] Add warning state to `GrowthComparisonCard` or create separate warning section
- [ ] T026 [US2] Handle edge case: negative income growth + positive expense growth = critical warning
- [ ] T027 [US2] Handle edge case: equal growth rates = neutral indicator (no warning)
- [ ] T028 [US2] Integrate `CreepWarning` into main `LifestyleCreepTracker` component flow

**Checkpoint**: User Stories 1 AND 2 both work. Warning appears when expenses outpace income.

---

## Phase 5: User Story 3 - Trend Visualization (Priority: P2)

**Goal**: Display line chart showing income and expense trends over time using Tremor

**Independent Test**: Select 12-month period, verify Tremor LineChart renders with two distinct colored lines (income/emerald, expenses/rose) and tooltips work on hover

### Tests for User Story 3 ⚠️

- [ ] T029 [P] [US3] Component test for `TrendChart`: `components/features/lifestyle-creep/TrendChart.test.tsx`

### Implementation for User Story 3

- [ ] T030 [US3] Create `TrendChart` component: `components/features/lifestyle-creep/TrendChart.tsx` using Tremor LineChart
- [ ] T031 [US3] Configure chart with emerald color for income line, rose color for expenses line
- [ ] T032 [US3] Implement tooltip showing exact income/expense amounts on hover
- [ ] T033 [US3] Format month labels for chart display (e.g., "Jan 2024", "Feb 2024")
- [ ] T034 [US3] Integrate `TrendChart` into main tracker component layout
- [ ] T035 [US3] Ensure responsive chart sizing (mobile → tablet → desktop)

**Checkpoint**: All P1 stories + Trend Visualization (P2) functional. Chart displays correctly alongside comparison data.

---

## Phase 6: User Story 4 - Time Period Selection (Priority: P2)

**Goal**: Enable users to select different analysis periods (3/6/12 months or custom)

**Independent Test**: Change period selector from 6-month to 12-month, verify page recalculates and chart/percentages update correctly

### Tests for User Story 4 ⚠️

- [ ] T036 [P] [US4] Component test for `TimePeriodSelector`: `components/features/lifestyle-creep/TimePeriodSelector.test.tsx`
- [ ] T037 [P] [US4] Unit test for date range calculation logic (3mo/6mo/12mo/custom)

### Implementation for User Story 4

- [ ] T038 [US4] Create `TimePeriodSelector` component: `components/features/lifestyle-creep/TimePeriodSelector.tsx` using Shadcn/ui Select
- [ ] T039 [US4] Implement predefined options: 3 months, 6 months, 12 months
- [ ] T040 [US4] Implement custom date range selection UI (date pickers for start/end)
- [ ] T041 [US4] Create `getPeriodDates()` utility: `lib/utils/lifestyle-creep/getPeriodDates.ts` (calculates date ranges from selection)
- [ ] T042 [US4] Wire period selection to Server Action (re-fetch analysis on change)
- [ ] T043 [US4] Update main `LifestyleCreepTracker` component to manage period selection state
- [ ] T044 [US4] Ensure mobile-friendly touch targets (44x44px minimum for Select component)

**Checkpoint**: All user stories functional. Users can select periods and see updated analysis.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Performance, accessibility, mobile responsiveness, and final integration

- [ ] T045 [P] Create main `LifestyleCreepTracker` container component: `components/features/lifestyle-creep/LifestyleCreepTracker.tsx` (integrates all sub-components)
- [ ] T046 [P] Add loading states while fetching data (skeleton UI)
- [ ] T047 [P] Implement error handling with toast notifications per Constitution
- [ ] T048 Verify mobile responsiveness: 44x44px touch targets, proper stacking layout
- [ ] T049 [P] Add dark mode support (Tremor and Shadcn/ui handle this automatically, verify)
- [ ] T050 Run quickstart.md validation steps (manual test checklist)
- [ ] T051 Verify performance: <3 second load time (SC-001)
- [ ] T052 Verify 100% test coverage on math utilities (SC-006)
- [ ] T053 Final integration test: End-to-end flow from page load to warning display

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Setup - BLOCKS all user stories (TDD requires tests before implementation)
- **User Stories (Phases 3-6)**: All depend on Phase 2 completion
  - Can proceed sequentially in priority order (P1 → P2)
  - Or in parallel if team has capacity (US1+US2 can overlap, US3+US4 can overlap)
- **Phase 7 (Polish)**: Depends on all user stories being functional

### User Story Dependencies

- **US1 (P1)**: Foundation only - No dependencies on other stories
- **US2 (P1)**: Depends on US1 data structures but can be developed in parallel if interface is agreed
- **US3 (P2)**: Depends on US1 (needs growth data for chart), but chart component itself is independent
- **US4 (P2)**: Depends on US1 (needs to re-trigger analysis fetch), but selector component itself is independent

### Recommended Execution Order

**Single Developer (Sequential)**:
1. Phase 1 → Phase 2 (Foundation complete)
2. US1 → US2 (Core MVP complete - can demo)
3. US3 → US4 (Enhanced features)
4. Phase 7 (Polish)

**Team (Parallel)**:
1. Phase 1 → Phase 2 together
2. Dev A: US1 + US2 (core functionality)
3. Dev B: US3 (chart, uses US1 data)
4. Dev C: US4 (selector, triggers US1 re-fetch)
5. Phase 7 together

---

## Parallel Opportunities

### Within Phase 2 (Foundation)
- T007, T008: Implement calculateAverage and calculateGrowthPercentage in parallel

### Within User Story 1
- T011, T012, T013: Tests can be written in parallel
- T014, T015: Query and utility can be developed in parallel (after T011/T012 exist)

### Within User Story 2
- T021, T022: Tests can be written in parallel
- T023, T024: Warning component and logic can be developed in parallel

### Within User Story 3
- T029: Test writing
- T030, T031, T032: Chart configuration tasks can be parallel

### Within User Story 4
- T036, T037: Tests can be written in parallel
- T038, T039, T040: Selector UI and options can be parallel

---

## Implementation Strategy

### MVP First (User Stories 1-2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete US1: Core comparison functionality
4. Complete US2: Warning system
5. **STOP and VALIDATE**: Test both stories independently
6. Deploy/demo MVP - Core lifestyle creep detection works

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → Test independently → Deploy (can show comparisons!)
3. US2 → Test independently → Deploy (warnings added!)
4. US3 → Test independently → Deploy (visualization added!)
5. US4 → Test independently → Deploy (flexibility added!)
6. Phase 7 → Polish complete

---

## Task Summary

| Phase | Tasks | Story | Priority |
|-------|-------|-------|----------|
| Setup | 4 tasks | - | - |
| Foundational | 6 tasks | - | CRITICAL |
| US1 | 10 tasks | Growth Comparison | P1 |
| US2 | 8 tasks | Creep Warning | P1 |
| US3 | 7 tasks | Trend Chart | P2 |
| US4 | 9 tasks | Period Selector | P2 |
| Polish | 9 tasks | - | - |
| **Total** | **53 tasks** | | |

---

## Notes

- All tests MUST be written before implementation (TDD per Constitution III)
- All file paths follow project structure from plan.md
- No database tables created (derived state only per spec)
- Math utilities require 100% coverage before proceeding to user stories
- Mobile-first responsive design required (44x44px touch targets)
- Each user story should be independently demo-able when complete
