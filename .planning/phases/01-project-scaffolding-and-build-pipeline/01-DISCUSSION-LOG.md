# Phase 1: Project Scaffolding and Build Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 01-project-scaffolding-and-build-pipeline
**Areas discussed:** Build validation approach, Test file organization, ESLint rule strictness

---

## Build Validation Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Skeleton component | A minimal SiteIcon with domain prop that renders an `<img>` — no detection logic. Validates JSX compilation, React externalization, type exports, and "use client" banner end-to-end. | ✓ |
| Empty barrel export | Just `export {}` from index.ts. Validates the build toolchain runs, but can't verify React externalization, JSX handling, or realistic bundle size. | |
| Type-only export | Export just the SiteIconProps interface and a placeholder type. Validates .d.ts generation and exports field without shipping any runtime code. | |

**User's choice:** Skeleton component (recommended)
**Notes:** Validates the full pipeline end-to-end including JSX, React externalization, types, and bundle size.

---

## Test File Organization

| Option | Description | Selected |
|--------|-------------|----------|
| Co-located *.test.tsx | Test files next to source: src/SiteIcon.test.tsx beside src/SiteIcon.tsx. Modern convention, easy to find related tests, vitest discovers them automatically. | ✓ |
| Root tests/ directory | Separate tests/ folder at project root (matches reference doc). Clear separation of source and tests, but requires jumping between directories. | |
| src/__tests__/ directory | Tests in a dedicated subdirectory within src/. Jest-era convention, slightly dated but still common. | |

**User's choice:** Co-located *.test.tsx (recommended)
**Notes:** Sets the project convention for Phase 3's test suite.

---

## ESLint Rule Strictness

| Option | Description | Selected |
|--------|-------------|----------|
| Strict type-checked | typescript-eslint strict + type-checked rules. Catches unsafe any, floating promises, unnecessary conditions. Noisier during development but right for a library shipping to npm. | ✓ |
| Recommended only | typescript-eslint recommended rules. Lighter touch — catches obvious errors but allows looser patterns. Fewer false positives, less friction. | |
| You decide | Let Claude pick the appropriate strictness level based on the project's needs. | |

**User's choice:** Strict type-checked (recommended)
**Notes:** Appropriate level of strictness for a library shipping to npm consumers.

---

## Claude's Discretion

- tsup configuration details
- TypeScript tsconfig.json specifics
- Prettier configuration
- Husky + lint-staged setup mechanics
- Changesets configuration
- package.json exports field structure

## Deferred Ideas

None — discussion stayed within phase scope
