<!-- GSD:project-start source:PROJECT.md -->
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
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Framework
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React | 18.x / 19.x (peer dep) | UI framework | The library's entire purpose. React 17 dropped in v1.0 — untested in CI and the shipped `"use client"` banner is an RSC-era directive (18+). | HIGH |
| TypeScript | ^6.0 (dev dep) | Type safety + shipped .d.ts | Strict mode catches bugs at compile time; consumers expect shipped declarations. Now on TS 6. Note: tsconfig sets `ignoreDeprecations: "6.0"` until tsup updates its internal use of the deprecated `baseUrl` option. | HIGH |
### Build Tool
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| tsup | ^8.5.1 | Bundle ESM + CJS + .d.ts | **Use tsup, not tsdown.** See rationale below. | HIGH |
- tsdown is pre-1.0 (v0.21.7). API surface is still shifting.
- tsup v8.5.1 is battle-tested, has massive ecosystem adoption, and works perfectly for a single-file component library.
- This library has one entry point and one output file. Build takes under 1 second regardless of tool.
- tsup's "unmaintained" status means no new features, not that it's broken. For a < 1KB library, that's fine.
- tsdown requires Node >= 20.19.0; tsup requires Node >= 18. Wider CI compat with tsup.
- Migration from tsup to tsdown is trivial (`npx tsdown-migrate`) if needed later.
### Demo Site
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Astro | ^6.1.5 | Demo site framework | Static HTML for SEO + React islands for interactive playground. Official `withastro/action@v6` for GitHub Pages deploys. | HIGH |
| @astrojs/react | ^5.0.7 | React integration | Officially supports React 17/18/19 as peer deps (we only target 18/19). | HIGH |
### Testing
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vitest | ^4.1.4 | Test runner | Jest-compatible API, native ESM/TS, 4x faster than Jest. Standard for all new React libraries. | HIGH |
| @testing-library/react | ^16.3.2 | Component rendering | Standard React testing utility. Peer dep on React 18/19. | HIGH |
| @testing-library/jest-dom | ^6.9.1 | DOM matchers | Provides `.toBeInTheDocument()`, `.toHaveAttribute()`, etc. | HIGH |
| @testing-library/user-event | ^14.6.1 | User interaction simulation | Fires realistic events (click, type). More accurate than `fireEvent`. | HIGH |
| jsdom | ^29.0.2 | Browser environment | Required for Vitest DOM testing. Lighter than happy-dom for simple components. | HIGH |
### Quality Tooling
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| ESLint | ^10.2.0 | Linting | ESLint 10 uses flat config (`eslint.config.js`) exclusively. The legacy `.eslintrc` format is removed. | HIGH |
| typescript-eslint | ^8.58.1 | TS linting rules | Unified package replacing `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin`. | HIGH |
| eslint-plugin-react | ^7.37.5 | React-specific rules | Catches React anti-patterns (missing keys, hooks rules). | HIGH |
| eslint-plugin-react-hooks | ^7.0.1 | Hooks rules | Enforces Rules of Hooks. Separate from eslint-plugin-react. | HIGH |
| eslint-config-prettier | ^10.1.8 | Prettier compat | Disables ESLint rules that conflict with Prettier. | HIGH |
| Prettier | ^3.8.2 | Code formatting | Opinionated formatter. No config debates. | HIGH |
| Husky | ^9.1.7 | Git hooks | Runs pre-commit hooks reliably. v9 uses `core.hooksPath`. | HIGH |
| lint-staged | ^16.4.0 | Staged file processing | Runs ESLint + Prettier only on staged files (1-2s, not full repo). | HIGH |
### Versioning & Publishing
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @changesets/cli | ^2.30.0 | Version management | Manages version bumps + CHANGELOG generation. Standard for OSS npm libraries. | HIGH |
| @changesets/changelog-github | ^0.6.0 | Changelog format | Links PRs and contributors in CHANGELOG.md. | HIGH |
| changesets/action (GH Action) | v1 | CI automation | Creates "Version Packages" PR on merge, auto-publishes on approval. | HIGH |
### CI/CD (GitHub Actions)
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| actions/checkout | v4 | Clone repo | Standard. | HIGH |
| actions/setup-node | v4 | Node setup | With npm caching. Pin to Node 22.x LTS for OIDC support. | HIGH |
| changesets/action | v1 | Version PR + publish | Creates version bump PRs, publishes on merge. | HIGH |
| withastro/action | v6 | Demo site build | Official Astro action for GitHub Pages. | HIGH |
| actions/deploy-pages | v4 | Deploy to GH Pages | Standard GitHub Pages deployment action. | HIGH |
### Supporting Packages
| Package | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| globals | ^17.5.0 | ESLint flat config globals | Required for ESLint 10 flat config browser/node environments | HIGH |
| @types/react | ^19.2.14 (dev) | React type definitions | Development only. Do NOT ship as dependency. | HIGH |
| @types/react-dom | ^19.2.0 (dev) | ReactDOM type definitions | Development only. | HIGH |
## package.json Configuration
### Dual ESM + CJS Output
- `"type": "module"` -- ESM-first, standard for 2026.
- `exports` field with `types` condition first (TypeScript requires this ordering).
- Separate `.d.ts` and `.d.cts` for ESM and CJS consumers.
- `"sideEffects": false` -- enables tree-shaking.
- `"files": ["dist"]` -- only ship the build output to npm.
### tsup Configuration
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
| CI (lint/test/build) | 22.x LTS | Required for npm OIDC Trusted Publishing (>= 22.14.0). Also satisfies Vitest (^20 or ^22) and ESLint 10 (^20.19 or ^22.13). |
| CI (demo deploy) | 22.x LTS | Consistency with main CI. |
| `engines` in package.json | `>=18` | Don't restrict consumers. The library output is plain JS; any Node version works. |
| Local development | 22.x+ | Recommended via `.nvmrc` or `.node-version` file. |
## Installation
# Core dev dependencies
# React (dev + peer)
# Testing
# Linting + formatting
# Git hooks
# Versioning
# Demo site (in docs/ or separate workspace)
## Sources
- tsup npm: v8.5.1, verified via `npm view tsup version` (2026-04-12)
- tsup GitHub README: "not actively maintained, consider tsdown" -- https://github.com/egoist/tsup
- tsdown: v0.21.7, pre-1.0, actively developed -- https://github.com/rolldown/tsdown
- tsdown migration guide -- https://tsdown.dev/guide/migrate-from-tsup
- Vitest npm: v4.1.4, engines `^20.0.0 || ^22.0.0 || >=24.0.0`
- ESLint npm: v10.2.0, engines `^20.19.0 || ^22.13.0 || >=24`
- @testing-library/react npm: v16.3.2, peerDeps `react ^18 || ^19` (React 17 not supported since v13)
- @astrojs/react npm: v5.0.3, peerDeps `react ^17 || ^18 || ^19`
- npm token deprecation: classic tokens revoked 2025-12-09 -- https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/
- npm OIDC trusted publishing GA -- https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/
- npm trusted publishing docs -- https://docs.npmjs.com/trusted-publishers/
- ESLint flat config `extends` and `defineConfig` -- https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/
- Astro GitHub Pages deploy -- https://docs.astro.build/en/guides/deploy/github/
- Dual ESM+CJS packaging with tsup -- https://johnnyreilly.com/dual-publishing-esm-cjs-modules-with-tsup-and-are-the-types-wrong
- React 19 peer dependency ecosystem -- https://medium.com/@zachshallbetter/resolving-react-19-dependency-conflicts-without-downgrading-ee0a808af2eb
- Changesets action -- https://github.com/changesets/action
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
