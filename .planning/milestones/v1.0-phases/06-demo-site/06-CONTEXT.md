# Phase 6: Demo Site - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Astro + React landing page with interactive playground deployed to GitHub Pages. Playground-first design: visitors see live favicons immediately, can test any domain, and copy the generated JSX. Minimal marketing content — let the demo sell the library.

</domain>

<decisions>
## Implementation Decisions

### Page Structure & Content
- **D-01:** Playground-first layout — hero with tagline + badges, then the interactive playground front and center. Minimal marketing content below.
- **D-02:** Pre-filled grid of 6-8 well-known domains (github.com, google.com, etc.) rendered on page load. Visitors see favicons immediately as proof-of-concept. User can add their own domains via the input.
- **D-03:** Brief "Why" section below playground — 2-3 feature bullets (< 1KB, zero deps, SSR-safe) plus one-sentence teaser about the naturalWidth detection technique with a link to the README for technical depth.
- **D-04:** Install snippet section with `npm install react-site-icon` and links to GitHub repo, npm page, and README.

### Playground Design
- **D-05:** Input field + live code preview — text input to type a domain, with a JSX code snippet displayed alongside showing the exact `<SiteIcon>` usage for the current configuration.
- **D-06:** Collapsible "Advanced" panel below the main playground with strategy toggle (lazy/eager/hidden) and size slider. Collapsed by default — power users can explore, casual visitors see a clean interface.
- **D-07:** Live code sync — the code preview updates in real-time as the user changes domain, strategy, or size props. What you see is what you'd paste into your project.

### Visual Style & Layout
- **D-08:** Minimal dev-tool aesthetic — clean, monochrome with one accent color. Monospace headings, system font body. Signals "serious library" to developers.
- **D-09:** Astro scoped styles (`<style>` blocks) — no CSS framework dependencies. Keeps the demo site as lean as the library itself.
- **D-10:** System preference dark/light mode with a manual toggle. Both themes implemented, defaults to OS preference via `prefers-color-scheme`, with a toggle for manual override. Demonstrates that the component works on both light and dark backgrounds — relevant for a UI component library.

### Component Integration
- **D-11:** Import from built `dist/` package — more realistic (tests what consumers actually get). Library builds automatically before Astro dev server starts.
- **D-12:** Watch + rebuild dev workflow — run `tsup --watch` in parallel with Astro dev server. Library rebuilds on `src/` changes and Astro hot-reloads. Requires a concurrency tool (e.g., `concurrently` package).
- **D-13:** `client:visible` hydration directive for the React playground island. Hydrates when it scrolls into view — since the playground is near the top of a playground-first page, it hydrates almost immediately without blocking initial paint.

### Claude's Discretion
- Specific pre-filled domains for the grid (pick recognizable sites with distinctive favicons)
- Dark/light theme color palette and accent color choice
- Concurrency tool selection for the watch+rebuild dev workflow
- Astro project structure within `docs/` (pages, components, layouts)
- Code preview syntax highlighting approach
- Playground grid layout details (columns, spacing, favicon label display)
- Dark mode toggle UI placement and implementation

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Component Source
- `src/SiteIcon.tsx` — Full component (157 lines): SiteIconProps interface, 3 strategies, domain normalization, naturalWidth detection. The demo imports this via built dist/.
- `src/index.ts` — Re-export barrel file

### Build & Deploy Configuration
- `package.json` — Build scripts, homepage URL (`jorislacance.github.io/react-site-icon`), existing dependencies
- `tsup.config.ts` — Library build configuration (what `npm run build` produces)
- `.github/workflows/deploy.yml` — Existing GitHub Pages deploy workflow. Expects Astro site in `docs/`. Runs quality gates, builds library, then builds Astro site with `withastro/action@v6`.

### Requirements
- `.planning/REQUIREMENTS.md` §Demo Site (DEMO-01 through DEMO-03) — All demo site requirements

### Prior Phase Decisions
- `.planning/phases/04-ci-cd-and-release-automation/04-CONTEXT.md` — Phase 4 decisions: demo site in `docs/` (D-13), `withastro/action@v6` (D-12), GitHub Pages URL (D-18), deploy triggers (D-14), build library before Astro (D-17)
- `.planning/phases/05-documentation/05-CONTEXT.md` — Phase 5 decisions: README tone and structure, strategy documentation, comparison table (content the demo can link to)
- `.planning/phases/02-core-component/02-CONTEXT.md` — Phase 2 decisions: all component behaviors the playground must demonstrate (strategies D-01 through D-05, detection D-06 through D-09)

### Technology
- `CLAUDE.md` §Demo Site — Astro ^6.1.5, @astrojs/react ^5.0.3 (supports React 17/18/19 peer deps)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SiteIcon` component — fully implemented with all props, 3 strategies, SSR safety. The demo is a consumer of this component.
- `.github/workflows/deploy.yml` — Complete deploy pipeline already configured. Just needs `docs/` directory to exist.
- `package.json` scripts — `build`, `lint`, `test` all exist and are referenced by deploy workflow.

### Established Patterns
- `forwardRef` wrapper on SiteIcon — playground can demonstrate ref forwarding in advanced examples
- Strategy pattern (lazy/eager/hidden) — playground's advanced panel toggles between these
- Domain normalization — accepts full URLs, strips to hostname. Playground input can accept messy URLs.

### Integration Points
- `docs/` directory is the trigger for `deploy.yml` — once it exists, GitHub Pages deploys automatically on push to main
- Library build output (`dist/`) is what the Astro site imports — `tsup --watch` keeps it fresh during development
- `package.json` needs new scripts: `docs:dev` (watch + dev), `docs:build` (for CI)

</code_context>

<specifics>
## Specific Ideas

- Pre-filled grid should include at least one domain that triggers fallback (e.g., a non-existent domain) so visitors see both success and fallback states immediately
- Code preview should show a minimal but complete snippet — import statement + JSX with current props
- Dark mode toggle could be a simple sun/moon icon in the header area
- The "Advanced" panel collapse/expand should be smooth (CSS transition) but not fancy

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-demo-site*
*Context gathered: 2026-04-12*
