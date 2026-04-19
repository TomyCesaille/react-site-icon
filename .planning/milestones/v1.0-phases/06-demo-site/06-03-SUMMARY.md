---
phase: 06-demo-site
plan: 03
subsystem: ui
tags: [react, hydration, ssr, favicon, useEffect, naturalWidth]

# Dependency graph
requires:
  - phase: 02-core-component
    provides: SiteIcon component with onLoad/onError detection
  - phase: 06-demo-site-01
    provides: Astro demo site with SSR rendering of SiteIcon
provides:
  - SSR hydration-safe favicon detection via post-mount .complete check
  - Pre-loaded image handling for all three strategies (lazy, eager, hidden)
affects: [demo-site, core-component, documentation]

# Tech tracking
tech-stack:
  added: []
  patterns: [post-mount useEffect hydration check, callback ref merging for forwarded refs]

key-files:
  created: []
  modified: [src/SiteIcon.tsx, src/SiteIcon.test.tsx]

key-decisions:
  - "useEffect with no dependency array for hydration check -- status === loading guard prevents re-fires"
  - "Callback ref pattern for eager strategy to merge eagerInternalRef with forwarded ref"

patterns-established:
  - "Post-mount .complete check: useEffect (no deps) checks img.complete after mount to catch SSR-cached images"
  - "Dual-ref merging: callback ref assigns both internal ref and forwarded ref for eager strategy"

requirements-completed: [COMP-09]

# Metrics
duration: 2min
completed: 2026-04-19
---

# Phase 06 Plan 03: SSR Hydration Fix Summary

**Post-mount .complete detection check fixing SSR hydration bug where pre-loaded favicons stayed in loading state**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-19T01:39:16Z
- **Completed:** 2026-04-19T01:41:11Z
- **Tasks:** 1 (TDD: RED + GREEN)
- **Files modified:** 2

## Accomplishments
- Fixed SSR hydration bug: SiteIcon now detects already-loaded/cached images after React hydration
- Added useEffect with .complete + naturalWidth check that fires after mount for all three strategies
- Added 5 new hydration-specific tests covering lazy found, lazy globe, eager found, onResolved callback, and naturalWidth=0 error cases
- Bundle size remains 855 bytes gzipped (well under 1KB constraint)
- All 40 tests pass (35 existing + 5 new, zero regressions)

## Task Commits

Each task was committed atomically (TDD RED then GREEN):

1. **Task 1 RED: Failing hydration tests** - `0bf9f04` (test)
2. **Task 1 GREEN: Post-mount .complete detection check** - `0e531ce` (feat)

## Files Created/Modified
- `src/SiteIcon.tsx` - Added detectionRef, eagerInternalRef, and post-mount useEffect checking img.complete + naturalWidth for hydration safety
- `src/SiteIcon.test.tsx` - Added "hydration (pre-loaded images)" describe block with 5 tests mocking HTMLImageElement.prototype.complete/naturalWidth

## Decisions Made
- **No dependency array on hydration useEffect:** Intentional -- runs every render but `status === 'loading'` guard ensures it only fires once per detection cycle. Using deps could miss the hydration window if deps don't change between SSR and hydration.
- **Callback ref merging for eager strategy:** Uses `(el) => { eagerInternalRef.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }` to set both the internal ref and the forwarded ref.
- **vi.spyOn for HTMLImageElement.prototype:** Tests mock `.complete` and `.naturalWidth` getters on the prototype before render, ensuring the useEffect sees pre-loaded state on first mount.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Astro docs:build command not available in worktree (astro not in PATH) -- this is expected for a parallel git worktree environment. The library build itself succeeds and the component changes are valid.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- SSR hydration bug is fixed -- favicons now resolve on initial page load after Astro SSR
- All existing behavior preserved (onLoad/onError flow, domain change reset, stale detection)
- Bundle size constraint maintained (855 bytes gzipped)

## Self-Check: PASSED

- All created/modified files exist on disk
- All commit hashes (0bf9f04, 0e531ce) found in git log
- Key patterns (.complete, detectionRef, eagerInternalRef, hydration tests) verified in source

---
*Phase: 06-demo-site*
*Completed: 2026-04-19*
