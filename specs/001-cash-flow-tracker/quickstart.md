# Quickstart: Cash Flow Tracker

**Phase**: 1 | **Date**: 2026-05-09 | **Feature**: Cash Flow Tracker

## Prerequisites

1. **Supabase Project**: Create at supabase.com
2. **Node.js 18+**: Verify with `node -v`
3. **Vercel Account**: For deployment (free tier)

## Setup Steps

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest household-financial-tracker \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### 2. Install Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/ssr

# UI dependencies (per Constitution)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button dialog form input select toast
npm install @tremor/react lucide-react zustand

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### 3. Configure Supabase

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run Database Migration

Execute SQL from `data-model.md` in Supabase SQL Editor:
- Create `households` table
- Create `profiles` table
- Create `categories` table
- Create `transactions` table
- Enable RLS on all tables
- Set up default categories (seed data)

### 5. Verify Build

```bash
npm run dev
```

Open http://localhost:3000 - you should see the Next.js starter page.

## Project Structure Reference

```
household-financial-tracker/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── ui/                   # Shadcn components
│   │   └── features/
│   │       └── cash-flow/        # Feature components
│   ├── lib/
│   │   ├── supabase/             # DB client & queries
│   │   └── utils/                # Utilities
│   ├── hooks/                    # Zustand stores
│   └── types/                    # TypeScript types
├── tests/
│   ├── unit/                     # Vitest tests
│   └── integration/              # RTL tests
└── .env.local                    # Supabase config
```

## Next Steps

After setup, proceed to `/speckit.tasks` to generate implementation tasks.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| RLS blocked | Check auth context in Supabase client |
| Type errors | Ensure strict mode in tsconfig.json |
| Tailwind not working | Verify content paths in tailwind.config.ts |
