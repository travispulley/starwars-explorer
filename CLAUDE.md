# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is an API tester template built with Bun + React 19 + Tailwind 4 + shadcn/ui. It serves as a starting point for building API testing tools with a modern frontend stack.

## Commands

```bash
bun install          # Install dependencies
bun dev              # Dev server with HMR at http://localhost:3000
bun start            # Production server
bun run build.ts     # Production build to dist/
bun test             # Run tests
```

## Architecture

### Server (`src/index.ts`)
Uses `Bun.serve()` with HTML imports (no Express, no Vite):
- Routes defined in `routes` object with method handlers
- HTML files imported directly and served
- HMR enabled in development via `development.hmr`

### Frontend Entry
- `src/index.html` → loads `src/frontend.tsx`
- `src/frontend.tsx` → renders `src/App.tsx` with HMR support
- `src/App.tsx` → main app component with `APITester`

### Styling
- Tailwind 4 with shadcn/ui (new-york style)
- `styles/globals.css` → shadcn theme variables and Tailwind imports
- `src/index.css` → app-specific styles, imports globals.css
- `src/lib/utils.ts` → `cn()` utility for class merging

### UI Components (`src/components/ui/`)
shadcn/ui components installed via `bunx shadcn@latest add <component>`. Uses `@/` path alias mapped to `./src/*`.

## Bun Preferences

- `Bun.serve()` for HTTP (not Express)
- `bun:sqlite` for SQLite (not better-sqlite3)
- `Bun.file` for file I/O (not node:fs)
- `Bun.$` for shell commands (not execa)
- Auto-loads `.env` files (no dotenv)

## Adding API Routes

Add routes in `src/index.ts`:
```ts
"/api/endpoint": {
  GET: (req) => Response.json({ data: "value" }),
  POST: async (req) => {
    const body = await req.json();
    return Response.json({ received: body });
  },
},
"/api/endpoint/:param": (req) => Response.json({ param: req.params.param }),
```
