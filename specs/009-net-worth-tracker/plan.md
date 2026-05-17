# Implementation Plan: Net Worth Tracker

**Branch**: `009-net-worth-tracker` | **Date**: 2026-05-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-net-worth-tracker/spec.md`

## Summary

Enable users to track their true net worth by recording assets (Current and Non-Current) and liabilities in a single `net_worth_items` table. The system computes Net Worth = Total Assets - Total Liabilities in real-time, stores daily aggregated snapshots in `net_worth_snapshots`, and visualizes historical trends using Tremor AreaChart. Soft delete (`is_active = false`) preserves historical data integrity while allowing items to be hidden from the active view.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**: Next.js 16.2.6 (App Router), Supabase (PostgreSQL), @tremor/react 3.18.7, Shadcn/ui, Tailwind CSS 4, Zustand  
**Storage**: PostgreSQL (Supabase) — two new tables: `net_worth_items` and `net_worth_snapshots`  
**Testing**: Vitest + React Testing Library (TDD mandatory — tests before implementation)  
**Target Platform**: Mobile-first (Android/iPhone), responsive to tablet/desktop via Tailwind breakpoints  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: <200ms server response for item list + summary fetch, <100ms client-side net worth calculation  
**Constraints**: Zero-cost deployment (Vercel + Supabase Free Tier), RLS mandatory, NUMERIC(14,2) for all monetary values, single-table design (KISS)  
**Scale/Scope**: ~20–50 net worth items per household, daily snapshots — MVP, no automated bank sync in v1

## Constitution Check

| Rule | Status | Notes |
|------|--------|-------|
| Mobile-First UI | ✅ Pass | Bottom Nav entry, responsive Bento grid; 44x44px touch targets on form inputs |
| Shadcn/ui + Tremor | ✅ Pass | Tremor `AreaChart`/`BarChart` for history; Shadcn `Form`/`Input`/`Select` for CRUD; Tremor `Card`/`Metric` for summary |
| TDD (Vitest + RTL) | ✅ Pass | `net-worth.test.ts` must be written and passing before any UI component |
| Financial Precision (NUMERIC) | ✅ Pass | Database uses NUMERIC(14,2); pure functions avoid floating-point errors |
| Supabase + Vercel | ✅ Pass | Zero-cost architecture; Server Components for data fetch |
| YAGNI/KISS | ✅ Pass | Single table for assets + liabilities; no per-item history table in v1 |
| Soft Deletes | ✅ Pass | `net_worth_items.is_active` aligns with existing `categories` pattern; snapshots provide audit trail |
| UUID Primary Keys | ✅ Pass | Both new tables use UUID PK |
| RLS | ✅ Pass | RLS enabled on `net_worth_items` and `net_worth_snapshots` |
| Derived State Not Persisted | ✅ Pass | Net worth computed on-demand via SQL SUM; only daily snapshots (inherently historical) are persisted |

## Project Structure

### Documentation (this feature)

```text
specs/009-net-worth-tracker/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── component-contracts.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── net-worth/
│       └── page.tsx                         # Server Component — fetches items, summary, snapshots; renders dashboard
│
├── components/
│   ├── ui/                                  # Shadcn base components (existing)
│   └── features/
│       └── net-worth/
│           ├── NetWorthDashboard.tsx         # Client Component — orchestrates summary + lists + chart
│           ├── NetWorthDashboard.test.tsx
│           ├── NetWorthSummaryCard.tsx       # Tremor Card/Metric for 5 totals
│           ├── NetWorthSummaryCard.test.tsx
│           ├── NetWorthItemForm.tsx          # Shadcn form for create/edit item
│           ├── NetWorthItemForm.test.tsx
│           ├── NetWorthItemList.tsx          # Grouped list by type
│           ├── NetWorthItemList.test.tsx
│           ├── NetWorthHistoryChart.tsx      # Tremor AreaChart for snapshot history
│           └── NetWorthHistoryChart.test.tsx
│
├── lib/
│   ├── utils/
│   │   ├── net-worth.ts                     # Pure functions: calculateNetWorthSummary, createSnapshotFromItems, getNetWorthColor
│   │   └── net-worth.test.ts               # Vitest unit tests (RED before GREEN)
│   ├── supabase/
│   │   ├── queries/
│   │   │   └── net-worth.ts                # getNetWorthItems, getNetWorthItemById, getNetWorthSummary, getNetWorthSnapshots
│   │   └── migrations/
│   │       └── 009-net-worth-tracker.sql    # CREATE TABLE net_worth_items, net_worth_snapshots
│   └── actions/
│       └── net-worth.ts                    # createNetWorthItem, updateNetWorthItem, deleteNetWorthItem, recordSnapshot
│
├── hooks/
│   └── useNetWorth.ts                       # Zustand store or React state hook
│
└── types/
    └── net-worth.ts                         # NetWorthItem, NetWorthSnapshot, NetWorthSummary, ActionResult
```

**Structure Decision**: Single Next.js project following existing conventions. Feature-scoped components under `/components/features/net-worth/`. Pure financial math in `/lib/utils/net-worth.ts` with colocated tests. Database queries in `/lib/supabase/queries/net-worth.ts`. Server Actions in `/lib/actions/net-worth.ts`. Migration creates two new tables.

## Complexity Tracking

> No constitution violations requiring justification.

## Phases

### Phase 0: Research (Completed)

- Decision: Single `net_worth_items` table with `type` enum (KISS — avoids duplicated schema for assets and liabilities)
- Decision: `is_active` soft delete (aligns with existing `categories` pattern; snapshots provide full audit trail)
- Decision: Tremor `AreaChart` for net worth history visualization (spec mandate; already a dependency)
- Decision: `net_worth_snapshots` table for daily aggregated history (space-efficient; one row per day per household)
- Decision: Snapshot upsert via `ON CONFLICT (household_id, snapshot_date) DO UPDATE` (overwrites same-day edits)
- Decision: Net worth computed in SQL via `SUM(CASE WHEN type = ...)` (derived state not persisted in items table)

### Phase 1: Data Model & Quickstart (Completed)

- `data-model.md`: Documents `net_worth_items` and `net_worth_snapshots` schemas, TypeScript interfaces, SQL calculations, edge cases
- `quickstart.md`: Migration SQL, file checklist, development workflow, testing commands
- `contracts/component-contracts.md`: Server Action signatures, query function signatures, component prop interfaces
- `research.md`: Single-table rationale, soft delete strategy, Tremor chart lock-in, snapshot strategy

### Phase 2: Implementation (Pending via /speckit.tasks)

- Database migration (`009-net-worth-tracker.sql`)
- Pure utility functions (`lib/utils/net-worth.ts`) with full Vitest coverage
- Server Actions (`lib/actions/net-worth.ts`)
- Database queries (`lib/supabase/queries/net-worth.ts`)
- TypeScript types (`src/types/net-worth.ts`)
- Dashboard components (Tremor AreaChart, Shadcn forms, KPI cards)
- App Router page (`app/net-worth/page.tsx`)
- Integration tests for component + Server Action flow

---

**Next Step**: Run `/speckit.tasks` to generate implementation tasks
