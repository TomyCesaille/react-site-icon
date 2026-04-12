---
phase: 04-ci-cd-and-release-automation
plan: 02
subsystem: infra
tags: [github-actions, ci, cd, oidc, changesets, github-pages, astro]

# Dependency graph
requires:
  - phase: 04-ci-cd-and-release-automation
    plan: 01
    provides: Repository identity in package.json, release script, .changeset/config.json repo field
  - phase: 01-project-scaffolding-and-build-pipeline
    provides: npm scripts (lint, typecheck, test, test:exports, format:check, build), tsup config, Changesets config
provides:
  - CI quality gates workflow enforcing lint, typecheck, test, exports, format, build, and bundle size on every PR and push to main
  - Release workflow automating Changesets version PRs and npm publishing via OIDC Trusted Publishing
  - Deploy workflow for GitHub Pages demo site with conditional skip when docs/ absent
affects: [06-demo-site, 05-documentation-and-discoverability]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CI pipeline: sequential fail-fast quality gates in single job (no matrix)"
    - "npm publishing: OIDC Trusted Publishing via id-token: write (no stored NPM_TOKEN)"
    - "Demo deploy: conditional job chain with docs/ existence check via sparse-checkout"
    - "Bundle size gate: gzip -c dist/index.js | wc -c with 1024 byte limit"

key-files:
  created:
    - .github/workflows/ci.yml
    - .github/workflows/release.yml
    - .github/workflows/deploy.yml
  modified: []

key-decisions:
  - "No decisions beyond plan -- all three workflows implemented exactly as specified"

patterns-established:
  - "Workflow action versions: actions/checkout@v4, actions/setup-node@v4, changesets/action@v1, withastro/action@v6, actions/deploy-pages@v4"
  - "OIDC npm publishing: registry-url on setup-node + id-token: write permission, no NPM_TOKEN secret"
  - "Conditional deploy: check job with sparse-checkout sets output, downstream jobs inherit skip via needs chain"

requirements-completed: [CICD-01, CICD-02, CICD-03, CICD-04]

# Metrics
duration: 2min
completed: 2026-04-12
---

# Phase 4 Plan 2: GitHub Actions Workflows Summary

**Three GitHub Actions workflows for CI quality gates with bundle size enforcement, Changesets release automation with OIDC npm publishing, and conditional GitHub Pages deployment**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-12T19:52:39Z
- **Completed:** 2026-04-12T19:54:47Z
- **Tasks:** 3
- **Files created:** 3

## Accomplishments
- CI workflow enforces sequential quality gates (lint, typecheck, test, test:exports, format:check, build) with a gzipped bundle size gate of 1024 bytes
- Release workflow uses changesets/action with OIDC Trusted Publishing -- no stored npm tokens needed after initial manual publish
- Deploy workflow conditionally builds and deploys Astro demo site to GitHub Pages, skipping cleanly when docs/ directory does not exist

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CI quality gates workflow** - `9756630` (feat)
2. **Task 2: Create release workflow with Changesets and OIDC** - `7b55ab2` (feat)
3. **Task 3: Create GitHub Pages deploy workflow** - `b4f0c01` (feat)

## Files Created/Modified
- `.github/workflows/ci.yml` - Sequential quality gates on PR and push to main with bundle size enforcement
- `.github/workflows/release.yml` - Changesets version PR creation and OIDC npm publish on merge
- `.github/workflows/deploy.yml` - Conditional GitHub Pages deployment for Astro demo site

## Decisions Made
None - followed plan as specified.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

Before automated CI/CD works, two manual steps are needed (documented in workflow comments):

1. **First npm publish:** Run `npm publish` locally to claim the package name, then configure OIDC Trusted Publishing at https://www.npmjs.com/package/react-site-icon/access (owner: jorislacance, repo: react-site-icon, workflow: release.yml)
2. **GitHub Pages:** Enable GitHub Pages in repo settings with "GitHub Actions" as the source (Settings > Pages > Source: GitHub Actions)
3. **Branch protection (optional):** Enable branch protection requiring the CI workflow to pass before merge to main

## Next Phase Readiness
- All three workflows are ready to run once the repository is pushed to GitHub
- CI workflow will immediately enforce quality gates on PRs
- Release workflow is ready for automated publishing after first manual npm publish + OIDC setup
- Deploy workflow will auto-activate when docs/ directory is created in Phase 6
- Full quality suite (lint, typecheck, 35 tests, format:check, build) passes locally

## Threat Surface Scan

No new threat surfaces beyond what is documented in the plan's threat model. All workflows follow minimal permissions principle. No user input is injected into run blocks. OIDC eliminates stored npm tokens.

## Self-Check: PASSED

- All 3 created workflow files exist on disk
- All 3 task commits verified in git log (9756630, 7b55ab2, b4f0c01)

---
*Phase: 04-ci-cd-and-release-automation*
*Completed: 2026-04-12*
