# Implementation Plan: Custom Categories

**Branch**: `006-custom-categories` | **Date**: 2025-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-custom-categories/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement a custom category management system that allows users to create, edit, delete (soft delete), and filter categories for expense and income transactions. Categories use Lucide icons for visual distinction and are stored in Supabase PostgreSQL with soft delete support for audit trail integrity. The UI will be built with Shadcn/ui components following mobile-first responsive design principles.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (strict mode, no `any` types)
**Primary Dependencies**: Next.js (App Router), Shadcn/ui, Lucide React, Supabase (PostgreSQL & Auth), Tailwind CSS, Tremor
**Storage**: Supabase PostgreSQL with Row Level Security (RLS)
**Testing**: Vitest (unit tests), React Testing Library (integration tests)
**Target Platform**: Web (mobile-first responsive design: Android/iPhone → tablet → desktop)
**Project Type**: Web application (Serverless Next.js on Vercel)
**Performance Goals**: Category list loads within 2 seconds for users with up to 100 categories
**Constraints**: Mobile-first with 44x44px minimum touch targets, TDD mandatory (tests before code), Shadcn/ui for all interactive components, soft delete for audit trail
**Scale/Scope**: Foundation layer feature for household financial tracker, supporting dual-user households

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Mobile-First & Responsive Excellence
✅ **PASS**: UI will begin with mobile screens using Tailwind's fluid stacking and safe-area insets. Will transition to 2-column Bento grid for tablets (`md:`) and 3+ column with sidebar for desktops (`lg:`, `xl:`). Minimum 44x44px touch targets will be enforced.

### High-Fidelity & Data-Driven UI
✅ **PASS**: Will use Shadcn/ui for all interactive components (forms, modals, buttons) as required by FR-016. Lucide icons will be used for category visual distinction. Dark mode support will be implemented.

### Strict Test-Driven Development (TDD)
✅ **PASS**: Tests will be written before implementation code following Red-Green-Refactor cycle. Will use Vitest for unit tests and React Testing Library for integration tests.

### Financial Precision & Integrity
✅ **PASS**: Category data does not involve monetary calculations, but will follow the same precision standards when integrating with transactions. Soft delete ensures audit trail integrity.

### Serverless & Zero-Cost Architecture
✅ **PASS**: Will use Next.js (App Router) deployed on Vercel, backed by Supabase (PostgreSQL & Auth). React Server Components will be used for data fetching.

### Pragmatism Over Perfection (YAGNI & KISS)
✅ **PASS**: Soft delete approach (not hard delete + transaction reassignment) follows KISS principle. Category types are limited to expense/income (not "both") following YAGNI. No over-engineering for speculative use cases.

### Database Design & Data Integrity (Supabase/PostgreSQL)
✅ **PASS**: Will use UUID primary keys, `deleted_at` for soft delete, `created_at` and `updated_at` timestamps. RLS will be enforced for household-based data isolation. Table will use plural `snake_case` naming.

### Technical & Coding Constraints
✅ **PASS**: TypeScript strict mode will be used (no `any` types). Components will be functional and modular. Server Components prioritized. Error handling with toast notifications. Naming conventions will follow constitution (snake_case for DB, camelCase for TS, PascalCase for components).

### Project Structure Enforcement
✅ **PASS**: Will follow the specified structure: `/app` for pages, `/components/ui` for Shadcn components, `/components/features` for category components, `/lib/utils` for utilities, `/lib/supabase` for database clients.

### Observability & Logging
✅ **PASS**: Will use structured JSON logging for server actions. Will log critical state changes (category creation, updates, deletion) without logging sensitive data.

### Development & Testing Workflow
✅ **PASS**: Unit tests will focus on business logic validation. Integration tests will test UI-Server Action flows. Test files will be colocated with implementation files.

**Overall Status**: ✅ **PASS - All constitution gates satisfied**

## Project Structure

### Documentation (this feature)

```text
specs/006-custom-categories/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── categories/              # Category management page (Server Component)
│       ├── page.tsx
│       └── actions/             # Server Actions for CRUD operations
│           ├── create.ts
│           ├── update.ts
│           └── delete.ts
├── components/
│   ├── ui/                      # Shadcn/ui base components (already exists)
│   └── features/
│       └── categories/          # Category-specific components
│           ├── CategoryList.tsx
│           ├── CategoryForm.tsx
│           ├── CategoryCard.tsx
│           ├── IconPicker.tsx
│           └── CategoryFilter.tsx
├── lib/
│   ├── supabase/
│   │   ├── categories.ts        # Database queries and types
│   │   └── client.ts            # Supabase client (already exists)
│   └── utils/
│       └── category-validation.ts # Category validation logic
└── hooks/
    └── useCategories.ts         # Category data fetching hook

tests/
├── unit/
│   └── lib/
│       └── utils/
│           └── category-validation.test.ts
└── integration/
    └── components/
        └── features/
            └── categories/
                ├── CategoryList.test.tsx
                └── CategoryForm.test.tsx
```

**Structure Decision**: Single Next.js project with App Router. Following the constitution's structure requirements: `/app` for pages and server actions, `/components/features` for domain-specific components, `/lib/supabase` for database clients, `/lib/utils` for utilities, and `/hooks` for custom hooks. Test files are colocated with implementation files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution gates satisfied.

## Phase 0: Research

**Status**: ✅ **COMPLETE** - No NEEDS CLARIFICATION items. All technical details are known from constitution and project setup.

## Phase 1: Design & Contracts

**Status**: ✅ **COMPLETE**

### Artifacts Generated

- **data-model.md**: Database schema for categories table with RLS policies, TypeScript types, and validation rules
- **contracts/**: Directory created (no external contracts needed for internal web application)
- **quickstart.md**: Implementation guide with database setup, client functions, validation utilities, server actions, UI components, and testing instructions

### Constitution Re-Check (Post-Design)

✅ **PASS - All constitution gates still satisfied**

The data model and design artifacts fully comply with all constitution requirements:
- Mobile-first responsive design planned
- Shadcn/ui components specified for all interactive UI elements
- TDD approach documented in quickstart
- Soft delete implemented for audit trail integrity
- UUID primary keys, snake_case naming, RLS policies defined
- TypeScript strict mode enforced
- Project structure follows constitution guidelines

## Phase 2: Implementation Planning

**Status**: ⏸️ **PENDING** - Run `/speckit.tasks` to generate implementation tasks
