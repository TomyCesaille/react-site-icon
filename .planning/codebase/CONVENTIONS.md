# Coding Conventions

**Analysis Date:** 2026-04-19

## Naming Patterns

**Files:**
- PascalCase for React components: `src/SiteIcon.tsx`
- PascalCase for test files matching component: `src/SiteIcon.test.tsx`
- camelCase for non-component modules: `src/index.ts`
- Config files use lowercase with dots: `vitest.config.ts`, `tsup.config.ts`, `eslint.config.mjs`

**Functions:**
- camelCase for all functions: `normalizeDomain`, `buildUrl`, `handleLoad`, `handleError`, `checkComplete`
- PascalCase for React components only: `SiteIcon`, `Playground`, `App`
- Event handlers prefixed with `handle`: `handleLoad`, `handleError`
- Ref callbacks describe purpose: `checkComplete`

**Variables:**
- camelCase for all variables: `normalizedDomain`, `fetchSize`, `prevDomain`
- UPPER_SNAKE_CASE for constants: `GOOGLE_GLOBE_SIZE`, `DETECTION_MIN_FETCH_SIZE`, `CDN_HOST`, `DEFAULT_DOMAINS`

**Types:**
- PascalCase for all types and interfaces: `SiteIconProps`, `SiteIconSize`
- Suffix `Props` for component prop types: `SiteIconProps`
- Use `type` for unions/aliases, `interface` for object shapes with `extends`

## Code Style

**Formatting (Prettier):**
- Config: `.prettierrc`
- Single quotes: `true`
- Trailing commas: `all`
- Print width: `80`
- Tab width: `2`
- Semicolons: `true`

**Linting (ESLint 10):**
- Config: `eslint.config.mjs` (flat config format)
- Base: `@eslint/js` recommended + `typescript-eslint` strict + stylistic type-checked
- React: `eslint-plugin-react` (flat recommended + jsx-runtime) + `eslint-plugin-react-hooks`
- Prettier compat: `eslint-config-prettier` (disables conflicting rules)
- Test file relaxations in `**/*.test.{ts,tsx}`:
  - `@typescript-eslint/no-non-null-assertion`: off (allows `!` in tests)
  - `@typescript-eslint/no-unsafe-call`: off
  - `@typescript-eslint/no-unsafe-member-access`: off
  - `@typescript-eslint/no-unsafe-assignment`: off
- Ignores: `dist/`, `node_modules/`, `*.config.*`, `vitest.setup.ts`, `examples/`

**TypeScript:**
- Config: `tsconfig.json`
- Strict mode: `true`
- Target: `ES2020`
- Module: `ESNext` with `bundler` resolution
- JSX: `react-jsx` (automatic runtime, no `import React`)
- `isolatedModules`: `true`
- `forceConsistentCasingInFileNames`: `true`

## Import Organization

**Order:**
1. React imports (named imports from `'react'`): `import { forwardRef, useCallback, ... } from 'react';`
2. Third-party libraries (when applicable)
3. Local project imports: `import { SiteIcon } from './SiteIcon';`

**Style:**
- Use named imports, not default imports (except for ESLint config plugins)
- Destructure React hooks and types in a single import statement
- Use `type` keyword for type-only imports: `import type { ... }` or inline `type` in mixed imports: `type ComponentPropsWithoutRef`
- No path aliases configured; use relative imports (`./SiteIcon`)

**Barrel Exports:**
- `src/index.ts` is the single barrel file: re-exports component and types
- Export both the component and its types: `export { SiteIcon }` and `export type { SiteIconProps, SiteIconSize }`

## Error Handling

**Component-Level:**
- Graceful degradation: render `fallback` content on any error
- Image load errors caught via `onError` handler, set status to `'missing'`
- Invalid domains passed through to CDN (let CDN handle it, detect globe fallback)
- Empty/whitespace domains caught early via `normalizeDomain` returning `''`

**Domain Normalization:**
- `try/catch` wrapping `new URL()` for invalid input: falls back to trimmed string
- Pattern: attempt parse, catch silently, use reasonable default

**No throw patterns:** The library never throws. All error states result in rendering the fallback.

**Stale Request Handling:**
- Domain ref (`domainRef`) compared against current `normalizedDomain` in event handlers
- Stale loads/errors silently ignored with early `return`

## Logging

**Framework:** None. No `console.log`, `console.warn`, or `console.error` calls in library source.

**Rationale:** This is a lightweight library (< 1KB). Consumers handle their own logging. Do not add console output.

## Comments

**When to Comment:**
- JSDoc on exported types and interfaces for IDE documentation
- JSDoc on each prop in the `SiteIconProps` interface
- Inline comments for non-obvious React patterns (e.g., "React-approved adjust state during render pattern")
- Inline comments for workarounds (e.g., "Request 24px when size is exactly 16 so detection can distinguish...")
- Section comments in test files with `// ===== SECTION NAME =====`

**JSDoc Style:**
- Single-line `/** ... */` for prop descriptions
- No `@param` or `@returns` tags on component props; use the `/** */` directly above the field

**Example from `src/SiteIcon.tsx`:**
```typescript
/** Supported favicon sizes from Google's faviconV2 CDN. */
export type SiteIconSize = 12 | 16 | 24 | ...;

export interface SiteIconProps extends Omit<...> {
  /** Domain to fetch the favicon for (e.g. "github.com" or "https://github.com/user/repo") */
  domain: string;
  /** Requested favicon size in pixels. ... (default: 32) */
  size?: SiteIconSize;
}
```

## Function Design

**Size:** Functions are short. The main component is ~140 lines including all strategies. Helper functions (`normalizeDomain`, `buildUrl`) are 1-5 lines.

**Parameters:**
- Component props destructured in function signature with defaults: `{ domain, size = 32, fallback = null, strategy = 'lazy', onResolved, ...rest }`
- Rest props spread onto the underlying element: `{...rest}`

**Return Values:**
- Component returns JSX directly
- Helper functions return primitives (string)
- Event handlers return `void`

## Component Design

**Pattern:** `forwardRef` with named function (not arrow function):
```typescript
const SiteIcon = forwardRef<HTMLImageElement, SiteIconProps>(function SiteIcon(
  { domain, size = 32, fallback = null, strategy = 'lazy', onResolved, ...rest },
  ref,
) { ... });
```

**State Machine:** Three-state model: `'loading' | 'found' | 'missing'`. Render logic uses early returns by status, then `switch` for strategy variants.

**Ref Handling:**
- `useRef` for mutable values not triggering re-render: `domainRef`, `statusRef`, `onResolvedRef`
- `useCallback` for ref callbacks: `checkComplete`
- Forwarded ref merged manually in eager strategy via combined ref callback

**Props Spreading:**
- `ComponentPropsWithoutRef<'img'>` as base, `Omit` controlled props
- `{...rest}` spread onto visible `<img>` in found state only

## Module Design

**Exports:**
- Named exports only: `export { SiteIcon }` (no default exports)
- Types exported separately: `export type { SiteIconProps, SiteIconSize }`
- Single entry point: `src/index.ts`

**Build Output:**
- `"use client"` banner prepended via tsup `esbuildOptions` for RSC compatibility
- Dual ESM + CJS with separate `.d.ts` / `.d.cts` declarations
- `"sideEffects": false` in `package.json` for tree-shaking

## Git Hooks

**Pre-commit (Husky + lint-staged):**
- `.husky/pre-commit` runs `npx lint-staged`
- `lint-staged` config in `package.json`:
  - `*.{ts,tsx}`: `eslint --fix` then `prettier --write`
  - `*.{json,md,yml,yaml}`: `prettier --write`

## CI Quality Gates

**Workflow:** `.github/workflows/ci.yml` runs on PR and push to main:
1. `npm run lint` (ESLint)
2. `npm run typecheck` (tsc --noEmit)
3. `npm run test` (Vitest)
4. `npm run test:exports` (Are The Types Wrong)
5. `npm run format:check` (Prettier)
6. `npm run build` (tsup)
7. Bundle size check: gzipped `dist/index.js` must be <= 1024 bytes

---

*Convention analysis: 2026-04-19*
