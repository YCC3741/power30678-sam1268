# Repository Guidelines

## Project Structure & Module Organization
- App entry: `index.html`, `src/main.tsx`; Vite config in `vite.config.ts`.
- Source code: `src/` (components, hooks, effects, types, styles).
  - Components: `src/components/` (PascalCase files, e.g., `VideoPlayer.tsx`).
  - Hooks: `src/hooks/` (camelCase `useX` files, e.g., `useKeyboard.ts`).
  - Types: `src/types/` and effects in `src/effects/`.
  - Global styles: `src/index.css`.
- Static assets: `public/` (served at `/`). Prefer `public/assets/images` and `public/assets/sounds` for new media.

## Build, Test, and Development Commands
- `npm install` – install dependencies.
- `npm run dev` – start Vite dev server with HMR at `http://localhost:5173` (default).
- `npm run build` – type-check (`tsc -b`) and produce a production build (`dist/`).
- `npm run preview` – locally preview the production build.

## Coding Style & Naming Conventions
- TypeScript + React functional components; prefer hooks and composition.
- Indentation: 2 spaces; single quotes; semicolons required.
- Filenames: Components `PascalCase.tsx`, hooks `useCamelCase.ts`, types `camelCase.ts`.
- Props and local variables: `camelCase`; exported types/interfaces: `PascalCase`.
- Keep styles in `src/index.css` (or component-level CSS if added later). Avoid inline styles unless trivial.
- Asset paths use Vite static serving: e.g., `src="/assets/images/MC.png"` or audio `src="/assets/sounds/MC.mp3"`.

## Testing Guidelines
- No test suite is configured yet. If adding tests, use Vitest + React Testing Library.
  - Place tests alongside sources as `*.test.tsx` or in `src/__tests__/`.
  - Aim for fast unit tests around hooks and components.

## Commit & Pull Request Guidelines
- Commits: concise, present tense. Conventional Commits encouraged (e.g., `feat: add memory game`).
- PRs: include a clear description, reproduction steps, screenshots/screencasts for UI changes, and linked issues.
- Keep PRs focused and small; note any asset additions (filenames, sizes).

## Security & Configuration Tips
- Do not commit secrets. Vite env vars must be prefixed with `VITE_` (e.g., `.env.local`).
- Optimize media (compress images/audio/video) to keep load times reasonable.

## Agent-Specific Instructions
- Preserve existing filenames (including non‑ASCII) and public paths; avoid renames.
- When adding assets, place them under `public/assets/` and reference with absolute paths.
- Match existing patterns in `src/components/` and `src/hooks/` when adding code.
