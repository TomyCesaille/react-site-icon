# Technology Stack

**Analysis Date:** 2026-04-19

## Languages

**Primary:**
- TypeScript ^5.9.3 - All library source (`src/`), config files, tests
- TSX - React component (`src/SiteIcon.tsx`), test file (`src/SiteIcon.test.tsx`)

**Secondary:**
- Astro - Demo site pages and layouts (`docs/src/pages/`, `docs/src/layouts/`)
- CSS - Demo site global styles (`docs/src/styles/global.css`)

## Runtime

**Environment:**
- Node.js 22 (pinned in `.nvmrc`, CI uses `node-version: 22`)
- Browser (library target: ES2020)

**Package Manager:**
- npm (lockfile: `package-lock.json` present)
- No workspaces -- `docs/` is a separate npm project linked via `"react-site-icon": "file:.."`

## Frameworks

**Core:**
- React ^17.0.0 || ^18.0.0 || ^19.0.0 (peer dependency) - The library wraps a single `<img>` element with favicon detection logic
- React ^19.2.5 (dev dependency) - Used for local development and testing

**Testing:**
- Vitest ^4.1.4 - Test runner with jsdom environment
- @testing-library/react ^16.3.2 - Component rendering
- @testing-library/jest-dom ^6.9.1 - DOM assertion matchers (via `vitest.setup.ts`)
- @testing-library/user-event ^14.6.1 - User interaction simulation (installed but not currently used in tests)
- jsdom ^29.0.2 - Browser environment for Vitest

**Build/Dev:**
- tsup ^8.5.1 - Bundles ESM + CJS + .d.ts declarations
- TypeScript ^5.9.3 - Type checking (strict mode, `noEmit: true` -- tsup handles emit)
- concurrently ^9.2.1 - Runs lib watch + docs dev server in parallel (`docs:dev` script)

**Demo Site:**
- Astro ^6.1.5 - Static site generator for demo/landing page
- @astrojs/react ^5.0.3 - React integration for interactive Playground component

## Key Dependencies

**Critical (runtime -- zero):**
- None. The library has zero runtime dependencies. Only `react` and `react-dom` as peer dependencies.

**Dev Dependencies:**
- `@arethetypeswrong/cli` ^0.18.2 - Validates package exports are correct (`npm run test:exports` / `attw --pack .`)
- `@changesets/cli` ^2.30.0 - Version management and CHANGELOG generation
- `@changesets/changelog-github` ^0.6.0 - Links PRs/contributors in CHANGELOG.md

**Quality:**
- ESLint ^10.2.0 - Linting with flat config (`eslint.config.mjs`)
- typescript-eslint ^8.58.1 - TypeScript-aware ESLint rules (strict + stylistic)
- eslint-plugin-react ^7.37.5 - React-specific lint rules
- eslint-plugin-react-hooks ^7.0.1 - Rules of Hooks enforcement
- eslint-config-prettier ^10.1.8 - Disables ESLint rules that conflict with Prettier
- Prettier ^3.8.2 - Code formatting

**Git Hooks:**
- Husky ^9.1.7 - Git hooks via `core.hooksPath`
- lint-staged ^16.4.0 - Runs ESLint + Prettier on staged files only

## Configuration

**TypeScript:**
- Config: `tsconfig.json`
- Target: ES2020, Module: ESNext, JSX: react-jsx
- Strict mode enabled
- `noEmit: true` (tsup handles output)
- Vitest globals types included

**Build (tsup):**
- Config: `tsup.config.ts`
- Entry: `src/index.ts`
- Output formats: ESM (`.js`) + CJS (`.cjs`)
- DTS generation enabled
- Minified with sourcemaps
- Target: ES2020
- External: `react`, `react-dom`
- Banner: `"use client"` directive injected into all JS outputs

**Package Exports:**
- Dual ESM/CJS with separate type declarations (`.d.ts` / `.d.cts`)
- `"type": "module"` (ESM-first)
- `"sideEffects": false` (tree-shakeable)
- `"files": ["dist"]` (only `dist/` shipped to npm)

**Environment Variables:**
- None required. The library has no configuration beyond props.
- `.env` files: not present, not needed

## Build Output

**Bundle sizes (current):**
- `dist/index.js` (ESM): 1,569 bytes raw, 878 bytes gzipped
- `dist/index.cjs` (CJS): 2,178 bytes raw
- `dist/index.d.ts` + `dist/index.d.cts`: Type declarations
- Sourcemaps included (`.js.map`, `.cjs.map`)

**CI enforces < 1KB gzipped** via `ci.yml` bundle size check.

## Platform Requirements

**Development:**
- Node.js 22+ (`.nvmrc`)
- npm (no yarn/pnpm)

**CI:**
- Node 22 for lint/test/build (`ci.yml`, `deploy.yml`)
- Node 24 for release (`release.yml` -- needed for npm OIDC trusted publishing)

**Production (consumers):**
- Any React 17/18/19 project
- No Node.js version restriction on consumers (`"engines"` not set in package.json)
- ES2020 browser target

---

*Stack analysis: 2026-04-19*
