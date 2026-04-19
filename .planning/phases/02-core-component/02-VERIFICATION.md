---
phase: 02-core-component
verified: 2026-04-19T12:40:00Z
status: passed
score: 8/8
human_uat: 02-HUMAN-UAT.md (4/4 passed)
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_verified: 2026-04-12T19:30:00Z
  resolved_via: 02-HUMAN-UAT.md (cross-validated via Phase 06 demo site)
human_verification:
  - test: "Render SiteIcon with domain='github.com' in a browser and verify GitHub's favicon appears"
    expected: "GitHub's octocat favicon renders as a visible image, not Google's default globe"
    why_human: "naturalWidth detection requires a real browser image load against Google CDN -- cannot verify programmatically without network and DOM"
  - test: "Render SiteIcon with domain='thisdomain-definitely-does-not-exist-xyz.com' fallback={<span>?</span>} and verify fallback renders"
    expected: "The fallback <span>?</span> renders after detection completes, not the default globe"
    why_human: "Requires live browser to trigger onLoad with naturalWidth check against Google CDN response"
  - test: "SSR render SiteIcon and verify fallback appears in HTML, then hydrate and verify favicon loads"
    expected: "Server HTML contains fallback content (not img). After hydration, detection runs and resolves to found or missing."
    why_human: "SSR behavior requires rendering in a server environment (e.g., Next.js or Astro SSR) and observing hydration"
  - test: "Render SiteIcon with strategy='eager' and verify img is visible immediately during detection"
    expected: "The img element is rendered immediately with the CDN src, before detection completes"
    why_human: "Visual timing of loading state requires real browser rendering"
---

# Phase 2: Core Component Verification Report

**Phase Goal:** Users can render `<SiteIcon domain="github.com" />` and see GitHub's favicon, with automatic fallback for unknown domains
**Verified:** 2026-04-19T12:40:00Z
**Status:** passed (HUMAN-UAT 4/4 passed 2026-04-19)
**Re-verification:** Yes -- HUMAN-UAT resolved human_needed items from 2026-04-12

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | SiteIcon renders an img element with Google faviconV2 src for valid domains | VERIFIED | `buildUrl` at line 37-38 produces `https://t1.gstatic.com/faviconV2?...` URL; `status === 'found'` branch (line 97-101) renders `<img ref={ref} src={src} ...>` |
| 2 | SiteIcon renders fallback (or null) when naturalWidth detects Google default globe | VERIFIED | `handleLoad` (line 83-88) checks `e.currentTarget.naturalWidth > GOOGLE_DEFAULT_SIZE` (16); false -> `setStatus('missing')`; missing branch (line 104-106) returns `<>{fallback}</>` |
| 3 | SiteIcon renders fallback (or null) on network error | VERIFIED | `handleError` (line 90-94) calls `setStatus('missing')` and `onResolved?.(false)`; missing branch renders fallback |
| 4 | SiteIcon renders fallback during SSR and resolves on client after hydration | VERIFIED | `useState('loading')` (line 56-58) means SSR renders loading state; lazy strategy default returns `<>{fallback}{detectionImg}</>` which shows fallback; `useEffect` (line 72-74) runs client-only for detection |
| 5 | SiteIcon normalizes URL input to extract hostname before building CDN URL | VERIFIED | `normalizeDomain` (line 26-35) uses `new URL(...).hostname`; handles protocols, paths, ports, query strings, empty input |
| 6 | SiteIcon supports three strategies (lazy/eager/hidden) differing only in loading-state render | VERIFIED | `strategy` prop typed as `'lazy' \| 'eager' \| 'hidden'` (line 21); switch statement (lines 120-153) with all three cases; found/missing branches are strategy-independent |
| 7 | ref forwards to the underlying img element when favicon is shown | VERIFIED | `forwardRef<HTMLImageElement, SiteIconProps>` (line 42); `ref={ref}` on img in found state (line 99) and eager loading (line 126) |
| 8 | restProps, className, style spread onto img only, not onto fallback | VERIFIED | `{...rest}` spread on found-state img (line 99) and eager-loading img (line 132); NOT on fallback fragment, detectionImg, or hidden span |

**Score:** 8/8 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/SiteIcon.tsx` | Full SiteIcon component with all props, detection, strategies, normalization | VERIFIED | 157 lines, contains forwardRef, useState, useEffect, useRef, normalizeDomain, buildUrl, GOOGLE_DEFAULT_SIZE, handleLoad, handleError, strategy switch. Exports SiteIcon and SiteIconProps. |
| `src/index.ts` | Barrel re-export of SiteIcon component and types | VERIFIED | 2 lines: `export { SiteIcon }` and `export type { SiteIconProps }` from './SiteIcon' |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/SiteIcon.tsx` | Google faviconV2 CDN | `buildUrl` function producing img src | WIRED | Line 38: template literal `https://t1.gstatic.com/faviconV2?...url=http://${domain}&size=${String(size)}`. Used in `src` variable (line 54) which flows to all img elements. |
| `src/SiteIcon.tsx` | naturalWidth detection | onLoad handler checking `img.naturalWidth > 16` | WIRED | Line 85: `e.currentTarget.naturalWidth > GOOGLE_DEFAULT_SIZE`. `handleLoad` assigned to `onLoad` on detection img (line 114) and eager img (line 130). |
| `src/index.ts` | `src/SiteIcon.tsx` | Named re-export | WIRED | `export { SiteIcon } from './SiteIcon'` and `export type { SiteIconProps } from './SiteIcon'`. Confirmed in built output: `dist/index.d.ts` exports both. |

### Data-Flow Trace (Level 4)

Not applicable -- this is a library component, not a page/dashboard rendering dynamic data from an API or database. The component receives `domain` as a prop from the consumer and produces an img src URL. No upstream data source to trace.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| CJS module exports SiteIcon | `node -e "const m = require('./dist/index.cjs'); console.log(typeof m.SiteIcon);"` | `object` (ForwardRefExoticComponent) | PASS |
| ESM module exports SiteIcon | `node --input-type=module -e "import { SiteIcon } from './dist/index.js'; console.log(typeof SiteIcon);"` | `object` | PASS |
| TypeScript strict typecheck | `npx tsc --noEmit` | Exit 0, no errors | PASS |
| ESLint strictTypeChecked | `npx eslint src/` | Exit 0, no errors | PASS |
| Build produces output | `npm run build` | ESM 1.26KB, CJS 1.81KB, DTS 1.02KB | PASS |
| Bundle under 1KB gzipped | `gzip -c dist/index.js \| wc -c` | 765 bytes | PASS |
| "use client" banner present | `head -1 dist/index.js` | `"use client"` | PASS |
| React externalized | `head -3 dist/index.js` | `import{...}from"react"` (external import, not bundled) | PASS |
| Type declarations shipped | `ls dist/index.d.ts dist/index.d.cts` | Both present, SiteIconProps interface and SiteIcon const exported | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| COMP-01 | 02-01 | `domain` prop (string, required) | SATISFIED | `domain: string` in SiteIconProps interface (line 15) |
| COMP-02 | 02-01 | `size` prop (number, default 32) | SATISFIED | `size?: number` (line 17), default `size = 32` in destructuring (line 46) |
| COMP-03 | 02-01 | `fallback` prop (ReactNode) | SATISFIED | `fallback?: ReactNode` (line 19), rendered in missing state `<>{fallback}</>` (line 105) |
| COMP-04 | 02-01 | `className` prop passed through | SATISFIED | Via `ComponentPropsWithoutRef<'img'>` extends (line 10-13), spread via `{...rest}` (line 99, 132) |
| COMP-05 | 02-01 | `style` prop passed through | SATISFIED | Via `ComponentPropsWithoutRef<'img'>` extends, spread via `{...rest}` |
| COMP-06 | 02-01 | `alt` prop for accessibility | SATISFIED | Via `ComponentPropsWithoutRef<'img'>` extends; default `alt=""` on img (line 99); consumer overrides via `{...rest}` |
| COMP-07 | 02-01 | Normalizes domain input | SATISFIED | `normalizeDomain` function (lines 26-35) strips protocols, paths, ports via `new URL().hostname` |
| COMP-08 | 02-01 | naturalWidth globe detection | SATISFIED | `e.currentTarget.naturalWidth > GOOGLE_DEFAULT_SIZE` (line 85), `GOOGLE_DEFAULT_SIZE = 16` (line 40) |
| COMP-09 | 02-01 | SSR-compatible | SATISFIED | `useState('loading')` (line 56-58) renders fallback on server; `useEffect` for client-only detection (lines 72-81) |
| COMP-10 | 02-01 | Network error triggers fallback | SATISFIED | `handleError` (lines 90-94) sets status to 'missing'; `onError={handleError}` on detection img (line 115) and eager img (line 131) |
| COMP-11 | 02-01 | `onResolved` callback | SATISFIED | `onResolved?: (found: boolean) => void` (line 23); called in handleLoad (line 87), handleError (line 93), empty domain effect (line 79) |
| COMP-12 | 02-01 | Ref forwarding via forwardRef | SATISFIED | `forwardRef<HTMLImageElement, SiteIconProps>` (line 42); `ref={ref}` on found-state img (line 99) and eager img (line 126) |
| COMP-13 | 02-01 | restProps passthrough | SATISFIED | `{...rest}` spread on user-visible img elements (lines 99, 132); `Omit<ComponentPropsWithoutRef<'img'>, ...>` enables all standard img attributes |

All 13 COMP requirements SATISFIED. No orphaned requirements (REQUIREMENTS.md maps exactly COMP-01 through COMP-13 to Phase 2, matching the plan).

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | - | - | - | No anti-patterns detected |

No TODOs, FIXMEs, placeholders, empty implementations, hardcoded empty data, or console.log-only handlers found in any source files.

### Human Verification Required

1. **Live Favicon Resolution**
   **Test:** Render `<SiteIcon domain="github.com" />` in a browser
   **Expected:** GitHub's octocat favicon renders as a visible image, not Google's default globe
   **Why human:** naturalWidth detection requires a real browser image load against Google CDN

2. **Fallback for Unknown Domain**
   **Test:** Render `<SiteIcon domain="thisdomain-definitely-does-not-exist-xyz.com" fallback={<span>?</span>} />`
   **Expected:** The `<span>?</span>` fallback renders after detection, not the default globe
   **Why human:** Requires live browser to trigger onLoad with naturalWidth check against Google CDN response

3. **SSR Hydration Behavior**
   **Test:** SSR render SiteIcon and verify fallback appears in HTML, then hydrate and verify favicon loads
   **Expected:** Server HTML contains fallback content (not img). After hydration, detection runs and resolves.
   **Why human:** SSR behavior requires rendering in a server environment and observing hydration

4. **Eager Strategy Visual Timing**
   **Test:** Render SiteIcon with `strategy='eager'` and verify img is visible immediately during detection
   **Expected:** The img element is rendered immediately with the CDN src, before detection completes
   **Why human:** Visual timing of loading state requires real browser rendering

### Gaps Summary

No gaps found. All 8 must-have truths verified programmatically. All 13 COMP requirements satisfied with concrete code evidence. All artifacts exist, are substantive, and are wired. Build produces correct output (765 bytes gzipped, "use client" banner, React externalized, dual ESM+CJS, type declarations).

4 items require human verification in a real browser environment to confirm the runtime behavior matches the code structure. These are inherent to the nature of the library (image loading, naturalWidth detection, SSR hydration) and cannot be verified by static analysis alone.

---

_Verified: 2026-04-12T19:30:00Z_
_Verifier: Claude (gsd-verifier)_
