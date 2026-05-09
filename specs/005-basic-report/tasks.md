# Tasks: Basic Report (The Insight)

**Input**: Design documents from `/specs/005-basic-report/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: TDD is mandatory per Constitution. All `.test.ts` / `.test.tsx` files MUST be written and FAIL before their corresponding implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create report feature directory structure and verify dependencies

- [ ] T001 Create report feature directories: `src/app/report/`, `src/components/features/report/`, and `src/hooks/`
- [ ] T002 [P] Verify `@tremor/react` exports `<DonutChart>`, `<Badge>`, and `<Callout>` in installed version

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, calculation utilities, and Server Action that all user stories depend on

**⚠️ CRITICAL**: No user story component work can begin until this phase is complete

### Types & Utilities

- [ ] T003 [P] Define report TypeScript interfaces in `src/types/report.ts`: `ExpenseBreakdownItem`, `MonthlyTotals`, `MonthOverMonthComparison`, `SavingsHealthStatus`, `ReportData`
- [ ] T004 [P] Write unit tests for `savingsRate` and `expensePercentChange` pure functions in `src/lib/utils/calculations.test.ts`
- [ ] T005 [P] Implement `savingsRate(totalIncome, totalExpenses)` and `expensePercentChange(current, previous)` in `src/lib/utils/calculations.ts` (must return `null` for division-by-zero; must round to 2 decimals)
- [ ] T006 [P] Write tests for report Server Action in `src/app/actions/report.test.ts` (mock Supabase responses; verify aggregation, month-boundary filtering, and division-by-zero guard)

### Server Action

- [ ] T007 Implement `getReportData(householdId, yearMonth)` Server Action in `src/app/actions/report.ts`
  - Query 1: expense aggregation by category (selected month)
  - Query 2: income & expense totals (selected month)
  - Query 3: income & expense totals (previous month)
  - Calculate savings rate, percentages, and comparison deltas
  - Return `ReportData` shape; handle empty result sets gracefully

**Checkpoint**: Foundation ready — `getReportData` returns correct `ReportData` for any month. All utility tests pass. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - View Expense Breakdown (Priority: P1) 🎯 MVP

**Goal**: Display a pie chart (Tremor DonutChart) showing the largest expense categories for the selected month, with percentages and absolute amounts.

**Independent Test**: Render `ExpenseBreakdown` with mock data of 4 categories. Verify DonutChart renders, categories are sorted descending, and percentages sum to ~100%. Verify empty state message appears when data array is empty.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T008 [P] [US1] Write component tests in `src/components/features/report/ExpenseBreakdown.test.tsx` (verify DonutChart renders, sorting, empty state, and "Other" grouping for >6 categories)

### Implementation for User Story 1

- [ ] T009 [US1] Implement `ExpenseBreakdown` component in `src/components/features/report/ExpenseBreakdown.tsx`
  - Props: `data: ExpenseBreakdownItem[]`, `totalExpenses: number`
  - Uses `<DonutChart>` from `@tremor/react` with custom tooltip showing IDR amount
  - Sorts by `totalAmount` descending
  - Groups categories < 1% into "Other" when >6 categories
  - Empty state: "No expenses recorded this month"
  - `aria-label` on chart container

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. The DonutChart renders correctly with mock data and shows empty state when no data.

---

## Phase 4: User Story 2 - View Savings Rate (Priority: P1)

**Goal**: Display the savings rate prominently with a dynamic health indicator (Tremor Badge/Callout) showing Healthy (>20%), Caution (10–20%), or Needs Attention (<10%).

**Independent Test**: Render `SavingsRate` with mock props for all three health thresholds. Verify correct color and label for each. Verify "N/A" displays when `savingsRate` is `null`. Verify total income and total expenses are shown as context.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US2] Write component tests in `src/components/features/report/SavingsRate.test.tsx` (verify all three health statuses, "N/A" for null, and context values)

### Implementation for User Story 2

- [ ] T011 [US2] Implement `SavingsRate` component in `src/components/features/report/SavingsRate.tsx`
  - Props: `savingsRate: number | null`, `totalIncome: number`, `totalExpenses: number`
  - Uses `<Badge>` or `<Callout>` from `@tremor/react`
  - Color mapping: `>20%` → `"emerald"` (Healthy), `10–20%` → `"yellow"` (Caution), `<10%` or `null` or negative → `"red"` (Needs Attention)
  - Displays savings rate as percentage (2 decimals) or "N/A"
  - Shows `totalIncome` and `totalExpenses` in IDR format as supporting context

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Monthly Expense Comparison (Priority: P2)

**Goal**: Compare this month's total expenses to last month's with absolute difference, percentage change, and a visual alert for increases >10%.

**Independent Test**: Render `MonthlyComparison` with mock current and previous month totals. Verify both totals, difference, percentage change, and directional arrow display correctly. Verify red alert styling when increase >10%. Verify "No data" state when previous month total is 0.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T012 [P] [US3] Write component tests in `src/components/features/report/MonthlyComparison.test.tsx` (verify totals, difference, percentage change, >10% alert, and "No data" state)

### Implementation for User Story 3

- [ ] T013 [US3] Implement `MonthlyComparison` component in `src/components/features/report/MonthlyComparison.tsx`
  - Props: `currentMonthTotal: number`, `previousMonthTotal: number`, `currentMonthLabel: string`, `previousMonthLabel: string`
  - Displays both month totals in IDR format
  - Shows absolute difference and percentage change with ▲/▼ directional indicator
  - Highlights percentage change in red when `percentChange > 10%`
  - Shows "No data" for previous month when `previousMonthTotal === 0` and no historical data

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Report Shell & Navigation

**Purpose**: Assemble the report page, add month selector, wire navigation, and ensure responsive layout

- [ ] T014 [P] Write tests for `ReportHeader` in `src/components/features/report/ReportHeader.test.tsx` (verify month display, selector options, and `onMonthChange` callback)
- [ ] T015 [P] [P] Implement `ReportHeader` component in `src/components/features/report/ReportHeader.tsx`
  - Props: `selectedMonth: string`, `onMonthChange: (month: string) => void`, `availableMonths: string[]`
  - Uses Shadcn `<Select>` for month picker (last 12 months)
  - Displays selected month in human-readable format (e.g., "May 2026")
- [ ] T016 Implement `useReport` hook in `src/hooks/useReport.ts`
  - Manages `selectedMonth` state synchronized with URL search param (`?month=YYYY-MM`)
  - Defaults to current month if no param present
  - Uses `useRouter` from `next/navigation` for URL updates
- [ ] T017 Assemble report page in `src/app/report/page.tsx` (async Server Component)
  - Reads `searchParams.month` (format: `YYYY-MM`); defaults to current month
  - Calls `getReportData` with authenticated `householdId` and selected month
  - Renders `ReportHeader`, `SavingsRate`, `ExpenseBreakdown`, and `MonthlyComparison` with fetched data
  - Handles empty data states gracefully for all sections
  - Wraps sections in responsive Shadcn `<Card>` components: stacked on mobile, 2-column Bento on `md:`, 3-column on `lg:`

**Checkpoint**: Full report page renders at `/report` with all three insights. Month selector changes update the displayed data.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Navigation integration, responsive refinements, and final validation

- [ ] T018 [P] Add navigation link to `/report` in the app's bottom navigation bar (mobile) and sidebar (desktop) with a Lucide `BarChart3` icon
- [ ] T019 [P] Verify responsive layout: stacked cards on mobile (`< 768px`), 2-column grid on tablet (`md:`), 3-column Bento on desktop (`lg:`)
- [ ] T020 [P] Run all report tests: `npm run test:run -- src/components/features/report/ && npm run test:run -- src/app/actions/report.test.ts && npm run test:run -- src/lib/utils/calculations.test.ts`
- [ ] T021 Validate quickstart.md checklist: verify all 6 edge cases behave correctly (no income, empty month, single category, small amounts, future-dated transactions)
- [ ] T022 Add structured JSON logging to `getReportData` Server Action for critical errors (e.g., `event: 'REPORT_FETCH_FAIL'`) without logging sensitive data

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend on Foundational phase completion
  - US1, US2, US3 can proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Report Shell (Phase 6)**: Depends on all user story components being complete
- **Polish (Phase 7)**: Depends on report page assembly complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) — No dependencies on other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Component implementation depends on its own test file being written first
- No cross-story component dependencies (each consumes `ReportData` independently)

### Parallel Opportunities

- T001 and T002 can run in parallel
- T003, T004, T005, T006 can run in parallel (different files, no dependencies)
- T007 depends on T003, T005 (types and utilities must exist)
- T008 and T010 and T012 can run in parallel (different component test files)
- T009, T011, T013 can run in parallel once their respective tests exist
- T014 and T015 can run in parallel with T016
- T017 depends on all component implementations (T009, T011, T013, T015, T016)
- T018–T022 can run in parallel during Phase 7

---

## Parallel Example: User Story 1

```bash
# Launch test and implementation for User Story 1:
Task: "Write component tests in src/components/features/report/ExpenseBreakdown.test.tsx"
Task: "Implement ExpenseBreakdown in src/components/features/report/ExpenseBreakdown.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Expense Breakdown)
4. Complete Phase 4: User Story 2 (Savings Rate)
5. Complete Phase 6: Basic report page assembly with US1 + US2 only
6. **STOP and VALIDATE**: Test the report page independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Expense Breakdown) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Savings Rate) → Test independently → Deploy/Demo
4. Add US3 (Monthly Comparison) → Test independently → Deploy/Demo
5. Complete Phase 6–7: Navigation, responsive layout, polish
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Expense Breakdown)
   - Developer B: User Story 2 (Savings Rate)
   - Developer C: User Story 3 (Monthly Comparison)
3. One developer assembles the report page (Phase 6) once components are ready
4. Final polish done in parallel (Phase 7)

---

## Notes

- Total tasks: 22
- Tasks per user story: US1 = 2, US2 = 2, US3 = 2
- Parallel opportunities: Tests for all 3 user stories can be written simultaneously; all 3 component implementations can proceed in parallel
- All file paths use absolute or project-relative paths from repository root
- Each task is specific enough for an LLM to complete without additional context
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
