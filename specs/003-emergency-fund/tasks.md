---

description: "Task list for Emergency Fund Management feature implementation"
---

# Tasks: Emergency Fund Management

**Input**: Design documents from `/specs/003-emergency-fund/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, quickstart.md

**Tests**: TDD is MANDATORY per Constitution - tests must be written before implementation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create TypeScript types for Emergency Fund in src/types/emergency-fund.ts
- [x] T002 [P] Create pure financial calculation utilities in src/lib/utils/financial.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Execute database migrations from quickstart.md (user_profiles columns, financial_goals table, transactions column)
- [x] T004 [P] Create Supabase database queries in src/lib/supabase/emergency-fund.ts
- [x] T005 [P] Create Zustand store for emergency fund state in src/hooks/useEmergencyFund.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Set Emergency Fund Target (Priority: P1) 🎯 MVP

**Goal**: Users can set their emergency fund target based on household composition (marital status + dependents) with automatic calculation or manual override

**Independent Test**: Enter marital status, dependents, and Monthly Living Expense Estimate; verify target calculates correctly (6x or 12x) or manual override works

### Tests for User Story 1 (TDD - write FIRST, ensure FAIL) ⚠️

- [x] T006 [P] [US1] Unit test for calculateEmergencyFundTarget in tests/unit/financial.test.ts
- [x] T007 [P] [US1] Unit test for getEffectiveTarget (with override) in tests/unit/financial.test.ts

### Implementation for User Story 1

- [x] T008 [P] [US1] Create EmergencyFundSetup component in src/components/features/emergency-fund/EmergencyFundSetup.tsx
- [x] T009 [US1] Implement Server Action for saving household profile in src/app/actions/emergency-fund.ts
- [x] T010 [US1] Add target calculation logic to useEmergencyFund store
- [x] T011 [US1] Add manual override functionality

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Track Emergency Fund Progress (Priority: P1)

**Goal**: Display progress bar showing current emergency fund balance as percentage of target using Tremor in Bento-style card

**Independent Test**: Set target, add contributions, verify progress bar shows correct percentage

### Tests for User Story 2 (TDD - write FIRST, ensure FAIL) ⚠️

- [x] T012 [P] [US2] Unit test for calculateEmergencyFundProgress in tests/unit/financial.test.ts
- [x] T013 [P] [US2] Integration test for EmergencyFundProgress component in tests/integration/EmergencyFundProgress.test.tsx

### Implementation for User Story 2

- [x] T014 [P] [US2] Create EmergencyFundProgress component with Tremor ProgressBar in src/components/features/emergency-fund/EmergencyFundProgress.tsx
- [x] T015 [P] [US2] Create EmergencyFundCard Bento-style container in src/components/features/emergency-fund/EmergencyFundCard.tsx
- [x] T016 [US2] Implement real-time progress updates via useEmergencyFund store
- [x] T017 [US2] Add "exceeded target" indicator for 100%+ progress

**Checkpoint**: User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Designate Locked Emergency Funds (Priority: P2)

**Goal**: Users can designate funds as "locked" emergency reserves with warning on withdrawal, using Virtual Bucket approach

**Independent Test**: Designate amount as emergency fund, verify available balance = total - emergency fund, verify withdrawal warning

### Tests for User Story 3 (TDD - write FIRST, ensure FAIL) ⚠️

- [x] T018 [P] [US3] Unit test for calculateAvailableBalance in tests/unit/financial.test.ts
- [x] T019 [P] [US3] Integration test for EmergencyFundForm withdrawal warning in tests/integration/EmergencyFundForm.test.tsx

### Implementation for User Story 3

- [x] T020 [P] [US3] Create EmergencyFundForm component for add/withdraw in src/components/features/emergency-fund/EmergencyFundForm.tsx
- [x] T021 [US3] Implement Virtual Bucket tracking via financial_goals table
- [x] T022 [US3] Add withdrawal warning dialog (Shadcn AlertDialog)
- [x] T023 [US3] Display locked vs available balance in EmergencyFundCard

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T024 [P] Add responsive styling (mobile-first, Bento grid for tablet/desktop)
- [x] T025 [P] Add dark mode support
- [x] T026 Add error handling and toast notifications
- [x] T027 Run quickstart.md validation checklist
- [x] T028 Update dashboard to include EmergencyFundCard

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
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Can run in parallel with US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Can run in parallel with US1/US2

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types before utilities
- Utilities before components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T001, T002 can run in parallel (Setup)
- T003, T004, T005 can run in parallel (Foundational)
- T006, T007 can run in parallel (US1 tests)
- T008, T009 can run in parallel (US1 components)
- T012, T013 can run in parallel (US2 tests)
- T014, T015 can run in parallel (US2 components)
- T018, T019 can run in parallel (US3 tests)
- T020, T021 can run in parallel (US3 components)
- T024, T025 can run in parallel (Polish)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for calculateEmergencyFundTarget in tests/unit/financial.test.ts"
Task: "Unit test for getEffectiveTarget in tests/unit/financial.test.ts"

# Launch all components for User Story 1 together:
Task: "Create EmergencyFundSetup component in src/components/features/emergency-fund/EmergencyFundSetup.tsx"
Task: "Implement Server Action for saving household profile in src/app/actions/emergency-fund.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
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
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD: Write tests first, verify they FAIL before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All monetary values use NUMERIC(14,2) per Constitution
- UI uses Shadcn/ui + Tremor per Constitution
