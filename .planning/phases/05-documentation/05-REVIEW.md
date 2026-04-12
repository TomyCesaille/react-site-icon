---
phase: 05-documentation
reviewed: 2026-04-12T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - README.md
  - package.json
  - examples/basic/package.json
  - examples/basic/index.html
  - examples/basic/src/App.tsx
  - examples/basic/src/main.tsx
  - examples/basic/vite.config.ts
  - examples/basic/tsconfig.json
  - eslint.config.mjs
findings:
  critical: 0
  warning: 2
  info: 3
  total: 5
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2026-04-12
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Reviewed documentation files (README.md), configuration files (package.json, eslint.config.mjs), and the example project (examples/basic/). The codebase is well-structured with high quality overall. The README accurately documents the component API, strategies, and behavior as implemented in `src/SiteIcon.tsx`. The ESLint configuration is properly set up for TypeScript + React with flat config. Two warnings were found: the ESLint config's ignores block placement may not work as intended, and the example project pins `react-site-icon` to `latest` which is fragile for a reproducible example. Three informational items were noted related to documentation completeness and minor configuration details.

## Warnings

### WR-01: ESLint ignores block may not apply globally due to positioning

**File:** `eslint.config.mjs:49-52`
**Issue:** In ESLint flat config, an `ignores`-only object placed at the end of the config array acts as a global ignore pattern. However, by having it as the very last entry after `eslintConfigPrettier`, any files matching the ignore patterns (e.g., `*.config.*`) that were already matched by earlier config objects may have already been processed. While ESLint flat config does handle trailing ignores-only objects as global ignores, the `*.config.*` pattern in the ignores list would also match `eslint.config.mjs` itself. This is likely intentional (to avoid linting the config file), but could silently exclude other config files like `vitest.config.ts` or `tsup.config.ts` if they contain issues.
**Fix:** This is acceptable as-is, but consider being more explicit with the pattern to avoid accidental exclusions:
```js
ignores: ['dist/', 'node_modules/', 'eslint.config.mjs', 'vitest.config.ts', 'tsup.config.ts', 'vitest.setup.ts', 'examples/'],
```

### WR-02: Example project depends on `react-site-icon@latest` -- fragile for StackBlitz

**File:** `examples/basic/package.json:14`
**Issue:** The dependency `"react-site-icon": "latest"` will resolve to whatever version is currently published on npm. Since the package is at version `0.0.0` and not yet published, running `npm install` in this example (or opening it on StackBlitz via the README link) will fail with a "not found" error. Even after initial publish, `latest` can break the example if a future major version introduces breaking changes.
**Fix:** Either use a workspace link for local development or pin to a semver range:
```json
"react-site-icon": "^0.1.0"
```
Or for monorepo-style local development:
```json
"react-site-icon": "workspace:*"
```
Note: The StackBlitz link in README.md (`https://stackblitz.com/fork/github/jorislacance/react-site-icon/tree/main/examples/basic`) will also fail until the package is published to npm, since StackBlitz will run `npm install` which needs the package to exist on the registry.

## Info

### IN-01: README documents `react-dom` as reserved prop but it is a peer dependency

**File:** `README.md:72`
**Issue:** The README states that `src`, `width`, `height`, `onLoad`, `onError` are reserved props (line 72). This matches the implementation in `SiteIcon.tsx` line 10-13 where these are omitted from the `ComponentPropsWithoutRef<'img'>` type. This is accurate and well-documented. However, the README does not mention that `loading` and `decoding` props (which are listed as supported on line 72) are passed through without interception -- users might wonder if `loading="lazy"` conflicts with the `strategy="lazy"` option. A brief note clarifying this could prevent confusion.
**Fix:** Consider adding a note in the API section:
```
> `loading="lazy"` (native browser lazy-loading) is independent of the `strategy` prop. They can be combined.
```

### IN-02: Example `tsconfig.json` lacks `outDir` and `noEmit` options

**File:** `examples/basic/tsconfig.json:2-10`
**Issue:** The example's `tsconfig.json` does not set `noEmit: true` (since Vite handles transpilation) or `isolatedModules: true` (recommended for Vite projects per Vite docs). This is a minor point since the example works fine as-is -- Vite does not use `tsc` for building. But for completeness and to avoid confusion if someone runs `tsc` directly in the example directory, adding these would be clearer.
**Fix:**
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
    "noEmit": true,
    "isolatedModules": true
  },
  "include": ["src"]
}
```

### IN-03: Root `package.json` missing `engines` field

**File:** `package.json`
**Issue:** The CLAUDE.md specifies that `engines` should be set to `>=18` in `package.json` to avoid restricting consumers while documenting minimum Node version. The field is currently absent. This is informational only -- it does not affect functionality, but including it is a best practice for npm packages and aligns with the project's documented convention.
**Fix:** Add to `package.json`:
```json
"engines": {
  "node": ">=18"
}
```

---

_Reviewed: 2026-04-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
