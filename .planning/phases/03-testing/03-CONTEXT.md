# Phase 3: Testing - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Automated test suite verifying all SiteIcon component behaviors without network access, plus package export validation via attw. Covers rendering, fallback detection, domain normalization, error handling, SSR, ref forwarding, onResolved callbacks, and all three strategies.

</domain>

<decisions>
## Implementation Decisions

### Image Loading Mock Approach
- **D-01:** Use `Object.defineProperty` on the img element to set `naturalWidth`, then manually fire `onLoad`/`onError` events. Each test controls its own scenario directly — no global patches.
- **D-02:** Create a shared `simulateImageLoad(img, naturalWidth)` helper function at the top of the test file. Keeps each test focused on the scenario being verified, not mocking mechanics.

### Test Coverage Matrix
- **D-03:** Full strategy × state matrix — all 3 strategies (lazy, eager, hidden) tested across all states (loading rendering, found rendering, missing/fallback rendering, domain change reset, error handling). ~9 core strategy tests minimum.
- **D-04:** Broad domain normalization coverage — 8-10 edge cases: full URL with path/query/hash, protocol stripping, bare domain, www prefix, port numbers, empty string, whitespace-only, invalid input (no dots).
- **D-05:** SSR rendering tested — use `renderToString` from `react-dom/server` to verify fallback content renders on server, not an img with Google CDN src. Validates COMP-09 / D-05.
- **D-06:** Additional coverage: ref forwarding (found state), restProps spreading, onResolved callback (true on found, false on missing/error), domain change cancellation (stale detection).

### attw Integration
- **D-07:** Separate npm script `"test:exports": "attw --pack ."` in package.json. Runs independently from vitest. CI will run both. Keeps unit tests fast, attw focused on package export shape.
- **D-08:** `@arethetypeswrong/cli` added as a devDependency.

### Test File Organization
- **D-09:** Single test file `src/SiteIcon.test.tsx` with nested `describe` blocks organized by concern: strategies (with sub-describes per strategy), domain normalization, SSR, ref/props, onResolved callbacks. ~25-30 tests total.

### Claude's Discretion
- Exact test descriptions and assertion style
- Helper function implementation details (simulateImageLoad internals)
- Whether to use `screen` queries vs container queries from render()
- Test execution order and grouping within describe blocks
- Specific invalid domain strings to test beyond the decided categories

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Component Under Test
- `src/SiteIcon.tsx` — Full component implementation (157 lines): 3 strategies, domain normalization, naturalWidth detection, ref forwarding, onResolved
- `src/index.ts` — Re-export barrel file (exports to validate)

### Requirements
- `.planning/REQUIREMENTS.md` §Testing (TEST-01 through TEST-03) — All testing requirements for this phase

### Prior Phase Decisions
- `.planning/phases/02-core-component/02-CONTEXT.md` — Phase 2 decisions defining all component behaviors being tested (D-01 through D-20)
- `.planning/phases/01-project-scaffolding-and-build-pipeline/01-CONTEXT.md` — Phase 1 decisions: co-located test files (D-02), strict ESLint (D-03)

### Build Configuration
- `vitest.config.ts` — Existing vitest configuration (jsdom environment, globals, co-located discovery)
- `package.json` — Existing test scripts and devDependencies

### Project Spec
- `ReactThirdPartyDomainFavicon.md` — Original project spec with implementation details and design principles

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `vitest.config.ts` — Already configured with jsdom, globals: true, co-located pattern `src/**/*.test.{ts,tsx}`
- All test libraries pre-installed: @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom
- `npm run test` and `npm run test:watch` scripts already configured

### Established Patterns
- Props interface (`SiteIconProps`) exported alongside component — test can import both
- `normalizeDomain` is a module-private function — test via component rendering, not direct import
- `buildUrl` is module-private — verify correct CDN URLs via rendered img src attributes
- `GOOGLE_DEFAULT_SIZE = 16` constant — tests need naturalWidth > 16 for "found", ≤ 16 for "missing"

### Integration Points
- Phase 4 (CI/CD) will run `npm test` and `npm run test:exports` in GitHub Actions workflows
- Test file must pass existing ESLint strict rules (Phase 1 TOOL-01)
- Tests validate the public API that Phase 5 (Documentation) will document

</code_context>

<specifics>
## Specific Ideas

- The `simulateImageLoad` helper should handle both found (naturalWidth=64) and missing (naturalWidth=16) scenarios via a parameter
- SSR test should import `renderToString` from `react-dom/server` — this is a separate import from client rendering
- Domain normalization tests should verify the img src contains the correct hostname, not test the private function directly
- For stale detection tests: render with domain A, before simulating load, re-render with domain B, then simulate load for domain A — verify it's ignored

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-testing*
*Context gathered: 2026-04-12*
