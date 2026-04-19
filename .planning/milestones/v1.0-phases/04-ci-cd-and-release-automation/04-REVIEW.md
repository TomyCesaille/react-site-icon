---
phase: 04-ci-cd-and-release-automation
reviewed: 2026-04-12T22:15:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - package.json
  - .changeset/config.json
  - LICENSE
  - .github/workflows/ci.yml
  - .github/workflows/release.yml
  - .github/workflows/deploy.yml
findings:
  critical: 1
  warning: 3
  info: 1
  total: 5
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-04-12T22:15:00Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Reviewed CI/CD and release automation files: three GitHub Actions workflows (ci, release, deploy), package.json scripts/configuration, changesets config, and LICENSE. The overall structure is solid -- quality gates are well-ordered, concurrency controls are in place, and permissions are appropriately scoped. However, the release workflow has a critical issue: npm publish will fail because `NODE_AUTH_TOKEN` is not provided to the publish step. Additionally, GitHub Actions are pinned to mutable major version tags rather than commit SHAs, which is a supply chain security concern. The deploy workflow has an inconsistency with ci.yml in which quality checks it runs.

## Critical Issues

### CR-01: Missing NODE_AUTH_TOKEN for npm publish in release workflow

**File:** `.github/workflows/release.yml:41-47`
**Issue:** The `changesets/action` step runs `npm run release` which executes `changeset publish` (and ultimately `npm publish`). The `actions/setup-node` step on line 21 correctly sets `registry-url: 'https://registry.npmjs.org'`, which configures `.npmrc` to use the `NODE_AUTH_TOKEN` environment variable. However, the changesets/action step on line 42-47 only provides `GITHUB_TOKEN` in its `env` block -- it does not set `NODE_AUTH_TOKEN`. Without this token, `npm publish` will fail with an authentication error every time the "Version Packages" PR is merged. For OIDC trusted publishing, `npm publish` must be invoked with `--provenance` and `NODE_AUTH_TOKEN` must still be provided (via `NPM_TOKEN` secret or OIDC). The CLAUDE.md references OIDC trusted publishing (which requires Node >= 22.14.0, satisfied here), but the workflow does not actually configure it.
**Fix:**
```yaml
      - name: Create Release PR or Publish
        uses: changesets/action@v1
        with:
          publish: npm run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```
If using OIDC trusted publishing instead of a classic NPM_TOKEN secret, the release script in package.json should also pass `--provenance`:
```json
"release": "npm run build && changeset publish -- --provenance --access public"
```
And `NODE_AUTH_TOKEN` should be set to the OIDC-provided token (which `actions/setup-node` with `registry-url` handles automatically when `id-token: write` permission is present, but only if `NODE_AUTH_TOKEN` is not overridden). In that case, remove `NODE_AUTH_TOKEN` from env and ensure the provenance flag is set. Either approach works, but the current configuration does neither.

## Warnings

### WR-01: GitHub Actions pinned to mutable version tags instead of commit SHAs

**File:** `.github/workflows/ci.yml:16`, `.github/workflows/release.yml:19`, `.github/workflows/deploy.yml:27`
**Issue:** All GitHub Actions (`actions/checkout@v4`, `actions/setup-node@v4`, `changesets/action@v1`, `withastro/action@v6`, `actions/deploy-pages@v4`) are pinned to major version tags. These tags are mutable -- the action maintainer can push a new commit to the `v4` tag at any time. A compromised action maintainer could inject malicious code that exfiltrates secrets (particularly `GITHUB_TOKEN` and any future `NPM_TOKEN`). This is a known supply chain attack vector (cf. the `tj-actions/changed-files` incident). For a library that publishes to npm, this risk is elevated.
**Fix:** Pin actions to full commit SHAs with a version comment. For example:
```yaml
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8 # v4.0.2
```
Tools like Dependabot or Renovate can auto-update SHA pins when new versions are released.

### WR-02: Deploy workflow quality gate is inconsistent with CI workflow

**File:** `.github/workflows/deploy.yml:34-56`
**Issue:** The `quality` job in deploy.yml runs lint, test, and build -- but omits `typecheck` and `format:check` that the CI workflow (ci.yml lines 28-39) includes. This means code could pass the deploy gate but fail the CI gate, or vice versa. If a push to main triggers both workflows, the deploy could succeed while CI fails, resulting in a deployed site built from code that did not pass all quality checks.
**Fix:** Add the missing steps to the deploy quality gate to match ci.yml:
```yaml
      - name: Type check
        run: npm run typecheck

      - name: Format check
        run: npm run format:check
```
Alternatively, extract quality gates into a reusable workflow and call it from both ci.yml and deploy.yml to keep them in sync.

### WR-03: Bundle size check may fail on whitespace in wc output

**File:** `.github/workflows/ci.yml:44-50`
**Issue:** The command `SIZE=$(gzip -c dist/index.js | wc -c)` stores the output of `wc -c`, which on some platforms (notably macOS) includes leading whitespace (e.g., `"    512"` instead of `"512"`). While GitHub Actions runs on Ubuntu where `wc -c` typically does not include leading whitespace, bash arithmetic with `$SIZE` in the `-gt` comparison on line 48 will still work because `[ "$SIZE" -gt 1024 ]` trims whitespace in arithmetic context. However, the `echo` on line 47 would display `"Gzipped size:     512 bytes"` with extra spaces, which is cosmetic but sloppy. More importantly, if this script is ever run locally on macOS for debugging, the comparison could behave unexpectedly depending on the shell.
**Fix:** Trim the output explicitly:
```bash
SIZE=$(gzip -c dist/index.js | wc -c | tr -d ' ')
```

## Info

### IN-01: Export validation (attw) not listed as a CI prerequisite in deploy workflow

**File:** `.github/workflows/deploy.yml:34-56`
**Issue:** The deploy quality gate does not run `npm run test:exports` (the `@arethetypeswrong/cli` check), while ci.yml does (line 34). This is a minor gap -- export validation is most important at release time (which CI covers), but consistency would be better.
**Fix:** Add `npm run test:exports` to the deploy quality gate, or extract a shared workflow.

---

_Reviewed: 2026-04-12T22:15:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
