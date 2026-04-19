# Phase 4: CI/CD and Release Automation - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

GitHub Actions workflows for automated quality gates (CI), npm publishing via Changesets + OIDC (CD), and GitHub Pages demo site deployment. Also resolves repository identity placeholders and creates the MIT LICENSE file.

</domain>

<decisions>
## Implementation Decisions

### Publishing Flow
- **D-01:** Changesets-driven publishing is the sole publish mechanism. `changesets/action` creates a "Version Packages" PR on push to main. Merging that PR bumps the version, updates CHANGELOG.md, and publishes to npm. No tag-based backup workflow.
- **D-02:** The first npm publish must be done manually (`npm publish`) to claim the package name. After that, configure OIDC Trusted Publishing on npm and all subsequent publishes are automated via `changesets/action`.
- **D-03:** Version PRs are reviewed and merged manually — no auto-merge. The user reviews version bumps and changelog entries before publishing.

### CI Workflow
- **D-04:** CI runs on pull requests and pushes to main. Sequential fail-fast pipeline: lint → typecheck → test → test:exports → format:check → build. Stops on first failure to save CI minutes.
- **D-05:** Node 22.x only — no version matrix. Library output is plain JS; multi-version CI adds time without catching real issues.
- **D-06:** Bundle size gate in CI: after build, check gzipped size of dist/index.js. Fail CI if > 1KB. Prevents accidental size regressions.
- **D-07:** npm dependency caching via `actions/setup-node` with `cache: 'npm'`. Simple, built-in.
- **D-08:** GitHub Actions pinned to major version tags (e.g., `actions/checkout@v4`), not SHA-pinned. Standard for OSS projects.
- **D-09:** Include a comment in ci.yml noting that the repo owner should enable branch protection requiring CI to pass before merge.

### Workflow File Structure
- **D-10:** Three workflow files: `ci.yml` (quality gates on PR + main push), `release.yml` (Changesets version PR + npm publish on main push), `deploy.yml` (GitHub Pages deployment on main push + manual dispatch).

### Demo Site Deployment
- **D-11:** Create deploy.yml now with a conditional check — if the Astro site directory (`docs/`) doesn't exist, the workflow exits cleanly. Phase 6 builds the site and it auto-deploys with no rework.
- **D-12:** Use `withastro/action@v6` (official Astro GitHub Action) for build + artifact upload.
- **D-13:** Demo site source lives in the `docs/` directory.
- **D-14:** Deploy triggers: push to main (automatic) and workflow_dispatch (manual testing).
- **D-15:** Concurrency group with `cancel-in-progress: true` to prevent overlapping deployments.
- **D-16:** Deploy workflow re-runs CI checks (lint/test/build) before building and deploying the site. Belt-and-suspenders safety.
- **D-17:** Build the library (`npm run build`) before building the Astro site — the demo site imports from the local package.
- **D-18:** Default GitHub Pages URL (jorislacance.github.io/react-site-icon) for now. Workflow is structured to support adding a custom domain (CNAME file) later.

### Repository Identity
- **D-19:** Repository owner: `jorislacance`. Fix all `OWNER/react-site-icon` placeholders in package.json `repository.url` and `.changeset/config.json` `repo` field to `jorislacance/react-site-icon`.
- **D-20:** Set `author` field in package.json to `"Joris Lacance"`.
- **D-21:** Set `homepage` field in package.json to `"https://jorislacance.github.io/react-site-icon/"`.
- **D-22:** Add `bugs.url` field in package.json pointing to `"https://github.com/jorislacance/react-site-icon/issues"`.

### License
- **D-23:** Create a `LICENSE` file in the repo root with standard MIT license text. Copyright line: `Copyright (c) 2026 Joris Lacance`.

### Claude's Discretion
- Exact workflow YAML structure and step naming
- Job names and workflow display names
- Specific gzip size check implementation (script command)
- OIDC permission blocks in release.yml
- Conditional logic for skipping deploy when docs/ doesn't exist
- Order of package.json field updates

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Spec
- `CLAUDE.md` §Recommended Stack — Technology versions, CI/CD tooling choices, Node.js version strategy
- `CLAUDE.md` §Versioning & Publishing — Changesets configuration and changesets/action usage
- `CLAUDE.md` §CI/CD (GitHub Actions) — Action versions and purposes

### Requirements
- `.planning/REQUIREMENTS.md` §CI/CD (CICD-01 through CICD-04) — All CI/CD requirements for this phase

### Existing Configuration
- `package.json` — Existing scripts (lint, test, build, typecheck, format:check, test:exports), devDependencies, repository URL placeholder
- `.changeset/config.json` — Existing Changesets configuration with repo placeholder
- `tsup.config.ts` — Build configuration (needed to understand what `npm run build` produces)

### Prior Phase Decisions
- `.planning/phases/01-project-scaffolding-and-build-pipeline/01-CONTEXT.md` — Phase 1: Changesets configured with access: public (D relates to TOOL-04)
- `.planning/phases/03-testing/03-CONTEXT.md` — Phase 3: attw as separate test:exports script (D-07)

### External References
- npm OIDC Trusted Publishing docs — https://docs.npmjs.com/trusted-publishers/
- changesets/action — https://github.com/changesets/action
- withastro/action — https://docs.astro.build/en/guides/deploy/github/

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.changeset/config.json` — Already configured with `"access": "public"`, `@changesets/changelog-github`, and `"baseBranch": "main"`. Just needs repo placeholder fixed.
- `package.json` scripts — All CI check commands already exist: `lint`, `test`, `build`, `typecheck`, `format:check`, `test:exports`. Workflows just call these.
- `.husky/` — Pre-commit hooks already configured (Phase 1).

### Established Patterns
- All quality tooling configured in Phase 1 — CI workflows invoke existing npm scripts, not raw tool commands
- Vitest with jsdom environment, co-located test files
- tsup producing ESM + CJS + .d.ts in dist/

### Integration Points
- CI workflow validates the same checks that pre-commit hooks run locally (lint, format)
- Release workflow uses Changesets config already in `.changeset/`
- Deploy workflow will point to `docs/` which Phase 6 creates
- Bundle size gate relies on `npm run build` producing `dist/index.js`

</code_context>

<specifics>
## Specific Ideas

- The bundle size check can be a simple bash step: `SIZE=$(gzip -c dist/index.js | wc -c); if [ "$SIZE" -gt 1024 ]; then echo "Bundle too large: ${SIZE} bytes"; exit 1; fi`
- First publish bootstrapping should be documented as a comment in release.yml or a section in a future CONTRIBUTING.md
- The deploy.yml conditional for missing docs/ directory should be an early `if` check at the job level, not buried in steps

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-ci-cd-and-release-automation*
*Context gathered: 2026-04-12*
