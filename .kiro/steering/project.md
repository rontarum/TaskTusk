---
inclusion: always
---

# TaskTusk — Project Rules

> **Выполняй задачи в верном порядке** — a task prioritization planner that scores items by importance, desire, difficulty, and completion percentage, then ranks them so the user tackles the right task first.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Runtime | **React 18** + **TypeScript** | SWC compiler via `@vitejs/plugin-react-swc` |
| Bundler | **Vite 5** | Dev server on port `8080`, HMR overlay disabled |
| Styling | **Tailwind CSS 3** + CSS variables | `tailwindcss-animate` plugin; dark mode via `class` strategy |
| UI Kit | **shadcn/ui** — default style, no RSC | Components live in `src/components/ui/`; configured in `components.json` |
| Animation | **Framer Motion 12** | Used for layout transitions, squash-stretch micro-interactions, parallax effects |
| 3D Effects | **vanilla-tilt** | `TiltCard` wrapper for perspective tilt on cards |
| State | React `useState` + `useLocalStorageState` hook | No external state library; data persisted to `localStorage` under key `decision-planner:v1` |
| Routing | **react-router-dom 6** | Two routes: `/` — Index, `*` — NotFound |
| Forms | **react-hook-form** + **zod** | Available but currently used minimally |
| Data fetching | **@tanstack/react-query** | `QueryClientProvider` is wired up; no remote API calls yet |
| Theming | **next-themes** + custom `ThemeProvider` | `theme.config.ts` defines HEX palette → auto-converted to HSL at runtime via `themeGenerator.ts` |
| Testing | **Vitest** + **@testing-library/react** + **jsdom** | Tests in `src/test/`; run with `npm test` |
| Linting | **ESLint 9** flat config | `typescript-eslint`, `react-hooks`, `react-refresh` plugins |

---

## Project Structure

```
src/
├── main.tsx                  # Entry point — renders <App />
├── App.tsx                   # Root: providers, router, toasters
├── index.css                 # Global CSS, Tailwind directives
├── theme.config.ts           # Single source of truth for colors, fonts, radius, mesh gradients
├── vite-env.d.ts
│
├── pages/
│   ├── Index.tsx             # Main planner page — task list + scoring table
│   └── NotFound.tsx          # 404 catch-all
│
├── components/
│   ├── planner/              # Domain components
│   │   ├── types.ts          # PlannerItem type definition
│   │   ├── scoring.ts        # scoreOf, scoreColor, clampNumber
│   │   ├── PlannerItemForm.tsx
│   │   ├── PlannerItemList.tsx
│   │   ├── PlannerScoringTable.tsx
│   │   ├── ScoreInput.tsx
│   │   └── EmojiPicker.tsx
│   │
│   ├── ui/                   # shadcn/ui primitives — DO NOT edit manually
│   │
│   ├── demos/                # Visual demo components
│   │
│   ├── ThemeProvider.tsx      # Injects CSS vars from theme.config.ts at runtime
│   ├── ThemeToggle.tsx        # Light/dark mode switch
│   ├── DonateButton.tsx
│   ├── NavLink.tsx
│   ├── ParallaxLogo.tsx
│   └── ParallaxFlower.tsx
│
├── hooks/
│   ├── useLocalStorageState.ts  # Generic localStorage-backed state hook
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── lib/
│   ├── utils.ts              # cn() — clsx + tailwind-merge
│   ├── themeGenerator.ts     # Converts theme.config.ts HEX → CSS vars
│   ├── hexToHsl.ts
│   └── hexToRgb.ts
│
└── test/
    ├── setup.ts
    └── example.test.ts
```

---

## Domain Model

The core entity is [`PlannerItem`](src/components/planner/types.ts):

```ts
type PlannerItem = {
  id: string;
  emoji: string;
  text: string;
  priority: number;    // 1–10
  desire: number;      // 0–10
  difficulty: number;  // 1–10
  percent: number;     // 0–100
};
```

### Scoring Formula

Defined in [`scoreOf()`](src/components/planner/scoring.ts:8):

```
p = priority + priority × (1 - percent/100) + priority × (difficulty / 10)
d = desire   + desire × (percent/100)       + desire × ((10 - difficulty) / 10)
score = p × 0.93 + d × 0.69 + (10 - difficulty) × 0.36
```

Higher score = do this task first.

---

## Key Conventions

### Language

- **UI text is in Russian.** All user-facing strings, labels, and placeholders must be in Russian.
- **Code, comments, and variable names are in English.**

### Path Aliases

- `@/*` maps to `./src/*` — always use `@/` imports instead of relative paths when importing across directories.

### Styling

- Use **Tailwind utility classes** as the primary styling method.
- Colors reference CSS variables via `hsl(var(--token))` pattern — never hardcode color values in components.
- Custom color tokens: `buttonOutline`, `primaryBorder` — defined in `tailwind.config.ts`.
- Custom font families: `font-heading`, `font-body`, `font-numbers`, `font-sans`, `font-serif`, `font-mono`.
- Custom shadows: `shadow-xs`, `shadow-soft`, `shadow-elev`.
- Border radius uses `--radius` CSS variable — default `3rem`.
- The `paper` CSS class is used for card-like surfaces.
- The `no-elevate` class opts a button out of global lift/shadow effects.

### Theming

- All theme colors are defined in [`theme.config.ts`](src/theme.config.ts) as HEX values.
- [`ThemeProvider`](src/components/ThemeProvider.tsx) converts them to HSL CSS variables at runtime.
- To change colors, edit `theme.config.ts` — do NOT modify `index.css` color variables directly.
- Dark mode is toggled via `next-themes` with `class` attribute strategy.

### Components

- **shadcn/ui components** in `src/components/ui/` should not be manually edited. Use the shadcn CLI to add or update them.
- **Domain components** live in `src/components/planner/`.
- **Shared/layout components** live directly in `src/components/`.
- Use `cn()` from `@/lib/utils` for conditional class merging.

### State Management

- App state is managed with React hooks — no Redux, Zustand, or similar.
- Persistence uses [`useLocalStorageState`](src/hooks/useLocalStorageState.ts) hook with key `decision-planner:v1`.
- Export/import uses `.tsk` files — JSON format with `{ version, exportedAt, items }` structure.

### Animation

- Use **Framer Motion** for layout animations, enter/exit transitions, and micro-interactions.
- 3D perspective effects use `transformStyle: "preserve-3d"` and `translateZ()` for depth layering.
- `TiltCard` wraps vanilla-tilt.js for card tilt effects.
- `ScoreInput` has squash-stretch animation on mouse wheel interaction.

### Testing

- Tests use **Vitest** with **jsdom** environment and **@testing-library/react**.
- Test files go in `src/test/` or colocated as `*.test.ts` / `*.spec.ts`.
- Run tests: `npm test` — run in watch mode: `npm run test:watch`.

### Build & Dev

- `npm run dev` — start dev server on port 8080
- `npm run build` — production build
- `npm run build:dev` — development build
- `npm run lint` — ESLint check
- `npm run preview` — preview production build

### TypeScript

- Strict null checks are **disabled** (`strictNullChecks: false`).
- Implicit any is **allowed** (`noImplicitAny: false`).
- Unused variables/parameters are **not flagged** as errors.

---

## File Export Format

`.tsk` files are JSON:

```json
{
  "version": 1,
  "exportedAt": "2026-02-08T13:00:00.000Z",
  "items": [
    {
      "id": "uuid",
      "emoji": "❤️",
      "text": "Task name",
      "priority": 5,
      "desire": 5,
      "difficulty": 5,
      "percent": 0
    }
  ]
}
```
