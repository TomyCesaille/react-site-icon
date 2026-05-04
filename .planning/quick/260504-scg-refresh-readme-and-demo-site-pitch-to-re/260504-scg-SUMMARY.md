---
plan_id: 260504-scg
title: Refresh README and demo site pitch to reflect full library value
type: quick
status: completed
mode: quick
completed: 2026-05-04
tasks_completed: 2
tasks_total: 2
files_modified:
  - README.md
  - docs/src/pages/index.astro
commits:
  - 22c7061 docs(readme): refresh pitch to reflect full library value
  - 5984457 docs(site): expand demo-site pitch with concrete value bullets
---

# Phase quick Plan 260504-scg: Refresh README and demo site pitch Summary

Reframed README + demo-site pitch from a single "fallback detection" angle to a broader "favicons sound easy; they aren't — we hide the mess" framing, surfacing seven concrete behaviors the lib handles (size auto-bump, domain normalization, render strategies, hydration check, stale-prop guard, single CDN request) while preserving the existing globe-detection diagram and "Why other approaches fail" deep-dive intact.

## What changed

### Task 1 — README.md (commit `22c7061`)

- **Tagline** (line 3): `A React component to display any website's favicon from its domain. Zero dependencies. < 1KB.` → `Display any site's favicon effortlessly. One prop in, the right icon out. Zero dependencies. < 1KB.`
- **`## Why` section opening:** Replaced the single "no reliable fallback detection" sentence with a "Favicons sound easy. They aren't." hook + a 7-bullet list of concrete behaviors:
  - Reliable fallback detection (links to deep-dive)
  - Sharp at every size (whitelist + 16→24 auto-bump)
  - Forgiving domain input (hostname / URL / URL+path)
  - Three render strategies (`lazy` / `eager` / `hidden`)
  - SSR + hydration aware (`img.complete` ref-callback check)
  - Stale-prop safe (no flash-through on rapid `domain` changes)
  - One CDN request
- **Existing deep-dive preserved verbatim** under a new `### How it works` H3 inside the same `## Why` H2 — diagram, `naturalWidth` explanation, "Why other approaches fail" alternatives all intact.
- Net diff: +14 / -2 lines.

### Task 2 — docs/src/pages/index.astro (commit `5984457`)

- **Hero subtitle:** `Zero dependencies. &lt; 1KB.` → `Display any site's favicon effortlessly. Zero deps. &lt; 1KB.` (user-approved line)
- **`.why ul`:** Expanded from 3 generic bullets to 5 concrete bullets covering globe-detection, 16→24 size auto-bump, forgiving domain shape, SSR/hydration safety, and bundle/zero-deps/React-version compatibility.
- Corner banner, badges, footer, theme toggle, Playground, and all CSS untouched per scope.
- Net diff: +6 / -4 lines.

## Truthfulness check

Every technical claim in the new pitch was verified against `src/SiteIcon.tsx` (203 lines):

| Claim | Source-of-truth |
|-------|-----------------|
| Auto-bumps to 24px at `size=16` | Lines 70-72: `fetchSize = size === GOOGLE_GLOBE_SIZE ? DETECTION_MIN_FETCH_SIZE : size` |
| Whitelisted sizes `12 \| 16 \| 24 \| 28 \| 32 \| 40 \| 48 \| 50 \| 64 \| 96 \| 128` | Lines 12-23 (`SiteIconSize` union) |
| URL-based domain normalization (hostname / URL / URL+path) | Lines 41-50 (`normalizeDomain` uses `new URL()`) |
| Three render strategies | Lines 36, 162-198 (switch in render) |
| `img.complete` post-mount via ref callback | Lines 96-103 (`checkComplete`) |
| Stale-prop safe via domainRef guard | Lines 124-135 (`if (domainRef.current !== normalizedDomain) return`) |
| Single CDN request | One `<img>` per render path; no canvas / no second fetch |
| `naturalWidth` detection | Lines 99, 126 (`naturalWidth > GOOGLE_GLOBE_SIZE`) |

No discrepancies between the pitch and the source.

## Verification results

**Task 1 (README):**
- `grep -c "## Why" README.md` → 1 (no duplicate H2s)
- `grep -c "effortlessly" README.md` → 1 (new tagline present)
- `grep -c "naturalWidth" README.md` → 3 (preserved in deep-dive — diagram + bullet)
- `grep -c "Sharp at every size" README.md` → 1
- `grep -c "Display any site's favicon effortlessly" README.md` → 1
- `grep -c "fallback detection" README.md` → 1 (deep-dive preserved)
- `grep -c "### How it works" README.md` → 1

**Task 2 (demo site):**
- `grep -c "effortlessly" docs/src/pages/index.astro` → 1
- `grep -c "Auto-bumps" docs/src/pages/index.astro` → 1
- `grep -c "<li>" docs/src/pages/index.astro` → 5 (was 3)
- `cd docs && npx astro build` → `Complete!` in 810ms, exit 0, no errors

**Visual smoke-test — user's job.** Recommended manual checks:
- Open README on GitHub: confirm new tagline + 7 bullets render before the diagram, and the diagram + alternatives still appear under "How it works".
- Open demo site (`npm --prefix docs run dev`): confirm hero subtitle reads new line and "Why react-site-icon?" lists 5 bullets in expected order.

## Deviations from Plan

None — plan executed exactly as written. Voice and hero subtitle were pre-approved by the user; bullet wording matches the plan verbatim.

## Out of scope (untouched, per plan)

- `src/` — no source-code changes.
- README `## Compare`, `## API`, `## Strategies`, `## Advanced`, `## Install`, `## Contributing`, `## License` sections — all preserved.
- Demo site corner banner, badges, footer, Playground, theme toggle, CSS — all preserved.
- ROADMAP.md — not updated per orchestrator instructions.

## Self-Check: PASSED

- [x] `README.md` exists and contains new tagline + bulleted list + `### How it works` deep-dive
- [x] `docs/src/pages/index.astro` exists and contains new subtitle + 5 `<li>` items
- [x] Commit `22c7061` exists in `git log` (verified via subsequent commit chain)
- [x] Commit `5984457` exists in `git log` (HEAD points to it)
- [x] Astro build succeeds with exit 0
- [x] No `src/` files modified (verified — both commits touched only README.md and docs/src/pages/index.astro)
- [x] No new dependencies added (no package.json changes)
