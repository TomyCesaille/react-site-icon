# Phase 6: Demo Site - Research

**Researched:** 2026-04-12
**Domain:** Astro static site with React islands, GitHub Pages deployment, interactive playground
**Confidence:** HIGH

## Summary

Phase 6 builds an Astro 6 static landing page with a React interactive playground in a `docs/` subdirectory, deployed to GitHub Pages via the existing `deploy.yml` workflow. The critical integration challenge is importing the library from the parent directory's built `dist/` output -- both locally and in CI where the `withastro/action` runs dependency installation isolated to `docs/`.

The recommended approach uses `"react-site-icon": "file:.."` in `docs/package.json` to create a symlink to the root package, combined with a modified `build-cmd` in the deploy workflow that builds the library before Astro. Local development uses `concurrently` to run `tsup --watch` alongside `astro dev`. Dark mode uses a CSS-variables-on-`:root.dark` pattern with an inline blocking script to prevent FOUC, staying entirely within Astro scoped styles and vanilla JS -- no CSS framework needed.

**Primary recommendation:** Create `docs/` as a standalone Astro project with its own `package.json`, referencing the root library via `file:..`. Override the deploy workflow's `build-cmd` to chain library build and Astro build. Use `client:visible` for the playground island.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Playground-first layout -- hero with tagline + badges, then the interactive playground front and center. Minimal marketing content below.
- **D-02:** Pre-filled grid of 6-8 well-known domains rendered on page load. User can add their own domains via input.
- **D-03:** Brief "Why" section below playground -- 2-3 feature bullets plus one-sentence teaser about naturalWidth detection.
- **D-04:** Install snippet section with `npm install react-site-icon` and links to GitHub, npm, README.
- **D-05:** Input field + live code preview -- text input to type a domain, with JSX code snippet displayed.
- **D-06:** Collapsible "Advanced" panel below main playground with strategy toggle and size slider. Collapsed by default.
- **D-07:** Live code sync -- code preview updates in real-time as user changes domain, strategy, or size.
- **D-08:** Minimal dev-tool aesthetic -- clean, monochrome with one accent color. Monospace headings, system font body.
- **D-09:** Astro scoped styles -- no CSS framework dependencies.
- **D-10:** System preference dark/light mode with manual toggle. Both themes implemented.
- **D-11:** Import from built `dist/` package -- more realistic (tests what consumers get).
- **D-12:** Watch + rebuild dev workflow -- `tsup --watch` in parallel with Astro dev server. Requires concurrency tool.
- **D-13:** `client:visible` hydration directive for the React playground island.

### Claude's Discretion
- Specific pre-filled domains for the grid (pick recognizable sites with distinctive favicons)
- Dark/light theme color palette and accent color choice
- Concurrency tool selection for the watch+rebuild dev workflow
- Astro project structure within `docs/` (pages, components, layouts)
- Code preview syntax highlighting approach
- Playground grid layout details (columns, spacing, favicon label display)
- Dark mode toggle UI placement and implementation

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEMO-01 | Astro + React landing page with marketing-style content (what, why, how) | Astro 6.1.5 + @astrojs/react 5.0.3 verified. Scoped styles, CSS variables for theming, playground-first layout per D-01/D-03/D-04. |
| DEMO-02 | Interactive "try any domain" playground with live favicon preview | React island with `client:visible` (D-13). SiteIcon component imported from built dist/ via file:.. reference. Pre-filled grid (D-02), input + code preview (D-05/D-07), advanced panel (D-06). |
| DEMO-03 | Demo site deployed to GitHub Pages via GitHub Actions | Existing `deploy.yml` handles this. Needs `build-cmd` override to build library before Astro. `astro.config.mjs` needs `site` + `base` for correct asset paths. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | ^6.1.5 | Static site framework | Islands architecture for zero-JS marketing content + interactive React playground. Official GH Pages action. [VERIFIED: npm registry] |
| @astrojs/react | ^5.0.3 | React integration for Astro | Official integration. Supports React 17/18/19 peer deps. [VERIFIED: npm registry] |
| react | ^19.2.5 | Playground interactivity | Already installed in root. Demo site uses same version. [VERIFIED: root package.json] |
| react-dom | ^19.2.5 | React DOM rendering | Required peer dep for @astrojs/react. [VERIFIED: root package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| concurrently | ^9.2.1 | Parallel dev processes | Run `tsup --watch` and `astro dev` simultaneously for D-12. [VERIFIED: npm registry] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| concurrently | npm-run-all2 (^8.0.4) | npm-run-all2 works well but concurrently has better output labeling and wider adoption for parallel scripts |
| Astro scoped styles | Tailwind CSS | Tailwind adds a dependency and configuration. D-09 explicitly says no CSS framework. |
| Custom dark mode | astro-color-scheme package | Adds a dependency for something achievable with ~20 lines of inline JS. Against the library's zero-dep philosophy. |

**Installation (in docs/):**
```bash
npm install astro @astrojs/react react react-dom
```

**Installation (in root, dev dep):**
```bash
npm install -D concurrently
```

## Architecture Patterns

### Recommended Project Structure
```
docs/
  astro.config.mjs       # Astro config with site/base for GH Pages
  package.json            # Astro deps + "react-site-icon": "file:.."
  tsconfig.json           # Astro's TS config (extends astro/tsconfigs/strict)
  src/
    layouts/
      Layout.astro        # Base HTML layout with dark mode script
    components/
      Playground.tsx       # React island: input, grid, code preview, advanced panel
      ThemeToggle.astro    # Dark/light mode toggle (pure Astro/JS, no React)
      CodePreview.astro    # Static code display component (or part of Playground.tsx)
    pages/
      index.astro          # Landing page: hero, playground island, why, install
    styles/
      global.css           # CSS variables for theming, base typography
```

### Pattern 1: Library Import via file:.. Reference
**What:** `docs/package.json` uses `"react-site-icon": "file:.."` to create a symlink to the root package. The demo imports as `import { SiteIcon } from 'react-site-icon'` -- identical to what a real consumer writes. [VERIFIED: npm docs on local package references]
**When to use:** Always. This satisfies D-11 (import from built dist/) while keeping imports realistic.
**Example:**
```json
// docs/package.json
{
  "dependencies": {
    "react-site-icon": "file:..",
    "astro": "^6.1.5",
    "@astrojs/react": "^5.0.3",
    "react": "^19.2.5",
    "react-dom": "^19.2.5"
  }
}
```
```tsx
// docs/src/components/Playground.tsx
import { SiteIcon } from 'react-site-icon'; // Resolves to ../dist/index.js via symlink
```

### Pattern 2: Astro Config for GitHub Pages Subdirectory
**What:** Astro needs `site` and `base` to generate correct asset paths when deployed to `username.github.io/repo-name/`. [CITED: docs.astro.build/en/guides/deploy/github/]
**When to use:** Always for GH Pages project sites (not `<user>.github.io` repos).
**Example:**
```javascript
// docs/astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://jorislacance.github.io',
  base: '/react-site-icon',
  integrations: [react()],
});
```

### Pattern 3: Flashless Dark Mode with CSS Variables
**What:** An inline blocking script in `<head>` reads localStorage/system preference and sets a `dark` class on `<html>` before paint. CSS variables on `:root` and `:root.dark` provide theming. No FOUC. [CITED: vbesse.com/en/blog/flashless-dark-mode/]
**When to use:** For D-10 (system preference dark/light mode with toggle).
**Example:**
```astro
<!-- In Layout.astro <head> -->
<script is:inline>
  const theme = (() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme');
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  })();
  document.documentElement.classList.toggle('dark', theme === 'dark');
</script>
```
```css
/* global.css */
:root {
  --bg: #ffffff;
  --bg-secondary: #f5f5f5;
  --text: #1a1a1a;
  --text-muted: #666666;
  --accent: #0066ff;
  --border: #e0e0e0;
  --code-bg: #f0f0f0;
}
:root.dark {
  --bg: #0d0d0d;
  --bg-secondary: #1a1a1a;
  --text: #e5e5e5;
  --text-muted: #999999;
  --accent: #4d9fff;
  --border: #333333;
  --code-bg: #1e1e1e;
}
```

### Pattern 4: React Island with client:visible
**What:** The `client:visible` directive tells Astro to hydrate a React component only when it enters the viewport. Since the playground is near the top (D-01 playground-first), it hydrates almost immediately without blocking initial paint. [CITED: docs.astro.build/en/concepts/islands/]
**When to use:** For the Playground component (D-13).
**Example:**
```astro
<!-- pages/index.astro -->
---
import Playground from '../components/Playground';
---
<Playground client:visible />
```

### Pattern 5: Parallel Dev Workflow with concurrently
**What:** Run `tsup --watch` and `astro dev` simultaneously so library source changes rebuild dist/ and Astro hot-reloads. [ASSUMED]
**When to use:** For D-12 local development workflow.
**Example:**
```json
// root package.json scripts
{
  "docs:dev": "concurrently --names lib,docs --prefix-colors cyan,magenta \"tsup --watch\" \"npm run dev --prefix docs\"",
  "docs:build": "npm run build && npm run build --prefix docs"
}
```

### Anti-Patterns to Avoid
- **Importing source directly from ../src/ in Astro:** Bypasses the build output consumers actually use. D-11 explicitly requires importing from `dist/`. Use `file:..` dependency instead.
- **Using Astro ViewTransitions for a single-page site:** The demo is one page. ViewTransitions add complexity for zero benefit. Skip it.
- **Client-side routing or SPA patterns:** This is a static landing page. No React Router, no client-side navigation. Pure static Astro.
- **Installing React separately in docs/ at a different version:** Use the same React version as the root to avoid conflicts.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode toggle | Custom React context/state management | Inline `<script is:inline>` + `classList.toggle('dark')` + localStorage | Stays outside React hydration boundary; works before JS loads; no FOUC |
| Syntax highlighting for code preview | Custom tokenizer/highlighter | CSS-only approach with `<pre><code>` and manual span coloring | The code snippet is simple JSX -- 3-5 lines. A full syntax highlighter (Prism/Shiki) is overkill. Static spans with CSS classes are enough. |
| Concurrent dev processes | Custom shell script with & and wait | `concurrently` package | Handles stdout interleaving, process cleanup, and exit codes correctly |
| Asset path handling for GH Pages | Manual path prefixing | Astro `base` config | Astro handles asset path prefixing automatically when `base` is set |

**Key insight:** This is a marketing page for a tiny library. Every added dependency or complexity undermines the "zero deps, < 1KB" message. Keep the demo site as lean as the library.

## Common Pitfalls

### Pitfall 1: withastro/action Cannot Access Root dist/
**What goes wrong:** The `withastro/action` runs in the `docs/` directory. It does `npm install` inside `docs/` and then `npm run build`. The root library's `dist/` does not exist because the action starts from a fresh checkout. Imports from `react-site-icon` fail because the symlink points to a parent directory with no `dist/`. [VERIFIED: withastro/action source -- action runs install and build in the path directory]
**Why it happens:** The action operates entirely within the `path` directory. The existing `deploy.yml` builds the library in a separate `quality` job on a different runner. Artifacts don't transfer between jobs.
**How to avoid:** Override `build-cmd` in the withastro/action to first build the root library: `build-cmd: "cd .. && npm ci && npm run build && cd docs && astro build"`. Or restructure the deploy workflow so library build and Astro build happen in the same job.
**Warning signs:** CI deploy succeeds on quality gates but fails on Astro build with "Cannot find module 'react-site-icon'" or similar import error.

### Pitfall 2: Missing base Config Causes Broken Assets
**What goes wrong:** Deployed site loads HTML but CSS/JS 404 because asset paths assume site root (`/`) instead of `/react-site-icon/`.
**Why it happens:** GitHub Pages project sites serve from `https://user.github.io/repo-name/`. Without `base: '/react-site-icon'` in astro.config, all asset references point to `/` which is wrong.
**How to avoid:** Set `site: 'https://jorislacance.github.io'` and `base: '/react-site-icon'` in `docs/astro.config.mjs`. [CITED: docs.astro.build/en/guides/deploy/github/]
**Warning signs:** Local dev works fine but deployed site shows unstyled HTML or blank page.

### Pitfall 3: Dark Mode FOUC (Flash of Unstyled Content)
**What goes wrong:** Page loads in light mode then flashes to dark after JS executes.
**Why it happens:** Theme detection script is deferred or loaded as a module. By the time it runs, the browser has already painted the light default.
**How to avoid:** Use `<script is:inline>` in the `<head>` of the layout. The `is:inline` directive tells Astro to NOT defer or bundle the script -- it executes synchronously before first paint. [CITED: vbesse.com/en/blog/flashless-dark-mode/]
**Warning signs:** Brief white flash when navigating to the page in dark mode.

### Pitfall 4: React Version Mismatch Between Root and docs/
**What goes wrong:** Build errors or runtime warnings about multiple React instances.
**Why it happens:** Root package.json has React 19.x as devDependency. If `docs/package.json` specifies a different React version, npm may install a second copy.
**How to avoid:** Pin the same React version in both `package.json` files. The `file:..` symlink resolves `react-site-icon` from the root, which already externalized React as a peer dep.
**Warning signs:** "Invalid hook call" errors, "Cannot read property of null" in React internals.

### Pitfall 5: Astro Lockfile Detection in Subdirectory
**What goes wrong:** `withastro/action` fails to detect package manager because it looks for a lockfile in `docs/`, not the root.
**Why it happens:** The action scans the `path` directory for `package-lock.json`, `yarn.lock`, etc. If no lockfile exists in `docs/`, it may fail or use wrong defaults.
**How to avoid:** Ensure a `package-lock.json` exists in `docs/` (created by running `npm install` in `docs/` locally and committing the lockfile). Or specify `package-manager: npm` explicitly in the workflow.
**Warning signs:** CI fails with "Could not detect package manager" or uses pnpm when npm was intended.

## Code Examples

### Complete astro.config.mjs
```javascript
// Source: Astro docs (docs.astro.build/en/guides/deploy/github/)
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://jorislacance.github.io',
  base: '/react-site-icon',
  integrations: [react()],
});
```

### docs/package.json
```json
{
  "name": "react-site-icon-docs",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^6.1.5",
    "@astrojs/react": "^5.0.3",
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "react-site-icon": "file:.."
  }
}
```

### Root package.json New Scripts
```json
{
  "scripts": {
    "docs:dev": "concurrently --names lib,docs --prefix-colors cyan,magenta \"tsup --watch\" \"npm run dev --prefix docs\"",
    "docs:build": "npm run build && npm run build --prefix docs"
  }
}
```

### Playground Component Skeleton (React)
```tsx
// docs/src/components/Playground.tsx
import { useState } from 'react';
import { SiteIcon } from 'react-site-icon';

const DEFAULT_DOMAINS = [
  'github.com',
  'google.com',
  'stackoverflow.com',
  'npmjs.com',
  'twitter.com',
  'reddit.com',
  'this-domain-does-not-exist-xyz.com', // Demonstrates fallback
  'dev.to',
];

export default function Playground() {
  const [domain, setDomain] = useState('');
  const [size, setSize] = useState(32);
  const [strategy, setStrategy] = useState<'lazy' | 'eager' | 'hidden'>('lazy');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const allDomains = domain
    ? [domain, ...DEFAULT_DOMAINS]
    : DEFAULT_DOMAINS;

  return (
    <section>
      <input
        type="text"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="Type any domain..."
      />

      <div className="grid">
        {allDomains.map((d) => (
          <div key={d} className="grid-item">
            <SiteIcon
              domain={d}
              size={size}
              strategy={strategy}
              fallback={<span className="fallback-icon">?</span>}
            />
            <span className="domain-label">{d}</span>
          </div>
        ))}
      </div>

      {/* Code preview */}
      <pre><code>{`import { SiteIcon } from 'react-site-icon';

<SiteIcon
  domain="${domain || 'github.com'}"${size !== 32 ? `\n  size={${String(size)}}` : ''}${strategy !== 'lazy' ? `\n  strategy="${strategy}"` : ''}
  fallback={<span>?</span>}
/>`}</code></pre>

      {/* Advanced panel */}
      <button onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? 'Hide' : 'Show'} Advanced
      </button>
      {showAdvanced && (
        <div className="advanced-panel">
          <label>
            Strategy:
            <select value={strategy} onChange={(e) => setStrategy(e.target.value as 'lazy' | 'eager' | 'hidden')}>
              <option value="lazy">lazy</option>
              <option value="eager">eager</option>
              <option value="hidden">hidden</option>
            </select>
          </label>
          <label>
            Size: {size}px
            <input type="range" min={16} max={128} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          </label>
        </div>
      )}
    </section>
  );
}
```

### Deploy Workflow Fix (build-cmd Override)
```yaml
# In deploy.yml, build job
- uses: withastro/action@v6
  with:
    path: docs/
    node-version: 22
    package-manager: npm
    build-cmd: "cd .. && npm ci && npm run build && cd docs && astro build"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Storybook for component demos | Astro landing pages with React islands | 2024-2025 | Better SEO, faster load, marketing-friendly |
| CSS-in-JS for theming | CSS custom properties (variables) on :root | 2023-2024 | Zero runtime cost, works without JS, SSR-compatible |
| create-react-app for demo | Astro with `client:visible` | 2023 | Ships zero JS for static content, hydrates only interactive parts |
| Manual GH Pages deploy | withastro/action@v6 | 2024 | Single action handles install, build, artifact upload |

**Deprecated/outdated:**
- `withastro/action@v3/v4/v5`: v6 is current. v6 defaults to Node 24 (override to 22 for consistency with CI).
- `is:raw` directive: Replaced by `is:inline` for scripts that must execute synchronously.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `concurrently` is the best choice for parallel dev processes (D-12) | Architecture Patterns | Low -- npm-run-all2 works equally well. User can swap. |
| A2 | CSS-only code preview (manual spans) is sufficient for 3-5 line JSX snippets | Don't Hand-Roll | Low -- if highlighting looks bad, can add Shiki later. Incremental. |
| A3 | `cd .. && npm ci && npm run build && cd docs && astro build` works as build-cmd in withastro/action | Common Pitfalls | Medium -- untested in CI. If build-cmd doesn't support cd, will need workflow restructure. |

## Open Questions

1. **withastro/action build-cmd with directory changes**
   - What we know: build-cmd accepts a string command. The action runs it in the `path` directory (docs/).
   - What's unclear: Whether `cd ..` works reliably in the action's shell context. The action may set a working directory that constrains the command.
   - Recommendation: Test in CI. Fallback: restructure deploy.yml to NOT use withastro/action for the build step. Instead, manually run `npm ci` in root, build library, `cd docs && npm ci && npx astro build`, then use `actions/upload-pages-artifact` to upload `docs/dist/`.

2. **docs/ package-lock.json in git**
   - What we know: withastro/action detects package manager from lockfile. docs/ needs its own lockfile.
   - What's unclear: Whether having two package-lock.json files (root and docs/) causes any tooling issues.
   - Recommendation: Commit docs/package-lock.json. This is standard for non-workspace multi-package repos. Add `package-manager: npm` to the action config as a safety net.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build tooling | Yes | v25.9.0 | -- |
| npm | Package management | Yes | v11.12.1 | -- |
| Astro CLI | Site building | Not yet installed | -- | Will install via npm in docs/ |
| concurrently | Dev workflow | Not yet installed | -- | Will install via npm in root |

**Missing dependencies with no fallback:** None -- all dependencies are npm-installable.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 (existing in root) |
| Config file | `vitest.config.ts` (existing in root) |
| Quick run command | `npm test` |
| Full suite command | `npm test && npm run test:exports` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEMO-01 | Astro site builds successfully with marketing content | smoke | `npm run build --prefix docs` | No -- Wave 0 |
| DEMO-02 | Playground renders and accepts domain input | manual-only | Manual browser testing | N/A -- React island requires browser |
| DEMO-03 | Deploy workflow succeeds (docs/ exists, workflow triggers) | smoke | `test -d docs && test -f docs/package.json` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build --prefix docs` (verifies Astro build succeeds)
- **Per wave merge:** Full root test suite + docs build
- **Phase gate:** `npm test && npm run build && npm run build --prefix docs`

### Wave 0 Gaps
- [ ] `docs/package.json` -- Astro project must exist before any validation
- [ ] `docs/astro.config.mjs` -- Required for build
- [ ] Verify `npm run build --prefix docs` exits 0 after scaffolding

Note: The demo site is primarily validated by building successfully and manual browser inspection. Unit testing React islands inside Astro is not standard practice and adds complexity without proportional value for a single-component library.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A -- static site, no auth |
| V3 Session Management | No | N/A -- no sessions |
| V4 Access Control | No | N/A -- public static site |
| V5 Input Validation | Minimal | Domain input is passed to SiteIcon which already normalizes. No server-side processing. |
| V6 Cryptography | No | N/A -- no secrets handled client-side |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via domain input | Tampering | React escapes all rendered strings by default. Domain is used in URL construction, not dangerouslySetInnerHTML. SiteIcon already handles this. |
| External resource loading (Google CDN) | Information Disclosure | Acceptable -- the entire library's purpose is loading favicons from Google's CDN. No user data is sent. |

Security risk is minimal -- this is a static public demo site with no user data, no auth, and no server-side processing.

## Sources

### Primary (HIGH confidence)
- npm registry -- `astro@6.1.5`, `@astrojs/react@5.0.3`, `concurrently@9.2.1` versions verified
- `@astrojs/react` peerDependencies verified: `react ^17 || ^18 || ^19`
- Existing project files: `package.json`, `tsup.config.ts`, `deploy.yml`, `SiteIcon.tsx` -- all read directly

### Secondary (MEDIUM confidence)
- [Astro GitHub Pages deploy docs](https://docs.astro.build/en/guides/deploy/github/) -- site/base config, workflow structure
- [withastro/action GitHub](https://github.com/withastro/action) -- action.yml source, path/build-cmd parameters
- [Astro islands architecture](https://docs.astro.build/en/concepts/islands/) -- client:visible directive
- [Flashless dark mode in Astro](https://www.vbesse.com/en/blog/flashless-dark-mode/) -- is:inline script, CSS variables pattern
- [npm local package references](https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file/) -- file:.. dependency syntax

### Tertiary (LOW confidence)
- withastro/action build-cmd with directory changes (A3) -- untested pattern, needs CI validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified on npm registry, @astrojs/react peer deps confirmed
- Architecture: HIGH -- patterns from official Astro docs, existing deploy.yml informs integration
- Pitfalls: HIGH -- withastro/action behavior verified from action source; GH Pages base path is well-documented
- CI integration: MEDIUM -- build-cmd override approach is logical but untested in this exact configuration

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (30 days -- Astro ecosystem is stable at v6)
