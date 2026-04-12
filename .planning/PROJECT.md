# react-site-icon

## What This Is

A zero-dependency React component that displays any website's favicon from its domain name. It fetches favicons from Google's faviconV2 CDN and uses a `naturalWidth` check to detect Google's default globe fallback — the key insight that no other library implements. Packaged as a lightweight npm library with a demo site for discoverability.

## Core Value

Reliably display any website's favicon with correct fallback detection — fast (single CDN request, no waterfall), tiny (< 1KB), zero dependencies.

## Requirements

### Validated

- [x] SiteIcon component with domain, size, fallback, className, style, alt, onResolved props — Validated in Phase 2: core-component
- [x] Domain input normalization — strip protocols and paths (accept `https://github.com/path`, extract `github.com`) — Validated in Phase 2: core-component
- [x] naturalWidth fallback detection — Google returns 16x16 default globe when larger size requested — Validated in Phase 2: core-component
- [x] SSR-compatible — render fallback on server, load favicon on client — Validated in Phase 2: core-component
- [x] Unit tests with vitest + @testing-library/react — Validated in Phase 3: testing (35 tests, zero network requests)
- [x] Package export validation across all TypeScript resolution modes — Validated in Phase 3: testing
- [x] GitHub Actions CI — lint, test, build on PR/push — Validated in Phase 4: ci-cd-and-release-automation
- [x] GitHub Actions CD — auto-publish to npm via Changesets + OIDC Trusted Publishing — Validated in Phase 4: ci-cd-and-release-automation
- [x] GitHub Pages hosting for demo site — Validated in Phase 4: ci-cd-and-release-automation (deploy workflow ready, awaiting docs/ from Phase 6)
- [x] Changesets for versioning and changelog generation — Validated in Phase 4: ci-cd-and-release-automation

### Active
- [ ] TypeScript strict mode with shipped .d.ts declarations
- [ ] Dual ESM + CJS output via tsup
- [ ] React 17, 18, and 19 peer dependency support
- [x] README with badges, install instructions, API docs, usage examples, and comparison to alternatives — Validated in Phase 5: documentation
- [x] SEO-optimized package.json keywords for npm discoverability — Validated in Phase 5: documentation
- [ ] Demo site: Astro + React landing page with interactive "try it" playground
- [ ] ESLint + Prettier configuration
- [ ] Husky + lint-staged pre-commit hooks

### Out of Scope

- Styling props (border, padding, bgColor) — CSS via className/style is sufficient
- Direct favicon.ico fetch from target domains — unreliable, adds latency
- Canvas/image comparison for fallback detection — requires CORS, brittle
- fetch() pre-checks — CORS-blocked on Google's CDN
- crossOrigin attribute on img — causes CORS errors with Google's CDN
- Blog posts, social media promotion, or comparison benchmarks
- Server-side favicon fetching/scraping
- Hook API (useSiteIcon) — single component export, keep it simple
- Mobile app / React Native version

## Context

- The core `naturalWidth` detection approach is already validated in a production project
- Google's faviconV2 endpoint (`t1.gstatic.com/faviconV2`) returns real favicons at requested size but a 16x16 default globe for unknown domains — this size mismatch is the detection mechanism
- Closest competitor is `favicon-stealer` (47 stars) which uses a slow waterfall strategy (target domain first, then Google) and has 15+ styling props that overlap with CSS
- The name `react-site-icon` is available on npm (verified March 2026)
- Target audience: React developers building bookmark managers, link previews, dashboards, admin panels — anywhere external site favicons appear

## Constraints

- **Bundle size**: < 1KB minified+gzipped — this is the library's competitive edge
- **Dependencies**: Zero runtime dependencies — only React as peer dependency
- **React compatibility**: Must work with React 17, 18, and 19
- **License**: MIT
- **Build tooling**: tsup (ESM + CJS), vitest, TypeScript strict
- **Hosting**: GitHub Pages for demo site, npm registry for package
- **Publishing**: Automated via GitHub Actions on git tag

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Google faviconV2 CDN only (no target domain fetch) | Avoids waterfall latency, CORS issues, and DNS timeouts on dead domains | -- Pending |
| naturalWidth detection (not fetch/canvas) | Works without CORS; Google's default globe is always 16x16 regardless of requested size | -- Pending |
| Single repo (library at root, demo in /docs) | Simple setup; `"files": ["dist"]` keeps npm clean; standard for small libraries | -- Pending |
| Astro + React for demo site | Static HTML for SEO + React islands for interactive playground | -- Pending |
| Auto-publish on git tag | Changesets + GitHub Actions = reliable, auditable releases | -- Pending |
| Strip protocols from domain input | Better DX — accept `https://github.com/path` not just `github.com` | -- Pending |
| React 17+ support | Widest adoption — no reason to exclude 17 for a simple component | -- Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-12 — Phase 4 complete: CI/CD pipeline with quality gates, Changesets release automation via OIDC Trusted Publishing, GitHub Pages deploy workflow*
