# Project Research Summary

**Project:** react-site-icon
**Domain:** React npm component library (single component, favicon resolver)
**Researched:** 2026-04-12
**Confidence:** HIGH

## Executive Summary

react-site-icon is a micro React component library that displays any website's favicon given a domain name, using Google's undocumented faviconV2 CDN as its sole image source. The expert consensus for building this type of library is clear: ship a single, well-typed component with zero runtime dependencies, dual ESM/CJS output via tsup, and a minimal API surface. The primary competitor (favicon-stealer) overengineers the problem with 12+ props and a slow waterfall fetch strategy across multiple CDNs. react-site-icon's competitive edge is simplicity -- one component, one CDN, sub-1KB bundle, and a naturalWidth-based detection trick that reliably identifies missing favicons without CORS workarounds.

The recommended approach is a flat repository structure with the library at root and an Astro demo site in `/docs`. The core technical challenge is the favicon fallback detection: Google's CDN returns a 16x16 default globe icon when a domain has no favicon but a larger size was requested. Detecting this via `naturalWidth` in the `onLoad` callback is the correct pattern -- it avoids CORS issues, Canvas API complexity, and multi-service cascading. The component must be SSR-safe (render fallback on server, detect on client via `useEffect`), and the build must inject a `"use client"` banner for Next.js App Router compatibility.

The key risks are (1) getting the package.json `exports` field wrong, which silently breaks consumer imports and is hard to fix after publish; (2) npm authentication failures due to the 2025 classic token revocation -- OIDC Trusted Publishing is the only reliable path; and (3) the dependency on Google's undocumented CDN, which has no SLA, no published rate limits, and could change without notice. All three are manageable with the specific mitigations documented in the research. The overall confidence is HIGH because this is a well-understood problem domain (React component libraries, npm publishing, image loading) with established patterns and tooling.

## Key Findings

### Recommended Stack

The stack is entirely standard for a 2026 React component library. Every technology choice has HIGH confidence, backed by official documentation and ecosystem consensus.

**Core technologies:**
- **React 17/18/19** (peer dep): Wide compatibility range covering the entire modern React ecosystem. Only stable APIs used (`useState`, `useEffect`, `useRef`).
- **TypeScript 5.7** (dev dep): Strict mode with shipped `.d.ts` and `.d.cts` declarations. Pin to 5.x -- TS 6.0 is too new.
- **tsup 8.5.1**: Battle-tested bundler for ESM + CJS + dts. Not tsdown (pre-1.0, unnecessary for a sub-1KB library). Migration to tsdown is trivial later.
- **Vitest 4.1.4**: Test runner with native ESM/TS support. With @testing-library/react for component tests.
- **ESLint 10 + Prettier**: ESLint 10 flat config only. Combined with typescript-eslint, react, react-hooks plugins.
- **Changesets**: Version management with CHANGELOG generation. OIDC Trusted Publishing for npm (classic tokens are dead).
- **Astro 6.1.5**: Demo site framework. Static HTML for SEO + React islands for interactive playground. GitHub Pages deployment via withastro/action.
- **Node 22.x LTS**: Required in CI for OIDC npm publishing. Library output targets ES2018 for broad consumer compatibility.

### Expected Features

**Must have (table stakes -- v1.0.0):**
- `domain` prop accepting full URLs with automatic hostname extraction
- `size` prop mapping to Google API `sz` parameter and img dimensions
- `fallback` prop (ReactNode) rendered when favicon detection fails
- `alt`, `className`, `style` pass-through props
- naturalWidth-based fallback detection (the core innovation)
- SSR compatibility (fallback on server, detect on client)
- `...restProps` spread to underlying `<img>` (enables `loading="lazy"`, `data-*`, `aria-*`)
- `ref` forwarding (forwardRef for React 17/18, ref-as-prop for React 19)
- TypeScript strict with shipped declarations
- Dual ESM + CJS with correct `exports` field
- `"use client"` banner for RSC/Next.js App Router
- Zero runtime dependencies

**Should have (ship in v1.0.0, lower priority):**
- `onResolved` callback prop reporting `{ status: 'loaded' | 'fallback', domain }`
- Optimized npm keywords for discoverability
- Bundlephobia badge proving sub-1KB claim

**Ship shortly after v1.0.0:**
- Interactive Astro demo site with "try any domain" playground
- CodeSandbox/StackBlitz embed links
- Comparison table vs favicon-stealer and DIY approaches

**Defer indefinitely (anti-features):**
- `useSiteIcon` hook API (doubles API surface for marginal benefit)
- Built-in styling props (border, padding, bgColor -- let CSS do CSS)
- Multiple fallback service cascade (Google CDN alone is sufficient)
- Caching layer (browser already caches images)
- `crossOrigin` attribute (breaks Google CDN requests)
- Canvas/ImageData comparison (CORS issues, unnecessary complexity)

### Architecture Approach

Flat single-package repository. Library at root (`src/`, `dist/`), demo site in `/docs` as an independent Astro project. No monorepo tooling -- the library has one entry point, one component, and three source files. The demo site imports directly from `../src/` during development and build.

**Major components:**
1. **SiteIcon.tsx** -- The component. Manages load state, renders `<img>` or fallback, runs naturalWidth detection in `onLoad`.
2. **utils.ts** -- Pure functions: `normalizeDomain()` (URL parsing) and `buildFaviconUrl()` (Google CDN URL construction). Independently testable.
3. **types.ts** -- `SiteIconProps` interface extending `ImgHTMLAttributes<HTMLImageElement>`. Exported for consumer TypeScript usage.
4. **index.ts** -- Barrel export of `SiteIcon` component and `SiteIconProps` type. Minimal public API surface.
5. **docs/** -- Astro demo site with React island playground. Deployed to GitHub Pages.
6. **CI/CD** -- Three workflows: PR quality gates, Changesets release with OIDC publishing, Astro demo deployment.

### Critical Pitfalls

1. **Wrong `exports` field ordering** -- `types` must come first in each condition block; separate `.d.ts` and `.d.cts` for ESM/CJS. Validate with `@arethetypeswrong/cli` in CI. Unfixable after consumers depend on the package without a breaking change.
2. **tsup strips `"use client"` directive** -- Must use `banner: { js: '"use client";' }` in tsup config. Without it, Next.js App Router users cannot import the component. Verify first line of `dist/index.js` in CI.
3. **npm classic tokens revoked (Dec 2025)** -- Use OIDC Trusted Publishing exclusively. Requires `id-token: write` permission, npm CLI >= 11.5.1, Node >= 22.14.0, and `repository` field in package.json matching the GitHub repo URL exactly.
4. **naturalWidth timing bug** -- Reading `naturalWidth` before `onLoad` fires always returns 0. All detection logic must be inside the `onLoad` callback, never in render or bare `useEffect`.
5. **SSR crash from naturalWidth access** -- Gate all detection behind `useEffect` (server-safe). Render fallback on server. Never access DOM properties during render.

## Implications for Roadmap

Based on the build dependency graph from ARCHITECTURE.md and the phase-specific warnings from PITFALLS.md, here is the suggested phase structure:

### Phase 1: Project Scaffolding and Build Pipeline
**Rationale:** Everything else depends on a working build. The exports field, tsup config, and package.json structure must be correct from the start because they are nearly impossible to fix after consumers adopt the package.
**Delivers:** Repository structure, TypeScript config, tsup build producing correct ESM + CJS + dts output, package.json with correct `exports` field, `"use client"` banner, `sideEffects: false`.
**Addresses:** Dual ESM/CJS output, TypeScript declarations, zero runtime dependencies, `"use client"` RSC support.
**Avoids:** Pitfalls #1 (wrong exports), #2 (stripped use client), #5 (files leaking to npm), #8 (React bundled in output), #14 (missing repository field).

### Phase 2: Core Component Implementation
**Rationale:** The component is the product. It depends on the build pipeline from Phase 1 being functional. The naturalWidth detection and SSR safety are the two hardest technical problems and must be solved before anything else.
**Delivers:** `SiteIcon` component with all table-stakes props, `normalizeDomain()` and `buildFaviconUrl()` utilities, SSR-safe rendering, naturalWidth-based fallback detection.
**Addresses:** `domain`/`size`/`fallback`/`alt`/`className`/`style` props, domain normalization, naturalWidth detection, SSR compatibility, ref forwarding, `...restProps` spread, `onResolved` callback.
**Avoids:** Pitfalls #7 (SSR naturalWidth crash), #13 (naturalWidth timing).

### Phase 3: Testing
**Rationale:** Tests validate the component behavior established in Phase 2. Testing must cover SSR rendering, fallback detection, domain normalization edge cases, and error handling. Tests should mock image loading -- never hit Google's CDN in CI.
**Delivers:** Full Vitest + Testing Library test suite, mocked image loading, SSR render tests, edge case coverage for domain normalization.
**Addresses:** Reliability features from FEATURES.md (graceful error handling, domain normalization edge cases).
**Avoids:** Pitfall #6 (Google rate limiting in tests).

### Phase 4: Quality Tooling and CI
**Rationale:** Linting, formatting, and CI enforce quality gates before code reaches main. CI must include `@arethetypeswrong/cli` and `npm pack --dry-run` checks. The release workflow with OIDC publishing must be configured before the first npm publish.
**Delivers:** ESLint 10 flat config, Prettier, Husky + lint-staged pre-commit hooks, CI workflow (lint/test/build on PR), Release workflow (Changesets + OIDC npm publish), post-publish verification step.
**Addresses:** Quality tooling from STACK.md, Changesets versioning, npm OIDC Trusted Publishing.
**Avoids:** Pitfalls #3 (dead npm tokens), #10 (branch protection blocking changesets), #15 (forgotten changesets).

### Phase 5: Documentation and README
**Rationale:** The README is the marketing page for an npm package. It must follow the cognitive funneling structure (name, badges, install, example, API table, comparison). Ships alongside or just before the first npm publish.
**Delivers:** README with badges, install command, quick example, full props API table, comparison vs favicon-stealer, license.
**Addresses:** All package quality signals from FEATURES.md (badges, keywords, README structure, npm discoverability).

### Phase 6: Demo Site and Polish
**Rationale:** The demo site is a post-launch adoption accelerator. No competing favicon library has an interactive demo. This phase also includes CodeSandbox/StackBlitz embeds and the GitHub Pages deployment workflow. Can iterate after initial npm publish.
**Delivers:** Astro demo site with interactive "try any domain" playground, GitHub Pages deployment, CodeSandbox/StackBlitz links.
**Addresses:** Demo site differentiator from FEATURES.md, Astro architecture from ARCHITECTURE.md.
**Avoids:** Pitfalls #6 (rate limiting -- debounce input), #9 (GitHub Pages 404 from missing `base` path).

### Phase Ordering Rationale

- Phases 1-2 are strictly sequential: the component cannot be validated without a working build pipeline, and the build pipeline produces nothing useful without component source.
- Phase 3 can partially overlap with Phase 2: test files can be written alongside component development, but the full suite depends on the component being feature-complete.
- Phase 4 (CI/CD) depends on Phases 1-3: CI runs lint + test + build, so all three must work locally first. The release workflow specifically must be configured before the first `npm publish`.
- Phase 5 (README) can start during Phase 3-4: API documentation can be drafted once props are stable.
- Phase 6 (demo site) is independent of npm publishing: it imports from `../src/` directly, so it can be developed anytime after Phase 2, but deploying it to GitHub Pages requires the CI workflow from Phase 4.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (CI/CD):** OIDC Trusted Publishing setup is well-documented but has exact configuration requirements (npm CLI version, repository field format, permissions). Worth a focused research pass on the exact workflow YAML.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Scaffolding):** tsup + TypeScript + package.json exports is thoroughly documented. The exact config is provided in STACK.md and ARCHITECTURE.md.
- **Phase 2 (Component):** The SSR-safe component pattern with naturalWidth detection is fully specified in ARCHITECTURE.md with working code.
- **Phase 3 (Testing):** Vitest + Testing Library is standard. Image mocking patterns are well-known.
- **Phase 5 (README):** Template-driven, no research needed.
- **Phase 6 (Demo Site):** Astro + React islands is standard. The withastro/action config is documented in ARCHITECTURE.md.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against npm registry. Every tool is the established standard for 2026 React libraries. |
| Features | HIGH | Competitor analysis (favicon-stealer) provides clear differentiation. Table stakes derived from ecosystem expectations. Anti-features well-justified. |
| Architecture | HIGH | Single-component library patterns are thoroughly documented. Flat repo structure is the simplest correct choice. |
| Pitfalls | HIGH | 15 pitfalls identified with specific prevention strategies. All critical pitfalls confirmed via multiple sources. |

**Overall confidence:** HIGH

### Gaps to Address

- **Google faviconV2 CDN reliability:** This undocumented API has no SLA. The rate limit (~55 requests from same IP) is reported by a single practitioner. Document the dependency in README and accept the risk -- there is no viable alternative that avoids CORS issues.
- **React 17 testing coverage:** The test suite will run against React 18/19 (Testing Library v16 requires React 18+). React 17 compatibility is validated by API analysis (only stable hooks used) and optionally by a CI matrix smoke test. This is the standard industry approach but is not a full guarantee.
- **OIDC Trusted Publishing first-time setup:** The npm configuration UI for trusted publishers is specific to the package URL (`npmjs.com/package/react-site-icon/access`). This cannot be configured until the package name is claimed on npm. First publish may need a manual `npm publish` with a granular token, then OIDC for all subsequent releases.

## Sources

### Primary (HIGH confidence)
- tsup v8.5.1 npm registry and GitHub README
- TypeScript Modules Reference (types condition ordering)
- npm trusted publishing official docs
- npm classic token revocation changelog (Dec 9, 2025)
- Astro deployment guide and withastro/action
- Changesets action repository
- @arethetypeswrong/cli validation tool
- ESLint 10 flat config docs (extends, defineConfig)

### Secondary (MEDIUM confidence)
- Google faviconV2 API analysis (dev.to/derlin) -- undocumented API, behavior inferred from testing
- tsup issue #835 ("use client" banner pattern) -- community-established workaround
- favicon-stealer GitHub/npm -- competitor analysis for feature differentiation

### Tertiary (LOW confidence)
- Google faviconV2 rate limit (~55 requests) -- single practitioner report, no official documentation
- tsup dts generation performance issues (#945, #1050) -- unlikely to affect this tiny library but noted for awareness

---
*Research completed: 2026-04-12*
*Ready for roadmap: yes*
