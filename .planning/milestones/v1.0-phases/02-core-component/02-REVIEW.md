---
phase: 02-core-component
reviewed: 2026-04-12T19:30:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - src/SiteIcon.tsx
  - src/index.ts
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-12T19:30:00Z
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Reviewed the core `SiteIcon` component (`src/SiteIcon.tsx`) and its barrel export (`src/index.ts`). The component is well-structured, uses correct React patterns (state-during-render for prop changes, ref forwarding, stale closure detection), and the overall architecture is sound for a < 1KB library. The barrel file is clean.

Two warnings relate to missing input sanitization in URL construction and the forwarded ref being unreachable in certain states. Two informational items note minor edge cases in the naturalWidth detection threshold and the `onResolved` re-fire behavior.

No security vulnerabilities, no critical bugs, no dead code, no unused imports.

## Warnings

### WR-01: Domain not URL-encoded in favicon URL construction

**File:** `src/SiteIcon.tsx:38`
**Issue:** The `buildUrl` function interpolates `domain` directly into the URL string without `encodeURIComponent`. When `normalizeDomain` falls through to the `catch` branch (line 33), it returns the raw trimmed input. This raw string -- which could contain characters like `#`, `?`, `&`, or spaces -- is placed directly into the Google favicon URL, producing a malformed request. For example, a domain input of `"example.com/path?q=1"` would produce a URL where `?q=1` is parsed as a query parameter of the outer URL rather than part of the domain literal.
**Fix:**
```tsx
const buildUrl = (domain: string, size: number): string =>
  `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${encodeURIComponent(domain)}&size=${String(size)}`;
```
Note: Verify that Google's faviconV2 endpoint accepts encoded domains. If it requires the domain as a bare hostname (which `normalizeDomain` extracts in the happy path), the safer fix is to validate/sanitize in `normalizeDomain` so the `catch` branch never returns raw user input containing URL-special characters.

### WR-02: Forwarded ref is null during loading and missing states

**File:** `src/SiteIcon.tsx:105,138-152`
**Issue:** The `ref` forwarded via `forwardRef` is only attached to the `<img>` element in two cases: when `status === 'found'` (line 99) and when `strategy === 'eager'` during loading (line 125). In all other states -- `'lazy'` loading, `'hidden'` loading, and `'missing'` -- the ref is not attached to any DOM element and will be `null`. Consumers who use the ref for measurement, focus management, or Intersection Observer will encounter `null` unexpectedly. This is especially surprising because the component accepts a ref (via `forwardRef`), which signals to consumers that a DOM element reference is reliably available.
**Fix:** Document this behavior explicitly in the `SiteIconProps` JSDoc or README. Alternatively, for the `'missing'` state, wrap the fallback in a `<span>` that receives the ref:
```tsx
if (status === 'missing') {
  return fallback ? <span ref={ref}>{fallback}</span> : <>{fallback}</>;
}
```
If wrapping is undesirable (it changes the DOM structure), the minimum fix is clear documentation that the ref is only populated when a favicon is successfully loaded (or during eager loading).

## Info

### IN-01: 16px naturalWidth threshold may false-negative on 16x16 favicons

**File:** `src/SiteIcon.tsx:40,85`
**Issue:** `GOOGLE_DEFAULT_SIZE` is 16, and the check `naturalWidth > GOOGLE_DEFAULT_SIZE` classifies any favicon with exactly 16px natural width as the Google globe fallback. Sites that genuinely serve a 16x16 favicon (some older sites, particularly those with only a `favicon.ico` at 16x16) would be incorrectly classified as "missing." This is an inherent trade-off of the detection approach and is documented in the project description as the "key insight." Noting it here for awareness -- the `size` prop defaults to 32, so Google typically upscales real favicons, making this a rare edge case in practice.
**Fix:** No code change needed if the trade-off is acceptable. Consider adding a comment at the `GOOGLE_DEFAULT_SIZE` constant explaining why 16 was chosen and the known edge case.

### IN-02: onResolved fires on every render for empty domain when not memoized

**File:** `src/SiteIcon.tsx:77-81`
**Issue:** The `useEffect` on lines 77-81 includes `onResolved` in its dependency array. If a consumer passes an inline function (`onResolved={(found) => setX(found)}`), the effect re-runs on every render, calling `onResolved(false)` each time `domain` is empty. The JSDoc on line 22 warns consumers to memoize, but this is a common foot-gun in React libraries.
**Fix:** The warning in JSDoc is sufficient for v1. For a future improvement, consider using a ref to store `onResolved` to decouple the callback identity from the effect trigger:
```tsx
const onResolvedRef = useRef(onResolved);
onResolvedRef.current = onResolved;

useEffect(() => {
  if (!normalizedDomain) {
    onResolvedRef.current?.(false);
  }
}, [normalizedDomain]);
```

---

_Reviewed: 2026-04-12T19:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
