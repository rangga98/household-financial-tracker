# Implementation Plan: Cash Flow Tracker

**Branch**: `[001-cash-flow-tracker]` | **Date**: 2026-05-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-cash-flow-tracker/spec.md`

## Summary

Core transaction tracking module enabling dual-user (husband/wife) household financial management with frictionless entry, automatic running balance calculation, and Fixed vs. Variable expense categorization. Built on Next.js + Supabase with real-time sync capabilities.

## Technical Context

**Language/Version**: TypeScript (strict mode)  
**Primary Dependencies**: Next.js 14+ (App Router), Supabase (PostgreSQL), Shadcn/ui, Tremor, Tailwind CSS, Zustand  
**Storage**: PostgreSQL (Supabase) with NUMERIC(14,2) for monetary values  
**Testing**: Vitest + React Testing Library (TDD mandatory)  
**Target Platform**: Mobile-first (Android/iPhone), responsive to tablet/desktop  
**Project Type**: Web application (Next.js)  
**Performance Goals**: Real-time balance updates via Supabase subscriptions, <2s transaction sync  
**Constraints**: Zero-cost deployment (Vercel + Supabase Free Tier), RLS mandatory  
**Scale/Scope**: Dual-user household, MVP feature set

## Constitution Check

| Rule | Status | Notes |
|------|--------|-------|
| Mobile-First UI | ✅ Pass | Bottom Nav + FAB for transaction inputs |
| Shadcn/ui + Tremor | ✅ Pass | Required for components and data viz |
| TDD (Vitest + RTL) | ✅ Pass | Tests required before implementation |
| Financial Precision (NUMERIC) | ✅ Pass | Using NUMERIC(14,2) for amounts |
| Supabase + Vercel | ✅ Pass | Zero-cost architecture |
| YAGNI/KISS | ✅ Pass | MVP scope only |
| Soft Deletes | ✅ Pass | deleted_at for audit trail |
| UUID Primary Keys | ✅ Pass | Database-generated UUIDs |
| RLS | ✅ Pass | Row Level Security required |

## Project Structure

### Documentation (this feature)

```
specs/001-cash-flow-tracker/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```
app/
├── page.tsx                    # Dashboard with balance + quick entry
├── layout.tsx                  # Root layout with providers
└── [locale]/                   # i18n support (future)

components/
├── ui/                         # Shadcn base components
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── select.tsx
│   └── toast.tsx
│
└── features/
    └── cash-flow/
        ├── CashFlowDashboard.tsx
        ├── TransactionForm.tsx
        ├── TransactionList.tsx
        ├── BalanceDisplay.tsx
        ├── CategorySelect.tsx
        └── UserSwitcher.tsx

lib/
├── supabase/
│   ├── client.ts               # Browser client
│   ├── server.ts               # Server client
│   └── queries/
│       ├── transactions.ts
│       └── categories.ts
│
└── utils/
    ├── currency.ts             # Formatting (Rp X.XM)
    ├── calculations.ts         # Balance calculations
    └── cn.ts                   # classnames utility

hooks/
└── useCashFlow.ts              # Zustand store for state

types/
└── index.ts                    # TypeScript interfaces

tests/
├── unit/
│   └── currency.test.ts
└── integration/
    └── transaction-flow.test.tsx
```

**Structure Decision**: Single Next.js project with feature-scoped components under `/components/features/cash-flow`. Pure utilities in `/lib/utils`, database queries in `/lib/supabase`.

## Complexity Tracking

> No constitution violations requiring justification.

## Phases

### Phase 0: Research (Completed)
- Supabase real-time subscriptions for concurrent updates
- Tremor KPI cards for balance display
- Mobile-first FAB + Bottom Nav patterns

### Phase 1: Data Model & Quickstart (In Progress)
- Database schema design (transactions, categories, profiles)
- Initial Supabase setup
- Basic UI skeleton

### Phase 2: Implementation (Pending via /speckit.tasks)
- Transaction CRUD operations
- Running balance calculation
- Dual-user sync
- Fixed/Variable categorization

---

**Next Step**: Run `/speckit.tasks` to generate implementation tasks
