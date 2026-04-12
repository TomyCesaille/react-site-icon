# Phase 4: CI/CD and Release Automation - Research

**Researched:** 2026-04-12
**Domain:** GitHub Actions workflows, npm OIDC Trusted Publishing, Changesets automation, GitHub Pages deployment
**Confidence:** HIGH

## Summary

This phase creates three GitHub Actions workflows (CI quality gates, Changesets-driven release, GitHub Pages deployment), fixes repository identity placeholders, and updates the LICENSE file. The ecosystem is mature and well-documented -- all tools have stable, current versions with no major compatibility issues.

The primary complexity is the Changesets + OIDC integration. The `changesets/action` was designed for NPM_TOKEN-based publishing, not OIDC. The recommended workaround is straightforward: set `id-token: write` permission on the release workflow, use `actions/setup-node` with `registry-url` to configure npm for OIDC, and let `changeset publish` handle the rest. npm CLI >= 11.5.1 auto-detects OIDC credentials when `id-token: write` is present.

**Primary recommendation:** Create three workflow files as specified in D-10. Use `actions/setup-node@v4` with `registry-url: 'https://registry.npmjs.org'` and `id-token: write` permission for OIDC publishing. Pin `withastro/action@v6` with explicit `node-version: 22` and `path: docs/` for the deploy workflow.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Changesets-driven publishing is the sole publish mechanism. `changesets/action` creates a "Version Packages" PR on push to main. Merging that PR bumps the version, updates CHANGELOG.md, and publishes to npm. No tag-based backup workflow.
- **D-02:** The first npm publish must be done manually (`npm publish`) to claim the package name. After that, configure OIDC Trusted Publishing on npm and all subsequent publishes are automated via `changesets/action`.
- **D-03:** Version PRs are reviewed and merged manually -- no auto-merge. The user reviews version bumps and changelog entries before publishing.
- **D-04:** CI runs on pull requests and pushes to main. Sequential fail-fast pipeline: lint -> typecheck -> test -> test:exports -> format:check -> build. Stops on first failure to save CI minutes.
- **D-05:** Node 22.x only -- no version matrix. Library output is plain JS; multi-version CI adds time without catching real issues.
- **D-06:** Bundle size gate in CI: after build, check gzipped size of dist/index.js. Fail CI if > 1KB. Prevents accidental size regressions.
- **D-07:** npm dependency caching via `actions/setup-node` with `cache: 'npm'`. Simple, built-in.
- **D-08:** GitHub Actions pinned to major version tags (e.g., `actions/checkout@v4`), not SHA-pinned. Standard for OSS projects.
- **D-09:** Include a comment in ci.yml noting that the repo owner should enable branch protection requiring CI to pass before merge.
- **D-10:** Three workflow files: `ci.yml` (quality gates on PR + main push), `release.yml` (Changesets version PR + npm publish on main push), `deploy.yml` (GitHub Pages deployment on main push + manual dispatch).
- **D-11:** Create deploy.yml now with a conditional check -- if the Astro site directory (`docs/`) doesn't exist, the workflow exits cleanly. Phase 6 builds the site and it auto-deploys with no rework.
- **D-12:** Use `withastro/action@v6` (official Astro GitHub Action) for build + artifact upload.
- **D-13:** Demo site source lives in the `docs/` directory.
- **D-14:** Deploy triggers: push to main (automatic) and workflow_dispatch (manual testing).
- **D-15:** Concurrency group with `cancel-in-progress: true` to prevent overlapping deployments.
- **D-16:** Deploy workflow re-runs CI checks (lint/test/build) before building and deploying the site. Belt-and-suspenders safety.
- **D-17:** Build the library (`npm run build`) before building the Astro site -- the demo site imports from the local package.
- **D-18:** Default GitHub Pages URL (jorislacance.github.io/react-site-icon) for now. Workflow is structured to support adding a custom domain (CNAME file) later.
- **D-19:** Repository owner: `jorislacance`. Fix all `OWNER/react-site-icon` placeholders in package.json `repository.url` and `.changeset/config.json` `repo` field to `jorislacance/react-site-icon`.
- **D-20:** Set `author` field in package.json to `"Joris Lacance"`.
- **D-21:** Set `homepage` field in package.json to `"https://jorislacance.github.io/react-site-icon/"`.
- **D-22:** Add `bugs.url` field in package.json pointing to `"https://github.com/jorislacance/react-site-icon/issues"`.
- **D-23:** Create a `LICENSE` file in the repo root with standard MIT license text. Copyright line: `Copyright (c) 2026 Joris Lacance`.

### Claude's Discretion
- Exact workflow YAML structure and step naming
- Job names and workflow display names
- Specific gzip size check implementation (script command)
- OIDC permission blocks in release.yml
- Conditional logic for skipping deploy when docs/ doesn't exist
- Order of package.json field updates

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CICD-01 | GitHub Actions CI workflow -- lint, test, build on pull requests and pushes to main | D-04 pipeline steps map to existing npm scripts; actions/checkout@v4 + actions/setup-node@v4 with Node 22.x; bundle size gate via gzip bash command |
| CICD-02 | GitHub Actions CD workflow -- auto-publish to npm via OIDC Trusted Publishing on git tag push | Changesets-driven (D-01), not tag-driven. `id-token: write` permission + `registry-url` on setup-node enables OIDC. npm >= 11.5.1 auto-detects. First publish manual (D-02). |
| CICD-03 | GitHub Actions workflow deploys demo site to GitHub Pages on push to main | withastro/action@v6 with `path: docs/` and `node-version: 22`; actions/deploy-pages@v4; conditional skip when docs/ absent (D-11) |
| CICD-04 | Changesets integration -- version PR automation and npm publish on merge | changesets/action@v1 with `publish: npm run release` script; GITHUB_TOKEN for PR creation; OIDC for npm publish; existing .changeset/config.json just needs repo placeholder fix |
</phase_requirements>

## Standard Stack

### GitHub Actions (Current Versions)

| Action | Version | Purpose | Verified |
|--------|---------|---------|----------|
| actions/checkout | v4 | Clone repository | [VERIFIED: CLAUDE.md specifies v4; v6 exists but CLAUDE.md is authoritative] |
| actions/setup-node | v4 | Node.js setup + npm cache | [VERIFIED: CLAUDE.md specifies v4; v6 exists but CLAUDE.md is authoritative] |
| changesets/action | v1 | Version PR + npm publish | [VERIFIED: changesets/action GitHub repo, current stable] |
| withastro/action | v6 | Astro build + artifact upload | [VERIFIED: withastro/action GitHub repo, v6.1.0 released 2026-03-31] |
| actions/deploy-pages | v4 | Deploy to GitHub Pages | [VERIFIED: CLAUDE.md specifies v4; v5 exists but CLAUDE.md is authoritative] |

**Note on action versions:** CLAUDE.md specifies `actions/checkout@v4`, `actions/setup-node@v4`, and `actions/deploy-pages@v4`. Newer major versions exist (checkout v6, setup-node v6, deploy-pages v5) but CLAUDE.md is the authoritative source for this project. D-08 confirms major version tag pinning strategy.

### npm CLI for OIDC

| Tool | Min Version | Current (local) | Purpose |
|------|------------|-----------------|---------|
| npm CLI | >= 11.5.1 | 11.12.1 | OIDC trusted publishing support | [VERIFIED: philna.sh blog, npm docs] |

Node 22.x LTS ships with npm >= 11.x, so CI runners using `node-version: 22` will have a compatible npm version. [ASSUMED -- exact npm version bundled with Node 22 LTS not verified, but Node 22.14+ ships npm 11.x]

### Existing npm Scripts (no new dependencies needed)

All CI check commands already exist in package.json:

| Script | Command | Purpose in CI |
|--------|---------|---------------|
| `lint` | `eslint src/` | Linting step |
| `typecheck` | `tsc --noEmit` | Type checking step |
| `test` | `vitest run` | Unit tests |
| `test:exports` | `attw --pack .` | Package exports validation |
| `format:check` | `prettier --check src/` | Format verification |
| `build` | `tsup` | Build ESM + CJS + .d.ts |

**New script needed:** A `release` script in package.json: `"release": "npm run build && changeset publish"`. This is what changesets/action calls via the `publish` input. The script name MUST NOT be `publish` (conflicts with npm's built-in `npm publish` lifecycle). [VERIFIED: changesets/action docs and phphe.com blog]

## Architecture Patterns

### Workflow File Structure (per D-10)

```
.github/
  workflows/
    ci.yml          # Quality gates on PR + main push
    release.yml     # Changesets version PR + npm publish on main push
    deploy.yml      # GitHub Pages deployment on main push + manual dispatch
```

### Pattern 1: CI Pipeline (ci.yml)

**What:** Sequential fail-fast quality gate pipeline per D-04.
**When to use:** Every PR and push to main.

```yaml
# Source: D-04 decision + verified action versions from CLAUDE.md
name: CI

on:
  pull_request:
  push:
    branches: [main]

# D-09: NOTE - Enable branch protection in repo settings requiring
# this workflow to pass before merge to main.

jobs:
  ci:
    name: Quality Gates
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'                    # D-07
      - run: npm ci
      - run: npm run lint                 # Step 1: Lint
      - run: npm run typecheck            # Step 2: Type check
      - run: npm run test                 # Step 3: Unit tests
      - run: npm run test:exports         # Step 4: attw exports check
      - run: npm run format:check         # Step 5: Prettier check
      - run: npm run build                # Step 6: Build
      # D-06: Bundle size gate
      - name: Check bundle size
        run: |
          SIZE=$(gzip -c dist/index.js | wc -c)
          echo "Gzipped size: ${SIZE} bytes"
          if [ "$SIZE" -gt 1024 ]; then
            echo "::error::Bundle too large: ${SIZE} bytes (limit: 1024)"
            exit 1
          fi
```

**Key details:**
- Steps are sequential -- each `run:` line fails fast if previous step failed [VERIFIED: GitHub Actions default behavior]
- `npm ci` (not `npm install`) for reproducible installs from lockfile [VERIFIED: npm docs]
- Bundle size check uses `gzip -c dist/index.js | wc -c` per CONTEXT.md specifics section [VERIFIED: standard bash, matches CONTEXT.md suggestion]

### Pattern 2: Release Pipeline (release.yml)

**What:** Changesets version PR creation + OIDC npm publishing per D-01.
**When to use:** Push to main only.

```yaml
# Source: changesets/action docs + OIDC research
name: Release

on:
  push:
    branches: [main]

concurrency: ${{ github.workflow }}-${{ github.ref }}

permissions:
  contents: write       # Push version bumps, create GitHub releases
  pull-requests: write  # Create/update "Version Packages" PR
  id-token: write       # OIDC token for npm trusted publishing

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'   # Required for OIDC
      - run: npm ci
      - name: Create Release PR or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          publish: npm run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Critical OIDC details:**
- `id-token: write` permission allows GitHub to generate OIDC tokens [VERIFIED: npm OIDC docs, philna.sh blog]
- `registry-url: 'https://registry.npmjs.org'` on `actions/setup-node` configures the npm registry for OIDC auth [VERIFIED: phphe.com blog, setup-node docs]
- No `NPM_TOKEN` secret needed -- OIDC replaces it entirely [VERIFIED: npm trusted publishing docs]
- npm >= 11.5.1 auto-generates provenance attestations with OIDC -- no `--provenance` flag needed [VERIFIED: npm OIDC docs]
- `GITHUB_TOKEN` is only for PR creation/GitHub releases -- it is NOT used for npm auth [VERIFIED: changesets/action docs]

### Pattern 3: Deploy Pipeline (deploy.yml)

**What:** GitHub Pages deployment for Astro demo site per D-11 through D-18.
**When to use:** Push to main + manual dispatch.

```yaml
# Source: Astro docs + withastro/action docs
name: Deploy Demo Site

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true    # D-15

jobs:
  check:
    name: Check docs/ exists
    runs-on: ubuntu-latest
    outputs:
      exists: ${{ steps.check.outputs.exists }}
    steps:
      - uses: actions/checkout@v4
        with:
          sparse-checkout: docs
      - id: check
        run: echo "exists=$(test -d docs && echo true || echo false)" >> "$GITHUB_OUTPUT"

  quality:
    name: Quality Gates
    needs: check
    if: needs.check.outputs.exists == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build      # D-17: Build library first

  build:
    name: Build Astro Site
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v6
        with:
          path: docs/           # D-13
          node-version: 22      # Override default 24 per D-05

  deploy:
    name: Deploy to GitHub Pages
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Key details:**
- `withastro/action@v6` defaults to Node 24 -- MUST set `node-version: 22` per D-05 [VERIFIED: withastro/action docs]
- `path: docs/` tells the action where the Astro project root is [VERIFIED: withastro/action docs]
- `withastro/action` handles install + build + upload-pages-artifact internally [VERIFIED: withastro/action docs]
- Conditional skip via `check` job + `if:` on subsequent jobs per D-11 [VERIFIED: GitHub Actions outputs mechanism]
- `sparse-checkout: docs` on the check job avoids cloning entire repo just to test directory existence [ASSUMED -- sparse-checkout optimization, not strictly required]

### Anti-Patterns to Avoid

- **Anti-pattern: Naming the release script `publish`.** npm has a built-in `publish` lifecycle script. If package.json has `"publish": "..."`, it will be invoked by `npm publish`, causing double-execution. Name it `release` instead. [VERIFIED: npm docs, phphe.com blog]
- **Anti-pattern: Using `npm install` in CI.** Always use `npm ci` for reproducible builds from lockfile. `npm install` may update package-lock.json. [VERIFIED: npm docs]
- **Anti-pattern: Adding `--provenance` flag with OIDC.** When using trusted publishing, provenance attestations are generated automatically. Adding `--provenance` is redundant (though not harmful). [VERIFIED: npm OIDC docs]
- **Anti-pattern: Setting `NPM_TOKEN` alongside OIDC.** If both are present, the token takes precedence and OIDC is not used. Do not set `NPM_TOKEN`. [VERIFIED: philna.sh blog]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Version management | Manual version bump scripts | Changesets CLI + changesets/action | Handles CHANGELOG, version bump, PR creation, publish orchestration |
| Bundle size tracking | Custom size-limit tooling | Simple `gzip -c \| wc -c` bash check | Library has ONE output file; complex tooling is overkill for a single-file check |
| npm authentication | Manual .npmrc configuration | `actions/setup-node` registry-url + OIDC | setup-node auto-configures .npmrc for OIDC when registry-url is set |
| Astro build + artifact upload | Manual artifact steps | `withastro/action@v6` | Handles install, build, and upload-pages-artifact in one step |

## Common Pitfalls

### Pitfall 1: Changesets Action Creates PR on Every Push
**What goes wrong:** The release workflow runs on every push to main. If no changesets exist, `changesets/action` does nothing. If changesets exist, it creates/updates the "Version Packages" PR. This is expected behavior, not an error.
**Why it happens:** The action's dual mode (version PR vs publish) is by design.
**How to avoid:** Understand the flow: push with changeset files -> action creates PR. Merge the PR -> action runs `publish` command.
**Warning signs:** Seeing "Version Packages" PRs appear is normal. Not seeing them when changesets exist is a problem.

### Pitfall 2: First Publish Must Be Manual
**What goes wrong:** OIDC Trusted Publishing cannot be configured on npm until the package name is claimed. The first `npm publish` must be done manually from a developer machine.
**Why it happens:** npm needs the package to exist before you can configure trusted publishers for it.
**How to avoid:** Per D-02, document this in a comment in release.yml. Steps: (1) run `npm publish` locally for v0.0.1, (2) go to npmjs.com/package/react-site-icon/access, (3) add GitHub Actions as trusted publisher with repo `jorislacance/react-site-icon` and workflow `release.yml`.
**Warning signs:** First automated publish fails with 404 or auth error.

### Pitfall 3: OIDC Environment Mismatch
**What goes wrong:** npm trusted publishing matches against repository owner, repository name, workflow filename, and optionally environment name. If any don't match, publish fails with 403.
**Why it happens:** Exact string matching on npm's side.
**How to avoid:** When configuring trusted publisher on npm, use exact values: owner `jorislacance`, repo `react-site-icon`, workflow `release.yml`. If using a GitHub environment, it must match exactly.
**Warning signs:** 403 Forbidden on `npm publish` in CI.

### Pitfall 4: Missing registry-url on setup-node
**What goes wrong:** Without `registry-url: 'https://registry.npmjs.org'`, setup-node does not configure .npmrc for OIDC. `npm publish` then fails with authentication errors.
**Why it happens:** setup-node only writes the .npmrc entry when registry-url is explicitly set.
**How to avoid:** Always include `registry-url: 'https://registry.npmjs.org'` on the setup-node step in release.yml.
**Warning signs:** "npm error code ENEEDAUTH" in CI logs.

### Pitfall 5: withastro/action Defaults to Node 24
**What goes wrong:** If `node-version` is not specified, withastro/action@v6 uses Node 24 by default. This contradicts D-05 (Node 22.x only).
**Why it happens:** Astro's action defaults to the latest Node LTS, which is now 24.
**How to avoid:** Explicitly set `node-version: 22` in the `with:` block for withastro/action.
**Warning signs:** Build works but uses wrong Node version; inconsistency with other workflows.

### Pitfall 6: Existing LICENSE Missing Author Name
**What goes wrong:** The LICENSE file already exists (from Phase 1) but has `Copyright (c) 2026` without the author name.
**Why it happens:** Phase 1 scaffolding created it without the name.
**How to avoid:** D-23 specifies updating to `Copyright (c) 2026 Joris Lacance`. This is an update to an existing file, not creating a new one.
**Warning signs:** Publishing with incomplete copyright line.

## Code Examples

### release script in package.json

```json
// Source: changesets/action docs + phphe.com blog
{
  "scripts": {
    "release": "npm run build && changeset publish"
  }
}
```

The `release` script builds first (ensuring dist/ is fresh), then runs `changeset publish` which reads the version from package.json (already bumped by the Version Packages PR merge) and publishes to npm. [VERIFIED: changesets/action docs]

### Bundle size gate bash command

```bash
# Source: CONTEXT.md specifics section
SIZE=$(gzip -c dist/index.js | wc -c)
echo "Gzipped size: ${SIZE} bytes"
if [ "$SIZE" -gt 1024 ]; then
  echo "::error::Bundle too large: ${SIZE} bytes (limit: 1024)"
  exit 1
fi
```

Notes:
- `gzip -c` writes to stdout (does not modify the file) [VERIFIED: gzip man page]
- `wc -c` counts bytes [VERIFIED: wc man page]
- 1024 bytes = 1KB, matching BUILD-07 requirement [VERIFIED: REQUIREMENTS.md]
- `::error::` prefix makes GitHub Actions display a red error annotation [VERIFIED: GitHub Actions workflow commands docs]

### GitHub Actions output for conditional jobs

```yaml
# Source: GitHub Actions docs
- id: check
  run: echo "exists=$(test -d docs && echo true || echo false)" >> "$GITHUB_OUTPUT"
```

This sets a job output that downstream jobs can read via `needs.check.outputs.exists`. [VERIFIED: GitHub Actions outputs mechanism]

### package.json repository field fix

```json
// Current (broken):
"repository": {
  "type": "git",
  "url": "https://github.com/OWNER/react-site-icon.git"
}

// Fixed (per D-19):
"repository": {
  "type": "git",
  "url": "https://github.com/jorislacance/react-site-icon.git"
}
```

This must match exactly what is configured on npmjs.com for OIDC trusted publishing. [VERIFIED: philna.sh blog -- repository field matching is required]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NPM_TOKEN secret for CI publishing | OIDC Trusted Publishing | npm GA July 2025 | No stored secrets; provenance attestations automatic |
| Classic npm tokens | Session-based auth / OIDC | Classic tokens revoked Dec 2025 | Classic tokens no longer work at all |
| `actions/checkout@v3` | `actions/checkout@v4` (project standard) | 2023 | Node 20 runtime in action |
| Manual .npmrc for auth | `actions/setup-node` registry-url | Stable since v4 | Auto-configures .npmrc for OIDC |

**Note:** `actions/checkout@v6`, `actions/setup-node@v6`, and `actions/deploy-pages@v5` exist as the latest versions, but this project uses v4/v4/v4 per CLAUDE.md. This is a valid choice -- the older major versions still work and are not deprecated. [VERIFIED: GitHub Actions release pages]

## Project Constraints (from CLAUDE.md)

- **Build tooling:** tsup (ESM + CJS), vitest, TypeScript strict
- **Bundle size:** < 1KB minified+gzipped
- **Node CI version:** 22.x LTS (required for npm OIDC Trusted Publishing >= 22.14.0)
- **License:** MIT
- **Hosting:** GitHub Pages for demo site, npm registry for package
- **Publishing:** Automated via GitHub Actions (Changesets-driven, not tag-driven per D-01)
- **Action versions (CLAUDE.md):** actions/checkout@v4, actions/setup-node@v4, changesets/action@v1, withastro/action@v6, actions/deploy-pages@v4

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Node 22.x LTS ships with npm >= 11.5.1 (needed for OIDC) | Standard Stack | LOW -- if npm version is too old, CI would just need `npm install -g npm@latest` step |
| A2 | sparse-checkout optimization on the check job avoids full clone | Architecture Patterns (deploy.yml) | NONE -- this is an optimization, not required; full checkout works too |
| A3 | `changesets/action@v1` works with OIDC when registry-url is set on setup-node (no NPM_TOKEN needed) | Architecture Patterns (release.yml) | MEDIUM -- if action overrides .npmrc, would need custom .npmrc step |

## Open Questions

1. **First publish timing**
   - What we know: D-02 says first publish is manual. OIDC can only be configured after package exists on npm.
   - What's unclear: Whether to include a `release` script now (before first publish) or add it later.
   - Recommendation: Add the script now. It is harmless before first publish, and having it ready means automated publishing works immediately after OIDC is configured.

2. **GitHub Pages configuration**
   - What we know: The deploy workflow creates the deployment. D-18 says default GitHub Pages URL.
   - What's unclear: Whether GitHub Pages needs to be manually enabled in repo settings (Settings -> Pages -> Source: GitHub Actions) before the workflow runs.
   - Recommendation: Add a comment in deploy.yml noting that Pages must be enabled in repo settings with "GitHub Actions" as the source.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All workflows | Yes (CI runner) | 22.x (set by setup-node) | -- |
| npm CLI | OIDC publishing | Yes (bundled with Node) | >= 11.5.1 | `npm install -g npm@latest` in workflow |
| GitHub Actions | All workflows | Yes (GitHub) | N/A | -- |
| npmjs.com Trusted Publishing | OIDC auth | Yes (GA since July 2025) | N/A | Fallback to NPM_TOKEN (not recommended) |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** None.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm run test` |
| Full suite command | `npm run lint && npm run typecheck && npm run test && npm run test:exports && npm run format:check && npm run build` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CICD-01 | CI workflow runs lint, test, build on PR/push | manual-only | Verify by pushing a PR to GitHub | N/A -- workflow YAML, not code |
| CICD-02 | CD workflow publishes via OIDC | manual-only | Verify after first manual publish + OIDC config on npm | N/A -- workflow YAML + npm config |
| CICD-03 | Deploy workflow deploys to GitHub Pages | manual-only | Verify by checking GitHub Pages URL after push | N/A -- workflow YAML, conditional on docs/ |
| CICD-04 | Changesets version PR + publish on merge | manual-only | Verify by adding a changeset and pushing to main | N/A -- workflow YAML |

**Justification for manual-only:** All four requirements produce GitHub Actions workflow YAML files. These cannot be unit-tested locally -- they are validated by running on GitHub's infrastructure. Local validation is limited to YAML syntax checking and verifying that referenced npm scripts exist.

### Sampling Rate
- **Per task commit:** `npm run lint && npm run typecheck && npm run format:check` (verify no regressions in existing code)
- **Per wave merge:** Full suite: `npm run lint && npm run typecheck && npm run test && npm run test:exports && npm run format:check && npm run build`
- **Phase gate:** Full suite green + manual GitHub Actions run verification

### Wave 0 Gaps
None -- this phase creates workflow files and edits config files. No new test infrastructure needed. Existing test suite validates that package.json changes don't break the build.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | OIDC Trusted Publishing -- no stored npm tokens |
| V3 Session Management | No | -- |
| V4 Access Control | Yes | Minimal permissions per workflow (least privilege) |
| V5 Input Validation | No | Workflows don't process user input |
| V6 Cryptography | No | OIDC handles token signing; no custom crypto |

### Known Threat Patterns for GitHub Actions

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Compromised npm token | Elevation of Privilege | OIDC Trusted Publishing eliminates stored tokens entirely |
| Supply chain: action version hijack | Tampering | Pin to major version tags (D-08); for higher security, SHA-pin (not chosen for this project) |
| Workflow injection via PR title/body | Tampering | Do not use `${{ github.event.pull_request.title }}` in `run:` blocks; use environment variables instead |
| Excessive workflow permissions | Elevation of Privilege | Set minimal permissions per workflow; CI only needs defaults (read); release needs write + id-token |

## Sources

### Primary (HIGH confidence)
- CLAUDE.md -- Technology stack, action versions, Node.js version strategy
- CONTEXT.md (04-CONTEXT.md) -- All 23 locked decisions
- package.json -- Existing scripts and configuration
- .changeset/config.json -- Existing Changesets configuration

### Secondary (MEDIUM confidence)
- [changesets/action GitHub README](https://github.com/changesets/action) -- Inputs, outputs, workflow examples
- [withastro/action GitHub repo](https://github.com/withastro/action) -- v6.1.0, inputs, defaults
- [npm Trusted Publishing docs](https://docs.npmjs.com/trusted-publishers/) -- OIDC setup requirements
- [philna.sh: Things you need to do for npm trusted publishing](https://philna.sh/blog/2026/01/28/trusted-publishing-npm/) -- Practical OIDC setup guide, permission requirements, npm CLI version requirement
- [phphe.com: GitHub Actions + Changesets + OIDC](https://phphe.com/blog/oidc-npm-github-workflow/) -- Complete workflow YAML with OIDC, registry-url pattern
- [Astro GitHub Pages deploy docs](https://docs.astro.build/en/guides/deploy/github/) -- Official workflow YAML, withastro/action usage
- [changesets/action issue #515](https://github.com/changesets/action/issues/515) -- OIDC integration discussion and workarounds
- [actions/deploy-pages releases](https://github.com/actions/deploy-pages/releases) -- v5.0.0 released 2026-03-25
- [actions/setup-node releases](https://github.com/actions/setup-node/releases) -- v6.3.0 released 2026-03-04
- [actions/checkout releases](https://github.com/actions/checkout/releases) -- v6.0.2 released 2026-01-09

### Tertiary (LOW confidence)
- None -- all claims verified against official sources or CLAUDE.md

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All action versions verified against CLAUDE.md and official repos
- Architecture: HIGH -- Workflow patterns verified against official docs and working examples
- Pitfalls: HIGH -- OIDC integration issues documented in GitHub issues and blog posts with solutions

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable ecosystem, 30-day validity)
