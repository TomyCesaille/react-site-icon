# Phase 1: Project Scaffolding and Build Pipeline - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up the repository from scratch with a working build pipeline that produces correct dual ESM+CJS output, TypeScript declarations with "use client" banner, and quality tooling (ESLint, Prettier, Husky, Changesets). A skeleton SiteIcon component validates the full pipeline end-to-end.

</domain>

<decisions>
## Implementation Decisions

### Build Validation Approach
- **D-01:** Include a minimal skeleton SiteIcon component (domain prop, renders `<img>` with Google faviconV2 URL, no detection logic) to validate the full build pipeline — JSX compilation, React externalization, type exports (.d.ts), "use client" banner, and realistic bundle size measurement.

### Test File Organization
- **D-02:** Co-located test files next to source (`src/SiteIcon.test.tsx` beside `src/SiteIcon.tsx`). Modern convention, vitest auto-discovers. This sets the project convention for Phase 3.

### ESLint Rule Strictness
- **D-03:** Use `typescript-eslint` strict + type-checked rules (`tseslint.configs.strictTypeChecked`). Catches unsafe any, floating promises, unnecessary assertions. Appropriate strictness for a library shipping to npm.

### Claude's Discretion
- tsup configuration details (entry, format, dts, banner injection)
- TypeScript tsconfig.json specifics (target, module, moduleResolution)
- Prettier configuration (defaults are fine)
- Husky + lint-staged setup mechanics
- Changesets configuration (public access, commit conventions)
- package.json exports field structure (types-first ordering)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Spec
- `ReactThirdPartyDomainFavicon.md` — Original project spec with API design, implementation sketch, package structure, and design principles
- `CLAUDE.md` §Recommended Stack — Complete technology stack with exact versions, rationale, and alternatives considered

### Build Configuration
- `CLAUDE.md` §package.json Configuration — Dual ESM+CJS output requirements, exports field structure, sideEffects flag
- `CLAUDE.md` §tsup Configuration — tsup-specific build settings

### Requirements
- `.planning/REQUIREMENTS.md` §Package Build (BUILD-01 through BUILD-08) — All build requirements for this phase
- `.planning/REQUIREMENTS.md` §Quality Tooling (TOOL-01 through TOOL-04) — All tooling requirements for this phase

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — this phase establishes the foundational patterns

### Integration Points
- The skeleton component structure (`src/SiteIcon.tsx` + `src/index.ts`) will be the foundation that Phase 2 builds the full component on top of
- Test configuration set here will be used by Phase 3's test suite
- ESLint/Prettier config established here applies to all subsequent phases

</code_context>

<specifics>
## Specific Ideas

- The skeleton component should export both the component and its props type (`SiteIconProps`) so the build can verify type declaration generation
- Reference doc (`ReactThirdPartyDomainFavicon.md`) has a ~40-line implementation sketch — the skeleton is a stripped-down version of this (just the img rendering, no state/detection)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-project-scaffolding-and-build-pipeline*
*Context gathered: 2026-04-12*
