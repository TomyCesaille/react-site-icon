---
phase: 01-project-scaffolding-and-build-pipeline
reviewed: 2026-04-12T00:00:00Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - .changeset/config.json
  - .gitignore
  - .husky/pre-commit
  - .nvmrc
  - .prettierignore
  - .prettierrc
  - eslint.config.mjs
  - LICENSE
  - package.json
  - src/index.ts
  - src/SiteIcon.tsx
  - tsconfig.json
  - tsup.config.ts
  - vitest.config.ts
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-04-12
**Depth:** standard
**Files Reviewed:** 14
**Status:** issues_found

## Summary

Reviewed the full project scaffolding for react-site-icon: build pipeline (tsup), test config (vitest), linting (ESLint 10 flat config), formatting (Prettier), versioning (changesets), and the initial SiteIcon component.

The scaffolding is solid overall. The package.json dual ESM/CJS exports are correctly structured with `types` conditions first. The tsup config properly externalizes React, enables minification, and adds a `"use client"` banner for RSC compatibility. The ESLint flat config, Prettier setup, and Husky/lint-staged integration are well configured.

Three warnings were found: the `fallback` prop is declared in the component interface but never used (silent no-op for consumers), the `domain` parameter lacks input validation before URL interpolation, and placeholder `OWNER` strings remain in repository URLs that will break changeset changelogs on publish. Three informational items relate to minor config inconsistencies.

## Warnings

### WR-01: `fallback` prop declared in SiteIconProps but unused in component

**File:** `src/SiteIcon.tsx:9`
**Issue:** The `SiteIconProps` interface declares a `fallback?: ReactNode` prop (line 9), but the component implementation (lines 21-27) never destructures or uses it. Consumers who pass a `fallback` prop will see no effect -- their fallback content is silently ignored. This is misleading because the prop's existence in the type signature implies it works.
**Fix:** Either remove the `fallback` prop from the interface until the naturalWidth detection logic is implemented, or add a comment marking it as not-yet-implemented:
```tsx
// Option A: Remove until implemented
export interface SiteIconProps {
  domain: string;
  size?: number;
  // fallback will be added when naturalWidth detection is implemented
  className?: string;
  style?: CSSProperties;
  alt?: string;
}

// Option B: Implement basic fallback support with onError
export function SiteIcon({
  domain,
  size = 32,
  fallback,
  className,
  style,
  alt = '',
}: SiteIconProps): React.JSX.Element {
  const [showFallback, setShowFallback] = useState(false);

  if (showFallback && fallback) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={buildUrl(domain, size)}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={style}
      onError={() => setShowFallback(true)}
    />
  );
}
```

### WR-02: Domain parameter not validated before URL interpolation

**File:** `src/SiteIcon.tsx:19`
**Issue:** The `buildUrl` function interpolates the `domain` parameter directly into the URL string without any validation. An empty string produces a malformed URL (`url=http://`). A domain containing `&` characters (e.g., `evil.com&client=OTHER`) could inject additional query parameters into the Google Favicon CDN request. While this is an `<img src>` context (not a script injection vector), it could cause unexpected CDN behavior or broken images.
**Fix:** Add basic domain validation:
```tsx
const buildUrl = (domain: string, size: number): string => {
  const sanitized = encodeURIComponent(domain);
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${sanitized}&size=${String(size)}`;
};
```
Note: `encodeURIComponent` will encode dots and other URL-meaningful characters, which is safe here since the entire domain is a query parameter value within the `url=` parameter. Alternatively, validate that domain matches a basic pattern (`/^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`) and render fallback for invalid input.

### WR-03: Placeholder `OWNER` in repository URLs will break changeset changelogs

**File:** `.changeset/config.json:5` and `package.json:87`
**Issue:** Both files contain `OWNER/react-site-icon` as a placeholder GitHub repository path. The `@changesets/changelog-github` plugin uses this to generate PR links in CHANGELOG.md. If not replaced before the first release, the changelog will contain broken links and the plugin may error during version bumps.
**Fix:** Replace `OWNER` with the actual GitHub username or organization:
```json
// .changeset/config.json line 5
{ "repo": "your-username/react-site-icon" }

// package.json line 87
"url": "https://github.com/your-username/react-site-icon.git"
```
Run `git remote -v` to determine the correct owner.

## Info

### IN-01: ESLint ignores block correctly configured as global ignores

**File:** `eslint.config.mjs:41`
**Issue:** The final config object `{ ignores: ['dist/', 'node_modules/', '*.config.*'] }` is a standalone `ignores`-only object, which is the correct way to define global ignores in ESLint flat config. The `*.config.*` pattern also causes `eslint.config.mjs` to ignore itself, which is intentional but worth documenting. No action needed -- this is correctly configured.
**Fix:** No change required. Consider adding a comment for clarity:
```js
// Global ignores (standalone object = applies to all configs)
{ ignores: ['dist/', 'node_modules/', '*.config.*'] },
```

### IN-02: `React.JSX.Element` return type without explicit React import

**File:** `src/SiteIcon.tsx:27`
**Issue:** The function return type is annotated as `React.JSX.Element`, but `React` is not imported directly. This compiles because `@types/react` declares the `React` namespace globally. However, it creates an implicit dependency on global type augmentation that could break if `@types/react` changes its global declaration strategy in future versions.
**Fix:** Use the `JSX` namespace directly (available via `react/jsx-runtime` types that TypeScript resolves with `jsx: "react-jsx"`), or let TypeScript infer the return type:
```tsx
// Option A: Let TypeScript infer
export function SiteIcon({ ... }: SiteIconProps) {

// Option B: Import JSX explicitly
import type { CSSProperties, ReactNode, JSX } from 'react';
export function SiteIcon({ ... }: SiteIconProps): JSX.Element {
```

### IN-03: Contradictory `declaration` and `noEmit` in tsconfig.json

**File:** `tsconfig.json:13-16`
**Issue:** The tsconfig has both `"declaration": true` and `"noEmit": true`. These are contradictory -- `noEmit` prevents TypeScript from emitting any files, including declarations. This is harmless because tsup handles actual emission (using its own dts plugin), and the tsconfig is only used for typechecking via `tsc --noEmit`. But `declaration` and `declarationMap` are dead configuration in this context.
**Fix:** Remove the dead options for clarity, or add a comment explaining they exist for editor tooling:
```json
{
  "compilerOptions": {
    // ...
    "noEmit": true,
    // declaration/declarationMap omitted: tsup generates .d.ts via its own dts plugin
  }
}
```

---

_Reviewed: 2026-04-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
