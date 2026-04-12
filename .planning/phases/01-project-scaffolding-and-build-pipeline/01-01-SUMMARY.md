---
phase: 01-project-scaffolding-and-build-pipeline
plan: 01
subsystem: build
tags: [tsup, typescript, react, esm, cjs, npm-package]

# Dependency graph
requires: []
provides:
  - "Dual ESM+CJS build pipeline via tsup with TypeScript declarations"
  - "package.json with correct exports, peer deps, and npm packaging config"
  - "Skeleton SiteIcon component validating JSX compilation and React externalization"
affects: [02-quality-tooling, 02-core-component, 03-testing, 04-cicd, 05-docs, 06-demo]

# Tech tracking
tech-stack:
  added: [typescript@5.9.3, tsup@8.5.1, react@19.2.5, react-dom@19.2.5, "@types/react@19.2.14", "@types/react-dom@19.2.3"]
  patterns: [esbuildOptions-for-use-client-banner, types-first-exports-ordering, react-externalized-peer-dep]

key-files:
  created: [package.json, tsconfig.json, tsup.config.ts, src/SiteIcon.tsx, src/index.ts, .gitignore, .nvmrc, LICENSE]
  modified: []

key-decisions:
  - "esbuildOptions callback for 'use client' banner instead of top-level banner to avoid .d.ts injection"
  - "Types-first ordering in package.json exports for correct TypeScript resolution"
  - "React as devDependency + peerDependency (not runtime dependency)"

patterns-established:
  - "Dual ESM+CJS output: tsup produces index.js (ESM) + index.cjs (CJS) + index.d.ts + index.d.cts"
  - "Use client banner: esbuildOptions approach avoids banner in .d.ts files"
  - "React externalization: react and react-dom in external array, only import type used in component"
  - "Skeleton component pattern: minimal implementation validates full pipeline before adding logic"

requirements-completed: [BUILD-01, BUILD-02, BUILD-03, BUILD-04, BUILD-05, BUILD-06, BUILD-07, BUILD-08]

# Metrics
duration: 2min
completed: 2026-04-12
---

# Phase 01 Plan 01: Project Scaffolding and Build Pipeline Summary

**Dual ESM+CJS build pipeline via tsup with TypeScript strict, "use client" banner, and skeleton SiteIcon component producing 315-byte gzipped output**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-12T16:20:48Z
- **Completed:** 2026-04-12T16:23:12Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Complete build pipeline producing 4 output files: dist/index.js (ESM), dist/index.cjs (CJS), dist/index.d.ts, dist/index.d.cts
- "use client" banner correctly injected in JS output only (not .d.ts) via esbuildOptions approach
- Skeleton SiteIcon component with full TypeScript interface (domain, size, fallback, className, style, alt props) validates JSX compilation, React externalization, and type export
- Gzipped ESM bundle is 315 bytes -- well under the 1KB target constraint
- React 17, 18, and 19 declared as peer dependencies; React externalized from bundle

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize repository with package.json, TypeScript, and tsup build config** - `590bb87` (chore)
2. **Task 2: Create skeleton SiteIcon component and entry point, run build, verify output** - `1d97e87` (feat)

## Files Created/Modified
- `package.json` - npm manifest with dual ESM+CJS exports, types-first ordering, React 17/18/19 peer deps, ESLint overrides
- `tsconfig.json` - TypeScript strict config with react-jsx transform, bundler module resolution, noEmit
- `tsup.config.ts` - Build config with esbuildOptions for "use client" banner, React externalized, minified
- `src/SiteIcon.tsx` - Skeleton component with SiteIconProps interface, Google faviconV2 URL builder
- `src/index.ts` - Library entry point re-exporting SiteIcon component and SiteIconProps type
- `.gitignore` - Excludes node_modules, dist, coverage, .DS_Store
- `.nvmrc` - Node 22 for development
- `LICENSE` - MIT license
- `package-lock.json` - Dependency lockfile

## Decisions Made
- Used `esbuildOptions` callback for "use client" banner instead of top-level `banner` in tsup config -- top-level banner injects into .d.ts files which breaks TypeScript consumers
- Types-first ordering in package.json exports (`types` before `default`) -- TypeScript resolves conditions top-to-bottom
- React installed as devDependency for local development, declared as peerDependency for consumers -- prevents React from being bundled or duplicated
- Added npm `overrides` for eslint-plugin-react and eslint-plugin-react-hooks preemptively -- needed for ESLint 10 peer dep gap in Plan 02

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Build pipeline is fully operational and verified against all BUILD requirements (BUILD-01 through BUILD-08)
- Ready for Plan 02 (quality tooling: ESLint, Prettier, Husky, Changesets)
- Ready for Phase 02 (core component implementation: detection logic, state management)
- Skeleton component provides the foundation for adding naturalWidth detection in Phase 02

## Self-Check: PASSED

All 8 created files verified present. Both task commits (590bb87, 1d97e87) confirmed in git log.

---
*Phase: 01-project-scaffolding-and-build-pipeline*
*Completed: 2026-04-12*
