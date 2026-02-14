# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TaskTusk is a task prioritization planner that scores items by importance (priority), desire, difficulty, and completion percentage, then ranks them so the user tackles the right task first. UI text is in Russian; code and comments are in English.

## Development Commands

```powershell
# Install dependencies
npm install

# Start development server (port 8080)
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests (single run)
npm test

# Run tests in watch mode
npm run test:watch
```

## Tech Stack

- **Runtime**: React 18 + TypeScript (compiled via SWC)
- **Bundler**: Vite 5 (dev server on port 8080)
- **Styling**: Tailwind CSS 3 with CSS variables
- **UI Kit**: shadcn/ui (default style, no RSC) — components in `src/components/ui/`
- **Animation**: Framer Motion 12 for transitions and micro-interactions
- **3D Effects**: vanilla-tilt for perspective tilt on cards
- **State**: React hooks + `useLocalStorageState` (no external state library)
- **Persistence**: localStorage under key `decision-planner:v1`
- **Routing**: react-router-dom 6 (routes: `/` → Index, `*` → NotFound)
- **Forms**: react-hook-form + zod (available but minimally used)
- **Testing**: Vitest + @testing-library/react + jsdom

## Architecture Overview

### Core Data Model

The app centers around `PlannerItem` (defined in `src/components/planner/types.ts`):

```typescript
type PlannerItem = {
  id: string;
  emoji: string;
  text: string;
  priority: number;    // 1-10
  desire: number;      // 0-10
  difficulty: number;  // 1-10
  percent: number;     // 0-100
};
```

### Scoring Algorithm

The prioritization score is computed by `scoreOf()` in `src/components/planner/scoring.ts`:

```typescript
score = priority * 0.93 + desire * 0.69 + ((10 - difficulty) * 0.36)
```

Where:
- Priority gets boosted by incompleteness and low difficulty
- Desire gets boosted by completeness and high difficulty (inverse)
- Difficulty contributes inversely (harder tasks score lower)

**Higher score = do this task first.**

### Project Structure

```
src/
├── main.tsx                   # Entry point
├── App.tsx                    # Root: providers (theme, query, router, toasters)
├── index.css                  # Global styles, Tailwind directives
├── theme.config.ts            # Single source of truth for colors, fonts
│
├── pages/
│   ├── Index.tsx              # Main planner page (task list + scoring table)
│   └── NotFound.tsx           # 404 catch-all
│
├── components/
│   ├── planner/               # Domain-specific components
│   │   ├── types.ts           # PlannerItem type
│   │   ├── scoring.ts         # scoreOf, scoreColor, clampNumber
│   │   ├── PlannerItemForm.tsx
│   │   ├── PlannerItemList.tsx
│   │   ├── PlannerScoringTable.tsx
│   │   ├── ScoreInput.tsx
│   │   ├── ProgressBar.tsx
│   │   └── EmojiPicker.tsx
│   │
│   ├── ui/                    # shadcn/ui primitives (DO NOT edit manually)
│   │
│   ├── ThemeProvider.tsx      # Injects CSS vars from theme.config.ts
│   ├── ThemeToggle.tsx        # Light/dark mode switch
│   └── [various shared components]
│
├── hooks/
│   ├── useLocalStorageState.ts  # Generic localStorage-backed state
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── lib/
│   ├── utils.ts               # cn() — clsx + tailwind-merge
│   ├── themeGenerator.ts      # Converts HEX → CSS vars at runtime
│   ├── hexToHsl.ts
│   └── hexToRgb.ts
│
└── test/
    ├── setup.ts
    └── example.test.ts
```

### State Management & Persistence

- All app state is managed via React hooks (no Redux/Zustand)
- Data persistence uses `useLocalStorageState` hook with localStorage key: `decision-planner:v1`
- Export/import uses `.tsk` files (JSON format): `{ version, exportedAt, items }`

## Development Conventions

### Language

- **UI text must be in Russian** (all user-facing labels, placeholders, messages)
- **Code, comments, and variable names must be in English**

### Path Aliases

- Use `@/*` imports (maps to `./src/*`) instead of relative paths across directories
- Example: `import { Button } from "@/components/ui/button"` NOT `../../components/ui/button`

### Styling

- Use **Tailwind utility classes** as primary styling method
- Colors reference CSS variables via `hsl(var(--token))` — never hardcode color values
- Custom tokens defined in `tailwind.config.ts`:
  - Colors: `buttonOutline`, `primaryBorder`
  - Fonts: `font-heading`, `font-body`, `font-numbers`, `font-sans`, `font-serif`, `font-mono`
  - Shadows: `shadow-xs`, `shadow-soft`, `shadow-elev`
- Border radius uses `--radius` CSS variable (default `3rem`)
- `.paper` class for card-like surfaces
- `.no-elevate` class opts out of global button lift/shadow effects
- **Responsive UI Scaling**: The base UI scale is `125%` for screen widths `1024px` and above (FHD and larger for optimal visual experience). For screen widths below `1024px`, the base UI scale reverts to `100%` to ensure better layout fit on narrower desktop displays. This is controlled via a media query in `src/index.css` modifying the `:root` `font-size`.

### Theming

- All theme colors defined in `src/theme.config.ts` as **HEX values**
- `ThemeProvider` converts them to HSL CSS variables at runtime
- **To change colors, edit `theme.config.ts`** — do NOT modify `index.css` color variables directly
- Dark mode toggled via `next-themes` with `class` attribute strategy

### Components

- **shadcn/ui components** (`src/components/ui/`) should NOT be manually edited
  - Use shadcn CLI to add/update: `npx shadcn@latest add <component>`
- **Domain components** live in `src/components/planner/`
- **Shared/layout components** live directly in `src/components/`
- Use `cn()` from `@/lib/utils` for conditional class merging

### Animation

- Use **Framer Motion** for layout animations, enter/exit transitions, micro-interactions
- 3D perspective effects use `transformStyle: "preserve-3d"` and `translateZ()` for depth layering
- `TiltCard` wraps vanilla-tilt.js for card tilt effects
- `ScoreInput` has squash-stretch animation on mouse wheel interaction

### Testing

- Tests use **Vitest** with **jsdom** environment and **@testing-library/react**
- Test files go in `src/test/` or colocated as `*.test.ts` / `*.spec.ts`
- Setup file: `src/test/setup.ts`
- Vitest config includes global test utilities and path aliases

## Key Implementation Details

### Scoring Table Behavior

The scoring table (`PlannerScoringTable.tsx`) is designed to prevent horizontal content overlap on narrower screens while preserving its 3D parallax effects. This is achieved by:
- Defining grid columns with `minmax(280px, 1fr)` for the task name column, ensuring it always has sufficient width.
- Applying `flex-shrink-0` to critical inner elements (emoji, `ProgressBar`) within the task name column to prevent them from shrinking.
Row order is **frozen** to prevent rows from "jumping" while the user is typing. This is controlled by the `tableEditing` state in `Index.tsx`.

### File Import/Export

- Uses modern File System Access API when available (Chromium-based browsers) for "Save As" dialog
- Falls back to standard download link for other browsers
- Import accepts `.tsk` or `.json` files

### Typography

Custom fonts are loaded via `theme.config.ts`:
- **Heading**: Gropled (weight: 600)
- **Body**: Montserrat (weight: 500)
- **Numbers**: Neutral Face (weight: 500)

### Background Animation

Mesh gradients for animated background are defined in `theme.config.ts` under `meshGradients` (separate configs for light/dark modes).

## TypeScript Configuration

- Path aliases: `@/*` → `./src/*`
- Relaxed strictness: `noImplicitAny: false`, `strictNullChecks: false`, `noUnusedLocals: false` (Note: Efforts are made to use explicit types where possible, as demonstrated by fixes for `@typescript-eslint/no-explicit-any` and `@typescript-eslint/no-empty-object-type` in core UI components).
- Composite project with separate app and node configs

## Common Pitfalls

1. **Never hardcode colors** — always use CSS variables via Tailwind tokens
2. **Do not edit shadcn/ui components** — regenerate them via CLI if needed
3. **Keep table editing state in sync** to prevent row reordering during input
4. **Use `@/` imports** for cross-directory imports (not relative paths like `../../`)
5. **All user-facing text must be in Russian** — check strings in JSX
6. **If task is not simple and clean - do requirements first, then work.