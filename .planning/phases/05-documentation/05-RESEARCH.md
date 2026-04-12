# Phase 5: Documentation - Research

**Researched:** 2026-04-12
**Domain:** README authoring, npm discoverability, badge services, StackBlitz embedding
**Confidence:** HIGH

## Summary

Phase 5 is a documentation-only phase with no runtime code changes. The deliverables are: (1) a README.md following cognitive funneling with badges, code examples, API table, strategy guide, comparison table, and StackBlitz link; (2) optimized package.json keywords for npm search. All component behavior is already implemented and tested in Phases 2-3, so the README must accurately reflect the actual `SiteIcon` component API from `src/SiteIcon.tsx`.

The technical research surface is narrow but has several precision requirements: correct shields.io badge URL formats, accurate favicon-stealer comparison data (verified from npm registry), working StackBlitz embed/link patterns, and npm search algorithm awareness for keyword optimization. All external service URLs (shields.io, bundlephobia, StackBlitz, GitHub Actions) must use the correct repository and package names.

**Primary recommendation:** Write the README as a single markdown file following the locked section order (D-04), using shields.io dynamic badges, a StackBlitz link (not embed), and comparison data verified against the npm registry.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Developer-concise tone -- terse, code-forward, minimal prose. Let code examples and the comparison table do the talking. Think: zustand, zod, nanoid READMEs.
- **D-02:** "Why this library" section is the exception to brevity -- detailed explanation of the naturalWidth detection technique with an ASCII flow diagram showing how Google CDN returns a 16x16 default globe for unknown domains, and why other approaches (direct fetch, canvas comparison) fail.
- **D-03:** Quick example above the fold shows two snippets: bare minimum (3 lines) + with fallback (5 lines). Demonstrates both success path and missing favicon handling immediately.
- **D-04:** Section order after name + badges + quick example: Why -> Install -> API -> Strategies -> Advanced -> Compare -> Contributing -> License.
- **D-05:** Brief inline contributing section -- clone, install, test commands, and "PRs welcome". No separate CONTRIBUTING.md file needed for v1.
- **D-06:** Full strategy documentation -- dedicated section with a code example for each of the 3 strategies (lazy, eager, hidden) plus a table explaining when to use which. The `strategy` prop is a differentiator worth showcasing.
- **D-07:** Grouped "Advanced" section with 2-3 short examples: SSR behavior note, ref forwarding, onResolved callback for loading states. Shows the component is production-ready.
- **D-08:** Compare against 4 alternatives: favicon-stealer (npm competitor), DIY with Google CDN (no fallback detection), DIY with target domain fetch (CORS/reliability issues), favicon.im / other proxy services (external dependency).
- **D-09:** Comparison dimensions: bundle size, fallback detection, network requests, dependencies.
- **D-10:** Mixed format -- exact numbers where meaningful (bundle size: "< 1KB" vs "3.2KB"), checkmarks/crosses for boolean features (fallback detection: yes/no).
- **D-11:** Multi-domain showcase -- 4-5 domains (e.g., github.com, google.com, a made-up domain for fallback demo) showing both successful favicons and fallback rendering in one view.
- **D-12:** Default (lazy) strategy only in the StackBlitz. Strategy docs in the README are sufficient -- StackBlitz is for "does this work?" not "what are all the options?"
- **D-13:** 5 badges total: npm version, Bundlephobia bundle size, TypeScript, MIT license, CI status.
- **D-14:** Badge order (left to right): npm -> size -> TypeScript -> license -> CI. Version first (most checked), size second (key selling point).

### Claude's Discretion
- Exact ASCII diagram design for the naturalWidth detection flow
- Specific domains to use in StackBlitz multi-domain showcase
- Badge image URLs and shield.io parameters
- Exact wording of one-line description under package name
- Code example formatting and import style
- Whether to use JSX or TSX in examples

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DOCS-01 | README follows cognitive funneling: package name -> one-line description -> badges -> install -> 3-line example -> "why this library" -> full API table -> advanced examples -> license | Section order locked in D-04. Badge order locked in D-14. Nanoid-style structure verified as reference model. |
| DOCS-02 | README displays badges: npm version, bundle size (Bundlephobia), MIT license, CI status | 5 badges per D-13. Shields.io URL formats verified. CI workflow name is "CI" in ci.yml. |
| DOCS-03 | package.json `keywords` optimized for npm search: favicon, site-icon, website-icon, react, react-component, domain-favicon, google-favicon | Current keywords verified. npm search algorithm uses name + description + keywords via Algolia. |
| DOCS-04 | README includes comparison table vs favicon-stealer and DIY approaches | favicon-stealer v1.9.0 data verified from npm registry: react as dep (not peer), 11.6KB unpacked, React 19 only. |
| DOCS-05 | README includes StackBlitz embed link for one-click "try it now" experience | StackBlitz URL format verified. Two approaches: link to project or GitHub integration. |
| DOCS-06 | README includes full props/API table with prop name, type, default, and description columns | SiteIconProps interface in src/SiteIcon.tsx:10-24 provides canonical prop definitions with JSDoc. |
</phase_requirements>

## Standard Stack

This phase has no library dependencies. It produces markdown files and edits package.json.

### External Services Used (not installed, just referenced via URLs)

| Service | Purpose | URL Pattern | Confidence |
|---------|---------|-------------|------------|
| shields.io | Dynamic badges | `https://img.shields.io/...` | HIGH |
| Bundlephobia | Bundle size badge data | `https://img.shields.io/bundlephobia/minzip/react-site-icon` | HIGH |
| StackBlitz | Interactive example | `https://stackblitz.com/edit/{project-id}` or `https://stackblitz.com/fork/github/{user}/{repo}/tree/main/{path}` | HIGH |
| GitHub Actions | CI status badge | `https://img.shields.io/github/actions/workflow/status/{user}/{repo}/ci.yml` | HIGH |

## Architecture Patterns

### README Section Structure (locked per D-04)

```
README.md
  1. Package name (h1)
  2. One-line description
  3. Badges (5, inline)
  4. Quick example (bare minimum + with fallback)
  5. Why this library (detailed, ASCII diagram)
  6. Install
  7. API (props table)
  8. Strategies (3 strategies with code + selection table)
  9. Advanced (SSR, ref forwarding, onResolved)
  10. Compare (4-column comparison table)
  11. Contributing (inline, brief)
  12. License (one-liner)
```

### Pattern 1: Shields.io Dynamic Badges

**What:** Shields.io generates SVG badges that auto-update from npm, Bundlephobia, and GitHub APIs.
**When to use:** All 5 README badges.

Badge URLs for this project (repo: `jorislacance/react-site-icon`, package: `react-site-icon`): [VERIFIED: shields.io docs]

```markdown
<!-- npm version -->
[![npm](https://img.shields.io/npm/v/react-site-icon)](https://www.npmjs.com/package/react-site-icon)

<!-- bundle size (minified + gzipped) -->
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-site-icon)](https://bundlephobia.com/package/react-site-icon)

<!-- TypeScript -->
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](#)

<!-- license -->
[![license](https://img.shields.io/npm/l/react-site-icon)](https://github.com/jorislacance/react-site-icon/blob/main/LICENSE)

<!-- CI status -->
[![CI](https://img.shields.io/github/actions/workflow/status/jorislacance/react-site-icon/ci.yml?branch=main)](https://github.com/jorislacance/react-site-icon/actions/workflows/ci.yml)
```

**Notes:**
- The `bundlephobia/minzip` format shows the minified+gzipped size, which is the most meaningful metric. [VERIFIED: shields.io/badges/npm-bundle-size]
- The GitHub Actions badge uses the workflow file name (`ci.yml`), not the workflow `name` field. [VERIFIED: shields.io/badges/git-hub-actions-workflow-status]
- The TypeScript badge is a static badge (no dynamic data needed). [ASSUMED]
- Bundlephobia badge will show data only after the package is published to npm. Before first publish, it will show "not found". This is expected and acceptable.
- Badge order matches D-14: npm -> size -> TypeScript -> license -> CI.

### Pattern 2: Props Table from Source of Truth

**What:** The API table in README must match `SiteIconProps` in `src/SiteIcon.tsx` exactly.
**Source of truth:** Lines 10-24 of `src/SiteIcon.tsx`. [VERIFIED: codebase read]

Canonical props (from actual source code):

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `domain` | `string` | required | Domain to fetch the favicon for (e.g. "github.com" or "https://github.com/user/repo") |
| `size` | `number` | `32` | Requested favicon size in pixels |
| `fallback` | `ReactNode` | `null` | Content to render when no favicon is available |
| `strategy` | `'lazy' \| 'eager' \| 'hidden'` | `'lazy'` | Detection strategy: "lazy" shows fallback during detection, "eager" shows img immediately, "hidden" shows sized placeholder |
| `onResolved` | `(found: boolean) => void` | `undefined` | Called when detection completes. `true` if favicon found, `false` if globe detected or error |
| `...rest` | `ComponentPropsWithoutRef<'img'>` | -- | All standard `<img>` props except `src`, `width`, `height`, `onLoad`, `onError` are spread onto the rendered `<img>` element |

**Note on `...rest` props:** The component extends `Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'width' | 'height' | 'onLoad' | 'onError'>`. This means `className`, `style`, `alt`, `loading`, `decoding`, `data-*`, `aria-*` etc. all pass through. The README should list the primary props in a table and note the spread behavior separately. [VERIFIED: codebase read]

**Note on `ref`:** The component uses `forwardRef<HTMLImageElement>`. Ref forwards to the `<img>` when favicon is found, `null` when fallback renders. Document in Advanced section. [VERIFIED: codebase read]

### Pattern 3: StackBlitz Link Strategy

**What:** A clickable link or badge in the README that opens a pre-configured StackBlitz project.
**Two approaches:** [VERIFIED: developer.stackblitz.com]

1. **GitHub integration (recommended for this project):** Create an `examples/` directory in the repo with a working React+Vite project that imports react-site-icon. Link format:
   ```
   https://stackblitz.com/fork/github/jorislacance/react-site-icon/tree/main/examples/basic
   ```
   Pros: Example code stays in sync with the library. Uses `/fork` for instant editing.

2. **Standalone StackBlitz project:** Create a project on stackblitz.com manually, link to it.
   ```
   https://stackblitz.com/edit/{project-slug}
   ```
   Pros: No repo overhead. Cons: Can get out of sync.

**Recommendation:** Use approach 1 (GitHub integration). Create a minimal `examples/basic/` directory with `package.json`, `index.html`, `src/App.tsx`, and `vite.config.ts`. The example installs `react-site-icon` from npm (or uses a relative path during dev). Per D-11, showcase 4-5 domains including one that triggers fallback. Per D-12, use default lazy strategy only.

**Important consideration:** The StackBlitz link will only work after the package is published to npm (so the example's `npm install react-site-icon` succeeds). Before publish, the link will error. This is acceptable -- the README is for published package consumers. Alternatively, the example could reference the library source directly via workspace or relative import if StackBlitz supports it.

### Anti-Patterns to Avoid
- **Stale API documentation:** Never hand-write prop types -- derive from `SiteIconProps` interface. If a prop changes, the README must be updated.
- **Misleading bundle size claims:** The actual gzipped size is 765 bytes. Say "< 1KB" in prose, let the Bundlephobia badge show the exact number dynamically. [VERIFIED: local build, `gzip -c dist/index.js | wc -c` = 765]
- **Embedding StackBlitz iframe in README:** GitHub markdown does not render `<iframe>` tags. Use a clickable badge/link instead. [ASSUMED]
- **Hardcoded badge values:** Use dynamic shields.io badges, not static "version 0.0.0" text.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Version badge | Static text in README | shields.io `npm/v` endpoint | Auto-updates on publish |
| Bundle size badge | Manual measurement | shields.io `bundlephobia/minzip` endpoint | Auto-updates, trusted source |
| CI status badge | Manual "passing" text | shields.io `github/actions/workflow/status` | Reflects actual CI state |
| Interactive example | Self-hosted demo page | StackBlitz link to examples/ dir | Zero infrastructure, instant load |

## Common Pitfalls

### Pitfall 1: Badge URLs Breaking After Repo/Package Rename
**What goes wrong:** Badges return 404 or "not found" if the GitHub username, repo name, or npm package name in the URL doesn't match reality.
**Why it happens:** Copy-paste errors, or testing with placeholder names.
**How to avoid:** Use these exact values: GitHub `jorislacance/react-site-icon`, npm `react-site-icon`, workflow file `ci.yml`. [VERIFIED: package.json repository URL and GitHub workflows]
**Warning signs:** Badges show "not found" or grey shields after README is pushed.

### Pitfall 2: Bundlephobia Badge Shows "Not Found" Before First Publish
**What goes wrong:** The bundle size badge returns "package not found" because react-site-icon v0.0.0 has never been published to npm.
**Why it happens:** Bundlephobia queries the npm registry.
**How to avoid:** This is expected pre-publish. No action needed. Badge auto-resolves after first `npm publish`. Document in README PR that this is expected.
**Warning signs:** Badge shows grey "not found" -- normal until first publish.

### Pitfall 3: favicon-stealer Comparison Data Getting Stale
**What goes wrong:** Comparison table claims about favicon-stealer become inaccurate if the package updates.
**Why it happens:** README is a point-in-time snapshot.
**How to avoid:** Use verifiable facts (version pinned, npm registry data). Current data as of 2026-04-12: v1.9.0, react ^19.0.0 as dependency (not peer dep), 11.6KB unpacked, 6 keywords. [VERIFIED: `npm view favicon-stealer`]
**Warning signs:** Users file issues saying comparison is unfair.

### Pitfall 4: Incorrect Prop Documentation
**What goes wrong:** README documents props that don't exist or misses props that do.
**Why it happens:** README written from memory instead of reading source.
**How to avoid:** Always derive the props table from `SiteIconProps` in `src/SiteIcon.tsx:10-24`. Cross-check JSDoc comments. [VERIFIED: codebase read]
**Warning signs:** TypeScript consumers get type errors that README examples don't predict.

### Pitfall 5: StackBlitz Example Uses Unpublished Package
**What goes wrong:** StackBlitz tries `npm install react-site-icon` and fails because package isn't on npm yet.
**Why it happens:** Package is v0.0.0, not yet published.
**How to avoid:** Either (a) publish the package first (Phase 4 CI/CD handles this), or (b) note in the examples README that StackBlitz works after first publish. The README itself will be correct for consumers who find the package on npm.
**Warning signs:** StackBlitz link opens but shows install errors.

## Code Examples

### Quick Example (above the fold, per D-03)
```tsx
// Source: derived from SiteIcon.tsx API, verified against actual props
import { SiteIcon } from 'react-site-icon';

// Bare minimum
<SiteIcon domain="github.com" />

// With fallback
<SiteIcon
  domain="example.com"
  fallback={<span>?</span>}
/>
```

### Strategy Examples (per D-06)
```tsx
// Source: derived from SiteIcon.tsx strategy prop, verified against component behavior

// Lazy (default): shows fallback during detection, swaps to favicon when found
<SiteIcon domain="github.com" fallback={<Spinner />} />

// Eager: shows img immediately, may flash Google's globe briefly
<SiteIcon domain="github.com" strategy="eager" />

// Hidden: sized placeholder during detection, no layout shift
<SiteIcon domain="github.com" strategy="hidden" />
```

### Advanced: onResolved Callback
```tsx
// Source: derived from SiteIcon.tsx onResolved prop
function FaviconWithStatus({ domain }: { domain: string }) {
  const [found, setFound] = useState<boolean | null>(null);

  return (
    <div>
      <SiteIcon domain={domain} onResolved={setFound} />
      {found === false && <span>No favicon available</span>}
    </div>
  );
}
```

### Advanced: Ref Forwarding
```tsx
// Source: derived from SiteIcon.tsx forwardRef usage
const imgRef = useRef<HTMLImageElement>(null);
<SiteIcon ref={imgRef} domain="github.com" />
```

### ASCII Flow Diagram (for "Why" section, per D-02)
```
                    react-site-icon
                         |
           Google faviconV2 CDN request
                  (single request)
                         |
                   +-----+-----+
                   |           |
              Real favicon   Default globe
              (64x64 px)    (always 16x16)
                   |           |
           naturalWidth > 16  naturalWidth = 16
                   |           |
              Show <img>   Show fallback
```

This diagram shows the key insight: Google's CDN returns a 16x16 default globe for unknown domains regardless of the requested size. By checking `naturalWidth` after `onLoad`, we detect the globe without CORS issues, canvas comparison, or fetching from the target domain.

## Comparison Table Data (Verified)

| Feature | react-site-icon | favicon-stealer | DIY Google CDN | DIY Domain Fetch | Proxy Services |
|---------|----------------|-----------------|----------------|------------------|----------------|
| Bundle size | < 1KB gzipped | ~3.5KB min (est.) | 0 (inline code) | 0 (inline code) | 0 (inline code) |
| Dependencies | 0 (React peer) | 2 (React as dep!) | 0 | 0 | 0 |
| Fallback detection | Yes (naturalWidth) | Unclear | No | No | No |
| Network requests | 1 (Google CDN) | 1-2 (domain first, then Google) | 1 (Google CDN) | 1+ (target domain, may fail) | 1 (external proxy) |
| React version support | 17, 18, 19 | 19 only | Any | Any | Any |
| SSR compatible | Yes | Unknown | Manual | Manual | Manual |
| TypeScript | Full types shipped | TypeScript source | Manual | Manual | Manual |
| Detection strategy | 3 options (lazy/eager/hidden) | None | None | None | None |

**Data sources:**
- react-site-icon: local build (`gzip -c dist/index.js | wc -c` = 765 bytes), `package.json` peerDependencies. [VERIFIED: codebase]
- favicon-stealer v1.9.0: `npm view favicon-stealer dependencies` shows `react: ^19.0.0, react-dom: ^19.0.0` as regular dependencies (packaging anti-pattern -- bundles React or causes duplicate React). Unpacked size 11,601 bytes. [VERIFIED: npm registry]
- favicon-stealer React version: peerDependencies is empty `{}`, dependencies has `react: ^19.0.0`. Only React 19 users can install without conflicts. [VERIFIED: npm registry]
- DIY approaches: assessed from project spec `ReactThirdPartyDomainFavicon.md` problem analysis. [VERIFIED: codebase file]
- Proxy services (favicon.im etc.): external dependency, no fallback detection, service can go down. [ASSUMED]

## npm Search Optimization

### How npm Search Ranking Works
npm search is powered by Algolia. [CITED: github.com/algolia/npm-search] Key factors:

1. **Text relevance:** Searches against `name`, `description`, `keywords`, and `owner.name`. Exact name matches are boosted. [VERIFIED: Algolia npm-search repo]
2. **Download popularity:** 30-day downloads used as custom ranking tiebreaker. [VERIFIED: Algolia npm-search repo]
3. **Popular flag:** Packages with >0.005% of total npm downloads get a boost. [VERIFIED: Algolia npm-search repo]

### Current Keywords (from package.json)
```json
["favicon", "site-icon", "website-icon", "react", "react-component", "domain-favicon", "google-favicon"]
```
[VERIFIED: package.json]

### Keyword Assessment
The current 7 keywords are well-chosen. They cover:
- Primary function: `favicon`, `site-icon`, `website-icon`, `domain-favicon`
- Ecosystem: `react`, `react-component`
- Implementation detail (discoverable): `google-favicon`

**Potential additions to consider:**
- `website-favicon` -- variant of existing keywords, covers "website favicon" search query
- `favicon-component` -- compound keyword for "favicon component" searches

**No changes required per DOCS-03** -- the existing 7 keywords already match the requirement spec exactly. Additional keywords could be added but are not required.

### Description Optimization
Current: `"A zero-dependency React component that displays any website's favicon from its domain name"`
This is strong -- contains "React component", "favicon", "domain", "zero-dependency". Matches likely search queries. [VERIFIED: package.json]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static badges with hardcoded values | Dynamic shields.io badges | 2020+ | Auto-updating, always accurate |
| README code blocks only | StackBlitz/CodeSandbox live links | 2021+ | "Try before install" reduces friction |
| Long prose READMEs | Code-first, terse READMEs (nanoid style) | 2022+ | Faster time-to-value for developers |
| Manual CHANGELOG maintenance | Changesets auto-generation | 2022+ | Consistent, linked to PRs (already configured) |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | GitHub markdown does not render `<iframe>` tags for StackBlitz embeds | Architecture Patterns / Anti-Patterns | Low -- worst case, the iframe is stripped and shows nothing. Using a link/badge is safe regardless. |
| A2 | TypeScript badge is best done as a static shields.io badge | Architecture Patterns / Badge URLs | Low -- alternative is a dynamic badge from npm types detection, but static is simpler and always correct for this project. |
| A3 | favicon.im and other proxy services lack fallback detection | Comparison Table | Medium -- if a proxy service added detection, comparison would be inaccurate. Mitigated by describing the general proxy approach, not a specific service. |
| A4 | StackBlitz examples/ directory approach works for monorepo-style linking | StackBlitz Link Strategy | Medium -- if StackBlitz can't resolve a subdirectory with its own package.json, would need a standalone project. Testable before finalizing. |

## Open Questions

1. **StackBlitz Example Timing**
   - What we know: StackBlitz needs the package on npm to `npm install react-site-icon`. Package is v0.0.0, not yet published.
   - What's unclear: Whether to create the examples/ directory now (with the StackBlitz link) or defer until after first publish.
   - Recommendation: Create the examples/ directory and README link now. The link will work as soon as the package is published (Phase 4 CI/CD). Note in PR description that StackBlitz link is pre-publish placeholder.

2. **TSX vs JSX in Code Examples**
   - What we know: The library is written in TypeScript. Users may use JSX or TSX.
   - What's unclear: Which format is more accessible in README examples (Claude's discretion per CONTEXT.md).
   - Recommendation: Use TSX for examples that show type annotations (onResolved callback, ref), plain JSX for simple examples (quick start). This matches how zustand and zod document -- types shown where they add clarity.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run` |
| Full suite command | `npm test && npm run test:exports` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DOCS-01 | README structure follows cognitive funneling | manual-only | Visual inspection of rendered markdown | N/A |
| DOCS-02 | 5 badges present with correct URLs | manual-only | Visual inspection + badge link clicks | N/A |
| DOCS-03 | package.json keywords match spec | smoke | `node -e "const p=require('./package.json'); const k=['favicon','site-icon','website-icon','react','react-component','domain-favicon','google-favicon']; const ok=k.every(w=>p.keywords.includes(w)); process.exit(ok?0:1)"` | No |
| DOCS-04 | Comparison table present in README | manual-only | Visual inspection | N/A |
| DOCS-05 | StackBlitz link present in README | manual-only | Visual inspection + link click | N/A |
| DOCS-06 | Props table matches SiteIconProps | manual-only | Cross-reference with `src/SiteIcon.tsx` | N/A |

### Sampling Rate
- **Per task commit:** `npm test` (ensure no source regressions during README/example edits)
- **Per wave merge:** `npm test && npm run test:exports && npm run build` (full quality gates)
- **Phase gate:** Full suite green + manual README review before `/gsd-verify-work`

### Wave 0 Gaps
None -- this phase is documentation-only. Existing test infrastructure covers source code. README content is verified by manual inspection, which is appropriate for prose/markdown artifacts. The DOCS-03 keyword check could be a one-liner but is not worth a formal test file.

## Security Domain

This phase creates markdown documentation and edits package.json keywords. No security-relevant code paths are introduced. No ASVS categories apply.

| ASVS Category | Applies | Rationale |
|---------------|---------|-----------|
| V2 Authentication | No | Documentation only |
| V3 Session Management | No | Documentation only |
| V4 Access Control | No | Documentation only |
| V5 Input Validation | No | Documentation only |
| V6 Cryptography | No | Documentation only |

## Sources

### Primary (HIGH confidence)
- Codebase: `src/SiteIcon.tsx` -- full component API, prop types, JSDoc comments
- Codebase: `package.json` -- keywords, repository URL, description, dependencies
- Codebase: `.github/workflows/ci.yml` -- workflow name ("CI"), file name (ci.yml) for badge URL
- Codebase: `dist/index.js` -- verified 765 bytes gzipped via `gzip -c dist/index.js | wc -c`
- npm registry: `npm view favicon-stealer` -- v1.9.0, dependencies, unpacked size 11,601 bytes

### Secondary (MEDIUM confidence)
- [shields.io/badges/npm-version](https://shields.io/badges/npm-version) -- npm version badge URL format
- [shields.io/badges/npm-bundle-size](https://shields.io/badges/npm-bundle-size) -- Bundlephobia badge URL format (`/bundlephobia/minzip/{package}`)
- [shields.io/badges/git-hub-actions-workflow-status](https://shields.io/badges/git-hub-actions-workflow-status) -- CI badge URL uses workflow filename, not YAML name field
- [developer.stackblitz.com/guides/integration/embedding](https://developer.stackblitz.com/guides/integration/embedding) -- StackBlitz embed URL format
- [developer.stackblitz.com/guides/integration/open-from-github](https://developer.stackblitz.com/guides/integration/open-from-github) -- GitHub project URL format with `/fork` prefix
- [github.com/algolia/npm-search](https://github.com/algolia/npm-search) -- npm search algorithm (Algolia-powered, uses name/description/keywords)
- [github.com/ai/nanoid/blob/main/README.md](https://github.com/ai/nanoid/blob/main/README.md) -- README structure reference (terse, code-first)

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no libraries involved, only markdown and external service URLs verified against official docs
- Architecture: HIGH -- README structure locked by user decisions, badge URLs verified against shields.io docs, props table derived from actual source code
- Pitfalls: HIGH -- common badge/StackBlitz issues well-documented, favicon-stealer data verified from npm registry
- Comparison data: MEDIUM -- favicon-stealer v1.9.0 npm data verified, but implementation details (waterfall behavior, fallback detection) inferred from version history and docs rather than source code audit

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (30 days -- badge URLs and StackBlitz patterns are stable)
