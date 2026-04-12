# Requirements: react-site-icon

**Defined:** 2026-04-12
**Core Value:** Reliably display any website's favicon with correct fallback detection -- fast, tiny, zero dependencies.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Component API

- [x] **COMP-01**: SiteIcon component accepts `domain` prop (string, required) to specify which website's favicon to display
- [x] **COMP-02**: SiteIcon accepts `size` prop (number, default 32) controlling requested favicon size in pixels
- [x] **COMP-03**: SiteIcon accepts `fallback` prop (ReactNode) rendered when no favicon is available
- [x] **COMP-04**: SiteIcon accepts `className` prop passed through to the wrapper/img element
- [x] **COMP-05**: SiteIcon accepts `style` prop (CSSProperties) passed through to the wrapper/img element
- [x] **COMP-06**: SiteIcon accepts `alt` prop (string) for accessibility on the img element
- [x] **COMP-07**: SiteIcon normalizes domain input -- strips protocols, paths, query params, and hash to extract hostname
- [x] **COMP-08**: SiteIcon detects Google's default globe via naturalWidth check (16x16 at any requested size) and triggers fallback
- [x] **COMP-09**: SiteIcon is SSR-compatible -- renders fallback on server, runs detection on client after hydration
- [x] **COMP-10**: SiteIcon handles network errors gracefully -- img onError triggers fallback rendering
- [x] **COMP-11**: SiteIcon accepts `onResolved` callback prop, fired with boolean (true = found, false = fallback) when favicon status is determined
- [x] **COMP-12**: SiteIcon forwards ref to the underlying `<img>` element -- forwardRef for React 17/18, ref as prop for React 19
- [x] **COMP-13**: SiteIcon spreads remaining props (`...restProps`) onto the `<img>` element, enabling `loading`, `decoding`, `data-*`, `aria-*` attributes

### Package Build

- [x] **BUILD-01**: TypeScript strict mode with shipped .d.ts declarations via tsup
- [x] **BUILD-02**: Dual ESM + CJS output via tsup (`.js` + `.cjs` or `.mjs` + `.js`)
- [x] **BUILD-03**: `"use client"` banner injected in build output for Next.js RSC/App Router compatibility
- [x] **BUILD-04**: Correct `exports` field in package.json with `types` condition listed first
- [x] **BUILD-05**: React and react-dom externalized as peer dependencies (not bundled into dist)
- [x] **BUILD-06**: `"files": ["dist"]` in package.json -- only dist directory published to npm
- [x] **BUILD-07**: Bundle size under 1KB minified+gzipped
- [x] **BUILD-08**: React 17, 18, and 19 declared as peer dependencies (`"^17.0.0 || ^18.0.0 || ^19.0.0"`)

### Testing

- [ ] **TEST-01**: Unit tests with vitest + @testing-library/react covering component rendering, fallback detection, and error handling
- [ ] **TEST-02**: Tests mock image loading (never hit Google CDN in CI)
- [ ] **TEST-03**: `@arethetypeswrong/cli` validates package exports correctness in CI

### Documentation

- [ ] **DOCS-01**: README follows cognitive funneling: package name -> one-line description -> badges -> install -> 3-line example -> "why this library" -> full API table -> advanced examples -> license
- [ ] **DOCS-02**: README displays badges: npm version, bundle size (Bundlephobia), MIT license, CI status
- [ ] **DOCS-03**: package.json `keywords` optimized for npm search: favicon, site-icon, website-icon, react, react-component, domain-favicon, google-favicon
- [ ] **DOCS-04**: README includes comparison table vs favicon-stealer and DIY approaches
- [ ] **DOCS-05**: README includes StackBlitz embed link for one-click "try it now" experience
- [ ] **DOCS-06**: README includes full props/API table with prop name, type, default, and description columns

### Demo Site

- [ ] **DEMO-01**: Astro + React landing page with marketing-style content (what, why, how)
- [ ] **DEMO-02**: Interactive "try any domain" playground with live favicon preview
- [ ] **DEMO-03**: Demo site deployed to GitHub Pages via GitHub Actions

### CI/CD

- [ ] **CICD-01**: GitHub Actions CI workflow -- lint, test, build on pull requests and pushes to main
- [ ] **CICD-02**: GitHub Actions CD workflow -- auto-publish to npm via OIDC Trusted Publishing on git tag push
- [ ] **CICD-03**: GitHub Actions workflow deploys demo site to GitHub Pages on push to main
- [ ] **CICD-04**: Changesets integration -- version PR automation and npm publish on merge

### Quality Tooling

- [x] **TOOL-01**: ESLint 10 with flat config (`eslint.config.js`) and typescript-eslint
- [x] **TOOL-02**: Prettier formatting configuration
- [x] **TOOL-03**: Husky + lint-staged pre-commit hooks running lint and format
- [x] **TOOL-04**: Changesets configured for versioning and changelog generation

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Community

- **COMM-01**: Contributing guide (CONTRIBUTING.md)
- **COMM-02**: Issue templates for bug reports and feature requests
- **COMM-03**: Weekly downloads badge (add after > 100 downloads/week)

### Features

- **FEAT-01**: Multiple favicon provider support (DuckDuckGo, favicon.im as alternatives)
- **FEAT-02**: Configurable fallback detection threshold (not hardcoded to 16)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Built-in styling props (border, padding, bgColor) | Duplicates CSS; bloats API surface; clashes with consumer design systems |
| Direct favicon.ico fetch from target domain | Unreliable, CORS issues, DNS timeouts on dead domains add latency |
| Multiple fallback service cascade | Adds latency and complexity; Google CDN alone is reliable enough |
| Canvas/ImageData comparison | Requires CORS headers Google doesn't send; brittle pixel comparison |
| `useSiteIcon` hook API | Doubles API surface for marginal benefit; component encapsulates all logic |
| In-memory favicon cache | Browser already caches via HTTP headers; JS cache adds complexity |
| Server-side favicon fetching | Different problem domain; would add Node.js deps and massive bundle |
| Theming / dark mode inversion | Opinionated; most favicons work on any background |
| crossOrigin attribute on img | Google CDN doesn't send CORS headers; adding it breaks the request |
| Animated/transition effects | Opinionated visual behavior; consumers can add via CSS wrappers |
| Blog post / social promotion | Not needed -- quality + SEO + demo site is the discovery strategy |
| React Native version | Different rendering target; out of scope for web component library |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| COMP-01 | Phase 2 | Complete |
| COMP-02 | Phase 2 | Complete |
| COMP-03 | Phase 2 | Complete |
| COMP-04 | Phase 2 | Complete |
| COMP-05 | Phase 2 | Complete |
| COMP-06 | Phase 2 | Complete |
| COMP-07 | Phase 2 | Complete |
| COMP-08 | Phase 2 | Complete |
| COMP-09 | Phase 2 | Complete |
| COMP-10 | Phase 2 | Complete |
| COMP-11 | Phase 2 | Complete |
| COMP-12 | Phase 2 | Complete |
| COMP-13 | Phase 2 | Complete |
| BUILD-01 | Phase 1 | Complete |
| BUILD-02 | Phase 1 | Complete |
| BUILD-03 | Phase 1 | Complete |
| BUILD-04 | Phase 1 | Complete |
| BUILD-05 | Phase 1 | Complete |
| BUILD-06 | Phase 1 | Complete |
| BUILD-07 | Phase 1 | Complete |
| BUILD-08 | Phase 1 | Complete |
| TEST-01 | Phase 3 | Pending |
| TEST-02 | Phase 3 | Pending |
| TEST-03 | Phase 3 | Pending |
| DOCS-01 | Phase 5 | Pending |
| DOCS-02 | Phase 5 | Pending |
| DOCS-03 | Phase 5 | Pending |
| DOCS-04 | Phase 5 | Pending |
| DOCS-05 | Phase 5 | Pending |
| DOCS-06 | Phase 5 | Pending |
| DEMO-01 | Phase 6 | Pending |
| DEMO-02 | Phase 6 | Pending |
| DEMO-03 | Phase 6 | Pending |
| CICD-01 | Phase 4 | Pending |
| CICD-02 | Phase 4 | Pending |
| CICD-03 | Phase 4 | Pending |
| CICD-04 | Phase 4 | Pending |
| TOOL-01 | Phase 1 | Complete |
| TOOL-02 | Phase 1 | Complete |
| TOOL-03 | Phase 1 | Complete |
| TOOL-04 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 41 total
- Mapped to phases: 41
- Unmapped: 0

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-12 after roadmap creation*
