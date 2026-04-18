---
phase: 06-demo-site
reviewed: 2026-04-18T19:14:44Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - docs/.gitignore
  - docs/astro.config.mjs
  - docs/package.json
  - docs/src/components/Playground.tsx
  - docs/src/components/ThemeToggle.astro
  - docs/src/layouts/Layout.astro
  - docs/src/pages/index.astro
  - docs/src/styles/global.css
  - docs/tsconfig.json
  - package.json
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-04-18T19:14:44Z
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Summary

The demo site is a well-structured Astro project with a React playground component. The code is clean, accessible (good use of `aria-label`, `aria-expanded`, `aria-controls`, visually-hidden labels), and properly themed (light/dark). The library integration via `file:..` is correct for local development.

Four warnings were found: a missing `favicon.svg` asset that will cause a 404, a type assertion without validation, a flash-of-incorrect-theme risk on the toggle button, and a hardcoded `max-height` that could clip the advanced panel. Three info-level items cover minor improvements.

No critical issues found. No security vulnerabilities detected.

## Warnings

### WR-01: Missing favicon.svg causes 404 on every page load

**File:** `docs/src/layouts/Layout.astro:22`
**Issue:** The layout references `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` but there is no `docs/public/` directory and no `favicon.svg` file exists. This will produce a 404 on every page load and a broken favicon in browser tabs.
**Fix:** Create `docs/public/favicon.svg` with a simple SVG icon, or remove the `<link>` tag if no favicon is desired.

### WR-02: Unchecked type assertion on strategy select value

**File:** `docs/src/components/Playground.tsx:247`
**Issue:** The `onChange` handler casts `e.target.value as 'lazy' | 'eager' | 'hidden'` without runtime validation. While the `<option>` values currently match the union type, this is fragile -- if the options are ever changed without updating the cast, the type system will not catch the mismatch at runtime, potentially passing an invalid strategy to `SiteIcon`.
**Fix:** Add a runtime guard or use a type-safe pattern:
```tsx
const STRATEGIES = ['lazy', 'eager', 'hidden'] as const;
type Strategy = (typeof STRATEGIES)[number];

// In the onChange handler:
onChange={(e) => {
  const val = e.target.value;
  if (STRATEGIES.includes(val as Strategy)) {
    setStrategy(val as Strategy);
  }
}}
```

### WR-03: Theme toggle aria-label can be stale on initial server render

**File:** `docs/src/components/ThemeToggle.astro:4`
**Issue:** The button's initial HTML is hardcoded as `aria-label="Switch to dark theme"`. However, the inline script in `Layout.astro` (lines 23-33) may set `class="dark"` on the `<html>` element before the ThemeToggle's `<script>` runs. There is a brief window where the button says "Switch to dark theme" but the page is already in dark mode (because the user's `localStorage` or `prefers-color-scheme` was dark). The ThemeToggle script does correct this (lines 65-69), but the initial server-rendered HTML is wrong for dark-theme users. This is a minor accessibility concern -- screen readers announcing the page before hydration completes will read the wrong label.
**Fix:** This is inherent to SSG and largely unavoidable without client-side rendering. The existing script at lines 64-69 already corrects it. To minimize the window, move the ThemeToggle's correction logic into the same inline `<script is:inline>` block in Layout.astro where the theme class is set:
```html
<script is:inline>
  const theme = (() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme');
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  })();
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  // Fix toggle button label immediately
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
</script>
```

### WR-04: Hardcoded max-height on advanced panel may clip content

**File:** `docs/src/components/Playground.tsx:220`
**Issue:** The advanced panel uses `maxHeight: showAdvanced ? '200px' : '0'` for its expand/collapse animation. At larger font sizes (browser zoom, accessibility settings) or narrower viewports where the flex-wrap causes content to stack, the actual content height could exceed 200px, clipping the controls. The `overflow: 'hidden'` (line 221) means clipped content is invisible and inaccessible.
**Fix:** Use a larger max-height value that provides comfortable headroom, or switch to a CSS approach that measures content height:
```tsx
style={{
  maxHeight: showAdvanced ? '500px' : '0',
  overflow: 'hidden',
  transition: 'max-height 200ms ease-out',
}}
```
A generous max-height (e.g., 500px) works because CSS transition still animates smoothly -- the animation just completes faster when actual height is smaller.

## Info

### IN-01: Visually-hidden label uses absolute positioning without a positioned ancestor

**File:** `docs/src/components/Playground.tsx:52-57`
**Issue:** The visually-hidden label uses `position: 'absolute'` to move it off-screen, but the parent `<section>` does not have `position: 'relative'`. In practice this works because the clipping technique (`width: 1px`, `height: 1px`, `overflow: hidden`, `clip: rect(0,0,0,0)`) ensures the label is invisible regardless of stacking context. However, it could theoretically affect layout in edge cases. Consider also adding `whiteSpace: 'nowrap'` to the standard visually-hidden pattern.
**Fix:** Add `whiteSpace: 'nowrap'` for a more robust visually-hidden pattern:
```tsx
style={{
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
}}
```

### IN-02: favicon href does not use Astro base path

**File:** `docs/src/layouts/Layout.astro:22`
**Issue:** The favicon link uses `href="/favicon.svg"` which is an absolute path. Since `astro.config.mjs` sets `base: '/react-site-icon'`, the favicon should be at `/react-site-icon/favicon.svg` in production. Astro automatically rewrites asset paths in most cases, but `<link>` hrefs in the `<head>` may not be rewritten depending on the Astro version. If the favicon is added later (see WR-01), verify the path resolves correctly under the base path.
**Fix:** When the favicon file is created, test the deployed path or use a dynamic approach:
```astro
<link rel="icon" type="image/svg+xml" href={`${import.meta.env.BASE_URL}favicon.svg`} />
```

### IN-03: Root package.json docs scripts assume npm prefix behavior

**File:** `package.json:37-38`
**Issue:** The `docs:dev` and `docs:build` scripts use `npm run dev --prefix docs` and `npm run build --prefix docs`. This works with npm but not with yarn or pnpm (they use different workspace syntaxes). Since the project uses npm (evidenced by no `yarn.lock` or `pnpm-lock.yaml`), this is fine, but worth noting if the package manager ever changes.
**Fix:** No action needed. Document the npm requirement in contributing guidelines if not already present.

---

_Reviewed: 2026-04-18T19:14:44Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
