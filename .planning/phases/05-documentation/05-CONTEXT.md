# Phase 5: Documentation - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

README that converts npm browsers into users within 60 seconds — cognitive funneling from name + badges + quick example through full API docs, strategy guide, and comparison table. Plus optimized package.json keywords and a StackBlitz embed link.

</domain>

<decisions>
## Implementation Decisions

### README Tone & Structure
- **D-01:** Developer-concise tone — terse, code-forward, minimal prose. Let code examples and the comparison table do the talking. Think: zustand, zod, nanoid READMEs.
- **D-02:** "Why this library" section is the exception to brevity — detailed explanation of the naturalWidth detection technique with an ASCII flow diagram showing how Google CDN returns a 16x16 default globe for unknown domains, and why other approaches (direct fetch, canvas comparison) fail.
- **D-03:** Quick example above the fold shows two snippets: bare minimum (3 lines) + with fallback (5 lines). Demonstrates both success path and missing favicon handling immediately.
- **D-04:** Section order after name + badges + quick example: Why → Install → API → Strategies → Advanced → Compare → Contributing → License.
- **D-05:** Brief inline contributing section — clone, install, test commands, and "PRs welcome". No separate CONTRIBUTING.md file needed for v1.

### Strategy Documentation
- **D-06:** Full strategy documentation — dedicated section with a code example for each of the 3 strategies (lazy, eager, hidden) plus a table explaining when to use which. The `strategy` prop is a differentiator worth showcasing.

### Advanced Usage
- **D-07:** Grouped "Advanced" section with 2-3 short examples: SSR behavior note, ref forwarding, onResolved callback for loading states. Shows the component is production-ready.

### Comparison Table
- **D-08:** Compare against 4 alternatives: favicon-stealer (npm competitor), DIY with Google CDN (no fallback detection), DIY with target domain fetch (CORS/reliability issues), favicon.im / other proxy services (external dependency).
- **D-09:** Comparison dimensions: bundle size, fallback detection, network requests, dependencies.
- **D-10:** Mixed format — exact numbers where meaningful (bundle size: "< 1KB" vs "3.2KB"), checkmarks/crosses for boolean features (fallback detection: yes/no).

### StackBlitz Example
- **D-11:** Multi-domain showcase — 4-5 domains (e.g., github.com, google.com, a made-up domain for fallback demo) showing both successful favicons and fallback rendering in one view.
- **D-12:** Default (lazy) strategy only in the StackBlitz. Strategy docs in the README are sufficient — StackBlitz is for "does this work?" not "what are all the options?"

### Badge Selection
- **D-13:** 5 badges total: npm version, Bundlephobia bundle size, TypeScript, MIT license, CI status.
- **D-14:** Badge order (left to right): npm → size → TypeScript → license → CI. Version first (most checked), size second (key selling point).

### Claude's Discretion
- Exact ASCII diagram design for the naturalWidth detection flow
- Specific domains to use in StackBlitz multi-domain showcase
- Badge image URLs and shield.io parameters
- Exact wording of one-line description under package name
- Code example formatting and import style
- Whether to use JSX or TSX in examples

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Component Source (for accurate API table)
- `src/SiteIcon.tsx` — Full component implementation (157 lines): SiteIconProps interface defines all props with JSDoc comments, 3 strategies, domain normalization, naturalWidth detection
- `src/index.ts` — Re-export barrel file

### Package Configuration
- `package.json` — Current keywords (DOCS-03), description, homepage URL, repository URL for badge links

### Requirements
- `.planning/REQUIREMENTS.md` §Documentation (DOCS-01 through DOCS-06) — All documentation requirements for this phase

### Prior Decisions (component behavior for accurate docs)
- `.planning/phases/02-core-component/02-CONTEXT.md` — All component behavior decisions (strategies, detection, DOM structure, fallback, domain normalization) that the README must accurately document

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SiteIconProps` interface in `src/SiteIcon.tsx:10-24` — Complete prop types with JSDoc comments. API table should match these exactly.
- `normalizeDomain()` in `src/SiteIcon.tsx:26-35` — Domain normalization logic to document (accepts full URLs, extracts hostname).
- `buildUrl()` in `src/SiteIcon.tsx:37-38` — Google faviconV2 URL construction for the "Why" diagram.

### Established Patterns
- `forwardRef` wrapper — Component uses React's forwardRef, relevant for advanced usage examples.
- Strategy pattern with switch statement — 3 rendering paths (lazy/eager/hidden) in loading state.

### Integration Points
- `package.json` keywords — Already populated with 7 keywords per DOCS-03. May need review/optimization.
- `package.json` description — Already set. README one-liner should match or complement it.
- `.github/workflows/ci.yml` — CI badge URL needs to reference this workflow.

</code_context>

<specifics>
## Specific Ideas

- The naturalWidth detection diagram should show the full flow: component renders → Google CDN request → response (real favicon at requested size OR 16x16 default globe) → naturalWidth check → show favicon or fallback
- Comparison with favicon-stealer should highlight the waterfall problem (tries target domain first, then falls back to Google — two requests, slower)
- StackBlitz example should include at least one domain that triggers fallback, so users immediately see both states

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-documentation*
*Context gathered: 2026-04-12*
