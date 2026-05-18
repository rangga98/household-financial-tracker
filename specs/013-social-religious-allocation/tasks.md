# Tasks: Social & Religious Allocation Module (Giving)

**Input**: Design documents from `/specs/013-social-religious-allocation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: TDD mandatory per Constitution - FR-011 requires pure testable functions before UI

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Database & Infrastructure)

**Purpose**: Database migration and project initialization

- [X] T001 Create migration file `src/lib/supabase/migrations/013-social-religious-allocation.sql` with profile columns and goal_type extension per data-model.md
- [X] T002 [P] Add TypeScript types for giving module in `src/types/giving.ts`
- [X] T003 [P] Create database queries in `src/lib/supabase/queries/giving.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and hooks that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Implement Zakat Maal calculation utility in `src/lib/utils/zakat-maal.ts`
- [X] T005 [P] Implement Zakat Fitrah calculation utility in `src/lib/utils/zakat-fitrah.ts`
- [X] T006 Create useGiving hook in `src/hooks/useGiving.ts`
- [X] T007 [P] Create Zakat calculator server actions in `src/app/actions/giving.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Calculate Zakat Obligation (Priority: P1) 🎯 MVP

**Goal**: Users can calculate Zakat Maal and Zakat Fitrah amounts using standalone calculators

**Independent Test**: Open Giving module, select "Zakat Calculator," enter nisab-eligible assets and threshold, verify computed amount matches formula (2.5% above nisab for Maal, family members × sha × price for Fitrah)

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T008 [P] [US1] Unit test for Zakat Maal above nisab in `src/lib/utils/zakat-maal.test.ts`
- [X] T009 [P] [US1] Unit test for Zakat Maal below nisab (returns 0) in `src/lib/utils/zakat-maal.test.ts`
- [X] T010 [P] [US1] Unit test for Zakat Maal exactly at nisab in `src/lib/utils/zakat-maal.test.ts`
- [X] T011 [P] [US1] Unit test for Zakat Fitrah calculation in `src/lib/utils/zakat-fitrah.test.ts`
- [X] T012 [P] [US1] Unit test for Zakat Fitrah with custom sha weight in `src/lib/utils/zakat-fitrah.test.ts`

### Implementation for User Story 1

- [X] T013 [P] [US1] Create ZakatCalculator component in `src/components/features/giving/ZakatCalculator.tsx`
- [X] T014 [P] [US1] Create ZakatMaalForm component in `src/components/features/giving/ZakatMaalForm.tsx`
- [X] T015 [P] [US1] Create ZakatFitrahForm component in `src/components/features/giving/ZakatFitrahForm.tsx`
- [X] T016 [US1] Create calculator page route in `src/app/(dashboard)/giving/calculator/page.tsx`
- [X] T017 [US1] Add validation for required fields (FR-024)
- [X] T018 [US1] Add "No Zakat due" display when below nisab (FR-023)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Set Up Automatic Giving Allocation (Priority: P1)

**Goal**: Users can configure recurring auto-allocation from income to Zakat/Donations/Compassion Fund

**Independent Test**: Navigate to Giving Settings, enter auto-allocation percentage for Zakat and fixed monthly amount for Compassion Fund, verify income transactions trigger automatic earmarks to Virtual Buckets

### Implementation for User Story 2

- [X] T019 [P] [US2] Create GivingSettingsForm component in `src/components/features/giving/GivingSettingsForm.tsx`
- [X] T020 [P] [US2] Create ProfileSettings page route in `src/app/(dashboard)/giving/settings/page.tsx`
- [X] T021 [US2] Implement updateGivingSettings server action in `src/app/actions/giving.ts`
- [X] T022 [US2] Add validation for allocation settings (FR-010, FR-025)
- [X] T023 [US2] Create auto-allocation trigger logic in income transaction flow
- [X] T024 [US2] Add empty state when no settings configured (FR-040)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Track the Compassion Fund (Priority: P2)

**Goal**: Users can view Compassion Fund balance and history, record disbursements

**Independent Test**: Record a Compassion Fund contribution and a disbursement, verify running balance and transaction history update correctly

### Implementation for User Story 3

- [X] T025 [P] [US3] Create CompassionFundCard component in `src/components/features/giving/CompassionFundCard.tsx`
- [X] T026 [P] [US3] Create CompassionFundHistory component in `src/components/features/giving/CompassionFundHistory.tsx`
- [X] T027 [P] [US3] Create DisbursementForm component in `src/components/features/giving/DisbursementForm.tsx`
- [X] T028 [US3] Implement recordDisbursement server action in `src/app/actions/giving.ts`
- [X] T029 [US3] Add insufficient balance warning (FR-056) with confirmation dialog

**Checkpoint**: User Stories 1, 2, AND 3 should now work independently

---

## Phase 6: User Story 4 - View Giving Summary Dashboard (Priority: P2)

**Goal**: Users can view consolidated dashboard of all giving activities with Tremor charts

**Independent Test**: Verify dashboard shows correct totals and category breakdown after recording giving transactions

### Implementation for User Story 4

- [X] T030 [P] [US4] Create GivingSummaryCard component in `src/components/features/giving/GivingSummaryCard.tsx`
- [X] T031 [P] [US4] Create GivingDonutChart component using Tremor in `src/components/features/giving/GivingDonutChart.tsx`
- [X] T032 [P] [US4] Create GivingBarChart component using Tremor in `src/components/features/giving/GivingBarChart.tsx`
- [X] T033 [US4] Create GivingDashboard component in `src/components/features/giving/GivingDashboard.tsx`
- [X] T034 [US4] Create main Giving page route in `src/app/(dashboard)/giving/page.tsx`
- [X] T035 [US4] Add date filter for period selection (FR-071)
- [X] T036 [US4] Add empty state when no transactions (FR-072)

**Checkpoint**: User Stories 1-4 should now work independently

---

## Phase 7: User Story 5 - Manage Giving Allocation Settings (Priority: P3)

**Goal**: Users can edit or remove allocation settings without affecting historical data

**Independent Test**: Edit allocation rate, verify future transactions use new rate but past allocations unchanged

### Implementation for User Story 5

- [X] T037 [P] [US5] Add edit functionality to GivingSettingsForm in `src/components/features/giving/GivingSettingsForm.tsx`
- [X] T038 [P] [US5] Add delete/clear functionality for allocation settings in `src/components/features/giving/GivingSettingsForm.tsx`
- [X] T039 [US5] Verify historical transactions preserved after settings change (FR-087, FR-088)
- [X] T040 [US5] Add validation error for invalid percentages (FR-089)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T041 [P] Add navigation item for Giving module in SideNav
- [X] T042 [P] Ensure mobile-first responsive layout across all components
- [X] T043 Add dark mode support for all Giving components
- [X] T044 Run quickstart.md validation
- [X] T045 Add error boundaries and toast notifications

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on transactions existing (US1-US3 create transactions)
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Builds on US2 settings

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD per Constitution)
- Utility functions before components
- Components before pages
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- All test tasks for US1 marked [P] can run in parallel
- Once Foundational phase completes, US1 and US2 can start in parallel (both P1)
- US3 and US4 can run in parallel (both P2, depend on transactions)
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for Zakat Maal above nisab in src/lib/utils/calculations/zakat-maal.test.ts"
Task: "Unit test for Zakat Maal below nisab in src/lib/utils/calculations/zakat-maal.test.ts"
Task: "Unit test for Zakat Maal exactly at nisab in src/lib/utils/calculations/zakat-maal.test.ts"

# Launch all components for User Story 1 together:
Task: "Create ZakatCalculator component in src/components/features/giving/ZakatCalculator.tsx"
Task: "Create ZakatMaalForm component in src/components/features/giving/ZakatMaalForm.tsx"
Task: "Create ZakatFitrahForm component in src/components/features/giving/ZakatFitrahForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (MVP)
   - Developer B: User Story 2
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD mandatory per Constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
