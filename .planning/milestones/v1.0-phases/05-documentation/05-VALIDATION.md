---
phase: 5
slug: documentation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-12
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npm test && npm run test:exports` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npm test && npm run test:exports && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 1 | DOCS-01 | — | N/A | manual-only | Visual inspection of rendered markdown | N/A | ⬜ pending |
| 5-01-02 | 01 | 1 | DOCS-02 | — | N/A | manual-only | Visual inspection + badge link clicks | N/A | ⬜ pending |
| 5-01-03 | 01 | 1 | DOCS-03 | — | N/A | smoke | `node -e "const p=require('./package.json'); const k=['favicon','site-icon','website-icon','react','react-component','domain-favicon','google-favicon']; const ok=k.every(w=>p.keywords.includes(w)); process.exit(ok?0:1)"` | No | ⬜ pending |
| 5-01-04 | 01 | 1 | DOCS-04 | — | N/A | manual-only | Visual inspection | N/A | ⬜ pending |
| 5-01-05 | 01 | 1 | DOCS-05 | — | N/A | manual-only | Visual inspection + link click | N/A | ⬜ pending |
| 5-01-06 | 01 | 1 | DOCS-06 | — | N/A | manual-only | Cross-reference with `src/SiteIcon.tsx` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. This phase is documentation-only — no new test files needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| README structure follows cognitive funneling | DOCS-01 | Prose/layout quality requires human judgment | Verify section order: name → description → badges → example → why → install → API → strategies → advanced → compare → contributing → license |
| 5 badges present with correct URLs | DOCS-02 | Badge rendering depends on external services | Click each badge link, verify shields.io renders correctly |
| Comparison table accurate | DOCS-04 | Data accuracy requires domain knowledge | Cross-check claims against npm registry and source code |
| StackBlitz link present | DOCS-05 | Link functionality depends on npm publish | Verify link format is correct; functional test after publish |
| Props table matches source | DOCS-06 | API accuracy requires source cross-reference | Compare every row against `SiteIconProps` in `src/SiteIcon.tsx:10-24` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
