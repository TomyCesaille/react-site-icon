# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 -- MVP

**Shipped:** 2026-04-19
**Phases:** 6 | **Plans:** 13 | **Timeline:** 7 days

### What Was Built
- SiteIcon component with naturalWidth-based globe detection, 3 strategies, domain normalization (855 bytes gzipped)
- Full quality toolchain: ESLint 10 strict, Prettier, Husky/lint-staged, Changesets, Vitest (40 tests)
- CI/CD: GitHub Actions for quality gates + bundle size enforcement, OIDC npm publishing, GitHub Pages deployment
- README with cognitive funneling structure, badges, API table, comparison vs 4 alternatives, StackBlitz example
- Astro demo site with interactive playground, flashless dark mode, live favicon testing

### What Worked
- **Requirement-driven phases**: 41 requirements mapped to 6 phases with clear success criteria made verification straightforward
- **naturalWidth detection approach**: The core insight (Google returns 16x16 globe regardless of requested size) proved reliable and simple
- **Verification + HUMAN-UAT pattern**: AI verification caught code-level issues; human UATs caught runtime behaviors (hydration bug, strategy visibility)
- **Gap closure plans**: When Phase 06 UAT revealed hydration and UX issues, plans 03 and 04 were inserted cleanly
- **tsup choice over tsdown**: Zero build issues despite tsup being "unmaintained" -- the library is too small to need cutting-edge bundler features

### What Was Inefficient
- **Phase 02 verification initially missed hydration bug**: Static analysis confirmed useEffect/useState patterns but couldn't detect that cached images skip onLoad. Only discovered during Phase 06 demo site human testing
- **Repository identity placeholders (OWNER)**: Had to dedicate Phase 04 Plan 01 to fix placeholder values that should have been set in Phase 01
- **Verification human_needed statuses lingered**: Three phases had `human_needed` status that wasn't updated after HUMAN-UATs passed, requiring cleanup at milestone close

### Patterns Established
- **esbuildOptions callback for banners**: Use tsup's esbuildOptions to inject "use client" instead of top-level banner (avoids .d.ts injection)
- **prevDomain state pattern**: Use useState instead of useRef for domain-change detection (eslint-plugin-react-hooks 7.x compliance)
- **Post-mount .complete check**: Always check img.complete + naturalWidth in a no-deps useEffect for SSR hydration safety
- **attw as standalone script**: Run @arethetypeswrong/cli as separate npm script, not inside vitest

### Key Lessons
1. **Image onLoad is unreliable for SSR hydration** -- cached/pre-loaded images may already be complete when React hydrates, so always check .complete in useEffect
2. **Bundle size gates in CI catch drift early** -- the 1KB gzipped limit in ci.yml prevented accidental bloat across all 6 phases
3. **Demo sites are the best integration test** -- Phase 06 human testing uncovered the hydration bug that 35 unit tests missed
4. **OIDC Trusted Publishing requires first manual publish** -- can't configure npm trusted publisher until package name is claimed

### Cost Observations
- Model mix: primarily opus for planning/verification, sonnet for execution
- The entire v1.0 was built in ~7 days across multiple sessions
- Notable: gap closure plans (06-03, 06-04) were efficient -- focused fixes with minimal overhead

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Timeline | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 7 days | 6 | Initial process -- requirement-driven phases with verification + HUMAN-UAT |

### Cumulative Quality

| Milestone | Tests | Bundle Size | Requirements |
|-----------|-------|-------------|-------------|
| v1.0 | 40 | 855 bytes gz | 41/41 |

### Top Lessons (Verified Across Milestones)

1. Demo/integration testing catches what unit tests miss (verified in v1.0 hydration bug discovery)
2. CI size gates prevent bundle drift across all phases (verified: 315 -> 765 -> 855 bytes, always under 1KB)
