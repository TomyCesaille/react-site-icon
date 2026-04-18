---
phase: 06-demo-site
plan: 01
subsystem: ui
tags: [astro, react, css-variables, dark-mode, demo-site, github-pages]

# Dependency graph
requires:
  - phase: 04-ci-cd
    provides: deploy.yml workflow with GitHub Pages configuration
  - phase: 02-core-component
    provides: SiteIcon component in dist/ via tsup build
provides:
  - Complete Astro demo site scaffold in docs/
  - CSS theme system with light/dark variables and code highlight tokens
  - Flashless dark mode via is:inline script
  - ThemeToggle Astro component with sun/moon SVG
  - Landing page with hero, why, install, and footer sections
  - Playground React island placeholder with client:visible
  - docs:dev and docs:build scripts in root package.json
affects: [06-02-PLAN, 06-03-PLAN]

# Tech tracking
tech-stack:
  added: [astro@6.1.5, @astrojs/react@5.0.3, concurrently@9.2.1]
  patterns: [Astro scoped styles, CSS custom properties theming, is:inline dark mode, React island with client:visible, file:.. library reference]

key-files:
  created:
    - docs/package.json
    - docs/astro.config.mjs
    - docs/tsconfig.json
    - docs/src/styles/global.css
    - docs/src/layouts/Layout.astro
    - docs/src/components/ThemeToggle.astro
    - docs/src/components/Playground.tsx
    - docs/src/pages/index.astro
    - docs/.gitignore
  modified:
    - package.json

key-decisions:
  - "Astro CSS import via frontmatter instead of link tag for proper build-time processing"
  - "docs/.gitignore created for .astro/ and dist/ generated directories"

patterns-established:
  - "CSS variables on :root/:root.dark for theming -- all components use var(--token)"
  - "is:inline script in head for flashless dark mode -- reads localStorage then matchMedia"
  - "Astro scoped styles in each .astro file -- no global class collisions"
  - "file:.. dependency for importing built library -- consumers see same import path"

requirements-completed: [DEMO-01, DEMO-03]

# Metrics
duration: 3min
completed: 2026-04-18
---

# Phase 6 Plan 01: Demo Site Shell Summary

**Astro demo site scaffolded with CSS theme system, flashless dark mode, and complete landing page sections including Playground island placeholder**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-18T19:04:52Z
- **Completed:** 2026-04-18T19:08:11Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Complete Astro project in docs/ with file:.. library reference, GitHub Pages config, and strict TypeScript
- CSS theme system with 7 color variables, 7 spacing tokens, monospace font stack, and 4 code highlight token classes for both light and dark themes
- Landing page with all static sections: header with ThemeToggle, hero with tagline/subtitle/badges, Playground island (client:visible), Why section with 3 feature bullets and naturalWidth teaser, Install section with code snippet, and footer with GitHub/npm/README links
- Root package.json updated with docs:dev (concurrently) and docs:build (chained builds) scripts

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Astro project and create static shell components** - `c727a29` (feat)
2. **Task 2: Create index.astro landing page with all static sections** - `c33ec67` (feat)

## Files Created/Modified
- `docs/package.json` - Astro project with react-site-icon file:.. dependency
- `docs/package-lock.json` - Generated lockfile for docs/ dependencies
- `docs/astro.config.mjs` - Astro config with site/base for GitHub Pages
- `docs/tsconfig.json` - Extends astro/tsconfigs/strict
- `docs/src/styles/global.css` - CSS variables for theming, typography, spacing, code tokens
- `docs/src/layouts/Layout.astro` - Base HTML layout with flashless dark mode script
- `docs/src/components/ThemeToggle.astro` - Sun/moon SVG toggle with localStorage persistence
- `docs/src/components/Playground.tsx` - Minimal placeholder (replaced by Plan 02)
- `docs/src/pages/index.astro` - Landing page with all sections and Playground island
- `docs/.gitignore` - Ignores .astro/, dist/, node_modules/
- `package.json` - Added concurrently, docs:dev, docs:build scripts

## Decisions Made
- Used Astro frontmatter CSS import (`import '../styles/global.css'`) instead of `<link>` tag for proper Astro build-time processing and bundling
- Created docs/.gitignore to exclude .astro/ generated types directory and dist/ build output from version control

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

| File | Line | Stub | Reason | Resolved By |
|------|------|------|--------|-------------|
| docs/src/components/Playground.tsx | 2 | Returns placeholder `<div>Playground loading...</div>` | Intentional -- Plan 02 replaces with full interactive component | Plan 06-02 |

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- docs/ Astro project builds successfully with both `npm run build --prefix docs` and `npm run docs:build`
- Playground.tsx placeholder present and imported with client:visible -- Plan 02 replaces it with the full interactive component
- All CSS variables and theme infrastructure ready for Playground to use
- Deploy workflow (Plan 03) can build on this foundation

## Self-Check: PASSED

All 10 created files verified on disk. Both commit hashes (c727a29, c33ec67) found in git log.

---
*Phase: 06-demo-site*
*Completed: 2026-04-18*
