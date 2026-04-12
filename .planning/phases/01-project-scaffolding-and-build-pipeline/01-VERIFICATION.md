---
phase: 01-project-scaffolding-and-build-pipeline
verified: 2026-04-12T18:45:00Z
status: passed
score: 12/12
overrides_applied: 0
---

# Phase 1: Project Scaffolding and Build Pipeline Verification Report

**Phase Goal:** Developers can clone the repo, run the build, and get correct dual ESM+CJS output with TypeScript declarations and "use client" banner
**Verified:** 2026-04-12T18:45:00Z
**Status:** passed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

Merged from ROADMAP success criteria (SC-1 through SC-5) and PLAN frontmatter must-haves (Plan 01: 7 truths, Plan 02: 5 truths). After deduplication, 12 unique truths remain.

| # | Truth | Source | Status | Evidence |
|---|-------|--------|--------|----------|
| 1 | Running `npm run build` produces dist/index.js (ESM) and dist/index.cjs (CJS) | SC-1, Plan 01 | VERIFIED | Build exits 0. dist/index.js (380B), dist/index.cjs (864B), dist/index.d.ts (651B), dist/index.d.cts (651B) all present. |
| 2 | dist/index.d.ts and dist/index.d.cts type declarations exist after build | SC-1, Plan 01 | VERIFIED | Both files present. dist/index.d.ts exports `SiteIcon` function and `SiteIconProps` type. |
| 3 | The first line of dist/index.js contains the string `"use client"` | SC-2, Plan 01 | VERIFIED | `head -1 dist/index.js` outputs `"use client"`. dist/index.d.ts first line is `import { ReactNode, CSSProperties } from 'react';` -- no banner leakage. |
| 4 | dist/index.js does not contain React internals -- React is externalized | SC-4, Plan 01 | VERIFIED | `grep -c 'createElement\|jsxRuntime\|function jsx' dist/index.js` returns 0. ESM uses `import{jsx as s}from"react/jsx-runtime"` (external import, not bundled). CJS also clean. |
| 5 | The built bundle is under 1KB minified+gzipped | Plan 01 | VERIFIED | `gzip -c dist/index.js | wc -c` = 320 bytes (31% of 1024 limit). |
| 6 | package.json exports field has types condition before default in both import and require | SC-3, Plan 01 | VERIFIED | `Object.keys(exports['.'].import)` = `['types', 'default']`. Same for require. |
| 7 | React 17, 18, and 19 are declared as peer dependencies | Plan 01 | VERIFIED | `peerDependencies.react` = `"^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0"`. Same for react-dom. |
| 8 | Running `npx eslint src/` passes without errors on the skeleton component | SC-5, Plan 02 | VERIFIED | `npm run lint` exits 0 with no output (clean). strictTypeChecked rules active. |
| 9 | Running `npx prettier --check src/` passes without formatting issues | SC-5, Plan 02 | VERIFIED | `npm run format:check` reports "All matched files use Prettier code style!" |
| 10 | The .husky/pre-commit hook file exists and calls lint-staged | SC-5, Plan 02 | VERIFIED | `.husky/pre-commit` contains `npx lint-staged`. Husky v9 uses `.husky/_/pre-commit` as executable shim with `core.hooksPath = .husky/_`. Architecture verified. |
| 11 | The .changeset/config.json exists with access set to public | Plan 02 | VERIFIED | File exists. Contains `"access": "public"` and `"baseBranch": "main"`. |
| 12 | vitest.config.ts exists configured for jsdom environment with co-located test discovery | Plan 02 | VERIFIED | File contains `environment: 'jsdom'`, `globals: true`, `include: ['src/**/*.test.{ts,tsx}']`. |

**Score:** 12/12 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `package.json` | npm manifest with dual exports, peer deps, files field | VERIFIED | Name: react-site-icon, type: module, sideEffects: false, files: ["dist"], all scripts present (build, typecheck, lint, format:check, test, prepare) |
| `tsconfig.json` | TypeScript strict configuration | VERIFIED | strict: true, jsx: react-jsx, moduleResolution: bundler, noEmit: true |
| `tsup.config.ts` | Build config with esbuildOptions banner | VERIFIED | entry: src/index.ts, format: esm+cjs, dts: true, minify: true, external: react+react-dom, esbuildOptions for use client |
| `src/SiteIcon.tsx` | Skeleton component with SiteIconProps | VERIFIED | 38 lines. Exports SiteIconProps interface (6 props) and SiteIcon function. Uses `import type` only (no runtime React import). Google faviconV2 URL builder present. |
| `src/index.ts` | Library entry point re-exporting component | VERIFIED | Named export for SiteIcon, type-only export for SiteIconProps |
| `dist/index.js` | ESM build output with use client | VERIFIED | 380B, starts with "use client", externalized React imports |
| `dist/index.cjs` | CJS build output | VERIFIED | 864B, loadable via require(), exports SiteIcon function |
| `dist/index.d.ts` | TypeScript declarations (ESM) | VERIFIED | 651B, exports SiteIcon function signature and SiteIconProps interface, no "use client" leakage |
| `dist/index.d.cts` | TypeScript declarations (CJS) | VERIFIED | 651B, present |
| `eslint.config.mjs` | ESLint 10 flat config with strictTypeChecked | VERIFIED | strictTypeChecked, stylisticTypeChecked, projectService: true, React plugins, eslintConfigPrettier last |
| `.prettierrc` | Prettier configuration | VERIFIED | singleQuote: true, trailingComma: all, printWidth: 80 |
| `.prettierignore` | Prettier exclusions | VERIFIED | Excludes dist/, node_modules/, coverage/, .changeset/, *.md |
| `.husky/pre-commit` | Pre-commit hook | VERIFIED | Contains `npx lint-staged`. Husky v9 shim architecture functional. |
| `.changeset/config.json` | Changesets config | VERIFIED | access: public, baseBranch: main, changelog-github integration |
| `vitest.config.ts` | Vitest test config | VERIFIED | jsdom environment, globals: true, co-located test discovery |
| `.gitignore` | Git exclusions | VERIFIED | node_modules/, dist/, coverage/, *.tsbuildinfo, .DS_Store |
| `.nvmrc` | Node version | VERIFIED | Contains `22` |
| `LICENSE` | MIT license | VERIFIED | MIT License, Copyright (c) 2026 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/index.ts` | `src/SiteIcon.tsx` | named export re-export | WIRED | `export { SiteIcon } from './SiteIcon'` and `export type { SiteIconProps } from './SiteIcon'` |
| `tsup.config.ts` | `src/index.ts` | entry point configuration | WIRED | `entry: ['src/index.ts']` |
| `package.json` | `dist/` | exports field and files field | WIRED | 7 references to `dist/index.*` in exports, main, module, types fields. `files: ["dist"]` |
| `.husky/pre-commit` | `lint-staged config in package.json` | npx lint-staged invocation | WIRED | Hook calls `npx lint-staged`, package.json has `lint-staged` config with `.ts/.tsx` and `.json/.md/.yml/.yaml` patterns |
| `eslint.config.mjs` | `tsconfig.json` | projectService type-aware linting | WIRED | `projectService: true` in parserOptions enables automatic tsconfig discovery |
| `package.json` | `eslint.config.mjs` | npm run lint script | WIRED | `"lint": "eslint src/"` in scripts, eslint.config.mjs auto-discovered by ESLint |

### Data-Flow Trace (Level 4)

Not applicable for this phase. Phase 1 produces build tooling, configuration, and a skeleton component. No dynamic data rendering to trace.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Build produces dual output | `npm run build` | Exits 0. 4 dist files produced (js, cjs, d.ts, d.cts) | PASS |
| TypeScript strict passes | `npm run typecheck` | Exits 0, no errors | PASS |
| ESLint passes on src/ | `npm run lint` | Exits 0, clean output | PASS |
| Prettier passes on src/ | `npm run format:check` | "All matched files use Prettier code style!" | PASS |
| CJS output is loadable | `node -e "require('./dist/index.cjs')"` | Exits 0 | PASS |
| CJS exports SiteIcon function | `node -e "...typeof m.SiteIcon"` | `function` | PASS |
| ESM output is importable | `node --input-type=module -e "import {SiteIcon}..."` | `function` | PASS |
| Bundle size under 1KB | `gzip -c dist/index.js \| wc -c` | 320 bytes | PASS |
| React externalized from ESM | `grep -c 'createElement' dist/index.js` | 0 matches | PASS |
| React externalized from CJS | `grep -c 'createElement' dist/index.cjs` | 0 matches | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| BUILD-01 | 01-01 | TypeScript strict mode with shipped .d.ts declarations via tsup | SATISFIED | tsconfig.json has strict: true. dist/index.d.ts and dist/index.d.cts produced. tsc --noEmit exits 0. |
| BUILD-02 | 01-01 | Dual ESM + CJS output via tsup | SATISFIED | dist/index.js (ESM, 380B) and dist/index.cjs (CJS, 864B) produced by build. |
| BUILD-03 | 01-01 | "use client" banner injected in build output | SATISFIED | First line of dist/index.js is `"use client"`. d.ts files do NOT contain banner. |
| BUILD-04 | 01-01 | Correct exports field with types condition first | SATISFIED | types is first key in both import and require objects. Verified programmatically. |
| BUILD-05 | 01-01 | React and react-dom externalized as peer dependencies | SATISFIED | external: ['react', 'react-dom'] in tsup config. dist output uses import statements, not bundled React code. |
| BUILD-06 | 01-01 | files: ["dist"] -- only dist published to npm | SATISFIED | package.json files field is `["dist"]`. |
| BUILD-07 | 01-01 | Bundle size under 1KB minified+gzipped | SATISFIED | 320 bytes gzipped (31% of limit). |
| BUILD-08 | 01-01 | React 17, 18, 19 declared as peer dependencies | SATISFIED | `"^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0"` for both react and react-dom. |
| TOOL-01 | 01-02 | ESLint 10 with flat config and typescript-eslint | SATISFIED | eslint.config.mjs with strictTypeChecked, stylisticTypeChecked, React plugins. `npm run lint` exits 0. |
| TOOL-02 | 01-02 | Prettier formatting configuration | SATISFIED | .prettierrc with singleQuote convention. `npm run format:check` passes. |
| TOOL-03 | 01-02 | Husky + lint-staged pre-commit hooks | SATISFIED | .husky/pre-commit calls lint-staged. Husky v9 core.hooksPath architecture verified. package.json has lint-staged config. |
| TOOL-04 | 01-02 | Changesets configured for versioning and changelog | SATISFIED | .changeset/config.json with access: public, baseBranch: main, @changesets/changelog-github. |

**Orphaned requirements check:** REQUIREMENTS.md maps BUILD-01 through BUILD-08 and TOOL-01 through TOOL-04 to Phase 1. All 12 are covered by Plans 01-01 and 01-02. No orphaned requirements.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | -- | -- | -- | No anti-patterns detected in src/, config files, or dist output. |

Anti-pattern scan covered: TODO/FIXME/HACK markers, placeholder text, empty implementations, hardcoded empty data, console.log-only handlers. All clean.

### Human Verification Required

No human verification items identified. All truths are programmatically verifiable and have been verified through behavioral spot-checks.

### Gaps Summary

No gaps found. All 12 must-have truths verified. All 18 artifacts confirmed present and substantive. All 6 key links wired. All 12 requirements satisfied. Zero anti-patterns. Zero blockers.

**Informational notes (not gaps):**
- `.changeset/config.json` uses `"repo": "OWNER/react-site-icon"` as a placeholder for the GitHub owner. This affects changelog link generation only and should be updated when the actual repository owner is known. Not a functional issue.
- The `fallback` prop is declared in `SiteIconProps` but unused in the skeleton component. This is intentional per plan -- Phase 2 implements detection logic and fallback rendering.

---

_Verified: 2026-04-12T18:45:00Z_
_Verifier: Claude (gsd-verifier)_
