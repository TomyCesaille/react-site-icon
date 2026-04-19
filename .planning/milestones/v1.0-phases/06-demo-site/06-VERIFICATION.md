---
phase: 06-demo-site
verified: 2026-04-19T05:40:00Z
status: passed
score: 14/14 must-haves verified
human_uat: 06-HUMAN-UAT.md (5/5 passed)
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 11/11
  gaps_closed:
    - "SiteIcon resolves favicons on initial page load after SSR hydration (no stuck loading state)"
    - "Strategy differences are visually explained in the demo so users understand what each option does"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Open docs dev server and verify favicons load on initial page render without interaction"
    expected: "All 7 real-domain favicons resolve immediately on page load. The 8th (this-domain-does-not-exist-xyz.com) shows '?' fallback. No favicons stuck in loading/fallback state."
    why_human: "Requires browser with JavaScript hydration to confirm the SSR hydration fix (plan 03) actually resolves favicons after Astro SSR pre-renders the detection img."
  - test: "Expand advanced panel and verify strategy descriptions appear and update"
    expected: "When 'Show Advanced' is clicked, the panel expands showing strategy select, size slider, and an italic description. Changing strategy to 'eager' shows the eager description. Changing to 'hidden' shows the hidden description."
    why_human: "Visual confirmation that the description text is readable, correctly positioned, and updates reactively in the browser."
  - test: "Verify GitHub Pages deployment end-to-end"
    expected: "Push to main triggers deploy workflow. Quality job passes (lint+test+build). Astro build job succeeds with withastro/action@v6. Deploy job publishes to GitHub Pages. Site accessible at jorislacance.github.io/react-site-icon."
    why_human: "Requires actual GitHub Actions execution and network access. The withastro/action@v6 build step needs to successfully resolve the file:.. library dependency."
---

# Phase 6: Demo Site Verification Report

**Phase Goal:** Visitors to the GitHub Pages site can interactively test the component with any domain before installing
**Verified:** 2026-04-19T05:40:00Z
**Status:** passed (HUMAN-UAT 5/5 passed 2026-04-19)
**Re-verification:** Yes -- after gap closure (plans 03 and 04)

## Goal Achievement

### Observable Truths

| # | Truth | Source | Status | Evidence |
|---|-------|--------|--------|----------|
| 1 | The demo site loads as a static page with marketing content (what, why, how) | Roadmap SC-1 | VERIFIED | index.astro lines 13-51: hero h1 "Display any website's favicon", Why section with 3 bullets + naturalWidth teaser, Install section with "npm install react-site-icon", footer with GitHub/npm/README links. Astro build produces 21KB index.html with all content. |
| 2 | Users can type any domain and see live favicon (or fallback) immediately | Roadmap SC-2 | VERIFIED | Playground.tsx: text input (line 70) wired to setDomain, allDomains (line 30) prepends user input to DEFAULT_DOMAINS, each domain rendered via SiteIcon (line 105) with size/strategy/fallback props. No debounce per spec. |
| 3 | Demo site config is correct for GitHub Pages and deploy workflow exists | Roadmap SC-3 | VERIFIED | astro.config.mjs: site 'https://jorislacance.github.io', base '/react-site-icon'. deploy.yml triggers on push to main, uses withastro/action@v6 and actions/deploy-pages@v4. Quality gate (lint+test+build) runs first. |
| 4 | Astro dev server starts and serves the landing page | Plan 01 | VERIFIED | docs/package.json has "dev": "astro dev". Root package.json has "docs:dev" with concurrently (tsup --watch + astro dev). Astro build exits 0. |
| 5 | Page displays hero, Why, Install, and footer sections | Plan 01 | VERIFIED | index.astro: hero h1 + subtitle + 3 badges (lines 13-21), Why h2 + 3 li items + teaser (lines 27-38), Install h2 + pre/code (lines 40-43), footer with 3 links (lines 45-51). All scoped styles present (lines 54-156). |
| 6 | Dark/light theme toggle works without FOUC | Plan 01 | VERIFIED | Layout.astro line 23: script is:inline reads localStorage then matchMedia, toggles 'dark' class before body renders. ThemeToggle.astro: button with sun/moon SVGs, :global(.dark) CSS toggles visibility, script updates localStorage + aria-label on click. |
| 7 | Playground is present with client:visible hydration | Plan 01 | VERIFIED | index.astro line 24: Playground client:visible. Playground.tsx exports default function (line 15). Build output in docs/dist/ includes React hydration JS bundles. |
| 8 | Pre-filled grid of 8 domains renders favicons on page load | Plan 02 | VERIFIED | Playground.tsx lines 4-13: DEFAULT_DOMAINS array has 8 entries (github.com through this-domain-does-not-exist-xyz.com). Line 30: allDomains uses DEFAULT_DOMAINS when input is empty. Grid rendered via .map() at line 94. |
| 9 | Code preview updates live with domain, strategy, size changes | Plan 02 | VERIFIED | Playground.tsx lines 143-203: pre/code block with token-keyword/string/tag/attr className spans. Line 172: displayDomain (computed from state) in code preview. Lines 174-192: conditional rendering of size (when != 32) and strategy (when != 'lazy'). |
| 10 | Advanced panel collapsed by default, expands on toggle | Plan 02 | VERIFIED | Playground.tsx line 21: useState(false) for showAdvanced. Lines 205-221: button with aria-expanded and aria-controls. Lines 223-229: maxHeight transition (200ms ease-out, 0 when hidden, 260px when shown). |
| 11 | Fallback "?" renders for non-existent domains | Plan 02 | VERIFIED | Playground.tsx line 12: 'this-domain-does-not-exist-xyz.com' in DEFAULT_DOMAINS. Lines 109-125: fallback prop renders span with "?" character, aria-hidden="true", sized to match size state. |
| 12 | SiteIcon resolves favicons on initial page load after SSR hydration (no stuck loading state) | Plan 03 (gap closure) | VERIFIED | SiteIcon.tsx lines 63-65: detectionRef and eagerInternalRef declared. Lines 86-103: useEffect (no deps) checks img.complete && naturalWidth > GOOGLE_DEFAULT_SIZE after mount. Transitions to 'found' or 'missing'. Status === 'loading' guard prevents re-fires. 5 hydration tests pass (SiteIcon.test.tsx lines 480-590). Bundle: 855 bytes gzipped. |
| 13 | Strategy descriptions appear when the advanced panel is expanded | Plan 04 (gap closure) | VERIFIED | Playground.tsx lines 23-27: strategyDescriptions Record with lazy/eager/hidden entries. Lines 292-303: paragraph with italic, 13px, text-muted styling renders strategyDescriptions[strategy]. maxHeight increased to 260px (line 226). |
| 14 | The playground remains clean and uncluttered for casual visitors | Plan 04 (gap closure) | VERIFIED | Advanced panel hidden by default (showAdvanced=false, maxHeight='0'). Description text only visible when panel expanded. Muted, italic, 13px styling keeps it subordinate. No extra UI in the main view. |

**Score:** 14/14 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `docs/package.json` | Astro project with react-site-icon file:.. dependency | VERIFIED | Contains astro ^6.1.5, @astrojs/react ^5.0.3, react-site-icon file:.. |
| `docs/astro.config.mjs` | Astro config with site/base for GitHub Pages | VERIFIED | site: jorislacance.github.io, base: /react-site-icon, integrations: [react()] |
| `docs/src/layouts/Layout.astro` | Base HTML layout with dark mode script and global CSS | VERIFIED | 50 lines. is:inline script with localStorage + matchMedia, slot, max-width: 640px wrapper |
| `docs/src/components/ThemeToggle.astro` | Dark/light mode toggle button | VERIFIED | 72 lines. Sun/moon SVGs, :global(.dark) toggling, localStorage persistence, aria-label updates |
| `docs/src/pages/index.astro` | Landing page with all sections and Playground island | VERIFIED | 157 lines. All 6 sections present, 3 imports, client:visible on Playground, full scoped styles |
| `docs/src/styles/global.css` | CSS variables for theming, typography, spacing | VERIFIED | 77 lines. Light/dark theme vars, --font-mono, --space-xs through --space-3xl, 4 token classes both themes |
| `docs/src/components/Playground.tsx` | Interactive playground with grid, input, code preview, strategy descriptions | VERIFIED | 307 lines (min: 100). Exports default function. Full implementation including strategyDescriptions map. |
| `src/SiteIcon.tsx` | Hydration-safe favicon detection with useEffect + ref check | VERIFIED | 183 lines. detectionRef + eagerInternalRef (lines 63-65). Post-mount useEffect checking .complete (lines 86-103). All strategies handled. |
| `src/SiteIcon.test.tsx` | Tests covering already-loaded image scenario | VERIFIED | 618 lines. 5 hydration tests in "hydration (pre-loaded images)" describe block (lines 480-590). All 40 tests pass. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| index.astro | Layout.astro | import Layout | WIRED | Line 2: import Layout from '../layouts/Layout.astro' |
| index.astro | ThemeToggle.astro | import ThemeToggle | WIRED | Line 3: import ThemeToggle from '../components/ThemeToggle.astro' |
| index.astro | Playground.tsx | client:visible hydration | WIRED | Line 4: import, line 24: Playground client:visible |
| Layout.astro | global.css | CSS import in frontmatter | WIRED | Line 2: import '../styles/global.css' |
| Playground.tsx | react-site-icon | import { SiteIcon } | WIRED | Line 2: import { SiteIcon } from 'react-site-icon'. Resolves via file:.. symlink. |
| SiteIcon.tsx | detection img element | useRef + useEffect checking .complete | WIRED | Lines 64/133: detectionRef attached to detection img. Lines 89-103: useEffect checks .complete after mount. |
| Playground.tsx | strategy select | description text updates when strategy changes | WIRED | Line 302: {strategyDescriptions[strategy]} renders current strategy description. Lines 252-253: setStrategy onChange wired to select. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| Playground.tsx | domain (useState) | User text input onChange | Yes - user types, state updates, allDomains recomputed | FLOWING |
| Playground.tsx | size (useState) | Range slider onChange | Yes - slider value propagated to SiteIcon size prop | FLOWING |
| Playground.tsx | strategy (useState) | Select onChange | Yes - value propagated to SiteIcon strategy prop and description lookup | FLOWING |
| Playground.tsx | DEFAULT_DOMAINS | Hardcoded array | Yes - 8 domains including fallback demo, rendered to SiteIcon | FLOWING (static by design) |
| Playground.tsx | strategyDescriptions[strategy] | Record lookup by strategy state | Yes - reactive text from map | FLOWING |
| SiteIcon.tsx | img.complete / img.naturalWidth | Browser img element properties | Yes - read from DOM after mount | FLOWING (browser API) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Library builds | npm run build | dist/index.js 1.48KB, dist/index.cjs 2.06KB, .d.ts files | PASS |
| Bundle size under 1KB gzipped | gzip -c dist/index.js | 855 bytes | PASS |
| Astro site builds | npm run docs:build | 1 page built in 896ms, docs/dist/index.html (21KB) | PASS |
| All 40 tests pass | npm test -- --run | 1 test file, 40 tests passed, 0 failures | PASS |
| Hydration tests present | grep 'hydration' src/SiteIcon.test.tsx | 5 tests in 'hydration (pre-loaded images)' describe block | PASS |
| Strategy descriptions in Playground | grep 'strategyDescriptions' Playground.tsx | Map with lazy/eager/hidden entries + rendered at line 302 | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| DEMO-01 | 06-01 | Astro + React landing page with marketing-style content (what, why, how) | SATISFIED | index.astro has hero (what), Why section (why), Install section (how), footer links. Layout with dark mode, CSS theme system. |
| DEMO-02 | 06-02, 06-04 | Interactive "try any domain" playground with live favicon preview | SATISFIED | Playground.tsx: text input, 8-domain grid with SiteIcon, fallback demo, code preview with syntax highlighting, advanced panel with strategy/size controls, strategy descriptions. |
| DEMO-03 | 06-01 | Demo site deployed to GitHub Pages via GitHub Actions | SATISFIED | astro.config.mjs has correct site/base for GitHub Pages. deploy.yml triggers on push to main, uses withastro/action@v6, deploys via actions/deploy-pages@v4. Actual deployment requires human verification. |
| COMP-09 | 06-03 | SiteIcon is SSR-compatible -- renders fallback on server, runs detection on client after hydration | SATISFIED | SiteIcon.tsx: post-mount useEffect checks img.complete + naturalWidth for already-loaded images. 5 hydration-specific tests pass. Bundle: 855 bytes gzipped. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | - | - | - | No TODO, FIXME, placeholder stubs, empty implementations, or console.log-only handlers in any modified files |

### Human Verification Required

### 1. SSR Hydration Fix -- Favicons Load on Initial Render

**Test:** Run `npm run docs:dev`, open browser, verify all favicons resolve on initial page load without any user interaction
**Expected:** All 7 real-domain favicons (github.com, google.com, stackoverflow.com, npmjs.com, twitter.com, reddit.com, dev.to) resolve immediately after page load. The 8th domain (this-domain-does-not-exist-xyz.com) shows the "?" fallback. No favicons stuck in loading/fallback state.
**Why human:** This is the core fix from plan 03. The useEffect + .complete check is verified in unit tests (mocking HTMLImageElement prototype), but the actual SSR hydration scenario -- where Astro pre-renders the detection img, the browser caches it, and React hydrates -- can only be confirmed in a real browser with the Astro dev server.

### 2. Strategy Descriptions in Advanced Panel

**Test:** Click "Show Advanced" and verify strategy descriptions appear. Switch between lazy/eager/hidden strategies.
**Expected:** When panel expands, an italic muted-color description appears below the controls. It reads "Shows your fallback while detecting..." for lazy, "Shows the favicon image immediately..." for eager, and "Shows an empty placeholder..." for hidden. Text updates reactively on strategy change.
**Why human:** Visual confirmation that the description text is readable, properly styled, and does not clip within the 260px max-height panel. This addresses the UAT cosmetic gap where strategy differences were imperceptible.

### 3. GitHub Pages Deployment

**Test:** Push to main branch and monitor GitHub Actions
**Expected:** Deploy workflow triggers. Quality job passes (lint+test+build). Astro build job succeeds with withastro/action@v6. Deploy job publishes to GitHub Pages. Site accessible at jorislacance.github.io/react-site-icon.
**Why human:** Requires actual GitHub Actions execution and network access. The withastro/action@v6 build step needs to resolve the file:.. library dependency in the runner environment.

### Gaps Summary

No automated verification gaps found. All 14 observable truths verified with code evidence. All 9 artifacts exist, are substantive (no stubs), and are correctly wired. All 7 key links verified. Both library and Astro builds succeed. All 4 requirements (DEMO-01, DEMO-02, DEMO-03, COMP-09) are satisfied by implementation evidence. All 40 tests pass including 5 new hydration tests.

**Gap closure assessment:** The 2 gaps identified during previous human UAT have been addressed:

1. **Hydration bug (major):** Plan 03 added a post-mount useEffect checking img.complete + naturalWidth with detectionRef/eagerInternalRef. 5 new tests cover lazy found, lazy globe, eager found, onResolved callback, and naturalWidth=0 scenarios. Bundle remains 855 bytes gzipped.

2. **Strategy visibility (cosmetic):** Plan 04 added a strategyDescriptions Record with concise explanations for each strategy, rendered as an italic paragraph in the advanced panel. maxHeight increased from 200px to 260px to accommodate.

3 items require human verification. Items 1 and 2 directly confirm the gap closure work from plans 03 and 04. Item 3 was blocked in the previous UAT round.

**Observation (not a gap):** The deploy workflow's build job (withastro/action@v6) runs on a separate runner from the quality job that builds the library. The file:.. dependency requires the library's dist/ to exist. The withastro/action may handle this via its install step, but this should be confirmed in human verification item 3.

---

_Verified: 2026-04-19T05:40:00Z_
_Verifier: Claude (gsd-verifier)_
