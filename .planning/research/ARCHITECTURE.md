# Architecture Patterns

**Domain:** Small React component library (single component) with demo site
**Researched:** 2026-04-12

## Recommended Architecture

Single repository, flat structure. The library lives at the repo root (`src/`, `dist/`). The demo site lives in `/docs` as an independent Astro project that imports the library from the parent `src/`. No monorepo tooling -- this is a single-package repo with a co-located documentation site.

```
react-site-icon/
|-- src/                        # Library source
|   |-- SiteIcon.tsx            # The component
|   |-- utils.ts                # Domain normalization, favicon URL builder
|   |-- types.ts                # Exported TypeScript interfaces
|   |-- index.ts                # Public API barrel export
|
|-- dist/                       # Build output (gitignored, npm-published)
|   |-- index.js                # CJS output
|   |-- index.mjs               # ESM output
|   |-- index.d.ts              # Type declarations
|   |-- index.d.mts             # ESM type declarations
|
|-- docs/                       # Astro demo site (independent project)
|   |-- src/
|   |   |-- pages/
|   |   |   |-- index.astro     # Landing page
|   |   |-- components/
|   |   |   |-- Playground.tsx  # Interactive React island
|   |   |-- layouts/
|   |       |-- Base.astro      # HTML shell
|   |-- public/
|   |   |-- CNAME               # Custom domain (if used)
|   |-- astro.config.mjs
|   |-- package.json            # Astro's own dependencies
|   |-- tsconfig.json
|
|-- __tests__/                  # Library tests
|   |-- SiteIcon.test.tsx
|   |-- utils.test.ts
|
|-- .changeset/                 # Changesets config + pending changesets
|   |-- config.json
|
|-- .github/
|   |-- workflows/
|       |-- ci.yml              # Lint, test, build on PR
|       |-- release.yml         # Changesets version PR + npm publish
|       |-- deploy-docs.yml     # Astro demo to GitHub Pages
|
|-- tsup.config.ts
|-- vitest.config.ts
|-- package.json                # Library package manifest
|-- tsconfig.json               # Library TypeScript config
|-- .eslintrc.cjs
|-- .prettierrc
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `SiteIcon` (component) | Renders `<img>` tag, manages favicon load state, triggers fallback detection | `utils.ts` for URL building and domain normalization |
| `utils.ts` | Pure functions: `normalizeDomain()`, `buildFaviconUrl()` | Called by `SiteIcon`, independently testable |
| `types.ts` | TypeScript interfaces: `SiteIconProps`, internal state types | Imported by `SiteIcon`, re-exported from `index.ts` |
| `index.ts` | Public API surface. Barrel export of `SiteIcon` and `SiteIconProps` | Imports from `SiteIcon` and `types` |
| `docs/` Astro site | Demo/marketing page with interactive playground | Imports library from parent `../src/` during dev, from `react-site-icon` in deployed builds |
| `__tests__/` | Unit and behavior tests | Imports from `src/` |

### Data Flow

```
User provides domain prop ("https://github.com/some/path")
        |
        v
  normalizeDomain() strips protocol/path -> "github.com"
        |
        v
  buildFaviconUrl(domain, size) -> Google faviconV2 CDN URL
        |
        v
  <img> element loads the favicon URL
        |
        +---> onLoad fires
        |       |
        |       v
        |   naturalWidth check: is it 16px when size > 16 requested?
        |       |
        |       +-- YES (16px = globe fallback) -> render fallback prop
        |       +-- NO  (real favicon loaded)   -> render <img>, call onResolved("favicon")
        |
        +---> onError fires -> render fallback prop, call onResolved("fallback")
```

**SSR behavior:** On the server (or before hydration), render the fallback. The `<img>` load + naturalWidth detection only runs client-side after mount via `useEffect`.

## Key Architecture Decisions

### 1. tsup Build Configuration

**Confidence: HIGH** (verified against tsup docs and community patterns)

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  target: 'es2018',
  minify: true,
  banner: {
    js: '"use client";',
  },
});
```

**Rationale for each option:**

| Option | Value | Why |
|--------|-------|-----|
| `format` | `['cjs', 'esm']` | CJS for older bundlers and Node `require()`, ESM for modern bundlers and tree-shaking |
| `dts` | `true` | Generates `.d.ts` files so consumers get full TypeScript support without needing the source |
| `external` | `['react', 'react-dom']` | React must not be bundled -- consumers provide their own copy via peer deps |
| `target` | `'es2018'` | Async/await support without downleveling, compatible with all modern browsers and Node 12+ |
| `clean` | `true` | Wipes `dist/` before each build to prevent stale artifacts |
| `sourcemap` | `true` | Lets consumers debug into library source in devtools |
| `minify` | `true` | Reduces bundle size (targeting < 1KB gzipped) |
| `banner.js` | `'"use client"'` | Marks the output as a client component for React Server Components / Next.js App Router |

**Note on `"use client"` banner:** This applies the directive to all output files. For a single-component library where everything is client-side (uses `useEffect`, `useState`, and `<img>` with event handlers), this is correct and desirable. If the library later added server-safe exports, those would need a separate entry point.

### 2. package.json Exports Configuration

**Confidence: HIGH** (standard practice, verified across multiple sources)

```jsonc
{
  "name": "react-site-icon",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "peerDependencies": {
    "react": "^17.0.0 || ^18.0.0 || ^19.0.0",
    "react-dom": "^17.0.0 || ^18.0.0 || ^19.0.0"
  },
  "devDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    "tsup": "^8.0.0",
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "jsdom": "^26.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "@changesets/cli": "^2.27.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/",
    "format": "prettier --check .",
    "format:fix": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build",
    "release": "changeset publish"
  }
}
```

**Critical notes on the exports field:**

- `"types"` must come first in each condition block -- TypeScript resolves the first matching entry, and bundlers read conditions top-to-bottom.
- `"import"` serves ESM consumers (Vite, modern webpack, ESM Node).
- `"require"` serves CJS consumers (older Node, legacy bundlers).
- `"files": ["dist"]` ensures only the build output ships to npm, keeping the package tiny.
- `"sideEffects": false` enables tree-shaking -- bundlers can safely eliminate unused exports.

### 3. React Peer Dependency Strategy

**Confidence: HIGH** (standard practice for React component libraries)

```json
{
  "peerDependencies": {
    "react": "^17.0.0 || ^18.0.0 || ^19.0.0",
    "react-dom": "^17.0.0 || ^18.0.0 || ^19.0.0"
  }
}
```

**How this works:**

- The `||` syntax means "any of these ranges." npm 7+ will warn (not error) if the consumer's React version does not match.
- `^17.0.0` covers 17.x, `^18.0.0` covers 18.x, `^19.0.0` covers 19.x. Each caret range is bounded to its major version.
- The library uses only stable React APIs (`useState`, `useEffect`, `useCallback`, `useRef`, JSX) that exist unchanged across all three major versions.
- **Do not add React to `dependencies`** -- this would bundle a second copy of React, causing the "hooks called in a different React instance" error.
- Development uses React 19 (`devDependencies`) to test against the latest. CI should matrix-test against 17, 18, and 19.

**React 17 compatibility consideration:** React 17 introduced the new JSX transform (`react/jsx-runtime`), which tsup uses by default. This is fine -- React 17.0.0+ supports it. If targeting React 16 were needed (it is not), the legacy `React.createElement` transform would be required.

### 4. Astro Demo Site Architecture

**Confidence: HIGH** (verified against official Astro docs and withastro/action)

The demo site in `/docs` is an independent Astro project with its own `package.json`, `node_modules`, and config. It uses Astro's React integration for interactive "island" components.

**astro.config.mjs:**

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  site: 'https://<username>.github.io',
  base: '/ReactThirdPartyDomainFavicon',
});
```

**How the demo imports the library:**

During development, the demo site imports directly from the parent source via a TypeScript path alias or relative import:

```typescript
// docs/src/components/Playground.tsx
import { SiteIcon } from '../../src/index';
```

For production builds, this still works because the Astro build resolves the import at build time. No need for npm link, workspaces, or publishing the library first. The relative import is resolved during Astro's Vite-based build.

**Astro page structure:**

```astro
---
// docs/src/pages/index.astro
import Base from '../layouts/Base.astro';
import Playground from '../components/Playground.tsx';
---
<Base title="react-site-icon">
  <main>
    <!-- Static marketing content rendered as HTML at build -->
    <h1>react-site-icon</h1>
    <p>Display any website's favicon from its domain name.</p>
    
    <!-- Interactive React island, hydrated on client -->
    <Playground client:load />
  </main>
</Base>
```

The `client:load` directive tells Astro to hydrate the `Playground` component immediately on page load. This is appropriate for an interactive demo that users will want to interact with right away.

### 5. GitHub Actions Workflow Architecture

**Confidence: HIGH** (verified against official GitHub docs, withastro/action, changesets/action)

Three separate workflows, each with a single responsibility:

#### CI Workflow (`.github/workflows/ci.yml`)

Triggers on pull requests and pushes to main. Runs quality gates.

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run format
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
```

**Design decisions:**
- `concurrency` with `cancel-in-progress: true` stops stale PR runs, saving CI minutes.
- `npm ci` for reproducible installs (uses lockfile exactly).
- Quality checks run sequentially so failures produce clear, ordered output. Lint and format failures are faster to surface than test failures.
- Build step at the end validates that the library compiles successfully.

#### Release Workflow (`.github/workflows/release.yml`)

Uses Changesets to manage versioning and npm publishing.

```yaml
name: Release

on:
  push:
    branches: [main]

concurrency: ${{ github.workflow }}-${{ github.ref }}

permissions:
  contents: write
  pull-requests: write
  id-token: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: npm run release
          title: 'chore: version packages'
          commit: 'chore: version packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**How the Changesets flow works:**

1. Developer runs `npx changeset` locally, selects version bump type, writes a summary. This creates a markdown file in `.changeset/`.
2. The changeset file is committed and pushed (or included in a PR).
3. When merged to main, the Release workflow detects pending changesets and opens a "Version Packages" PR that bumps `package.json` version and updates `CHANGELOG.md`.
4. When that PR is merged, the workflow runs again, finds no pending changesets, and executes the `publish` command to push to npm.

**`id-token: write` permission:** Enables npm provenance (OIDC-based trusted publishing). This proves the package was built by this specific GitHub Actions workflow, adding supply chain security.

#### Deploy Docs Workflow (`.github/workflows/deploy-docs.yml`)

Deploys the Astro demo site to GitHub Pages.

```yaml
name: Deploy Demo Site

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Astro site
        uses: withastro/action@v6
        with:
          path: ./docs
          node-version: 20

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Key detail:** The `path: ./docs` input tells `withastro/action` where the Astro project lives. This is the critical configuration that makes a subdirectory Astro project work with the official action. The action handles lockfile detection, dependency installation, building, and artifact upload within that subdirectory.

### 6. Changesets Configuration

**Confidence: HIGH** (verified against changesets/changesets repo)

```jsonc
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.5/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

- `"access": "public"` is required for unscoped packages on npm (which `react-site-icon` is).
- `"commit": false` means changesets does not auto-commit version bumps -- the GitHub Action handles this through its PR-based flow.

## Patterns to Follow

### Pattern 1: SSR-Safe Component with Client-Side Detection

**What:** Render fallback on server, detect favicon on client.
**When:** Always -- this is the core rendering strategy.

```typescript
export function SiteIcon({ domain, size = 32, fallback, ...props }: SiteIconProps) {
  const [status, setStatus] = useState<'loading' | 'favicon' | 'fallback'>('loading');
  const imgRef = useRef<HTMLImageElement>(null);
  
  const normalizedDomain = useMemo(() => normalizeDomain(domain), [domain]);
  const faviconUrl = useMemo(
    () => normalizedDomain ? buildFaviconUrl(normalizedDomain, size) : null,
    [normalizedDomain, size]
  );

  // Only runs on client after hydration
  useEffect(() => {
    if (!faviconUrl) {
      setStatus('fallback');
      return;
    }
    // Reset on prop change
    setStatus('loading');
  }, [faviconUrl]);

  if (status === 'fallback' || !faviconUrl) return <>{fallback}</>;
  
  return (
    <img
      ref={imgRef}
      src={faviconUrl}
      width={size}
      height={size}
      onLoad={() => {
        const img = imgRef.current;
        if (img && img.naturalWidth === 16 && size > 16) {
          setStatus('fallback');
        } else {
          setStatus('favicon');
        }
      }}
      onError={() => setStatus('fallback')}
      style={{ display: status === 'loading' ? 'none' : undefined }}
      {...props}
    />
  );
}
```

**Why this pattern:** The `useEffect` + `useState` approach ensures the component renders the fallback during SSR (where `useEffect` does not run), then attempts favicon loading after hydration. The `<img>` is in the DOM but hidden during loading to let the browser start the request.

### Pattern 2: Pure Utility Functions Separated from Component

**What:** Domain normalization and URL building as pure, exported functions.
**When:** Always -- keeps the component focused on rendering.

```typescript
// src/utils.ts
export function normalizeDomain(input: string): string | null {
  if (!input) return null;
  try {
    // Handle full URLs: "https://github.com/user/repo" -> "github.com"
    const url = new URL(input.includes('://') ? input : `https://${input}`);
    return url.hostname;
  } catch {
    // Handle plain domains: "github.com" stays "github.com"
    return input.replace(/\/.*$/, '').trim() || null;
  }
}

export function buildFaviconUrl(domain: string, size: number): string {
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=${size}`;
}
```

**Why this pattern:** Pure functions are trivially testable without React rendering. `normalizeDomain` handles the messy input parsing, and `buildFaviconUrl` encapsulates the Google CDN URL format.

### Pattern 3: Minimal Public API Surface

**What:** Export only `SiteIcon` component and `SiteIconProps` type.
**When:** Always -- for a single-component library.

```typescript
// src/index.ts
export { SiteIcon } from './SiteIcon';
export type { SiteIconProps } from './types';
```

**Why:** A smaller API surface means fewer breaking changes, simpler documentation, and clearer consumer expectations. Utility functions stay internal unless there is a demonstrated need to expose them.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Monorepo Tooling for a Single Package

**What:** Using npm/pnpm workspaces, Turborepo, or Lerna for one component + one demo site.
**Why bad:** Massive configuration overhead for zero benefit. Workspaces add complexity to lockfiles, hoisting, and CI caching.
**Instead:** Flat repo structure. The demo site in `/docs` has its own `package.json` and `node_modules`, installed independently in CI when needed.

### Anti-Pattern 2: Bundling React into the Library

**What:** Including React in `dependencies` instead of `peerDependencies`, or forgetting to mark it `external` in tsup.
**Why bad:** Consumers end up with two copies of React. Hooks break with "Invalid hook call" errors. Bundle size explodes.
**Instead:** Always `external: ['react', 'react-dom']` in tsup config, always `peerDependencies` in package.json.

### Anti-Pattern 3: Publishing `src/` to npm

**What:** Forgetting `"files": ["dist"]` in package.json.
**Why bad:** Publishes TypeScript source, test files, and config to npm. Increases package size and can leak internal implementation.
**Instead:** `"files": ["dist"]` restricts what npm packs to only the build output. Verify with `npm pack --dry-run` before first publish.

### Anti-Pattern 4: Complex Multi-Entry Bundling

**What:** Splitting a tiny library into multiple entry points (`react-site-icon/utils`, `react-site-icon/types`).
**Why bad:** Unnecessary for a sub-1KB library. Adds exports map complexity, more tsup config, and confuses consumers.
**Instead:** Single entry point (`src/index.ts`), single barrel export. Tree-shaking handles dead code elimination.

## Scalability Considerations

Not a primary concern for a < 1KB single-component library. The architecture is designed for simplicity, not scale.

| Concern | Current (1 component) | If Growing (5-10 components) |
|---------|----------------------|------------------------------|
| Build | Single tsup entry, < 1s build | Still single entry, barrel export. Consider splitting if > 10KB |
| Testing | Flat `__tests__/` directory | Move to co-located `SiteIcon.test.tsx` next to component |
| Demo site | Single Astro page | Add pages per component, still manageable in `/docs` |
| Exports | Single `.` export | Add sub-path exports only if consumers need separate imports |

## Build Order (Dependency Graph)

This describes what must be built before what, informing phase ordering:

```
1. TypeScript types (types.ts)           -- no dependencies
2. Utility functions (utils.ts)          -- no dependencies
3. Component (SiteIcon.tsx)              -- depends on types + utils
4. Barrel export (index.ts)             -- depends on component + types
5. tsup build (dist/)                    -- depends on all src/
6. Tests (__tests__/)                    -- depends on src/ (not dist/)
7. Demo site (docs/)                     -- depends on src/ (imports directly)
8. CI workflow                           -- depends on build + test working
9. Release workflow                      -- depends on CI passing
10. Deploy docs workflow                 -- depends on demo site building
```

**Implications for phases:**
- Steps 1-4 (source code) must be complete before step 5 (build config) can be validated.
- Step 6 (tests) can be developed alongside steps 1-4.
- Step 7 (demo site) should come after the component is functional but can iterate alongside it.
- Steps 8-10 (CI/CD) should come last, after the library builds and tests pass locally.

## Sources

- [tsup documentation](https://tsup.egoist.dev/) - Build configuration reference
- [Astro React integration guide](https://docs.astro.build/en/guides/integrations-guide/react/) - Official React + Astro setup
- [Astro GitHub Pages deployment guide](https://docs.astro.build/en/guides/deploy/github/) - Official deployment workflow
- [withastro/action GitHub repo](https://github.com/withastro/action) - `path` input for subdirectory Astro projects
- [changesets/action GitHub repo](https://github.com/changesets/action) - Changesets workflow configuration
- [changesets/changesets GitHub repo](https://github.com/changesets/changesets) - Core changesets documentation
- [npm peer dependencies explained](https://fathomtech.io/blog/understanding-peer-dependencies-in-npm/) - Peer dependency semantics
- [tsup "use client" banner discussion](https://github.com/egoist/tsup/issues/835) - Banner approach for RSC compatibility
