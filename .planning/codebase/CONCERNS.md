# Codebase Concerns

**Analysis Date:** 2026-04-19

## Tech Debt

**~~Empty-string `src` attribute on detection img for empty domain~~ (RESOLVED 2026-06-04, commit 8e618a2):**
- ~~Issue: When `domain=""` or `domain="   "`, the component's initial render enters the `'loading'` state and renders a hidden detection `<img src="" ...>`. The "adjust state during render" block at line 107 of `SiteIcon.tsx` does not fire because `prevDomain === normalizedDomain` (both empty on first render). This produces the browser warning: *"An empty string was passed to the src attribute. This may cause the browser to download the whole page again over the network."*~~
- ~~Files: `src/SiteIcon.tsx` (lines 73-76, 107-110, 150-158)~~
- ~~Impact: Cosmetic browser console warning. Minor: the empty-src img may trigger a redundant network request for the current page URL in some browsers before the next render cycle transitions to `'missing'`.~~
- Fix applied: Initialized `status` from `normalizedDomain` so empty-domain renders go straight to `'missing'`, mirroring the pattern already used in the domain-change branch. No more empty-src `<img>` mounted on first render.

**Missing `concurrently` dependency (not installed):**
- Issue: `concurrently@^9.2.1` is listed in `devDependencies` in `package.json` but is not present in `node_modules/`. Running `npm ls` reports `UNMET DEPENDENCY concurrently@^9.2.1`. The `docs:dev` script depends on it.
- Files: `package.json` (line 37, line 63)
- Impact: `npm run docs:dev` will fail until `npm install` is re-run. Not a publish blocker since it is a devDependency.
- Fix approach: Run `npm install` to resolve. Alternatively, if it was intentionally not installed to keep node_modules smaller during library development, document that `docs:dev` requires a full install.

**No coverage tooling installed:**
- Issue: `@vitest/coverage-v8` (or any coverage provider) is not in `devDependencies`. Running `vitest --coverage` fails with `MISSING DEPENDENCY`. There is no `test:coverage` script in `package.json`.
- Files: `package.json`, `vitest.config.ts`
- Impact: Cannot measure or enforce test coverage thresholds. CI does not gate on coverage.
- Fix approach: Add `@vitest/coverage-v8` to devDependencies. Add a `test:coverage` script. Optionally add coverage thresholds in `vitest.config.ts`:
  ```ts
  coverage: {
    provider: 'v8',
    thresholds: { lines: 90, branches: 90, functions: 90 }
  }
  ```

**`examples/basic/` is not runnable without manual setup:**
- Issue: The example project has no `node_modules/` (not installed), no lockfile, and depends on `"react-site-icon": "latest"` from npm rather than `"file:.."`. A contributor cloning the repo cannot run the example without modifying `package.json` or publishing first.
- Files: `examples/basic/package.json` (line 14)
- Impact: Poor contributor DX. The example is only useful after the package is published to npm.
- Fix approach: Change the dependency to `"react-site-icon": "file:../.."` (relative to the example's location) and add a `package-lock.json`. Alternatively, add a README note explaining how to link the local package.

**ESLint ignores entire `examples/` directory:**
- Issue: The `eslint.config.mjs` ignores `examples/` entirely (line 50). The example code in `examples/basic/src/App.tsx` is never linted.
- Files: `eslint.config.mjs` (line 50), `examples/basic/src/App.tsx`
- Impact: Example code could drift from project conventions without detection.
- Fix approach: Either lint examples with a separate ESLint config, or accept this as intentional since examples are standalone projects.

## Known Bugs

**~~Empty domain renders hidden img with `src=""` for one render frame~~ (RESOLVED 2026-06-04, commit 8e618a2):**
- Status: Fixed by initializing `status` from `normalizedDomain` (see Tech Debt entry above). No empty-src `<img>` is ever mounted; empty-domain renders go straight to fallback.

## Security Considerations

**Third-party CDN dependency (Google faviconV2):**
- Risk: The entire component depends on Google's `t1.gstatic.com/faviconV2` CDN endpoint. This is an undocumented, unofficial Google API. Google could change the response format (e.g., return a different-sized globe), throttle requests, or deprecate the endpoint without notice. The `naturalWidth` detection heuristic would break.
- Files: `src/SiteIcon.tsx` (lines 52-53, line 55)
- Current mitigation: The fallback mechanism degrades gracefully -- if the CDN returns an error, `onError` fires and the fallback is shown. The `onResolved` callback lets consumers react to detection results.
- Recommendations: Document the CDN dependency prominently in the README (already done). Consider adding an optional `cdnUrl` prop to allow consumers to use alternative favicon providers. Monitor the Google CDN for changes.

**Content Security Policy (CSP) compatibility:**
- Risk: Sites with strict `img-src` CSP directives will block requests to `t1.gstatic.com`. The component will silently fail (trigger `onError`, show fallback).
- Files: `src/SiteIcon.tsx` (line 52)
- Current mitigation: The `onError` handler gracefully falls back.
- Recommendations: Document CSP requirements in the README. Consumers must allow `img-src t1.gstatic.com` in their CSP.

**No input sanitization on domain prop:**
- Risk: The `domain` prop is passed through `normalizeDomain()` which uses `new URL()` for parsing, then interpolated into the CDN URL. While `new URL()` handles most injection vectors, unusual input could produce unexpected CDN URLs. The CDN itself would reject invalid domains, so this is low-risk.
- Files: `src/SiteIcon.tsx` (lines 41-49, line 53)
- Current mitigation: `new URL()` parsing extracts only the hostname. Invalid input falls through to the raw string (line 48), which is interpolated into the CDN URL.
- Recommendations: Low priority. Consider validating that the extracted hostname matches a basic domain pattern before building the URL.

## Performance Bottlenecks

**No image caching across component instances:**
- Problem: Each `<SiteIcon>` instance independently fetches and detects the favicon. If a page renders 50 instances for `github.com`, all 50 fetch from the CDN (browser HTTP cache helps, but each runs detection independently).
- Files: `src/SiteIcon.tsx` (entire component -- detection is per-instance)
- Cause: Detection state (`status`) is local to each component instance. There is no shared cache or context provider.
- Improvement path: This is acceptable for the library's "zero dependencies, < 1KB" constraint. A shared detection cache would add complexity and size. If needed, consumers can implement their own caching layer using `onResolved`. Document this pattern.

**Detection latency with `lazy` strategy:**
- Problem: The `lazy` strategy renders a hidden `<img>` for detection, waits for it to load, then swaps to the visible `<img>`. This means a visual "pop" when the favicon appears. For pages with many favicons, this creates a staggered loading effect.
- Files: `src/SiteIcon.tsx` (lines 150-198)
- Cause: By design -- `lazy` prioritizes correctness (never showing the globe) over speed.
- Improvement path: The `eager` strategy exists for use cases where immediate display is preferred. Document the trade-offs between strategies more prominently.

## Fragile Areas

**Globe detection heuristic (`naturalWidth > 16`):**
- Files: `src/SiteIcon.tsx` (lines 55, 99, 126)
- Why fragile: The entire detection mechanism assumes Google's faviconV2 CDN returns a 16x16 globe for domains without favicons. If Google changes the globe size (e.g., to match the requested size, or to a different fixed size), detection breaks silently -- all domains would appear to have favicons, or none would.
- Safe modification: Do not change the `GOOGLE_GLOBE_SIZE` constant without testing against the actual CDN response. The `size === 16` workaround (fetching 24px instead) is specifically designed around this heuristic.
- Test coverage: Good. Tests cover `naturalWidth > 16` (found), `naturalWidth === 16` (globe), and `naturalWidth === 0` (error). However, all tests mock `naturalWidth` -- no integration test against the real CDN.

**"Adjust state during render" pattern for domain changes:**
- Files: `src/SiteIcon.tsx` (lines 107-110)
- Why fragile: This is a React-approved but uncommon pattern. It sets state during the render phase (not in an effect) to avoid an extra render cycle. Future React versions or strict mode changes could interact unexpectedly with this pattern. The combination of `prevDomain` state, `domainRef` ref, and `statusRef` ref creates a complex state synchronization mechanism.
- Safe modification: When changing domain-change logic, trace all three synchronization mechanisms (`prevDomain` state, `domainRef`, `statusRef`) together. Test domain-change scenarios explicitly.
- Test coverage: Covered by "domain change" test suite (2 tests). Could benefit from more edge cases (rapid successive domain changes, empty-to-valid transitions).

## Scaling Limits

**Bundle size ceiling (1024 bytes gzipped):**
- Current capacity: 878 bytes gzipped (ESM bundle).
- Limit: CI enforces a hard 1024-byte gzip limit in `.github/workflows/ci.yml` (lines 44-50).
- Scaling path: 146 bytes of headroom. Any new feature (e.g., retry logic, caching, animation) will likely exceed this. To add features, either raise the limit or split into a core + extensions architecture.

## Dependencies at Risk

**tsup (unmaintained):**
- Risk: tsup's README states it is "not actively maintained" and recommends tsdown. No new features or bug fixes expected.
- Impact: Currently works perfectly for this library's simple build requirements. Would only become a problem if a future esbuild or Node.js version introduces an incompatibility.
- Migration plan: Run `npx tsdown-migrate` when needed. tsdown v1.0 should be stable by then. The CLAUDE.md explicitly documents this decision and migration path.

**Google faviconV2 CDN (external, undocumented):**
- Risk: Not a package dependency, but the core runtime dependency. Undocumented Google API with no SLA, no versioning, no deprecation policy.
- Impact: If the endpoint changes or goes offline, every `<SiteIcon>` instance in every consumer's app falls back to the fallback prop. The library becomes a no-op wrapper.
- Migration plan: The `buildUrl` function (line 52-53) is the single point of CDN coupling. Swapping to an alternative favicon CDN requires changing only this function. Consider exposing a `cdnUrl` prop for consumer-controlled fallback.

## Missing Critical Features

**No `loading` / `aria-busy` state exposed:**
- Problem: Consumers cannot style or announce the loading state. Screen readers get no indication that favicon detection is in progress.
- Blocks: Full accessibility compliance for dynamic content loading patterns.

**No retry mechanism:**
- Problem: If the CDN request fails (network error, timeout), the component immediately shows fallback with no retry. Transient network issues cause permanent fallback display until the component remounts.
- Blocks: Reliable favicon display on flaky connections.

## Test Coverage Gaps

**No integration tests against real CDN:**
- What's not tested: All tests mock `naturalWidth` and image load/error events. No test verifies that the actual Google CDN returns the expected globe size (16x16) for unknown domains or the expected real favicon size for known domains.
- Files: `src/SiteIcon.test.tsx`
- Risk: The core detection heuristic could break without any test failing. A CDN behavior change would only be caught by manual testing or user reports.
- Priority: Medium. An optional integration test (skipped in CI, run manually) would provide early warning.

**~~No React 17 compatibility testing~~ (RESOLVED 2026-06-04):**
- Resolution: Dropped React 17 from `peerDependencies`. Range is now `^18.0.0 || ^19.0.0`. The "use client" banner is now consistent with the declared peer range. Existing React 17 users who pinned an earlier 0.x release are unaffected; v1.0+ consumers must be on React 18 or 19.

**No coverage enforcement:**
- What's not tested: Coverage thresholds are not configured. There is no way to detect coverage regressions.
- Files: `vitest.config.ts`, `package.json`
- Risk: Low -- the component is small and well-tested (52 tests). But coverage could regress silently as features are added.
- Priority: Low.

**No test for rapid domain switching:**
- What's not tested: Changing the domain prop multiple times in rapid succession (e.g., as a user types in a search box). The stale-detection mechanism (`domainRef`) is tested for a single switch, but not for rapid successive changes.
- Files: `src/SiteIcon.test.tsx`
- Risk: Race conditions between multiple in-flight CDN requests and stale detection callbacks.
- Priority: Medium.

## CI/CD Concerns

**Node version mismatch between CI workflows:**
- Issue: `ci.yml` and `deploy.yml` use Node 22, but `release.yml` uses Node 24 (line 24). This inconsistency could mask Node-version-specific issues.
- Files: `.github/workflows/ci.yml` (line 20), `.github/workflows/release.yml` (line 24), `.github/workflows/deploy.yml` (line 43)
- Impact: Low -- the library output is plain JS. But the publish step running on a different Node version than CI tests is unexpected.
- Fix approach: Align all workflows to Node 22 (matching `.nvmrc`), or document the intentional divergence.

**No branch protection enforcement documented:**
- Issue: `ci.yml` includes a comment "Enable branch protection in repo settings requiring this workflow to pass before merge to main" but there is no way to verify this is actually configured.
- Files: `.github/workflows/ci.yml` (line 1)
- Impact: Without branch protection, PRs can be merged to main without passing CI.
- Fix approach: Verify branch protection is enabled in GitHub repo settings.

---

*Concerns audit: 2026-04-19*
