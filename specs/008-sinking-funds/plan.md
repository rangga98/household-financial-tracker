# Implementation Plan: Education Costs & Sinking Funds Module

**Branch**: `008-sinking-funds` | **Date**: 2026-05-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-sinking-funds/spec.md`

## Summary

Enable users to create sinking funds for large, scheduled future expenses (car, renovation, vacation) and calculate future education costs factoring in inflation using the formula $FV = CC \\times (1 + i)^{n}$. Reuses the existing `financial_goals` table (Virtual Bucket pattern from Emergency Fund) and `transactions` table with `goal_id`. No new database tables. Education inflation formula is extracted as a pure, testable function. UI uses Tremor `ProgressBar` for fund progress and Shadcn/ui for forms.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**: Next.js 16.2.6 (App Router), Supabase (PostgreSQL), @tremor/react 3.18.7, Shadcn/ui, Tailwind CSS 4, Zustand  
**Storage**: PostgreSQL (Supabase) — reuses existing `financial_goals` and `transactions` tables; migration adds `target_date` and `description` columns  
**Testing**: Vitest + React Testing Library (TDD mandatory — tests before implementation)  
**Target Platform**: Mobile-first (Android/iPhone), responsive to tablet/desktop via Tailwind breakpoints  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: <200ms server response for goal list fetch, <100ms client-side inflation calculation  
**Constraints**: Zero-cost deployment (Vercel + Supabase Free Tier), RLS mandatory, NUMERIC(14,2) for all monetary values  
**Scale/Scope**: Multiple sinking funds per user/household, single education calculator — MVP, no multi-scenario comparison in v1

## Constitution Check

| Rule | Status | Notes |
|------|--------|-------|
| Mobile-First UI | ✅ Pass | Bottom Nav entry, responsive Bento grid; 44x44px touch targets on form inputs |
| Shadcn/ui + Tremor | ✅ Pass | Tremor `ProgressBar` for fund progress; Shadcn `Form`/`Input`/`Dialog` for CRUD |
| TDD (Vitest + RTL) | ✅ Pass | `sinking-funds.test.ts` must be written and passing before any UI component |
| Financial Precision (NUMERIC) | ✅ Pass | Database uses NUMERIC(14,2); inflation formula uses integer-safe math |
| Supabase + Vercel | ✅ Pass | Zero-cost architecture; Server Components for data fetch |
| YAGNI/KISS | ✅ Pass | No new tables — reuses `financial_goals` + `transactions`. No persisted projections |
| Soft Deletes | ✅ Pass | `financial_goals.deleted_at` already exists; transactions preserved on goal deletion |
| UUID Primary Keys | ✅ Pass | Uses existing `financial_goals.id` UUID |
| RLS | ✅ Pass | Inherits existing `financial_goals` and `transactions` RLS policies |
| Derived State Not Persisted | ✅ Pass | Education future value is computed in real-time by pure function |

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
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
│   └── sinking-funds/
│       └── page.tsx                         # Server Component — fetches goals, renders dashboard
│
├── components/
│   ├── ui/                                  # Shadcn base components (existing)
│   └── features/
│       └── sinking-funds/
│           ├── SinkingFundsDashboard.tsx     # Client Component — orchestrates list + forms
│           ├── SinkingFundsDashboard.test.tsx
│           ├── SinkingFundCard.tsx           # Tremor ProgressBar + fund details card
│           ├── SinkingFundCard.test.tsx
│           ├── SinkingFundForm.tsx           # Shadcn form for create/edit fund
│           ├── SinkingFundForm.test.tsx
│           ├── ContributionForm.tsx          # Shadcn form for recording contributions
│           ├── ContributionForm.test.tsx
│           ├── EducationCalculator.tsx       # Inflation calculator UI
│           ├── EducationCalculator.test.tsx
│           ├── FundList.tsx                  # List of all sinking funds
│           └── FundList.test.tsx
│
├── lib/
│   ├── utils/
│   │   ├── sinking-funds.ts                 # Pure functions: computeFutureValue, computeProgress
│   │   └── sinking-funds.test.ts            # Vitest unit tests (RED before GREEN)
│   ├── supabase/
│   │   ├── client.ts                        # Existing browser client
│   │   ├── server.ts                        # Existing server client
│   │   ├── queries/
│   │   │   └── sinking-funds.ts             # getSinkingFunds, getFundById, getContributions
│   │   └── migrations/
│   │       └── 008-sinking-funds.sql        # ALTER TABLE financial_goals ADD target_date, description
│   └── actions/
│       └── sinking-funds.ts                 # Next.js Server Actions for CRUD
│
├── hooks/
│   └── useSinkingFunds.ts                   # Zustand store or React state hook
│
└── types/
    └── sinking-funds.ts                     # SinkingFund, Contribution, EducationEstimate
```

**Structure Decision**: Single Next.js project following existing conventions. Feature-scoped components under `/components/features/sinking-funds/`. Pure financial math in `/lib/utils/sinking-funds.ts` with colocated tests. Database queries in `/lib/supabase/queries/sinking-funds.ts`. Server Actions in `/lib/actions/sinking-funds.ts`. Migration adds `target_date` and `description` columns to existing `financial_goals` table.

## Complexity Tracking

> No constitution violations requiring justification.

## Phases

### Phase 0: Research (Completed)

- Decision: Reuse existing `financial_goals` table (YAGNI — no new table, `goal_type = 'sinking'` already supported)
- Decision: Contributions recorded as transactions with `goal_id` (Virtual Bucket pattern from Emergency Fund)
- Decision: Education inflation formula extracted as pure function in `lib/utils/sinking-funds.ts`
- Decision: Tremor `ProgressBar` for fund progress visualization
- Decision: Soft delete via existing `financial_goals.deleted_at`; transactions preserved on goal deletion

### Phase 1: Data Model & Quickstart (Completed)

- `data-model.md`: Documents `financial_goals` table reuse with new `target_date` and `description` columns
- `quickstart.md`: Migration SQL, file checklist, development workflow, testing commands
- `contracts/component-contracts.md`: Server Action signatures, component prop interfaces
- `research.md`: Storage strategy, inflation formula, contribution tracking, component architecture

### Phase 2: Implementation (Pending via /speckit.tasks)

- Database migration (ALTER TABLE financial_goals ADD target_date, description)
- Pure utility functions (`lib/utils/sinking-funds.ts`) with full Vitest coverage
- Server Actions (`lib/actions/sinking-funds.ts`)
- Database queries (`lib/supabase/queries/sinking-funds.ts`)
- TypeScript types (`src/types/sinking-funds.ts`)
- Dashboard components (Tremor ProgressBar, Shadcn forms)
- App Router page (`app/sinking-funds/page.tsx`)
- Integration tests for component + Server Action flow

---

**Next Step**: Run `/speckit.tasks` to generate implementation tasks
