# Tasks: Net Worth Tracker

**Input**: Design documents from `/specs/009-net-worth-tracker/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/component-contracts.md, quickstart.md, research.md

**Tests**: TDD is mandatory per Constitution. All test tasks MUST be written and FAILING before their corresponding implementation tasks begin.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Feature-scoped directory initialization

- [ ] T001 [P] Create feature component directory `src/components/features/net-worth/`
- [ ] T002 [P] Create App Router page directory `src/app/net-worth/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Create database migration `src/lib/supabase/migrations/009-net-worth-tracker.sql` (net_worth_items + net_worth_snapshots tables, indexes, RLS)
- [ ] T004 [P] Create TypeScript types `src/types/net-worth.ts` (NetWorthItem, NetWorthSnapshot, NetWorthSummary interfaces)
- [ ] T005 [P] Write Vitest unit tests `src/lib/utils/net-worth.test.ts` (calculateNetWorthSummary, createSnapshotFromItems, getNetWorthColor — RED phase)
- [ ] T006 Implement pure utility functions `src/lib/utils/net-worth.ts` (GREEN phase — depends on T005)
- [ ] T007 [P] Implement database queries `src/lib/supabase/queries/net-worth.ts` (getNetWorthItems, getNetWorthItemById, getNetWorthSummary, getNetWorthSnapshots)
- [ ] T008 [P] Implement Server Actions `src/lib/actions/net-worth.ts` (createNetWorthItem, updateNetWorthItem, deleteNetWorthItem, recordSnapshot)
- [ ] T009 Implement React hook `src/hooks/useNetWorth.ts` (Zustand store or React Context for client state)

**Checkpoint**: Foundation ready — database schema, types, utilities, queries, actions, and hook are all in place. Run `npx vitest run src/lib/utils/net-worth.test.ts` to confirm pure functions pass.

---

## Phase 3: User Story 1+2 — Add Net Worth Items (Priority: P1) 🎯 MVP

**Goal**: Users can add assets (Current and Non-Current) and liabilities through a unified form. Items appear grouped by type in a list.

**Independent Test**: Can be fully tested by submitting the form with each type (CURRENT_ASSET, NON_CURRENT_ASSET, LIABILITY) and verifying the item appears in the correct group in the list.

### Tests for User Story 1+2

- [ ] T010 [P] [US1] Write component test for NetWorthItemForm `src/components/features/net-worth/NetWorthItemForm.test.tsx` (create mode, all three types, validation errors — RED)
- [ ] T011 [P] [US1] Write component test for NetWorthItemList `src/components/features/net-worth/NetWorthItemList.test.tsx` (grouping by type, empty state — RED)

### Implementation for User Story 1+2

- [ ] T012 [US1] Implement NetWorthItemForm `src/components/features/net-worth/NetWorthItemForm.tsx` (Shadcn form with name, amount, type select; calls createNetWorthItem Server Action — GREEN, depends on T010)
- [ ] T013 [US1] Implement NetWorthItemList `src/components/features/net-worth/NetWorthItemList.tsx` (groups items by type with subtotals; empty state CTA — GREEN, depends on T011)
- [ ] T014 [US2] Verify NetWorthItemForm handles LIABILITY type selection and NetWorthItemList renders liabilities in their own group (validation that all three types work end-to-end)

**Checkpoint**: User can add Current Assets, Non-Current Assets, and Liabilities. All three types render in correct groups. Form validation prevents empty names and non-positive amounts.

---

## Phase 4: User Story 3 — View Net Worth Summary (Priority: P1) 🎯 MVP

**Goal**: Users see their complete financial position at a glance — Current Assets, Non-Current Assets, Total Assets, Total Liabilities, and Net Worth — with color-coded positive/negative indicator.

**Independent Test**: Can be fully tested by mocking a set of NetWorthItems and verifying the summary cards display correct totals and Net Worth = Total Assets - Total Liabilities.

### Tests for User Story 3

- [ ] T015 [P] [US3] Write component test for NetWorthSummaryCard `src/components/features/net-worth/NetWorthSummaryCard.test.tsx` (correct totals, green for positive net worth, red for negative — RED)
- [ ] T016 [P] [US3] Write component test for NetWorthDashboard `src/components/features/net-worth/NetWorthDashboard.test.tsx` (renders summary + list, handles empty state — RED)

### Implementation for User Story 3

- [ ] T017 [US3] Implement NetWorthSummaryCard `src/components/features/net-worth/NetWorthSummaryCard.tsx` (Tremor Card/Metric grid: 5 totals with tabular-nums; green/red net worth — GREEN, depends on T015)
- [ ] T018 [US3] Implement NetWorthDashboard `src/components/features/net-worth/NetWorthDashboard.tsx` (Client Component orchestrating SummaryCard + ItemList + form modal — GREEN, depends on T016, T017)
- [ ] T019 [US3] Create App Router page `src/app/net-worth/page.tsx` (Server Component fetching initial data and passing to NetWorthDashboard — depends on T018)

**Checkpoint**: Navigating to `/net-worth` shows the dashboard with summary cards and item list. Net worth calculation is accurate. Positive = green, negative = red.

---

## Phase 5: User Story 5 — Edit and Delete Net Worth Items (Priority: P2)

**Goal**: Users can update item details or soft-delete items. Historical snapshots remain intact. Net worth recalculates immediately.

**Independent Test**: Can be fully tested by editing an item's amount, verifying the summary updates, soft-deleting an item, and confirming it disappears from the active list while snapshots are preserved.

### Tests for User Story 5

- [ ] T020 [P] [US5] Write component test for edit mode in NetWorthItemForm `src/components/features/net-worth/NetWorthItemForm.test.tsx` (pre-filled values, update submission — RED)
- [ ] T021 [P] [US5] Write component test for soft-delete in NetWorthItemList `src/components/features/net-worth/NetWorthItemList.test.tsx` (delete button triggers action, item removed from UI — RED)

### Implementation for User Story 5

- [ ] T022 [US5] Add edit mode to NetWorthItemForm `src/components/features/net-worth/NetWorthItemForm.tsx` (mode prop: 'create' | 'edit'; pre-fills existing values; calls updateNetWorthItem — GREEN, depends on T020)
- [ ] T023 [US5] Add edit/delete actions to NetWorthItemList `src/components/features/net-worth/NetWorthItemList.tsx` (edit button opens form in edit mode; delete button triggers soft-delete with confirmation dialog — GREEN, depends on T021)
- [ ] T024 [US5] Add snapshot trigger to mutating Server Actions `src/lib/actions/net-worth.ts` (createNetWorthItem, updateNetWorthItem, deleteNetWorthItem all call recordSnapshot after success — depends on T008)

**Checkpoint**: Users can edit any item's name, amount, or type. Soft-deleted items disappear from the list and summary but historical snapshots remain. Summary updates within 1 second.

---

## Phase 6: User Story 4 — Track Net Worth Over Time (Priority: P2)

**Goal**: Users view a trend chart of their net worth history. Snapshots are recorded automatically on every mutation.

**Independent Test**: Can be fully tested by recording multiple snapshot data points and verifying the Tremor AreaChart renders the trend correctly.

### Tests for User Story 4

- [ ] T025 [P] [US4] Write component test for NetWorthHistoryChart `src/components/features/net-worth/NetWorthHistoryChart.test.tsx` (renders AreaChart with snapshot data, empty state for < 2 points — RED)
- [ ] T026 [P] [US4] Write integration test for snapshot recording flow (mock server action triggers snapshot, verify snapshot data shape — RED)

### Implementation for User Story 4

- [ ] T027 [US4] Implement NetWorthHistoryChart `src/components/features/net-worth/NetWorthHistoryChart.tsx` (Tremor AreaChart with net_worth over time; optional toggle for totalAssets/totalLiabilities — GREEN, depends on T025)
- [ ] T028 [US4] Integrate NetWorthHistoryChart into NetWorthDashboard `src/components/features/net-worth/NetWorthDashboard.tsx` (add chart section below summary and list — depends on T027, T018)
- [ ] T029 [US4] Verify recordSnapshot upserts correctly `src/lib/actions/net-worth.ts` (ON CONFLICT (household_id, snapshot_date) DO UPDATE; net_worth = total_assets - total_liabilities — depends on T026)

**Checkpoint**: History chart appears on the dashboard. Every item create/edit/delete triggers a snapshot upsert for today. Chart renders trend over time. Empty state shown when < 2 snapshots exist.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: UI polish, navigation integration, and full-suite validation

- [ ] T030 [P] Add empty state illustrations and helper text to NetWorthItemList when no items exist
- [ ] T031 [P] Add helper text to NetWorthHistoryChart when only 1 snapshot exists ("Update your assets and liabilities to see your trend over time.")
- [ ] T032 [P] Run full Vitest suite: `npm run test:run` — all net-worth tests must pass
- [ ] T033 Add Net Worth link to Bottom Navigation / sidebar navigation
- [ ] T034 Verify responsive layout: mobile (single column) → tablet (Bento 2-col) → desktop (3+ col with sidebar)
- [ ] T035 Run quickstart.md validation: confirm all files from File Checklist exist and migration SQL is correct

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories.
- **User Stories (Phase 3–6)**: All depend on Foundational phase completion.
  - Phase 3 (US1+US2 Add Items) and Phase 4 (US3 Summary) can proceed in parallel after Foundational
  - Phase 5 (US5 Edit/Delete) depends on Phase 3 (items must exist to edit/delete)
  - Phase 6 (US4 History) depends on Phase 3+5 (mutations trigger snapshots)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|-----------|-------------------|
| US1+US2 (Add Items) | Phase 2 | US3 (Summary) |
| US3 (View Summary) | Phase 2 | US1+US2 (Add Items) |
| US5 (Edit/Delete) | US1+US2 | US3 |
| US4 (History) | US1+US2, US5 | — |

### Within Each User Story

- Tests MUST be written and FAILING before implementation (TDD)
- Component tests before component implementation
- Server Actions and queries already exist from Phase 2; stories consume them

### Parallel Opportunities

- **Phase 2**: T003, T004, T005, T007 can all run in parallel (different files, no cross-dependencies)
- **Phase 3**: T010 and T011 (tests) can run in parallel; T012 and T013 (implementation) can run in parallel
- **Phase 4**: T015 and T016 (tests) can run in parallel; T017 and T018 (implementation) are sequential (Dashboard depends on SummaryCard)
- **Phase 5**: T020 and T021 (tests) can run in parallel; T022 and T023 (implementation) are sequential
- **Phase 6**: T025 and T026 (tests) can run in parallel
- **Phase 7**: All polish tasks marked [P] can run in parallel

---

## Parallel Example: Phase 3 (US1+US2 Add Items)

```bash
# Launch both component tests together (RED phase):
npx vitest run src/components/features/net-worth/NetWorthItemForm.test.tsx
npx vitest run src/components/features/net-worth/NetWorthItemList.test.tsx

# Then implement both components (GREEN phase):
# src/components/features/net-worth/NetWorthItemForm.tsx
# src/components/features/net-worth/NetWorthItemList.tsx
```

---

## Implementation Strategy

### MVP First (Phase 1 → 2 → 3 → 4)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (database, types, utils, queries, actions)
3. Complete Phase 3: US1+US2 — Add items (form + list)
4. Complete Phase 4: US3 — View summary (dashboard + page)
5. **STOP and VALIDATE**: Navigate to `/net-worth`, add items, verify summary. All P1 stories functional.
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1+US2 (Add Items) → Test independently → Deploy/Demo
3. Add US3 (Summary) → Test independently → Deploy/Demo (MVP complete!)
4. Add US5 (Edit/Delete) → Test independently → Deploy/Demo
5. Add US4 (History Chart) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 + 2 together
2. Once Foundational is done:
   - Developer A: Phase 3 (US1+US2 Add Items)
   - Developer B: Phase 4 (US3 Summary) — can start immediately, uses mocked items for testing
   - Developer C: Phase 5 (US5 Edit/Delete) — starts after Phase 3 completes
   - Developer D: Phase 6 (US4 History) — starts after Phase 5 completes
3. Stories integrate at the NetWorthDashboard component

---

## Task Summary

| Phase | Tasks | Count |
|-------|-------|-------|
| Setup | T001–T002 | 2 |
| Foundational | T003–T009 | 7 |
| US1+US2 Add Items | T010–T014 | 5 |
| US3 Summary | T015–T019 | 5 |
| US5 Edit/Delete | T020–T024 | 5 |
| US4 History | T025–T029 | 5 |
| Polish | T030–T035 | 6 |
| **Total** | **T001–T035** | **35** |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (TDD mandate)
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
- All monetary values use NUMERIC(14,2) in DB and `number` in TypeScript
- Soft delete uses `is_active = false` (not `deleted_at`) per spec feedback
- Chart component MUST use Tremor AreaChart or BarChart (no other libraries)
