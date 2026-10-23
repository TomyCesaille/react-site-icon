# AGENTS

## Project

**react-site-icon**

A zero-dependency React component that displays any website's favicon from its domain name. It fetches favicons from Google's faviconV2 CDN and uses a `naturalWidth` check to detect Google's default globe fallback — the key insight that no other library implements. Packaged as a lightweight npm library with a demo site for discoverability.

**Core Value:** Reliably display any website's favicon with correct fallback detection — fast (single CDN request, no waterfall), tiny (< 1KB), zero dependencies.

### Constraints

- **Bundle size**: < 1KB minified+gzipped — this is the library's competitive edge
- **Dependencies**: Zero runtime dependencies — only React as peer dependency
- **React compatibility**: Must work with React 18 and 19 (React 17 support dropped in v1.0)
- **License**: MIT
- **Build tooling**: tsup (ESM + CJS), vitest, TypeScript strict
- **Hosting**: GitHub Pages for demo site, npm registry for package
- **Publishing**: Automated via GitHub Actions on git tag

## Bundle size badge (check on every release)

The bundle size badge is hardcoded, not dynamic: the shields.io Bundlephobia badge (`img.shields.io/bundlephobia/minzip/...`) is almost always "rate limited by upstream service". It must be kept in sync by hand.

- **Where** — the same value appears in two places; update both:
  - `README.md`: `https://img.shields.io/badge/bundlephobia-903%20B-blue`
  - `docs/src/pages/index.astro` (demo site hero badges): same URL
- **Current value** — `903 B`, Bundlephobia's minified+gzipped size for `v1.0.0` and `v1.0.1` (identical `dist/index.js`).
- **What the number is** — Bundlephobia's own `gzip` figure. Bundlephobia re-bundles the ESM entry with webpack, so it does **not** match CI's `gzip -c dist/index.js | wc -c` (877 B for the same file). Never put the CI number on the badge.
- **How to check, as part of every release PR:**
  1. Compare the new build with the last published one:
     ```sh
     npm run build
     PREV=$(mktemp -d) && npm pack react-site-icon@latest --pack-destination "$PREV" --silent >/dev/null
     tar xzf "$PREV"/*.tgz -C "$PREV"
     cmp dist/index.js "$PREV/package/dist/index.js" && echo "unchanged: badge stays"
     ```
  2. If `dist/index.js` is unchanged, the badge stays. Say so in the PR.
  3. If it changed, Bundlephobia can only measure it once published. After the release, read the real value (the API works directly, only the shields proxy is rate-limited) and update both locations plus "Current value" above in a follow-up commit:
     ```sh
     curl -s 'https://bundlephobia.com/api/size?package=react-site-icon@<version>' | jq .gzip
     ```

## Technology Stack

### Core Framework
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React | 18.x / 19.x (peer dep) | UI framework | The library's entire purpose. React 17 dropped in v1.0 — untested in CI and the shipped `"use client"` banner is an RSC-era directive (18+). | HIGH |
| TypeScript | ^6.0 (dev dep) | Type safety + shipped .d.ts | Strict mode catches bugs at compile time; consumers expect shipped declarations. Stay on 6.x: typescript-eslint caps its peer range at `<6.1.0`, and TS 7 (native compiler) only ships an unstable API. | HIGH |
### Build Tool
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| tsup | ^9.0.0 | Bundle ESM + CJS + .d.ts | **Use tsup, not tsdown.** See rationale below. | HIGH |
- tsdown is pre-1.0 (v0.21.7). API surface is still shifting.
- tsup is battle-tested, has massive ecosystem adoption, and works perfectly for a single-file component library.
- This library has one entry point and one output file. Build takes under 1 second regardless of tool.
- tsup's "unmaintained" status means no new features, not that it's broken. For a < 1KB library, that's fine.
- tsup 9 requires Node `^22.18.0 || ^24.11.0 || >=26` for development; the published output is unaffected.
- Migration from tsup to tsdown is trivial (`npx tsdown-migrate`) if needed later.
### Demo Site
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Astro | ^7.4.2 | Demo site framework | Static HTML for SEO + React islands for interactive playground. Official `withastro/action@v6` for GitHub Pages deploys. Requires Node >= 22.23.4. | HIGH |
| @astrojs/react | ^7.1.1 | React integration | Officially supports React 17/18/19 as peer deps (we only target 18/19). | HIGH |
### Testing
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vitest | ^5.0.5 | Test runner | Jest-compatible API, native ESM/TS, 4x faster than Jest. Standard for all new React libraries. | HIGH |
| @testing-library/react | ^16.3.3 | Component rendering | Standard React testing utility. Peer dep on React 18/19. | HIGH |
| @testing-library/jest-dom | ^7.0.1 | DOM matchers | Provides `.toBeInTheDocument()`, `.toHaveAttribute()`, etc. | HIGH |
| @testing-library/user-event | ^14.6.8 | User interaction simulation | Fires realistic events (click, type). More accurate than `fireEvent`. | HIGH |
| jsdom | ^30.1.3 | Browser environment | Required for Vitest DOM testing. Lighter than happy-dom for simple components. | HIGH |
### Quality Tooling
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| ESLint | ^10.13.0 | Linting | ESLint 10 uses flat config (`eslint.config.js`) exclusively. The legacy `.eslintrc` format is removed. | HIGH |
| typescript-eslint | ^8.72.0 | TS linting rules | Unified package replacing `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin`. | HIGH |
| eslint-plugin-react | ^7.37.5 | React-specific rules | Catches React anti-patterns (missing keys, hooks rules). | HIGH |
| eslint-plugin-react-hooks | ^7.1.1 | Hooks rules | Enforces Rules of Hooks. Separate from eslint-plugin-react. | HIGH |
| eslint-config-prettier | ^10.1.8 | Prettier compat | Disables ESLint rules that conflict with Prettier. | HIGH |
| Prettier | ^3.9.10 | Code formatting | Opinionated formatter. No config debates. | HIGH |
| Husky | ^9.1.7 | Git hooks | Runs pre-commit hooks reliably. v9 uses `core.hooksPath`. | HIGH |
| lint-staged | ^17.6.0 | Staged file processing | Runs ESLint + Prettier only on staged files (1-2s, not full repo). | HIGH |
### Versioning & Publishing
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @changesets/cli | ^3.0.3 | Version management | Manages version bumps + CHANGELOG generation. Standard for OSS npm libraries. | HIGH |
| @changesets/changelog-github | ^1.0.1 | Changelog format | Links PRs and contributors in CHANGELOG.md. | HIGH |
| changesets/action (GH Action) | v2 | CI automation | Creates "Version Packages" PR on merge, auto-publishes on approval. | HIGH |
### CI/CD (GitHub Actions)
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| actions/checkout | v7 | Clone repo | Standard. | HIGH |
| actions/setup-node | v7 | Node setup | npm caching in CI and deploy; no cache in the release workflow (cache-poisoning risk with OIDC). Release runs on Node 24 for npm >= 11.5.1 (OIDC Trusted Publishing). | HIGH |
| changesets/action | v2 | Version PR + publish | Creates version bump PRs, publishes on merge. | HIGH |
| withastro/action | v6 | Demo site build | Official Astro action for GitHub Pages. | HIGH |
| actions/deploy-pages | v5 | Deploy to GH Pages | Standard GitHub Pages deployment action. | HIGH |
### Supporting Packages
| Package | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| globals | ^17.13.0 | ESLint flat config globals | Required for ESLint 10 flat config browser/node environments | HIGH |
| @types/react | ^19.3.0 (dev) | React type definitions | Development only. Do NOT ship as dependency. | HIGH |
| @types/react-dom | ^19.3.0 (dev) | ReactDOM type definitions | Development only. | HIGH |
## package.json Configuration
### Dual ESM + CJS Output
- `"type": "module"` -- ESM-first, standard for 2026.
- `exports` field with `types` condition first (TypeScript requires this ordering).
- Separate `.d.ts` and `.d.cts` for ESM and CJS consumers.
- `"sideEffects": false` -- enables tree-shaking.
- `"files": ["dist"]` -- only ship the build output to npm.
## Alternatives Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Bundler | tsup | tsdown | Pre-1.0. Library is too small to benefit from speed gains. Easy to migrate later. |
| Bundler | tsup | Rollup | More config, no dts generation built-in. tsup wraps esbuild with better defaults. |
| Bundler | tsup | Vite library mode | Heavier, designed for apps. tsup is purpose-built for libraries. |
| Test runner | Vitest | Jest | Slower, requires babel/ts-jest config, no native ESM. Vitest is the 2025+ standard. |
| Linter | ESLint 10 | Biome | Biome is fast but has smaller plugin ecosystem. ESLint has React/hooks/a11y plugins. |
| Formatter | Prettier | Biome | Could use Biome for both, but Prettier is more widely adopted and expected. |
| Versioning | Changesets | semantic-release | Changesets gives explicit control over version bumps. Better for small libraries where you want to review each release. |
| Demo site | Astro | Storybook | Storybook is for component catalogs. This library has ONE component -- a landing page with playground is better for marketing/SEO. |
| Demo site | Astro | Next.js | Overkill for a static demo site. Astro is lighter, faster, better SSG. |
| Git hooks | Husky | lefthook | Husky is more widely adopted. lefthook is faster but adds a Go dependency. |
## Node.js Version Strategy
| Context | Node Version | Rationale |
|---------|-------------|-----------|
| CI (lint/test/build) | 22.x LTS | Required for npm OIDC Trusted Publishing (>= 22.14.0). Also satisfies Vitest 5 (^22.12), tsup 9 (^22.18) and ESLint 10 (^22.13). |
| CI (demo deploy) | 22.x LTS | Consistency with main CI. Astro 7.4 requires >= 22.23.4 (`node-version: 22` resolves to the latest 22.x). |
| `engines` in package.json | `>=18` | Don't restrict consumers. The library output is plain JS; any Node version works. |
| Local development | 22.23.4+ | Pinned in `.nvmrc`. |
## Sources
- tsup GitHub README: "not actively maintained, consider tsdown" -- https://github.com/egoist/tsup
- tsdown: v0.21.7, pre-1.0, actively developed -- https://github.com/rolldown/tsdown
- tsdown migration guide -- https://tsdown.dev/guide/migrate-from-tsup
- @testing-library/react npm: peerDeps `react ^18 || ^19` (React 17 not supported since v13)
- npm token deprecation: classic tokens revoked 2025-12-09 -- https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/
- npm OIDC trusted publishing GA -- https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/
- npm trusted publishing docs -- https://docs.npmjs.com/trusted-publishers/
- ESLint flat config `extends` and `defineConfig` -- https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/
- Astro GitHub Pages deploy -- https://docs.astro.build/en/guides/deploy/github/
- Dual ESM+CJS packaging with tsup -- https://johnnyreilly.com/dual-publishing-esm-cjs-modules-with-tsup-and-are-the-types-wrong
- React 19 peer dependency ecosystem -- https://medium.com/@zachshallbetter/resolving-react-19-dependency-conflicts-without-downgrading-ee0a808af2eb
- Changesets action -- https://github.com/changesets/action
