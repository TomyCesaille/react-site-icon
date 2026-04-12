# Roadmap: react-site-icon

## Overview

Deliver a zero-dependency React component library that displays any website's favicon from its domain name. The journey moves from a working build pipeline through the core component, testing, CI/CD automation, documentation, and finally a demo site -- each phase delivering one complete, verifiable capability. The build pipeline must be correct from the start (exports field, dual output, "use client" banner) because these are nearly impossible to fix after consumers adopt the package.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Project Scaffolding and Build Pipeline** - Repository structure, TypeScript config, tsup producing correct dual ESM+CJS output with declarations
- [ ] **Phase 2: Core Component** - SiteIcon component with all props, domain normalization, naturalWidth fallback detection, and SSR safety
- [ ] **Phase 3: Testing** - Vitest + Testing Library test suite covering rendering, fallback detection, normalization, and error handling
- [ ] **Phase 4: CI/CD and Release Automation** - GitHub Actions workflows for quality gates, npm publishing via OIDC, and Changesets versioning
- [ ] **Phase 5: Documentation** - README with cognitive funneling structure, badges, API table, comparison, and npm keyword optimization
- [ ] **Phase 6: Demo Site** - Astro + React landing page with interactive playground, deployed to GitHub Pages

## Phase Details

### Phase 1: Project Scaffolding and Build Pipeline
**Goal**: Developers can clone the repo, run the build, and get correct dual ESM+CJS output with TypeScript declarations and "use client" banner
**Depends on**: Nothing (first phase)
**Requirements**: BUILD-01, BUILD-02, BUILD-03, BUILD-04, BUILD-05, BUILD-06, BUILD-07, BUILD-08, TOOL-01, TOOL-02, TOOL-03, TOOL-04
**Success Criteria** (what must be TRUE):
  1. Running `npm run build` produces ESM and CJS output files in `dist/` with `.d.ts` declarations
  2. The first line of the ESM output file contains `"use client"` directive
  3. The `exports` field in package.json resolves correctly (types condition first, separate ESM/CJS paths)
  4. React and react-dom are externalized (not present in dist output)
  5. ESLint, Prettier, and Husky pre-commit hooks run successfully on a sample file
**Plans:** 2 plans
Plans:
- [x] 01-01-PLAN.md -- Repository scaffold, build pipeline, skeleton SiteIcon component (BUILD-01 through BUILD-08)
- [x] 01-02-PLAN.md -- Quality tooling: ESLint, Prettier, Husky, Changesets, Vitest config (TOOL-01 through TOOL-04)

### Phase 2: Core Component
**Goal**: Users can render `<SiteIcon domain="github.com" />` and see GitHub's favicon, with automatic fallback for unknown domains
**Depends on**: Phase 1
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07, COMP-08, COMP-09, COMP-10, COMP-11, COMP-12, COMP-13
**Success Criteria** (what must be TRUE):
  1. `<SiteIcon domain="github.com" />` renders GitHub's favicon as a visible image
  2. `<SiteIcon domain="https://example.com/some/path?q=1" />` correctly extracts and resolves the hostname
  3. `<SiteIcon domain="thisdomain-definitely-does-not-exist-xyz.com" fallback={<span>?</span>} />` renders the fallback element (not the default globe)
  4. The component renders fallback content during SSR and resolves the favicon only on the client after hydration
  5. All standard img attributes (`loading`, `decoding`, `data-*`, `aria-*`) pass through to the underlying element, and ref forwarding works
**Plans:** 1 plan
Plans:
- [ ] 02-01-PLAN.md -- Full SiteIcon component: props API, domain normalization, naturalWidth detection, strategies, ref forwarding (COMP-01 through COMP-13)

### Phase 3: Testing
**Goal**: The component's behavior is verified by automated tests that run without network access
**Depends on**: Phase 2
**Requirements**: TEST-01, TEST-02, TEST-03
**Success Criteria** (what must be TRUE):
  1. Running `npm test` executes a test suite that passes, covering rendering, fallback detection, domain normalization edge cases, and error handling
  2. No test makes a real network request to Google's CDN (all image loading is mocked)
  3. Running `attw` (arethetypeswrong) against the built package reports no export resolution errors
**Plans**: TBD

### Phase 4: CI/CD and Release Automation
**Goal**: Every push to main runs automated quality gates, and tagging a release publishes to npm without manual intervention
**Depends on**: Phase 3
**Requirements**: CICD-01, CICD-02, CICD-03, CICD-04
**Success Criteria** (what must be TRUE):
  1. A pull request triggers a GitHub Actions workflow that runs lint, test, and build -- failing any step blocks merge
  2. Pushing a git tag triggers an automated npm publish via OIDC Trusted Publishing (no stored secrets)
  3. Changesets integration creates version bump PRs and publishes on merge
  4. A GitHub Actions workflow deploys the demo site to GitHub Pages on push to main
**Plans**: TBD

### Phase 5: Documentation
**Goal**: A developer discovering react-site-icon on npm can understand what it does, install it, and use it within 60 seconds
**Depends on**: Phase 2
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05, DOCS-06
**Success Criteria** (what must be TRUE):
  1. The README opens with package name, one-line description, badges (npm version, bundle size, license, CI), and a 3-line usage example above the fold
  2. A full props/API table documents every prop with name, type, default, and description
  3. A comparison table shows react-site-icon vs favicon-stealer vs DIY approaches
  4. The README includes a StackBlitz embed link for instant "try it now"
  5. `npm search favicon react` returns react-site-icon due to optimized package.json keywords
**Plans**: TBD

### Phase 6: Demo Site
**Goal**: Visitors to the GitHub Pages site can interactively test the component with any domain before installing
**Depends on**: Phase 2, Phase 4 (for GitHub Pages deployment workflow)
**Requirements**: DEMO-01, DEMO-02, DEMO-03
**Success Criteria** (what must be TRUE):
  1. The demo site loads as a static page with marketing content explaining what, why, and how
  2. Users can type any domain into a playground input and see the live favicon (or fallback) rendered immediately
  3. The demo site is accessible at the GitHub Pages URL and deploys automatically on push to main
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6
(Phase 5 depends on Phase 2 only, but is sequenced after Phase 4 for natural flow. Phase 6 depends on Phase 2 and Phase 4.)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Scaffolding and Build Pipeline | 0/2 | Planning complete | - |
| 2. Core Component | 0/1 | Planning complete | - |
| 3. Testing | 0/TBD | Not started | - |
| 4. CI/CD and Release Automation | 0/TBD | Not started | - |
| 5. Documentation | 0/TBD | Not started | - |
| 6. Demo Site | 0/TBD | Not started | - |
