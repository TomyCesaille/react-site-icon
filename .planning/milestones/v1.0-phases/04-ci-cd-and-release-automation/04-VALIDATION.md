---
phase: 4
slug: ci-cd-and-release-automation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-12
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run lint && npm run typecheck && npm run format:check` |
| **Full suite command** | `npm run lint && npm run typecheck && npm run test && npm run test:exports && npm run format:check && npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint && npm run typecheck && npm run format:check`
- **After every plan wave:** Run `npm run lint && npm run typecheck && npm run test && npm run test:exports && npm run format:check && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | CICD-01 | T-04-03 | Workflow injection safe (no PR title in run blocks) | manual-only | Verify by pushing a PR to GitHub | N/A | ⬜ pending |
| 04-01-02 | 01 | 1 | CICD-01 | T-04-04 | Minimal CI permissions (default read-only) | manual-only | Verify workflow permissions block | N/A | ⬜ pending |
| 04-02-01 | 02 | 1 | CICD-02 | T-04-01 | OIDC Trusted Publishing — no stored npm tokens | manual-only | Verify after npm OIDC config | N/A | ⬜ pending |
| 04-02-02 | 02 | 1 | CICD-04 | — | Changesets version PR + publish on merge | manual-only | Verify by adding changeset and pushing | N/A | ⬜ pending |
| 04-03-01 | 03 | 1 | CICD-03 | — | Deploy conditional on docs/ existence | manual-only | Verify by checking GitHub Pages | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. This phase creates workflow YAML files and edits config files — no new test infrastructure needed. Existing test suite validates that package.json changes don't break the build.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CI workflow runs lint, test, build on PR/push | CICD-01 | Workflow YAML executes on GitHub infrastructure, not locally testable | Push a PR, verify checks run and block merge on failure |
| CD workflow publishes via OIDC | CICD-02 | Requires npm OIDC configuration and GitHub Actions environment | After first manual publish, configure OIDC on npm, then verify automated publish |
| Deploy workflow deploys to GitHub Pages | CICD-03 | Requires GitHub Pages enabled in repo settings | Push to main after docs/ exists, verify site at GitHub Pages URL |
| Changesets version PR + publish on merge | CICD-04 | Requires actual changeset files and merge flow | Add a changeset, push to main, verify "Version Packages" PR is created |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
