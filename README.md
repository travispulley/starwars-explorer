# Star Wars Explorer

A demo frontend application showcasing Bun, React 19, Zustand, Ky, and shadcn/ui by interfacing with the [Star Wars API (SWAPI)](https://swapi.py4e.com/).

## Live Demo

Visit https://travispulley.github.io/starwars-explorer

## Configuration

- The port it runs on (3000 by default) can be set in .env (see .env.sample) 
- The base url for SWAPI is set as SWAPI_BASE in lib/api.ts

## Features

- **Browse Resources**: Explore People, Planets, Films, Species, Vehicles, and Starships
- **Global Search**: Search across all resource types simultaneously
- **Pagination**: Configurable items per page (12, 24, 48) with page navigation
- **Expandable Badges**: Click badge counts to reveal related entities
- **Detail View**: View individual entities with full information
- **URL State Sync**: Shareable URLs with query parameters for current view
- **Local Caching**: API responses cached in localStorage via Zustand persist
- **Dark Theme**: Space-themed dark UI with animated star background

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime and bundler
- **Framework**: [React 19](https://react.dev) - UI library
- **State**: [Zustand](https://zustand-demo.pmnd.rs/) - Lightweight state management
- **HTTP**: [Ky](https://github.com/sindresorhus/ky) - HTTP client
- **UI**: [shadcn/ui](https://ui.shadcn.com/) - Component library
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)

## Getting Started

```bash
bun install    # Install dependencies
bun dev        # Start dev server at http://localhost:3000
```

## URL Parameters

The app state syncs to URL query parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `type` | Resource type | `?type=planets` |
| `page` | Page number | `?page=3` |
| `q` | Search query | `?q=skywalker` |
| `detail` | Detail view | `?detail=people/1` |

## Project Structure

```
src/
├── App.tsx                        # Main app, URL sync, layout
├── index.ts                       # Bun server entry
├── components/
│   ├── ResourceCard.tsx           # Card switcher + 6 resource card types
│   ├── ExpandableBadge.tsx        # Badge with expandable entity list
│   ├── Pagination.tsx             # Page navigation
│   ├── LoadingSkeleton.tsx        # Loading state grid
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── api.ts                     # Ky client and SWAPI types
│   └── url-helpers.ts             # URL param helpers + global state
└── store/
    └── swapi.ts                   # Zustand store with caching
```
