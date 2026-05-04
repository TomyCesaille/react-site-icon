---
quick_id: 260504-rzz
type: execute
wave: 1
depends_on: []
files_modified:
  - docs/src/pages/index.astro
autonomous: true
requirements:
  - QUICK-01-github-corner
  - QUICK-02-link-npm-badge

must_haves:
  truths:
    - "A GitHub corner ribbon is visible in the top-right of the demo site on every viewport, regardless of scroll position"
    - "Clicking the corner ribbon opens https://github.com/TomyCesaille/react-site-icon in a new tab"
    - "Clicking the npm version badge opens https://www.npmjs.com/package/react-site-icon in a new tab"
    - "The corner ribbon is keyboard-accessible and announced as 'View source on GitHub' to screen readers"
    - "The corner ribbon respects light/dark themes (uses --accent and --bg CSS variables)"
    - "No new runtime dependencies were added; the only change is HTML/CSS in a single Astro file"
    - "The other four badges (bundle size, TypeScript, license, CI) remain plain images, NOT wrapped in anchors"
  artifacts:
    - path: "docs/src/pages/index.astro"
      provides: "Updated landing page with GitHub corner ribbon and clickable npm badge"
      contains: "aria-label=\"View source on GitHub\""
  key_links:
    - from: "docs/src/pages/index.astro (corner ribbon <a>)"
      to: "https://github.com/TomyCesaille/react-site-icon"
      via: "anchor href with target=\"_blank\" rel=\"noopener noreferrer\""
      pattern: "github\\.com/TomyCesaille/react-site-icon"
    - from: "docs/src/pages/index.astro (npm badge wrapper <a>)"
      to: "https://www.npmjs.com/package/react-site-icon"
      via: "anchor href wrapping the npm version <img>"
      pattern: "npmjs\\.com/package/react-site-icon"
---

<objective>
Make the demo site surface its source-code repo and npm package more prominently.

1. Add a GitHub corner ribbon (Tholman-style inline SVG) fixed to the top-right of the page so the repo link is visible from anywhere on the demo.
2. Wrap the existing npm version `<img>` badge in an anchor so visitors can click straight through to the package page.

Purpose: The current footer-only repo link underexposes the GitHub repo, and the unclickable npm badge is a UX papercut. Both fixes are zero-dependency, single-file edits that match the project's "tiny + zero deps" ethos.

Output: A single modified file (`docs/src/pages/index.astro`) with the corner ribbon markup, scoped styles for it (using existing CSS variables), and the npm badge wrapped in an anchor.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@./CLAUDE.md
@docs/src/pages/index.astro
@docs/src/styles/global.css
@docs/src/layouts/Layout.astro

<interfaces>
<!-- Existing CSS variables available in scope (from docs/src/styles/global.css) -->

Light theme tokens (`:root`):
- `--bg: #ffffff`
- `--text: #1a1a1a`
- `--accent: #0066ff`
- `--border: #e0e0e0`

Dark theme tokens (`:root.dark`):
- `--bg: #0d0d0d`
- `--text: #e5e5e5`
- `--accent: #4d9fff`

Spacing tokens:
- `--space-xs` (4px), `--space-sm` (8px), `--space-md` (16px)

Repo URL (verified in existing footer at index.astro line 44):
- `https://github.com/TomyCesaille/react-site-icon`

npm package URL (verified in existing footer at index.astro line 46):
- `https://www.npmjs.com/package/react-site-icon`

Page structure note: `docs/src/layouts/Layout.astro` wraps content in a `.page-wrapper` with `max-width: 640px; margin: 0 auto`. The corner ribbon must use `position: fixed` and live OUTSIDE that wrapper visually (i.e., anchored to the viewport, not the centered column). Placing the `<a>` inside the page works fine since `position: fixed` removes it from the flow.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add GitHub corner ribbon and link npm badge</name>
  <files>docs/src/pages/index.astro</files>
  <action>
Make two coordinated edits to `docs/src/pages/index.astro`:

**Edit A — Add GitHub corner ribbon**

Insert a new `<a class="github-corner">` element as the FIRST child inside the `<Layout>` slot (before the `<header>` element on line 8). Use the standard Tholman-style inline SVG (80x80 viewBox 0 0 250 250). Anchor attributes:
- `href="https://github.com/TomyCesaille/react-site-icon"` (verified — same URL the footer already uses)
- `target="_blank"`
- `rel="noopener noreferrer"`
- `aria-label="View source on GitHub"`

SVG markup (use this exact structure — it's the canonical Tholman corner with the octocat arm/body paths):

```html
<a
  class="github-corner"
  href="https://github.com/TomyCesaille/react-site-icon"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="View source on GitHub"
>
  <svg width="80" height="80" viewBox="0 0 250 250" aria-hidden="true">
    <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" class="corner-bg"></path>
    <path
      d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
      fill="currentColor"
      style="transform-origin: 130px 106px;"
      class="octo-arm"
    ></path>
    <path
      d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.1 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
      fill="currentColor"
    ></path>
  </svg>
</a>
```

**Edit B — Wrap npm version badge in anchor**

On line 17, the existing element is:
```html
<img src="https://img.shields.io/npm/v/react-site-icon" height="20" alt="npm version" />
```

Wrap ONLY this single `<img>` (the npm version badge) in an anchor:
```html
<a href="https://www.npmjs.com/package/react-site-icon" target="_blank" rel="noopener noreferrer" aria-label="View react-site-icon on npm">
  <img src="https://img.shields.io/npm/v/react-site-icon" height="20" alt="npm version" />
</a>
```

DO NOT wrap the other four badges (bundle size, TypeScript, license, CI) — only the npm version badge per the task spec.

**Edit C — Add scoped styles**

Inside the existing `<style>` block at the bottom of the file (after the existing `.footer .separator` rule near line 155), append the following rules:

```css
.github-corner {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10;
  color: var(--bg);
  line-height: 0;
}

.github-corner .corner-bg {
  fill: var(--accent);
}

.github-corner svg {
  display: block;
  transition: transform 200ms ease;
}

.github-corner:hover svg {
  transform: scale(1.05);
}

.github-corner:hover .octo-arm {
  animation: octocat-wave 560ms ease-in-out;
}

@keyframes octocat-wave {
  0%, 100% { transform: rotate(0); }
  20%, 60% { transform: rotate(-25deg); }
  40%, 80% { transform: rotate(10deg); }
}

@media (max-width: 500px) {
  .github-corner svg {
    width: 60px;
    height: 60px;
  }
  .github-corner:hover .octo-arm {
    animation: none;
  }
  .github-corner .octo-arm {
    animation: octocat-wave 560ms ease-in-out;
  }
}

@media (prefers-reduced-motion: reduce) {
  .github-corner svg,
  .github-corner .octo-arm {
    transition: none;
    animation: none;
  }
}
```

Notes on the styling choices:
- `color: var(--bg)` makes the octocat body match the page background (white body on light theme, near-black body on dark theme), and the corner triangle uses `var(--accent)` via `.corner-bg`. This achieves automatic dark-mode parity using existing tokens — no new variables introduced.
- `position: fixed` keeps the ribbon visible while scrolling. `z-index: 10` keeps it above the theme toggle which has no explicit z-index but lives in normal flow.
- `prefers-reduced-motion` block disables animation for accessibility.
- The mobile media query shrinks the ribbon and reverses the wave (animates on tap rather than hover) since hover doesn't exist on touch devices.
- No new files, no new dependencies — pure inline SVG + scoped CSS.

Implementation order recommendation: do Edit B first (smallest, least risky), then Edit A, then Edit C. Run the demo dev server (`pnpm --dir docs dev` or equivalent) and verify visually.
  </action>
  <verify>
    <automated>cd docs && (pnpm exec astro check 2>&1 || npx astro check 2>&1) | tail -20</automated>
  </verify>
  <done>
    - `docs/src/pages/index.astro` contains a `<a class="github-corner" ...>` element pointing to `https://github.com/TomyCesaille/react-site-icon` with `aria-label="View source on GitHub"`, `target="_blank"`, and `rel="noopener noreferrer"`.
    - The npm version `<img>` (the one with `src="https://img.shields.io/npm/v/react-site-icon"`) is wrapped in an `<a href="https://www.npmjs.com/package/react-site-icon" target="_blank" rel="noopener noreferrer">`.
    - The other four badges (bundle size, TypeScript, license, CI) are NOT wrapped in anchors.
    - The `<style>` block contains `.github-corner` rules using `var(--accent)` and `var(--bg)` (no new color literals introduced for theming).
    - `astro check` passes with no new errors.
    - No new files created, no `package.json` dependency changes.
    - Manual visual smoke test: corner ribbon renders top-right in both light and dark themes, npm badge is clickable and opens the package page in a new tab.
  </done>
</task>

</tasks>

<verification>
After implementation:
1. Run `cd docs && npx astro check` — expect no new errors.
2. Run `cd docs && npx astro dev` and open the local URL.
3. Confirm the GitHub corner ribbon is visible in the top-right corner.
4. Click the ribbon — should open `https://github.com/TomyCesaille/react-site-icon` in a new tab.
5. Click the npm version badge (the leftmost colored badge) — should open `https://www.npmjs.com/package/react-site-icon` in a new tab.
6. Click each of the other four badges — they should NOT navigate (still plain images).
7. Toggle dark mode — corner ribbon should remain readable: octocat body matches background, triangle uses accent color.
8. Tab through the page — the corner ribbon anchor should be focusable and show the focus ring (`outline: 2px solid var(--accent)` from global.css).
9. Verify `git diff --stat` shows ONLY `docs/src/pages/index.astro` changed.
</verification>

<success_criteria>
- Corner ribbon renders top-right and links to the verified repo URL.
- npm version badge is clickable and links to the package page.
- Other badges remain unchanged (no scope creep).
- Light/dark theme parity preserved via existing CSS variables.
- Zero new dependencies, zero new files, zero changes outside `docs/src/pages/index.astro`.
- No new TypeScript or Astro check errors.
</success_criteria>

<output>
After completion, create `.planning/quick/260504-rzz-add-github-corner-banner-and-link-npm-ba/260504-rzz-SUMMARY.md` documenting:
- Final markup additions (corner ribbon + anchor wrap).
- Confirmation that no other badges were modified.
- Any visual notes from manual verification (e.g., "octocat color in dark mode reads as expected").
</output>
