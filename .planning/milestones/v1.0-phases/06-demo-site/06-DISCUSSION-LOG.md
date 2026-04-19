# Phase 6: Demo Site - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 06-demo-site
**Areas discussed:** Page structure & content, Playground design, Visual style & layout, Component integration

---

## Page Structure & Content

| Option | Description | Selected |
|--------|-------------|----------|
| Playground-first | Hero + playground front and center, minimal marketing below | ✓ |
| Full landing page | Hero + playground + features + how-it-works + comparison + install + footer | |
| Bare minimum | Just playground + install + GitHub link, no marketing | |

**User's choice:** Playground-first
**Notes:** Let the interactive demo sell the library, with minimal supporting content.

| Option | Description | Selected |
|--------|-------------|----------|
| Pre-filled grid | 6-8 well-known domains rendered on load, user adds their own | ✓ |
| Empty until interaction | Input only, visitor must type first | |
| Animated entrance | Domains appear one-by-one with staggered animation | |

**User's choice:** Pre-filled grid
**Notes:** Instant proof the component works — no action needed to see favicons.

| Option | Description | Selected |
|--------|-------------|----------|
| Technical differentiator | Focus on naturalWidth detection insight, why other approaches fail | |
| Feature bullets | < 1KB, zero deps, SSR-safe — quick scannable list | |
| Both briefly | Feature bullets + one-sentence teaser about detection with README link | ✓ |

**User's choice:** Both briefly
**Notes:** Hybrid approach — scannable features with a hook into the technical depth in the README.

---

## Playground Design

| Option | Description | Selected |
|--------|-------------|----------|
| Single input + grid | Text input, Enter adds to grid, pre-filled domains already showing | |
| Input + code preview | Text input with live JSX code snippet alongside | ✓ |
| Multi-input form | Multiple input fields like a table, each row is domain + favicon | |

**User's choice:** Input + code preview
**Notes:** Developers can see and copy the exact JSX they'd use in their project.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, toggle switcher | Radio buttons/tabs to switch lazy/eager/hidden | |
| No, just default | Keep playground simple, strategy docs in README | |
| Advanced panel | Collapsible section with strategy toggle + size slider | ✓ |

**User's choice:** Advanced panel
**Notes:** Power users can explore, casual visitors see a clean default interface.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, live sync | Code snippet updates in real-time as props change | ✓ |
| Static snippet | Fixed code example, doesn't reflect current props | |

**User's choice:** Yes, live sync
**Notes:** What you see is what you'd paste — powerful demo of the component.

---

## Visual Style & Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal dev-tool | Clean, monochrome, accent color, monospace headings | ✓ |
| Polished marketing | Gradient hero, rounded cards, animations | |
| GitHub-native | Matches GitHub's color palette and spacing | |

**User's choice:** Minimal dev-tool
**Notes:** Signals "serious library" to the developer audience.

| Option | Description | Selected |
|--------|-------------|----------|
| Astro scoped styles | Native <style> blocks, zero extra dependencies | ✓ |
| Tailwind CSS | Utility-first, adds build dependency | |
| Vanilla CSS file | Single global CSS file | |

**User's choice:** Astro scoped styles
**Notes:** Keeps the demo site as lean as the library itself.

| Option | Description | Selected |
|--------|-------------|----------|
| Dark only | Single dark theme, no toggle needed | |
| Light only | Single light theme, conventional | |
| System preference | Respects prefers-color-scheme | |

**User's choice:** System preference with manual toggle (Other)
**Notes:** Both light and dark themes, defaults to OS preference, with a toggle for manual override. User noted: "It makes sense since it's for an UI icon react component" — demonstrating the component works on both backgrounds.

---

## Component Integration

| Option | Description | Selected |
|--------|-------------|----------|
| Local src/ import | Import directly from ../../src/SiteIcon | |
| Built dist/ import | Import from built package, build runs automatically | ✓ |
| npm workspace link | Configure docs/ as npm workspace | |

**User's choice:** Built dist/ import with automatic build
**Notes:** User wanted option 2 (realistic consumer experience) but with automatic build — no manual step needed.

| Option | Description | Selected |
|--------|-------------|----------|
| Build once, then dev | npm run build once at startup, re-run on library changes | |
| Watch + rebuild | tsup --watch in parallel with Astro dev | ✓ |

**User's choice:** Watch + rebuild
**Notes:** Seamless dev experience — library rebuilds on src/ changes, Astro hot-reloads.

| Option | Description | Selected |
|--------|-------------|----------|
| client:visible | Hydrates when playground scrolls into view | ✓ |
| client:load | Hydrates immediately on page load | |
| client:idle | Hydrates when browser is idle | |

**User's choice:** client:visible
**Notes:** Near-immediate hydration on a playground-first page without blocking initial paint.

---

## Claude's Discretion

- Pre-filled domain selection, color palette, concurrency tooling, Astro project structure, code preview formatting, dark mode toggle placement

## Deferred Ideas

None — discussion stayed within phase scope
