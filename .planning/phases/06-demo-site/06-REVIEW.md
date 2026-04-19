---
phase: 06-demo-site
reviewed: 2026-04-19T02:05:40Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/SiteIcon.tsx
  - src/SiteIcon.test.tsx
  - docs/src/components/Playground.tsx
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: issues_found
---

# Phase 06 Gap Closure: Code Review Report

**Reviewed:** 2026-04-19T02:05:40Z
**Depth:** standard
**Files Reviewed:** 3 (gap closure plans 03-04 only)
**Status:** issues_found
**All 40 tests pass.**

## Summary

This review covers the Phase 06 gap closure changes: the SSR hydration fix in `SiteIcon.tsx` (plan 03) and the strategy description text in `Playground.tsx` (plan 04).

The hydration fix is well-designed. The `useEffect` with no dependency array and a `status === 'loading'` guard is a sound approach for detecting images that are already loaded at mount time (SSR pre-fetch or browser cache). The `img.complete` + `naturalWidth` check correctly reuses the existing globe-detection threshold (`GOOGLE_DEFAULT_SIZE = 16`). The callback ref pattern for the eager strategy correctly merges the internal ref with the forwarded ref.

Two warnings were found: a potential `onResolved` double-fire race condition in the hydration path, and the `handleLoad`/`handleError` handlers closing over a stale `onResolved` reference. Two info-level items note the empty-string `src` console warning and a minor robustness improvement for the hydration effect ref selection. The strategy descriptions change in Playground.tsx is clean with no issues.

No critical issues or security vulnerabilities found.

## Warnings

### WR-01: Potential onResolved double-fire between hydration useEffect and onLoad handler

**File:** `src/SiteIcon.tsx:89-103`
**Issue:** When a cached image has `complete=true` at mount time, the hydration `useEffect` (line 89) calls `onResolved` and `setStatus`. However, `handleLoad` (line 105) only guards against stale domains -- it does not check whether `status === 'loading'`. If the browser fires the `onLoad` event on the same img element in the narrow window between the useEffect running and React committing the re-render, `onResolved` would be called a second time.

In practice this is very unlikely because React processes `setStatus` synchronously within the useEffect, triggering a re-render that removes or replaces the img element before any queued browser events fire. For the `lazy` and `hidden` strategies, the detection img is completely unmounted when status transitions away from `'loading'`, so `onLoad` cannot fire. For the `eager` strategy, the found-state img replaces the loading-state img's `onLoad` handler. Nevertheless, the lack of an explicit guard makes this dependent on React's internal scheduling guarantees.

**Fix:** Add a `status === 'loading'` guard to `handleLoad` and `handleError` for defense-in-depth:
```tsx
const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>): void => {
  if (domainRef.current !== normalizedDomain) return; // stale (D-08)
  if (status !== 'loading') return; // already resolved (hydration guard)
  const found = e.currentTarget.naturalWidth > GOOGLE_DEFAULT_SIZE;
  setStatus(found ? 'found' : 'missing');
  onResolved?.(found);
};

const handleError = (): void => {
  if (domainRef.current !== normalizedDomain) return; // stale (D-08)
  if (status !== 'loading') return; // already resolved (hydration guard)
  setStatus('missing');
  onResolved?.(false);
};
```
Note: `status` in the handler closure is from the render that created it, so this guard is safe -- it captures the correct value.

### WR-02: onResolved captured by closure in hydration useEffect may be stale

**File:** `src/SiteIcon.tsx:89-103`
**Issue:** The hydration `useEffect` has no dependency array, meaning it runs after every render. It captures the `onResolved` callback from the current render's closure. If a consumer passes an unstable `onResolved` (a new function reference each render), the effect's guard (`status === 'loading'`) prevents re-firing, so this is safe in practice. However, if the consumer changes `onResolved` to a different callback between the initial render and the first useEffect execution (e.g., via a state update that triggers a synchronous re-render in a parent during the child's first render), the effect could call a stale `onResolved`.

The JSDoc on `onResolved` already warns: "Memoize if you don't want re-fires on re-render." The `status === 'loading'` guard in the effect limits the window to first-render only, which makes this a very narrow concern.

**Fix:** Store `onResolved` in a ref to always call the latest version:
```tsx
const onResolvedRef = useRef(onResolved);
useEffect(() => {
  onResolvedRef.current = onResolved;
});
```
Then use `onResolvedRef.current?.(true/false)` in the hydration useEffect. This is a common React pattern for avoiding stale closures in effects. However, given the `status === 'loading'` guard and the JSDoc warning, this is a defensive improvement rather than a bug fix.

## Info

### IN-01: Empty domain renders detection img with empty src attribute

**File:** `src/SiteIcon.tsx:54,131-141`
**Issue:** When `domain` is an empty string, `normalizeDomain` returns `''`, and `src` becomes `''` (line 54). The component still enters the `'loading'` code path and renders `detectionImg` with `src=""`. This causes jsdom (and browsers) to emit: "An empty string was passed to the src attribute. This may cause the browser to download the whole page again over the network." The domain-change logic on lines 69-72 sets `status` to `'missing'` for empty normalized domains, but only when the domain *changes* from a non-empty value. On the initial render with `domain=""`, the initial `prevDomain` matches `normalizedDomain` (both empty), so the guard on line 69 does not fire. The empty-domain `useEffect` on line 80 eventually sets status to `'missing'`, but the detection img is briefly rendered with `src=""`.

This is visible in the test output (4 tests produce this console warning). It does not cause a user-facing bug because the `useEffect` on line 80 quickly transitions to `'missing'` state.

**Fix:** Initialize status to `'missing'` when domain is empty from the start:
```tsx
const [status, setStatus] = useState<'loading' | 'found' | 'missing'>(
  normalizedDomain ? 'loading' : 'missing',
);
```
This prevents the brief loading render with an empty `src` and eliminates the console warning.

### IN-02: Hydration useEffect ref selection could use a single ref variable

**File:** `src/SiteIcon.tsx:64-65, 90-93`
**Issue:** Two separate refs (`detectionRef` and `eagerInternalRef`) are maintained, and the hydration `useEffect` selects between them via `strategy === 'eager'`. This works correctly but adds cognitive overhead. A single `imgRef` that is always assigned to the current detection target -- regardless of strategy -- would simplify both the ref management and the hydration check.

This is a minor structural suggestion and does not affect correctness.

**Fix:** Consider unifying into a single ref:
```tsx
const imgRef = useRef<HTMLImageElement>(null);

// In hydration useEffect:
useEffect(() => {
  const img = imgRef.current;
  if (img && img.complete && status === 'loading') { ... }
});

// In eager strategy:
ref={(el) => {
  imgRef.current = el;
  if (typeof ref === 'function') ref(el);
  else if (ref) ref.current = el;
}}

// In detectionImg:
<img ref={imgRef} ... />
```
However, this changes the semantics slightly (the eager strategy's ref also serves as the forwarded ref), so evaluate whether the merging introduces complications with the found-state ref forwarding.

---

_Reviewed: 2026-04-19T02:05:40Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
