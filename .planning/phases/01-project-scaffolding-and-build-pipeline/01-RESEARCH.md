# Phase 1: Project Scaffolding and Build Pipeline - Research

**Researched:** 2026-04-12
**Domain:** TypeScript React library build pipeline, quality tooling, npm packaging
**Confidence:** HIGH

## Summary

Phase 1 scaffolds a greenfield React component library (`react-site-icon`) from scratch. The core deliverable is a working build pipeline producing correct dual ESM+CJS output with TypeScript declarations, a `"use client"` banner, and quality tooling (ESLint, Prettier, Husky, Changesets). A skeleton `SiteIcon` component validates the pipeline end-to-end.

The standard stack is well-established and fully documented in CLAUDE.md. All package versions have been verified against the npm registry and are current. The primary risk is an ESLint 10 peer dependency gap: `eslint-plugin-react@7.37.5` and `eslint-plugin-react-hooks@7.0.1` do not yet declare ESLint 10 support in their peerDependencies, requiring an npm `overrides` workaround during installation. Everything else is straightforward.

**Primary recommendation:** Follow CLAUDE.md stack exactly, use `esbuildOptions` (not top-level `banner`) for the `"use client"` directive in tsup, and add npm `overrides` for the ESLint plugin peer dependency gap.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Include a minimal skeleton SiteIcon component (domain prop, renders `<img>` with Google faviconV2 URL, no detection logic) to validate the full build pipeline -- JSX compilation, React externalization, type exports (.d.ts), "use client" banner, and realistic bundle size measurement.
- **D-02:** Co-located test files next to source (`src/SiteIcon.test.tsx` beside `src/SiteIcon.tsx`). Modern convention, vitest auto-discovers. This sets the project convention for Phase 3.
- **D-03:** Use `typescript-eslint` strict + type-checked rules (`tseslint.configs.strictTypeChecked`). Catches unsafe any, floating promises, unnecessary assertions. Appropriate strictness for a library shipping to npm.

### Claude's Discretion
- tsup configuration details (entry, format, dts, banner injection)
- TypeScript tsconfig.json specifics (target, module, moduleResolution)
- Prettier configuration (defaults are fine)
- Husky + lint-staged setup mechanics
- Changesets configuration (public access, commit conventions)
- package.json exports field structure (types-first ordering)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BUILD-01 | TypeScript strict mode with shipped .d.ts declarations via tsup | tsup `dts: true` generates .d.ts and .d.cts; tsconfig strict mode verified |
| BUILD-02 | Dual ESM + CJS output via tsup (.js + .cjs) | tsup `format: ['esm', 'cjs']` with `"type": "module"` produces index.js (ESM) + index.cjs (CJS) |
| BUILD-03 | "use client" banner injected in build output for RSC compatibility | `esbuildOptions` banner approach verified via react-wrap-balancer pattern |
| BUILD-04 | Correct `exports` field with `types` condition first | Verified types-first ordering pattern from multiple official sources |
| BUILD-05 | React and react-dom externalized as peer dependencies | tsup `external: ['react', 'react-dom']` verified |
| BUILD-06 | `"files": ["dist"]` -- only dist published to npm | Standard package.json configuration |
| BUILD-07 | Bundle size under 1KB minified+gzipped | Skeleton component is ~10 lines; tsup minify ensures this |
| BUILD-08 | React 17, 18, 19 as peer dependencies | peerDependencies range `"^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0"` verified |
| TOOL-01 | ESLint 10 flat config with typescript-eslint | Verified; peer dep gap with react plugins requires overrides workaround |
| TOOL-02 | Prettier formatting configuration | Prettier 3.8.2 verified; defaults sufficient |
| TOOL-03 | Husky + lint-staged pre-commit hooks | Husky 9.1.7 with `npx husky init`, lint-staged 16.4.0 verified |
| TOOL-04 | Changesets for versioning and changelog generation | @changesets/cli 2.30.0 with changelog-github 0.6.0 verified |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard | Confidence |
|---------|---------|---------|--------------|------------|
| TypeScript | ^5.7 (install 5.9.3) | Type safety + shipped .d.ts | CLAUDE.md locked decision. Pin to 5.x -- TS 6.0 is too new. typescript-eslint supports `<6.1.0`. | HIGH |
| tsup | ^8.5.1 | Bundle ESM + CJS + .d.ts | CLAUDE.md locked decision. Battle-tested, single entry point, < 1s builds. | HIGH |
| React | ^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0 | Peer dependency | Library must support all three React majors. | HIGH |

[VERIFIED: npm registry] -- all versions confirmed 2026-04-12.

### Quality Tooling

| Library | Version | Purpose | Why Standard | Confidence |
|---------|---------|---------|--------------|------------|
| ESLint | ^10.2.0 | Linting | CLAUDE.md locked. Flat config only (no legacy .eslintrc). | HIGH |
| typescript-eslint | ^8.58.1 | TS linting | Supports ESLint 10 (`^10.0.0` in peerDeps). Unified package. | HIGH |
| eslint-plugin-react | ^7.37.5 | React rules | Flat config exports: `flat.recommended`, `flat['jsx-runtime']`. | HIGH |
| eslint-plugin-react-hooks | ^7.0.1 | Hooks rules | Rules of Hooks enforcement. | HIGH |
| eslint-config-prettier | ^10.1.8 | Prettier compat | Disables conflicting rules. peerDep `>=7.0.0` -- supports ESLint 10. | HIGH |
| globals | ^17.5.0 | ESLint globals | Required for flat config browser/node environments. | HIGH |
| Prettier | ^3.8.2 | Formatting | No-config-debate formatter. Defaults are fine per CONTEXT.md. | HIGH |
| Husky | ^9.1.7 | Git hooks | `npx husky init` creates .husky/ and prepare script. | HIGH |
| lint-staged | ^16.4.0 | Staged linting | Runs lint+format on staged files only (1-2s). | HIGH |

[VERIFIED: npm registry] -- all versions confirmed 2026-04-12.

### Versioning

| Library | Version | Purpose | Why Standard | Confidence |
|---------|---------|---------|--------------|------------|
| @changesets/cli | ^2.30.0 | Version management | Standard for OSS npm libraries. Explicit control over bumps. | HIGH |
| @changesets/changelog-github | ^0.6.0 | Changelog format | Links PRs and contributors in CHANGELOG.md. | HIGH |

[VERIFIED: npm registry] -- all versions confirmed 2026-04-12.

### Dev Dependencies (types)

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| @types/react | ^19.2.14 | React type definitions (dev only) | HIGH |
| @types/react-dom | ^19.2.3 | ReactDOM type definitions (dev only) | HIGH |

[VERIFIED: npm registry] -- confirmed 2026-04-12. Note: @types/react-dom is 19.2.3, not 19.2.0 as in CLAUDE.md (minor patch).

### Testing (installed now, used Phase 3)

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| vitest | ^4.1.4 | Test runner | HIGH |
| @testing-library/react | ^16.3.2 | Component rendering | HIGH |
| @testing-library/jest-dom | ^6.9.1 | DOM matchers | HIGH |
| @testing-library/user-event | ^14.6.1 | User interaction | HIGH |
| jsdom | ^29.0.2 | Browser environment | HIGH |

[VERIFIED: npm registry] -- all versions confirmed 2026-04-12.

**Installation (all dev dependencies):**
```bash
npm install --save-dev typescript tsup \
  react react-dom @types/react @types/react-dom \
  vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom \
  eslint typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-config-prettier globals \
  prettier husky lint-staged \
  @changesets/cli @changesets/changelog-github
```

Note: `react` and `react-dom` are listed as both devDependencies (for local development/testing) and peerDependencies (for consumers). They must NOT be in `dependencies`.

## Architecture Patterns

### Recommended Project Structure
```
react-site-icon/
  src/
    SiteIcon.tsx          # Skeleton component (domain prop, renders <img>)
    SiteIcon.test.tsx     # Co-located test file (D-02)
    index.ts              # Re-export: export { SiteIcon } from './SiteIcon'
                          #            export type { SiteIconProps } from './SiteIcon'
  dist/                   # Build output (gitignored)
    index.js              # ESM output
    index.cjs             # CJS output
    index.d.ts            # ESM type declarations
    index.d.cts           # CJS type declarations
  .changeset/
    config.json           # Changesets config
  .husky/
    pre-commit            # Runs lint-staged
  tsup.config.ts          # Build configuration
  tsconfig.json           # TypeScript configuration
  eslint.config.mjs       # ESLint flat config
  .prettierrc             # Prettier config (or use defaults)
  .prettierignore         # Ignore dist/, coverage/, etc.
  .gitignore              # Standard Node gitignore + dist/
  .nvmrc                  # Pin Node version for contributors
  package.json            # Dual ESM+CJS exports, peer deps
  LICENSE                 # MIT
```

### Pattern 1: tsup Configuration for React Library

**What:** tsup config producing dual ESM+CJS with "use client" banner and React externalization.
**When to use:** This exact configuration for the library build.

```typescript
// tsup.config.ts
// Source: react-wrap-balancer pattern (verified), adapted for this project
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: true,
  target: 'es2020',
  external: ['react', 'react-dom'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    };
  },
});
```

[CITED: github.com/shuding/react-wrap-balancer/blob/main/tsup.config.ts] -- verified pattern, adapted.

**Key decisions:**
- `esbuildOptions` for banner (not top-level `banner`) -- avoids quirky behavior with DTS files [CITED: github.com/egoist/tsup/issues/1106]
- `external: ['react', 'react-dom']` -- ensures React is not bundled
- `minify: true` -- essential for < 1KB target (BUILD-07)
- `target: 'es2020'` -- broad browser compatibility while allowing modern features

### Pattern 2: package.json exports Field

**What:** Correct dual-format exports with types-first ordering.
**When to use:** The exact package.json configuration for npm publishing.

```json
{
  "name": "react-site-icon",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "peerDependencies": {
    "react": "^17.0.0 || ^18.0.0 || ^19.0.0",
    "react-dom": "^17.0.0 || ^18.0.0 || ^19.0.0"
  }
}
```

[CITED: johnnyreilly.com/dual-publishing-esm-cjs-modules-with-tsup-and-are-the-types-wrong] -- verified pattern.

**Critical ordering:** `types` MUST come before `default` in each condition object. TypeScript resolves conditions in order and stops at the first match.

### Pattern 3: TypeScript Configuration

**What:** tsconfig.json for a React component library built with tsup.
**When to use:** The exact TypeScript configuration.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "noEmit": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.tsx", "**/*.test.ts"]
}
```

[ASSUMED] -- standard configuration for tsup-based React libraries. tsup handles the actual build; TypeScript is used for type-checking only (`noEmit: true`). tsup generates declarations via its own DTS pipeline.

**Key decisions:**
- `noEmit: true` -- tsup handles compilation and DTS generation, not tsc
- `moduleResolution: "bundler"` -- modern resolution for libraries using ESM
- `jsx: "react-jsx"` -- React 17+ automatic JSX transform (no `import React`)
- `isolatedModules: true` -- required by esbuild (which tsup uses)
- `strict: true` -- per BUILD-01

### Pattern 4: ESLint 10 Flat Config with strictTypeChecked

**What:** ESLint flat config with typescript-eslint strict type-checked rules + React plugins.
**When to use:** The exact ESLint configuration.

```javascript
// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ...reactPlugin.configs.flat.recommended,
    ...reactPlugin.configs.flat['jsx-runtime'],
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  eslintConfigPrettier,
  {
    ignores: ['dist/', 'node_modules/', '*.config.*'],
  },
);
```

[CITED: typescript-eslint.io/users/configs/ -- strictTypeChecked pattern]
[CITED: github.com/jsx-eslint/eslint-plugin-react -- flat config exports]
[ASSUMED] -- combined config structure based on official documentation patterns.

**Key decisions:**
- `tseslint.config()` is the recommended helper for flat config (handles array merging) [CITED: typescript-eslint.io/packages/typescript-eslint/]
- `projectService: true` enables type-aware rules without explicit tsconfig paths [CITED: typescript-eslint.io/getting-started/typed-linting/]
- React plugins use flat config exports (`flat.recommended`, `flat['jsx-runtime']`)
- `eslintConfigPrettier` placed last to override conflicting rules
- `ignores` for dist and config files

### Pattern 5: Changesets Configuration

**What:** `.changeset/config.json` for a public npm library with GitHub changelog.

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.5/schema.json",
  "changelog": ["@changesets/changelog-github", { "repo": "OWNER/react-site-icon" }],
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

[CITED: github.com/changesets/changesets/blob/main/docs/config-file-options.md] -- verified config structure.

**Key decisions:**
- `"access": "public"` -- required for public npm packages (default is `"restricted"`)
- `"changelog": ["@changesets/changelog-github", ...]` -- links PRs and contributors
- `"commit": false` -- changesets does not auto-commit version bumps (CI handles this)
- Replace `OWNER` with the actual GitHub username/org

### Anti-Patterns to Avoid

- **Top-level `banner` in tsup config:** Use `esbuildOptions` callback instead. The top-level banner option can have quirky interactions with DTS generation. [CITED: github.com/egoist/tsup/issues/1106]
- **`crossOrigin` on img tags:** Google's CDN does not send CORS headers; adding it breaks requests. [CITED: ReactThirdPartyDomainFavicon.md]
- **React in `dependencies`:** Must be `peerDependencies` only (plus `devDependencies` for local dev). Bundling React would bloat the package. [VERIFIED: standard npm library practice]
- **`"type": "commonjs"` or omitting `"type"`:** Must use `"type": "module"` for ESM-first output with `.cjs` extension for CommonJS fallback. [CITED: CLAUDE.md]
- **Separate `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin`:** Use unified `typescript-eslint` package instead. [CITED: CLAUDE.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TypeScript declarations | Manual .d.ts authoring | tsup `dts: true` | tsup generates .d.ts and .d.cts automatically from source |
| ESM+CJS dual output | Manual Rollup/esbuild config | tsup `format: ['esm', 'cjs']` | tsup handles extensions, output paths, and module system differences |
| Pre-commit hooks | Manual .git/hooks scripts | Husky + lint-staged | Husky sets `core.hooksPath`, works across machines; lint-staged scopes to staged files |
| Version management | Manual version bumps + CHANGELOG | Changesets | Changesets tracks changes atomically, generates CHANGELOG, creates version PRs |
| ESLint type-checking | Manual TSC + ESLint piping | typescript-eslint `projectService` | `projectService: true` connects ESLint to TS compiler automatically |

## Common Pitfalls

### Pitfall 1: ESLint 10 Peer Dependency Gap with React Plugins
**What goes wrong:** `npm install` fails with ERESOLVE when installing `eslint-plugin-react@7.37.5` and `eslint-plugin-react-hooks@7.0.1` alongside ESLint 10, because neither plugin declares ESLint 10 in their peerDependencies.
**Why it happens:** `eslint-plugin-react` peerDep is `eslint ^3 || ^4 || ... || ^9.7`. `eslint-plugin-react-hooks` peerDep is `eslint ^3-9`. Neither has released a version with `^10` support yet (as of 2026-04-12). PRs exist but are not merged/published.
**How to avoid:** Add npm `overrides` in package.json:
```json
{
  "overrides": {
    "eslint-plugin-react": {
      "eslint": "$eslint"
    },
    "eslint-plugin-react-hooks": {
      "eslint": "$eslint"
    }
  }
}
```
The `$eslint` reference tells npm to use whatever version of eslint is in the project's own dependencies.
**Warning signs:** `ERESOLVE unable to resolve dependency tree` during `npm install`.

[VERIFIED: npm registry peerDependencies check] -- eslint-plugin-react: `eslint ^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9.7`; eslint-plugin-react-hooks: `eslint ^3-9`.
[CITED: github.com/jsx-eslint/eslint-plugin-react/issues/3977, github.com/facebook/react/issues/35758]

### Pitfall 2: "use client" Banner Applied to DTS Files
**What goes wrong:** Using the top-level `banner` option in tsup can inject `"use client"` into `.d.ts` files, which is invalid TypeScript.
**Why it happens:** tsup's top-level `banner` applies to all output files including declarations in some configurations.
**How to avoid:** Use `esbuildOptions` callback instead of top-level `banner`:
```typescript
esbuildOptions(options) {
  options.banner = { js: '"use client"' };
}
```
This only affects JS output, not DTS files.
**Warning signs:** TypeScript errors when consumers import the package; `.d.ts` files starting with `"use client"`.

[CITED: github.com/egoist/tsup/issues/1106]

### Pitfall 3: `types` Condition Ordering in Exports
**What goes wrong:** TypeScript consumers get "Cannot find module" errors even though the package builds correctly.
**Why it happens:** TypeScript resolves export conditions in order and stops at the first match. If `default` comes before `types`, TypeScript resolves to the JS file and can't find type declarations.
**How to avoid:** Always list `types` before `default` in each condition:
```json
"import": {
  "types": "./dist/index.d.ts",
  "default": "./dist/index.js"
}
```
**Warning signs:** `@arethetypeswrong/cli` reports resolution failures.

[CITED: johnnyreilly.com/dual-publishing-esm-cjs-modules-with-tsup-and-are-the-types-wrong]

### Pitfall 4: Missing .d.cts for CJS Consumers
**What goes wrong:** CJS consumers (using `require()`) can't resolve types.
**Why it happens:** When `"type": "module"` is set, TypeScript expects `.d.cts` for `.cjs` files. If tsup only generates `.d.ts`, CJS type resolution fails.
**How to avoid:** tsup `dts: true` with `format: ['esm', 'cjs']` automatically generates both `.d.ts` and `.d.cts`. Verify both exist after build.
**Warning signs:** Types work for ESM consumers but not CJS.

[CITED: johnnyreilly.com/dual-publishing-esm-cjs-modules-with-tsup-and-are-the-types-wrong]

### Pitfall 5: React Listed as Regular Dependency
**What goes wrong:** Consumers end up with two copies of React (theirs and the library's), causing "Invalid hook call" errors.
**Why it happens:** If React is in `dependencies` instead of `peerDependencies`, npm installs it alongside the consumer's React.
**How to avoid:** React and react-dom in `peerDependencies` only. Also add to `devDependencies` for local development. Never add to `dependencies`.
**Warning signs:** Package size > 100KB; "Invalid hook call" in consumer apps.

[VERIFIED: standard npm library practice]

### Pitfall 6: Husky Hooks Not Activating for Other Developers
**What goes wrong:** Pre-commit hooks don't run for developers who clone the repo.
**Why it happens:** Git hooks are not transferred with clone. Husky requires running `npx husky` (via the `prepare` script) after `npm install`.
**How to avoid:** Ensure `"prepare": "husky"` is in package.json scripts. This runs automatically after `npm install`.
**Warning signs:** Commits bypass linting; CI catches what pre-commit should have.

[CITED: typicode.github.io/husky/get-started.html]

## Code Examples

### Skeleton SiteIcon Component (Phase 1)

```typescript
// src/SiteIcon.tsx
// Minimal skeleton to validate build pipeline (D-01)
// Full implementation comes in Phase 2
import type { CSSProperties, ReactNode } from 'react';

export interface SiteIconProps {
  /** Domain to fetch the favicon for (e.g. "github.com") */
  domain: string;
  /** Requested favicon size in pixels */
  size?: number;
  /** Content to render when no favicon is available */
  fallback?: ReactNode;
  /** CSS class for the img element */
  className?: string;
  /** Inline styles for the img element */
  style?: CSSProperties;
  /** Alt text for the favicon image */
  alt?: string;
}

const buildUrl = (domain: string, size: number): string =>
  `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=${size}`;

export function SiteIcon({
  domain,
  size = 32,
  className,
  style,
  alt = '',
}: SiteIconProps): React.JSX.Element {
  return (
    <img
      src={buildUrl(domain, size)}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={style}
    />
  );
}
```

Source: adapted from ReactThirdPartyDomainFavicon.md implementation sketch, stripped to skeleton per D-01.

### Entry Point

```typescript
// src/index.ts
export { SiteIcon } from './SiteIcon';
export type { SiteIconProps } from './SiteIcon';
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

[ASSUMED] -- standard vitest configuration for React component testing with jsdom.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `.eslintrc.json` | `eslint.config.mjs` (flat config) | ESLint 10 (Feb 2026) | Legacy config format removed entirely; flat config is the only option |
| `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin` | `typescript-eslint` unified package | 2024 | Single import, cleaner config |
| `parserOptions.project: './tsconfig.json'` | `parserOptions.projectService: true` | typescript-eslint v8 | Automatic project discovery, faster |
| `moduleResolution: "node"` | `moduleResolution: "bundler"` | TypeScript 5.0 | Correct resolution for bundler-based projects |
| Manual `import React from 'react'` | Automatic JSX transform (`jsx: "react-jsx"`) | React 17 | No need to import React in every file |
| Husky v4 (hooks in package.json) | Husky v9 (`core.hooksPath` + .husky/ dir) | 2023 | Simpler, no package.json hooks field |

**Deprecated/outdated:**
- ESLint legacy `.eslintrc` format: removed in ESLint 10 [CITED: eslint.org/blog/2026/02/eslint-v10.0.0-released/]
- `@typescript-eslint/parser` as separate install: replaced by `typescript-eslint` unified package [VERIFIED: npm registry]
- TypeScript `moduleResolution: "node"`: replaced by `"bundler"` for libraries built with modern bundlers [ASSUMED]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | tsconfig with `noEmit: true` is correct when tsup handles compilation | Architecture Patterns, Pattern 3 | tsup might need tsc to pre-compile; would need to change tsconfig |
| A2 | `moduleResolution: "bundler"` is correct for a library consumed by bundlers | Architecture Patterns, Pattern 3 | Could cause resolution issues for consumers using `node` resolution; `"node"` might be safer |
| A3 | vitest.config.ts with `environment: 'jsdom'` and `globals: true` is sufficient | Code Examples | May need additional setup for React 17/18/19 testing compatibility |
| A4 | ESLint flat config combining typescript-eslint + react plugins works without conflicts | Architecture Patterns, Pattern 4 | Plugin interaction might need different merging strategy |

## Open Questions

1. **GitHub repository owner for changesets config**
   - What we know: Changesets changelog-github needs `{ "repo": "OWNER/react-site-icon" }` in config
   - What's unclear: The GitHub username/organization name
   - Recommendation: Use placeholder `OWNER/react-site-icon` and replace during implementation. The repo name is in the project spec.

2. **eslint-plugin-react ESLint 10 runtime compatibility**
   - What we know: Peer dependencies don't declare ESLint 10 support, but a fix PR (#3979) exists. The plugin may work at runtime despite the peer dep mismatch.
   - What's unclear: Whether `eslint-plugin-react@7.37.5` actually runs correctly with ESLint 10 (beyond peer dep declaration)
   - Recommendation: Install with overrides, test during implementation. If runtime errors occur (e.g., `getFilename is not a function`), fall back to `@eslint-react/eslint-plugin` as alternative.

3. **React 17 dev/testing compatibility**
   - What we know: `@testing-library/react@16` requires React 18+. The library itself must support React 17 as a peer dep (BUILD-08).
   - What's unclear: Whether Phase 1 skeleton needs React 17 testing (Phase 3 concern)
   - Recommendation: Install React 19 for development. React 17 compatibility is validated by the build output (no React-19-only APIs in skeleton), not by the test runner.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All tooling | Yes | v25.9.0 | -- |
| npm | Package management | Yes | 11.12.1 | -- |
| git | Version control, Husky | Yes | 2.50.1 | -- |

Node v25.9.0 satisfies all engine requirements:
- ESLint 10: `^20.19.0 || ^22.13.0 || >=24` -- satisfied by `>=24` [VERIFIED: npm registry]
- Vitest 4.1.4: `^20.0.0 || ^22.0.0 || >=24.0.0` -- satisfied by `>=24` [VERIFIED: npm registry]
- tsup 8.5.1: `>=18` -- satisfied [VERIFIED: npm registry]

**Missing dependencies:** None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.4 |
| Config file | `vitest.config.ts` (created in Wave 0) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUILD-01 | TypeScript strict mode + .d.ts generation | smoke | `npx tsc --noEmit && ls dist/index.d.ts` | No -- Wave 0 |
| BUILD-02 | Dual ESM + CJS output | smoke | `ls dist/index.js dist/index.cjs` | No -- Wave 0 |
| BUILD-03 | "use client" banner in ESM output | smoke | `head -1 dist/index.js \| grep '"use client"'` | No -- Wave 0 |
| BUILD-04 | Correct exports field | smoke | `node -e "require('./dist/index.cjs')"` | No -- Wave 0 |
| BUILD-05 | React externalized | smoke | `! grep -q 'createElement' dist/index.js` (React code not in bundle) | No -- Wave 0 |
| BUILD-06 | files field = ["dist"] | manual | Inspect package.json | -- |
| BUILD-07 | Bundle size < 1KB | smoke | `gzip -c dist/index.js \| wc -c` | No -- Wave 0 |
| BUILD-08 | React 17/18/19 peer deps | manual | Inspect package.json peerDependencies | -- |
| TOOL-01 | ESLint runs successfully | smoke | `npx eslint src/` | No -- Wave 0 |
| TOOL-02 | Prettier runs successfully | smoke | `npx prettier --check src/` | No -- Wave 0 |
| TOOL-03 | Husky pre-commit hook exists | manual | `ls .husky/pre-commit` | -- |
| TOOL-04 | Changesets initialized | manual | `ls .changeset/config.json` | -- |

### Sampling Rate
- **Per task commit:** `npm run build && npx tsc --noEmit && npx eslint src/`
- **Per wave merge:** Full build + lint + type-check + verification script
- **Phase gate:** All BUILD-* and TOOL-* smoke tests pass before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- test framework configuration
- [ ] No unit tests needed in this phase (skeleton component tested by build pipeline output)
- [ ] Build verification can be done via shell commands (checking file existence, banner content, bundle size)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A -- UI component library |
| V3 Session Management | No | N/A |
| V4 Access Control | No | N/A |
| V5 Input Validation | No | Domain prop is a string passed to URL construction; no server-side processing |
| V6 Cryptography | No | N/A |

This phase is build tooling and scaffolding. No security controls needed. The component renders an `<img>` tag with a domain prop -- input sanitization (if needed) is a Phase 2 concern.

## Project Constraints (from CLAUDE.md)

- **Bundle size**: < 1KB minified+gzipped
- **Dependencies**: Zero runtime dependencies -- only React as peer dependency
- **React compatibility**: Must work with React 17, 18, and 19
- **License**: MIT
- **Build tooling**: tsup (ESM + CJS), vitest, TypeScript strict
- **Node.js**: Pin to 22.x LTS in CI; `engines` >= 18 in package.json for consumers
- **tsup not tsdown**: CLAUDE.md explicitly states "Use tsup, not tsdown"
- **TypeScript**: Pin to 5.x -- TS 6.0 is too new
- **ESLint**: Version 10 with flat config only

## Sources

### Primary (HIGH confidence)
- npm registry -- all package versions verified via `npm view` (2026-04-12)
- CLAUDE.md -- complete technology stack with exact versions and rationale
- ReactThirdPartyDomainFavicon.md -- project spec with API design and implementation sketch

### Secondary (MEDIUM confidence)
- [typescript-eslint.io/users/configs/](https://typescript-eslint.io/users/configs/) -- strictTypeChecked flat config usage
- [typescript-eslint.io/getting-started/typed-linting/](https://typescript-eslint.io/getting-started/typed-linting/) -- projectService configuration
- [johnnyreilly.com/dual-publishing-esm-cjs-modules-with-tsup-and-are-the-types-wrong](https://johnnyreilly.com/dual-publishing-esm-cjs-modules-with-tsup-and-are-the-types-wrong) -- exports field types-first pattern
- [github.com/shuding/react-wrap-balancer/blob/main/tsup.config.ts](https://github.com/shuding/react-wrap-balancer/blob/main/tsup.config.ts) -- tsup "use client" banner pattern
- [github.com/changesets/changesets/blob/main/docs/config-file-options.md](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md) -- changesets config options
- [typicode.github.io/husky/get-started.html](https://typicode.github.io/husky/get-started.html) -- Husky v9 setup
- [github.com/jsx-eslint/eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) -- flat config exports

### Tertiary (LOW confidence)
- [github.com/jsx-eslint/eslint-plugin-react/issues/3977](https://github.com/jsx-eslint/eslint-plugin-react/issues/3977) -- ESLint 10 compat status (evolving)
- [github.com/facebook/react/issues/35758](https://github.com/facebook/react/issues/35758) -- react-hooks ESLint 10 peerDep issue (unresolved)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified via npm registry, CLAUDE.md provides exhaustive guidance
- Architecture: HIGH -- patterns verified via official docs and battle-tested OSS examples
- Pitfalls: HIGH -- ESLint 10 peer dep issue confirmed via npm registry check; banner issue confirmed via GitHub issues

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (30 days -- stable tooling, but ESLint plugin situation may resolve sooner)
