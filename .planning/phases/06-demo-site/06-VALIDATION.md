---
phase: 6
slug: demo-site
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-12
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 (existing in root) + Astro build validation |
| **Config file** | `vitest.config.ts` (existing in root) |
| **Quick run command** | `npm run build --prefix docs` |
| **Full suite command** | `npm test && npm run build && npm run build --prefix docs` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build --prefix docs`
- **After every plan wave:** Run `npm test && npm run build && npm run build --prefix docs`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | DEMO-01, DEMO-03 | T-06-01 | React escapes all strings; no dangerouslySetInnerHTML | smoke | `test -f docs/package.json && test -f docs/astro.config.mjs && npm run build --prefix docs` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | DEMO-01 | T-06-03 | Badge images are decorative; no security impact | smoke | `npm run build && npm run build --prefix docs` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 2 | DEMO-02 | T-06-04, T-06-05 | React escapes interpolated domain values; code preview uses JSX spans not innerHTML | manual+smoke | `npm run build && npm run build --prefix docs` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `docs/package.json` — Astro project must exist before any validation
- [ ] `docs/astro.config.mjs` — Required for Astro build
- [ ] Verify `npm run build --prefix docs` exits 0 after scaffolding

*Note: Wave 0 is satisfied by Plan 01 Task 1 which scaffolds the entire Astro project.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Playground renders favicons and accepts domain input | DEMO-02 | React island requires browser hydration; Vitest/jsdom cannot test Astro island integration | 1. Run `npm run docs:dev` 2. Open localhost in browser 3. Verify pre-filled grid shows favicons 4. Type a domain and verify it appears in grid 5. Toggle advanced panel, change strategy/size |
| Dark/light theme toggle works without FOUC | DEMO-01 | Flash-of-unstyled-content is a visual timing issue not detectable in automated tests | 1. Set system to dark mode 2. Load page — should render dark immediately (no white flash) 3. Click toggle — should switch themes and persist on reload |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-18
