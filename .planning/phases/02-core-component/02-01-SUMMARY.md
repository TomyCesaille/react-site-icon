---
phase: 02-core-component
plan: 01
subsystem: ui
tags: [react, forwardref, naturalwidth, favicon, google-cdn, ssr]

# Dependency graph
requires:
  - phase: 01-project-scaffolding-and-build-pipeline
    provides: "tsup build pipeline, TypeScript strict config, ESLint strictTypeChecked, skeleton SiteIcon component"
provides:
  - "Production-ready SiteIcon component with full prop API"
  - "naturalWidth-based favicon detection with Google CDN"
  - "Three rendering strategies (lazy/eager/hidden)"
  - "Domain normalization via URL constructor"
  - "forwardRef for React 17/18/19 ref forwarding"
  - "SSR-safe state management (loading initial state)"
affects: [03-testing, 05-documentation, 06-demo-site]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "prevDomain state pattern for domain-change detection during render (avoids ref access during render per react-hooks/refs rule)"
    - "useRef for stale detection in event handlers only (not during render)"
    - "ComponentPropsWithoutRef<'img'> with Omit for restProps typing"
    - "forwardRef with named function for DevTools display name"

key-files:
  created: []
  modified:
    - src/SiteIcon.tsx
    - src/index.ts

key-decisions:
  - "prevDomain state instead of ref for domain-change detection -- eslint-plugin-react-hooks 7.x react-hooks/refs rule forbids ref access during render"
  - "Separate useEffect for ref sync and onResolved callback -- react-hooks/set-state-in-effect rule forbids synchronous setState in effects"
  - "naturalWidth > 16 threshold for Google default globe detection"
  - "void strategy in Task 1 shell to satisfy no-unused-vars during intermediate commit"

patterns-established:
  - "prevDomain state pattern: track previous prop values via useState for during-render change detection"
  - "Event-handler-only ref access: useRef values read/written only in handlers and effects, never during render"
  - "Strategy render branching: found/missing identical across strategies, only loading state differs"

requirements-completed: [COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07, COMP-08, COMP-09, COMP-10, COMP-11, COMP-12, COMP-13]

# Metrics
duration: 3min
completed: 2026-04-12
---

# Phase 2 Plan 1: Core Component Summary

**SiteIcon component with naturalWidth-based favicon detection, three strategies (lazy/eager/hidden), domain normalization via URL constructor, and forwardRef -- 765 bytes gzipped**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-12T17:20:27Z
- **Completed:** 2026-04-12T17:24:08Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Full SiteIcon component replacing Phase 1 skeleton with complete prop API, detection state machine, and three rendering strategies
- naturalWidth > 16 check detects Google's default 16x16 globe fallback -- the library's core differentiator
- Domain normalization via URL constructor handles full URLs, protocols, paths, ports, query strings
- SSR-safe: useState('loading') initial state renders fallback on server, useEffect triggers client-only detection
- Bundle size: 765 bytes gzipped (well under 1KB constraint)
- "use client" directive in build output for React Server Components compatibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Define complete SiteIconProps interface, normalizeDomain, and forwardRef shell** - `488a3db` (feat)
2. **Task 2: Implement detection state machine, strategy render logic, and verify build** - `0113cf1` (feat)

## Files Created/Modified
- `src/SiteIcon.tsx` - Full SiteIcon component with all props, detection, strategies, normalization, forwardRef

## Decisions Made

1. **prevDomain state pattern instead of useRef for domain-change detection during render** -- eslint-plugin-react-hooks 7.x introduces `react-hooks/refs` rule that forbids ref access during render. Used `useState` to track previous domain and detect changes during render (React's approved getDerivedStateFromProps replacement), while keeping useRef only for stale detection in event handlers.

2. **Separate useEffect for ref sync vs onResolved callback** -- eslint-plugin-react-hooks 7.x `set-state-in-effect` rule forbids synchronous setState in effect bodies. Split into: (a) domain-change detection via prevDomain state during render, (b) ref sync in a separate effect, (c) onResolved(false) for empty domain in another effect.

3. **naturalWidth > 16 threshold** -- Google's default globe is always 16x16 regardless of requested size. Using `> 16` (not `=== 16` or `!== 16`) means any image larger than the known default is considered a real favicon. More robust against edge cases.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] ESLint react-hooks/set-state-in-effect rule blocked synchronous setState in useEffect**
- **Found during:** Task 2 (detection state machine implementation)
- **Issue:** Plan specified `setStatus('loading')` and `setStatus('missing')` inside a useEffect. eslint-plugin-react-hooks 7.x `set-state-in-effect` rule forbids this pattern.
- **Fix:** Moved domain-change detection from useEffect to during-render pattern using prevDomain state comparison. Kept useEffect only for side effects (ref sync, onResolved callback).
- **Files modified:** src/SiteIcon.tsx
- **Verification:** `npx eslint src/` passes with zero errors
- **Committed in:** 0113cf1

**2. [Rule 3 - Blocking] ESLint react-hooks/refs rule blocked ref access during render**
- **Found during:** Task 2 (detection state machine implementation)
- **Issue:** After fixing deviation 1, the during-render domain detection used `domainRef.current` reads and writes. eslint-plugin-react-hooks 7.x `refs` rule forbids ref access during render.
- **Fix:** Replaced domainRef-based change detection with prevDomain useState pattern. Ref is now only accessed in event handlers (handleLoad, handleError) and effects (sync).
- **Files modified:** src/SiteIcon.tsx
- **Verification:** `npx eslint src/` passes with zero errors
- **Committed in:** 0113cf1

---

**Total deviations:** 2 auto-fixed (2 blocking -- ESLint strict rules)
**Impact on plan:** Both deviations were necessary for ESLint compliance. The plan's detection logic is functionally identical -- only the implementation pattern changed (state vs ref for during-render change detection). No scope creep. Added one extra useState call (prevDomain) which has negligible bundle impact (765 bytes still well under 1KB).

## Issues Encountered
- Task 1 initial commit was blocked by ESLint no-unused-vars on destructured `fallback`, `strategy`, `onResolved` in the placeholder shell. Fixed by adding minimal usage (`void strategy`, early-return with `fallback` for empty domain, `onResolved?.()` call). This is inherent to committing an intermediate shell.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- SiteIcon component is production-ready and passes typecheck, lint, and build
- Ready for Phase 3 (Testing): all detection states, strategies, and normalization edge cases are testable
- Ready for Phase 5 (Documentation): complete prop API with JSDoc comments
- Ready for Phase 6 (Demo Site): component can be imported and used interactively

## Self-Check: PASSED

- FOUND: src/SiteIcon.tsx
- FOUND: src/index.ts
- FOUND: 02-01-SUMMARY.md
- FOUND: 488a3db (Task 1 commit)
- FOUND: 0113cf1 (Task 2 commit)

---
*Phase: 02-core-component*
*Completed: 2026-04-12*
