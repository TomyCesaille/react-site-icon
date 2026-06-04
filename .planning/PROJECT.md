# react-site-icon

## What This Is

A zero-dependency React component that displays any website's favicon from its domain name. It fetches favicons from Google's faviconV2 CDN and uses a `naturalWidth` check to detect Google's default globe fallback -- the key insight that no other library implements. Packaged as a lightweight npm library with a demo site for discoverability.

## Core Value

Reliably display any website's favicon with correct fallback detection -- fast (single CDN request, no waterfall), tiny (< 1KB), zero dependencies.

## Current State

**Shipped:** v1.0 MVP (2026-04-19)
**Package:** 855 bytes gzipped, dual ESM+CJS, TypeScript declarations
**Codebase:** 2,680 LOC (TypeScript, Astro, CSS), 40 tests, 41/41 requirements satisfied
**Infrastructure:** GitHub Actions CI/CD, OIDC npm publishing, GitHub Pages demo site
**Demo:** [jorislacance.github.io/react-site-icon](https://jorislacance.github.io/react-site-icon/)

## Requirements

### Validated

- ✓ COMP-01 through COMP-13: Full SiteIcon component API (domain, size, fallback, className, style, alt, onResolved, ref forwarding, restProps) -- v1.0
- ✓ BUILD-01 through BUILD-08: TypeScript strict, dual ESM+CJS via tsup, "use client" banner, correct exports field, React externalized, files whitelist, < 1KB bundle, React 17/18/19 peer deps -- v1.0
- ✓ TEST-01 through TEST-03: Vitest + Testing Library suite (40 tests), mocked image loading, attw export validation -- v1.0
- ✓ DOCS-01 through DOCS-06: Cognitive funneling README, badges, keywords, comparison table, StackBlitz link, API table -- v1.0
- ✓ DEMO-01 through DEMO-03: Astro landing page, interactive playground, GitHub Pages deployment -- v1.0
- ✓ CICD-01 through CICD-04: CI quality gates, OIDC npm publishing, GitHub Pages deployment, Changesets versioning -- v1.0
- ✓ TOOL-01 through TOOL-04: ESLint 10, Prettier, Husky/lint-staged, Changesets -- v1.0

### Active

(No active requirements -- next milestone not yet planned)

### Out of Scope

- Styling props (border, padding, bgColor) -- CSS via className/style is sufficient
- Direct favicon.ico fetch from target domains -- unreliable, adds latency
- Canvas/image comparison for fallback detection -- requires CORS, brittle
- fetch() pre-checks -- CORS-blocked on Google's CDN
- crossOrigin attribute on img -- causes CORS errors with Google's CDN
- Blog posts, social media promotion, or comparison benchmarks
- Server-side favicon fetching/scraping
- Hook API (useSiteIcon) -- single component export, keep it simple
- Mobile app / React Native version

## Context

- **Shipped v1.0** on 2026-04-19 with 855 bytes gzipped bundle
- Google's faviconV2 endpoint (`t1.gstatic.com/faviconV2`) returns real favicons at requested size but a 16x16 default globe for unknown domains -- this size mismatch is the detection mechanism
- naturalWidth > 16 threshold detects Google's default globe; size=16 uses naturalWidth > 0 check since globe and valid favicons are both 16px
- Closest competitor is `favicon-stealer` (47 stars) which uses a slow waterfall strategy and has 15+ styling props that overlap with CSS
- Target audience: React developers building bookmark managers, link previews, dashboards, admin panels

## Constraints

- **Bundle size**: < 1KB minified+gzipped -- this is the library's competitive edge
- **Dependencies**: Zero runtime dependencies -- only React as peer dependency
- **React compatibility**: Must work with React 18 and 19 (React 17 support dropped 2026-06-04 in v1.0)
- **License**: MIT
- **Build tooling**: tsup (ESM + CJS), vitest, TypeScript strict
- **Hosting**: GitHub Pages for demo site, npm registry for package
- **Publishing**: Automated via Changesets + GitHub Actions OIDC

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Google faviconV2 CDN only (no target domain fetch) | Avoids waterfall latency, CORS issues, and DNS timeouts on dead domains | ✓ Good -- single CDN request, fast and reliable |
| naturalWidth detection (not fetch/canvas) | Works without CORS; Google's default globe is always 16x16 regardless of requested size | ✓ Good -- proven approach, 855 bytes |
| Single repo (library at root, demo in /docs) | Simple setup; `"files": ["dist"]` keeps npm clean | ✓ Good -- clean separation |
| Astro + React for demo site | Static HTML for SEO + React islands for interactive playground | ✓ Good -- fast static site with interactive playground |
| Changesets-driven publishing (not git tag) | Explicit version control, automated PRs, CHANGELOG generation | ✓ Good -- D-01 decision, clean workflow |
| Strip protocols from domain input | Better DX -- accept `https://github.com/path` not just `github.com` | ✓ Good -- zero user complaints |
| React 17+ support | Widest adoption -- no reason to exclude 17 for a simple component | ⚠ Reversed 2026-06-04 (v1.0): dropped React 17 — never CI-tested and shipped `"use client"` banner is RSC-era (18+). Now React 18/19 only. |
| esbuildOptions callback for "use client" | Avoids banner injection into .d.ts files | ✓ Good -- clean declarations |
| prevDomain state pattern (not useRef) | eslint-plugin-react-hooks 7.x refs rule compliance | ✓ Good -- consistent with modern React patterns |
| naturalWidth > 16 threshold | Google default globe is always 16x16; size=16 uses > 0 fallback | ✓ Good -- validated in testing + production |
| Post-mount useEffect for cached images | Fixes SSR hydration bug where .complete images skip onLoad | ✓ Good -- 5 hydration tests confirm |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check -- still the right priority?
3. Audit Out of Scope -- reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-19 after v1.0 milestone*
