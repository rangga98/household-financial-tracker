---

description: "Task list for Custom Categories feature implementation"
---

# Tasks: Custom Categories

**Input**: Design documents from `/specs/006-custom-categories/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, quickstart.md

**Tests**: Tests are MANDATORY per constitution TDD requirement. All test tasks must be completed before implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths follow the project structure defined in plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create directory structure for categories feature in src/app/categories/, src/components/features/categories/, src/lib/supabase/, src/lib/utils/, src/hooks/
- [x] T002 [P] Create TypeScript type definitions in src/lib/supabase/categories-types.ts based on data-model.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create database migration for categories table in supabase/migrations/ with schema from data-model.md
- [x] T004 [P] Apply RLS policies for categories table in supabase/migrations/
- [x] T005 [P] Create Supabase client functions in src/lib/supabase/categories.ts (getCategories, createCategory, updateCategory, softDeleteCategory)
- [x] T006 Create validation utilities in src/lib/utils/category-validation.ts (validateCategoryName, validateIconName)
- [x] T007 [P] Create custom hook in src/hooks/useCategories.ts for category data fetching

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Custom Categories (Priority: P1) 🎯 MVP

**Goal**: Users can create custom categories with name, type (expense/income), and Lucide icon

**Independent Test**: Create a category through the UI and verify it appears in the category list

### Tests for User Story 1 (MANDATORY per TDD) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T008 [P] [US1] Write unit test for validateCategoryName in tests/unit/lib/utils/category-validation.test.ts
- [x] T009 [P] [US1] Write unit test for validateIconName in tests/unit/lib/utils/category-validation.test.ts
- [x] T010 [P] [US1] Write integration test for CategoryForm in tests/integration/components/features/categories/CategoryForm.test.tsx

### Implementation for User Story 1

- [x] T011 [P] [US1] Create IconPicker component in src/components/features/categories/IconPicker.tsx using Shadcn/ui components and Lucide icons
- [x] T012 [US1] Create CategoryForm component in src/components/features/categories/CategoryForm.tsx using Shadcn/ui Form, Input, Select components (depends on T011)
- [x] T013 [US1] Create create server action in src/app/categories/actions/create.ts with validation and error handling (depends on T005, T006, T012)
- [x] T014 [US1] Create categories page in src/app/categories/page.tsx with CategoryForm integration (depends on T012, T013)
- [x] T015 [US1] Add toast notifications for success/error in CategoryForm (depends on T013)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Edit Custom Categories (Priority: P2)

**Goal**: Users can modify existing category properties (name, type, icon)

**Independent Test**: Edit an existing category and verify the changes persist

### Tests for User Story 2 (MANDATORY per TDD) ⚠️

- [x] T016 [P] [US2] Write integration test for CategoryForm edit mode in tests/integration/components/features/categories/CategoryForm.test.tsx

### Implementation for User Story 2

- [x] T017 [US2] Extend CategoryForm component in src/components/features/categories/CategoryForm.tsx to support edit mode (depends on T012)
- [x] T018 [US2] Create update server action in src/app/categories/actions/update.ts with validation and error handling (depends on T005, T006, T017)
- [x] T019 [US2] Integrate update action in CategoryForm component (depends on T017, T018)
- [x] T020 [US2] Add toast notifications for update success/error in CategoryForm (depends on T019)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Delete Custom Categories (Priority: P3)

**Goal**: Users can soft delete categories (hidden from UI, retained in database for audit trail)

**Independent Test**: Delete a category and verify it no longer appears in the category list but is preserved in database

### Tests for User Story 3 (MANDATORY per TDD) ⚠️

- [x] T021 [P] [US3] Write integration test for category deletion in tests/integration/components/features/categories/CategoryList.test.tsx

### Implementation for User Story 3

- [x] T022 [P] [US3] Create CategoryCard component in src/components/features/categories/CategoryCard.tsx with delete button using Shadcn/ui
- [x] T023 [US3] Create CategoryList component in src/components/features/categories/CategoryList.tsx to display categories (depends on T022)
- [x] T024 [US3] Create delete server action in src/app/categories/actions/delete.ts with soft delete implementation (depends on T005)
- [x] T025 [US3] Integrate delete action in CategoryCard component with confirmation dialog (depends on T022, T024)
- [x] T026 [US3] Add toast notifications for delete success/error in CategoryCard (depends on T025)
- [x] T027 [US3] Integrate CategoryList in categories page in src/app/categories/page.tsx (depends on T023)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - View and Filter Categories (Priority: P4)

**Goal**: Users can view all categories with filtering by type and search by name

**Independent Test**: View category list and apply filters/search to verify filtering works

### Tests for User Story 4 (MANDATORY per TDD) ⚠️

- [x] T028 [P] [US4] Write integration test for CategoryFilter in tests/integration/components/features/categories/CategoryFilter.test.tsx
- [x] T029 [P] [US4] Write integration test for CategoryList with filtering in tests/integration/components/features/categories/CategoryList.test.tsx

### Implementation for User Story 4

- [x] T030 [US4] Create CategoryFilter component in src/components/features/categories/CategoryFilter.tsx using Shadcn/ui components (depends on T023)
- [x] T031 [US4] Integrate CategoryFilter in CategoryList component with filter logic (depends on T023, T030)
- [x] T032 [US4] Add search functionality to CategoryFilter component (depends on T030)
- [x] T033 [US4] Update CategoryList to support both filter and search (depends on T031, T032)

**Checkpoint**: All user stories should now be independently functional with filtering capabilities

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T034 [P] Add mobile-first responsive design to all category components (44x44px touch targets, fluid stacking, Bento grid for tablet/desktop)
- [x] T035 [P] Add dark mode support to all category components
- [x] T036 Add structured JSON logging to all server actions (create, update, delete) in src/app/categories/actions/
- [x] T037 Add error boundaries for category pages
- [x] T038 Run quickstart.md validation to ensure all implementation steps are complete
- [x] T039 Performance optimization for category list loading (ensure <2 seconds for 100 categories)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends CategoryForm from US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2, creates new components
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Depends on CategoryList from US3

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD mandate)
- Tests marked [P] can run in parallel within the story
- Components before server actions
- Server actions before page integration
- Core implementation before polish

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Stories 1, 2, and 3 can start in parallel (if team capacity allows)
- User Story 4 depends on User Story 3 (CategoryList)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write unit test for validateCategoryName in tests/unit/lib/utils/category-validation.test.ts"
Task: "Write unit test for validateIconName in tests/unit/lib/utils/category-validation.test.ts"
Task: "Write integration test for CategoryForm in tests/integration/components/features/categories/CategoryForm.test.tsx"

# Launch IconPicker in parallel with test writing (different files):
Task: "Create IconPicker component in src/components/features/categories/IconPicker.tsx"
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
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2 (after US1 CategoryForm is complete)
   - Developer C: User Story 3
3. User Story 4 waits for User Story 3 CategoryList completion
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are MANDATORY per constitution TDD requirement - verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All UI components MUST use Shadcn/ui per FR-016
- Mobile-first responsive design with 44x44px minimum touch targets
- Soft delete implementation for audit trail integrity
