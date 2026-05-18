# Implementation Plan: Social & Religious Allocation Module (Giving)

**Branch**: `013-social-religious-allocation` | **Date**: 2026-05-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-social-religious-allocation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A Giving module that provides Zakat calculation (Maal & Fitrah), automatic allocation from income to Virtual Buckets for Zakat/Donations/Compassion Fund, and a dashboard to track giving activities. Reuses existing `goals` (Virtual Buckets) and `transactions` tables; extends user profile with allocation settings.

## Technical Context

**Language/Version**: TypeScript (Next.js 14+ App Router)  
**Primary Dependencies**: Next.js, Supabase, Shadcn/ui, Tremor, Tailwind CSS, Vitest  
**Storage**: PostgreSQL via Supabase (NUMERIC(14,2) for monetary values)  
**Testing**: Vitest + React Testing Library (TDD mandatory per Constitution)  
**Target Platform**: Web (mobile-first responsive)  
**Project Type**: Web application (Next.js App Router with Server Actions)  
**Performance Goals**: <2s for auto-allocation earmarking on income recording  
**Constraints**: Mobile-first, Dark Mode, RLS mandatory, Shadcn/ui + Tremor for UI  
**Scale/Scope**: Single-user household financial tracker (MVP)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Mobile-First & Responsive | ✅ PASS | Spec requires mobile-first with Bottom Nav + FAB |
| Shadcn/ui + Tremor | ✅ PASS | Dashboard requires Tremor charts |
| TDD Mandatory | ✅ PASS | FR-011 requires pure testable functions before UI |
| Financial Precision | ✅ PASS | Uses NUMERIC(14,2) for all currency |
| Serverless/Vercel | ✅ PASS | Next.js on Vercel with Supabase |
| YAGNI/KISS | ✅ PASS | Reuses existing goals/transactions tables |
| TypeScript Strict | ✅ PASS | Existing project uses strict mode |
| RLS | ✅ PASS | Existing tables have RLS policies |

## Project Structure

### Documentation (this feature)

```text
specs/013-social-religious-allocation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (if needed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── (dashboard)/
│       └── giving/           # New Giving module pages
├── components/
│   └── features/
│       └── giving/           # Giving-specific components
├── hooks/
│   └── useGiving.ts          # New hook for giving logic
├── lib/
│   ├── utils/
│   │   └── calculations/     # Zakat calculation utilities
│   └── supabase/
│       └── queries/          # Existing query patterns
test/
└── unit/
    └── calculations/         # Zakat calculation tests (TDD first)
```

**Structure Decision**: Feature follows existing project patterns in `/src/app/(dashboard)/`, `/src/components/features/`, `/src/hooks/`, and `/src/lib/utils/`. Tests colocated in `/test/unit/calculations/` following Constitution.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. Feature reuses existing infrastructure (goals, transactions, profile tables) following YAGNI principle.
