# Implementation Plan: Emergency Fund Management

**Branch**: `003-emergency-fund` | **Date**: 2026-05-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-emergency-fund/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Emergency Fund Management feature enables users to set a savings target based on household composition (marital status + dependents), track progress via a Tremor progress bar in a Bento-style card, and designate funds as "locked" emergency reserves using a Virtual Bucket approach (no balance splitting in database). Target calculation: 12× expenses for married with children, 6× otherwise.

## Technical Context

**Language/Version**: TypeScript (strict mode)  
**Primary Dependencies**: Next.js 14+ (App Router), Shadcn/ui, Tremor, Supabase, Zustand  
**Storage**: PostgreSQL (Supabase) with NUMERIC(14,2) for monetary values  
**Testing**: Vitest + React Testing Library (mandatory TDD per Constitution)  
**Target Platform**: Web (mobile-first responsive, Android/iPhone primary)  
**Project Type**: Web application (Next.js + Supabase)  
**Performance Goals**: Mobile-first responsive, real-time UI updates  
**Constraints**: Zero-cost deployment (Vercel + Supabase free tier), KISS principle, Virtual Bucket approach for locked funds  
**Scale/Scope**: Single-user household (multi-account out of scope per YAGNI)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Mobile-First & Responsive | ✅ PASS | Bottom Nav + FAB, fluid stacking, Bento grid for tablet/desktop |
| Shadcn/ui + Tremor | ✅ PASS | FR-009 specifies Tremor ProgressBar/CategoryBar |
| TDD (Vitest + RTL) | ✅ PASS | Must write tests before implementation |
| Financial Precision | ✅ PASS | NUMERIC(14,2) for all monetary values |
| Serverless (Next.js + Vercel + Supabase) | ✅ PASS | Zero-cost architecture |
| YAGNI & KISS | ✅ PASS | Virtual Bucket approach, single account |
| TypeScript (strict, no any) | ✅ PASS | Required |
| RLS mandatory | ✅ PASS | Supabase RLS on all tables |

## Project Structure

### Documentation (this feature)

```text
specs/003-emergency-fund/
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
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Dashboard with emergency fund card
│   └── [other routes]
├── components/
│   ├── ui/                       # Shadcn/Tremor base components
│   └── features/
│       └── emergency-fund/       # Feature-specific components
│           ├── EmergencyFundCard.tsx
│           ├── EmergencyFundSetup.tsx
│           └── EmergencyFundProgress.tsx
├── hooks/
│   └── useEmergencyFund.ts       # Zustand store for emergency fund state
├── lib/
│   ├── supabase/                 # Database clients and queries
│   │   └── emergency-fund.ts     # Emergency fund specific queries
│   └── utils/
│       └── financial.ts          # Pure financial calculations
└── types/
    └── emergency-fund.ts         # TypeScript interfaces

tests/
├── unit/
│   └── emergency-fund.test.ts    # Pure logic tests
└── integration/
    └── emergency-fund.test.tsx   # Component + Server Action tests
```

**Structure Decision**: Feature components in `/components/features/emergency-fund/`, hooks in `/hooks/`, utilities in `/lib/utils/`, database queries in `/lib/supabase/`. All per Constitution project structure rules.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. Virtual Bucket approach maintains KISS principle by not splitting balance in database.
