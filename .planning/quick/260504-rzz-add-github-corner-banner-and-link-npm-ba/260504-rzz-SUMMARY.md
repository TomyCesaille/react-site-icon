---
quick_id: 260504-rzz
status: complete
completed: 2026-05-04
files_modified:
  - docs/src/pages/index.astro
commits:
  - 8637b73: "feat: add GitHub corner ribbon and link npm badge"
requirements:
  - QUICK-01-github-corner
  - QUICK-02-link-npm-badge
---

# Quick Task 260504-rzz: GitHub Corner Banner + Clickable npm Badge

One-liner: Added a Tholman-style GitHub corner ribbon fixed top-right of the demo site, and wrapped the npm version badge in an anchor — both single-file edits to `docs/src/pages/index.astro` with zero new dependencies.

## What Changed

Single file modified: `docs/src/pages/index.astro` (+78 / -1 lines).

### Edit A — GitHub corner ribbon (top-right, fixed)

Inserted an `<a class="github-corner">` as the first child inside the `<Layout>` slot, containing the canonical Tholman 80x80 SVG (corner triangle + octocat body + animated arm path). Anchor attributes: `href="https://github.com/TomyCesaille/react-site-icon"`, `target="_blank"`, `rel="noopener noreferrer"`, `aria-label="View source on GitHub"`. The inner `<svg>` carries `aria-hidden="true"` so screen readers announce only the anchor's accessible name.

### Edit B — Clickable npm version badge

Wrapped the `https://img.shields.io/npm/v/react-site-icon` `<img>` in an anchor pointing to `https://www.npmjs.com/package/react-site-icon` with `target="_blank"`, `rel="noopener noreferrer"`, `aria-label="View react-site-icon on npm"`. The other four badges (bundle size, TypeScript, license, CI) were intentionally **left unwrapped** per the plan's `must_haves.truths`.

### Edit C — Scoped styles

Appended a `.github-corner` rule block to the existing `<style>` element. Theming uses only existing CSS variables:
- `color: var(--bg)` on the anchor — the octocat body uses `fill="currentColor"` so the body matches the page background in both light and dark themes.
- `.corner-bg { fill: var(--accent) }` — corner triangle uses the project's accent token.
- `position: fixed; top: 0; right: 0; z-index: 10` — anchored to the viewport, sits above page content (the centered `.page-wrapper` in `Layout.astro` is unaffected because `position: fixed` is removed from flow).
- `:hover` scales the SVG and runs `octocat-wave` keyframes on `.octo-arm` for the standard Tholman wave.
- `@media (max-width: 500px)` shrinks the SVG to 60x60 and runs the wave on load (since touch devices have no hover).
- `@media (prefers-reduced-motion: reduce)` disables transitions and animations entirely.

No new color literals introduced; no new CSS variables; no new files; no `package.json` changes.

## Verification

| Check | Result |
| ----- | ------ |
| `astro check` | Skipped — `@astrojs/check` is not installed in `docs/` (pre-existing condition, not a regression). |
| `astro build` | **Passed** — `docs/` builds clean: 1 page generated in 865ms with no warnings or errors. |
| `git diff --stat` | Only `docs/src/pages/index.astro` changed (78 insertions, 1 deletion). |
| Done criteria — corner anchor present with verified attributes | Verified by re-reading the file (lines 8-28). |
| Done criteria — npm `<img>` wrapped in anchor with verified URL | Verified (lines 39-41). |
| Done criteria — other 4 badges unwrapped | Verified (lines 42-45 are bare `<img>` tags). |
| Done criteria — `.github-corner` rules use `var(--accent)` and `var(--bg)` | Verified (lines 181-188, 190-192). |

## Manual Spot-Check (User Action Required)

Visual verification cannot be performed from this agent. Please run:

```bash
cd docs && npm run dev
```

Then in the browser:
1. Confirm the GitHub corner ribbon renders top-right and stays fixed while scrolling.
2. Click the ribbon — should open `https://github.com/TomyCesaille/react-site-icon` in a new tab.
3. Click the npm version badge (leftmost colored badge under the hero) — should open `https://www.npmjs.com/package/react-site-icon` in a new tab.
4. Click each of the other four badges — they should NOT navigate anywhere (still plain `<img>` tags).
5. Toggle dark mode — corner triangle should switch to the dark accent (`#4d9fff`), octocat body should remain readable against the page (uses `var(--bg)` so it matches the dark page background; the contrast against the triangle is what makes the silhouette visible).
6. Tab into the page — the corner ribbon should be focusable and show the global focus ring (`outline: 2px solid var(--accent)` from `global.css:62`).
7. Hover the corner — SVG should scale 1.05x and the octocat arm should wave.
8. Resize to mobile width (< 500px) — ribbon shrinks to 60x60 and the arm waves on each render rather than on hover.

## Deviations from Plan

None — plan executed exactly as written. The only minor environmental note is that `astro check` was unavailable due to missing `@astrojs/check` package in `docs/` (a pre-existing condition unrelated to this task), so verification used `astro build` instead, which exercises the same parser and template type-check pipeline.

## Self-Check: PASSED

- File `docs/src/pages/index.astro` modified (verified via `git diff --stat`).
- Commit `8637b73` exists in `git log` with the expected message.
- No unintended deletions in the commit.
- No files created outside the planning directory.
- Plan-mandated invariants verified by re-reading the modified file.
