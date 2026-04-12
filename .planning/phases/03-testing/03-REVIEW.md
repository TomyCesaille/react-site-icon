---
phase: 03-testing
reviewed: 2026-04-12T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - eslint.config.mjs
  - package.json
  - src/SiteIcon.test.tsx
  - tsconfig.json
  - vitest.config.ts
  - vitest.setup.ts
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-04-12T00:00:00Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Reviewed the testing infrastructure and configuration files for the react-site-icon library. The test file (`SiteIcon.test.tsx`) is well-structured with good coverage across all three strategies (lazy, eager, hidden), domain normalization, SSR, ref forwarding, callbacks, and domain-change race conditions. The vitest/eslint/tsconfig configurations are solid.

Three warnings were found: a bug in the ESLint configuration where object spread silently drops the `plugins` field from the React plugin flat config, a conflicting `noEmit`/`declaration` pair in tsconfig, and a missing assertion for stale-callback suppression in a race-condition test. Two informational items were noted regarding the ESLint ignore pattern and the tsconfig `types` field.

## Warnings

### WR-01: ESLint React flat config spread overwrites `plugins` field

**File:** `eslint.config.mjs:25-29`
**Issue:** The config object at lines 24-38 first spreads `reactPlugin.configs.flat.recommended` (which sets `plugins: { react: ... }`) and then spreads `reactPlugin.configs.flat['jsx-runtime']` (which also sets `plugins: { react: ... }`). Both spreads work correctly for the React plugin because they set the same key. However, the explicit `plugins: { 'react-hooks': reactHooksPlugin }` on line 28 **completely replaces** the `plugins` object that was set by the earlier spreads, because later properties overwrite earlier ones in object literal syntax. This means the `react` plugin is silently dropped from that config block.

This currently works by accident because `reactPlugin.configs.flat.recommended` also sets `languageOptions.parser` and `rules` via the spread, and ESLint may resolve the plugin from the rules' prefix. But it is fragile -- if eslint-plugin-react changes its flat config structure, or if ESLint tightens plugin resolution, the React rules will silently stop running.

**Fix:** Merge the plugins explicitly instead of relying on spread:
```javascript
{
  files: ['**/*.{ts,tsx}'],
  ...reactPlugin.configs.flat.recommended,
  ...reactPlugin.configs.flat['jsx-runtime'],
  plugins: {
    ...reactPlugin.configs.flat.recommended.plugins,
    'react-hooks': reactHooksPlugin,
  },
  rules: {
    ...reactPlugin.configs.flat.recommended.rules,
    ...reactPlugin.configs.flat['jsx-runtime'].rules,
    ...reactHooksPlugin.configs.recommended.rules,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
},
```

### WR-02: tsconfig has conflicting `noEmit: true` and `declaration: true`

**File:** `tsconfig.json:14-16`
**Issue:** `noEmit: true` (line 16) tells TypeScript to produce no output files, while `declaration: true` (line 13) and `declarationMap: true` (line 14) ask it to produce `.d.ts` files. When `noEmit` is true, TypeScript ignores `declaration` and `declarationMap` entirely. This is harmless because tsup handles actual emit, but the contradictory flags are confusing and could mislead a contributor who expects `tsc` to produce declaration files. The `typecheck` script (`tsc --noEmit`) works correctly regardless since it explicitly passes `--noEmit`.

**Fix:** Remove `declaration` and `declarationMap` since tsup generates declarations independently and `noEmit` makes them no-ops:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "dist",
    "noEmit": true,
    "types": ["vitest/globals"]
  }
}
```

### WR-03: Stale domain-change test does not assert callback was not re-fired

**File:** `src/SiteIcon.test.tsx:423-452`
**Issue:** The "ignores stale load from previous domain" test correctly verifies that the DOM still shows `b.com` after a stale load from `a.com`, but it does not assert that `onResolved` was **not** called with `true` for the stale domain. The test passes `onResolved` as a mock but never checks `expect(onResolved).not.toHaveBeenCalled()` or `expect(onResolved).not.toHaveBeenCalledWith(true)`. If the stale-guard in `handleLoad` (line 84 of SiteIcon.tsx) were removed, the DOM assertion would still pass (React batches state updates and the rerender resets status), but the callback would fire incorrectly -- and this test would not catch that regression.

**Fix:** Add a callback assertion after the stale load simulation:
```typescript
// Simulate the old domain's image loading -- should be ignored
simulateImageLoad(oldImg, 64);

// Stale load must not fire onResolved
expect(onResolved).not.toHaveBeenCalled();
```

## Info

### IN-01: ESLint ignores pattern may unintentionally skip config files

**File:** `eslint.config.mjs:50`
**Issue:** The pattern `'*.config.*'` in the `ignores` array excludes all config files at the project root (e.g., `vitest.config.ts`, `eslint.config.mjs`). This is intentional for generated/tooling config, but the glob also matches any file named `*.config.*` in subdirectories if ESLint is ever run without the `src/` path restriction. Since the `lint` script scopes to `src/`, this has no practical impact today.

**Fix:** No change required. If the lint scope ever broadens beyond `src/`, consider making the ignore more specific: `'/*.config.*'` (root-only).

### IN-02: tsconfig `types` field restricts ambient type visibility

**File:** `tsconfig.json:17`
**Issue:** Setting `"types": ["vitest/globals"]` restricts TypeScript's automatic type acquisition to only `vitest/globals`. This means any other `@types/*` packages in `node_modules` (e.g., `@types/react`, `@types/react-dom`) are not automatically included -- they are only available because they are referenced via imports. This works correctly here, but adding a new ambient type package (e.g., `@types/node` for a build script in `src/`) would require explicitly adding it to this array. This is a common source of "type not found" confusion for new contributors.

**Fix:** No change required for current scope. Document the constraint if the project grows.

---

_Reviewed: 2026-04-12T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
