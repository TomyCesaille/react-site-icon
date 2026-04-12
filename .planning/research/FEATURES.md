# Feature Landscape

**Domain:** React component library for displaying third-party website favicons
**Researched:** 2026-04-12

## Table Stakes

Features users expect. Missing = product feels incomplete or untrustworthy.

### Component API

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `domain` prop (string) | Core purpose of the component | Low | Accept full URLs, strip to domain automatically |
| `size` prop (number) | Every image component exposes size control | Low | Maps to Google API `sz` param and img width/height |
| `fallback` prop (ReactNode) | Developers need control when favicon unavailable | Low | Render custom element (icon, initials, placeholder) when detection fails |
| `alt` prop (string) | Accessibility requirement; screen readers need description | Low | Default to `"Favicon for {domain}"` if omitted |
| `className` prop (string) | Standard React styling escape hatch | Low | Pass-through to rendered `<img>` element |
| `style` prop (CSSProperties) | Standard React inline styling | Low | Pass-through to rendered `<img>` element |
| TypeScript declarations (.d.ts) | 85%+ of React ecosystem uses TypeScript; no types = instant skip | Low | Ship via tsup `--dts`; strict mode |
| Dual ESM + CJS output | Required for compatibility with Next.js, Vite, CRA, Remix, etc. | Low | tsup handles this; use `exports` field in package.json |
| Zero runtime dependencies | Core selling point; developers audit dependency trees | Low | Only React as peerDependency |
| Tiny bundle (< 1KB gzipped) | Competitive differentiator that must be maintained as table stakes once advertised | Low | Single component, no heavy logic |

### Package Quality Signals

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| README with install + quick example | npm page IS the landing page; 5 seconds to understand or developers leave | Low | Follow "cognitive funneling": Name > Description > Install > Example > API > License |
| Shields.io badges | Trust signals: npm version, bundle size, license, CI status, downloads | Low | 4-5 badges max; npm version, bundlephobia size, license, CI passing, weekly downloads |
| Props/API documentation table | Developers need to see all props at a glance without reading source | Low | Markdown table with prop, type, default, description columns |
| MIT license | Standard for UI component libraries; anything else raises friction | Low | Already decided in project constraints |
| package.json `keywords` | npm search indexes title, description, readme, AND keywords | Low | Target: favicon, site-icon, react, component, website-icon, domain-icon, google-favicon |
| `exports` field in package.json | Modern Node.js resolution; Next.js and bundlers use this | Low | Map `.` to ESM/CJS/types; critical for TypeScript consumers |

### Reliability

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Domain input normalization | Developers will pass `https://github.com/user/repo`; component must handle it | Low | Strip protocol, path, query, hash; extract hostname |
| Fallback detection (naturalWidth) | The core innovation; Google returns 16x16 globe for unknown domains when larger size requested | Medium | Load `<img>` at requested size, check `naturalWidth === 16` after load to detect default globe |
| Graceful error handling | Network failures, CDN outages must not crash the app | Low | `onError` on img triggers fallback render |
| SSR compatibility | Next.js, Remix, Gatsby all use SSR; component must not break server render | Medium | Render fallback on server (no `Image` API available); run naturalWidth check on client after hydration |

## Differentiators

Features that set the product apart. Not expected, but valued when present.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| `onResolved` callback prop | Lets consumers know whether a real favicon was found or fallback triggered; enables analytics, conditional rendering | Low | Call with `{ status: 'loaded' \| 'fallback', domain }` after detection completes |
| Interactive demo site | Competing libraries have NO demo sites; a "try any domain" playground is immediately convincing | Medium | Astro + React; input field + live preview; helps SEO via inbound links |
| Comparison section in README | favicon-stealer has 15+ styling props and waterfall fetch strategy; direct comparison table shows why react-site-icon is better (faster, smaller, simpler) | Low | Table: Feature / react-site-icon / favicon-stealer / DIY |
| Bundlephobia badge | Proves < 1KB claim with independent verification; rare among micro-libraries | Low | `https://img.shields.io/bundlephobia/minzip/react-site-icon` |
| CodeSandbox/StackBlitz embed | One-click "try it now" without installing; reduces adoption friction to zero | Low | Link in README + embed on demo site |
| React 17/18/19 compatibility | favicon-stealer does not document React version support; explicit support matrix builds confidence | Medium | Use forwardRef for React 17/18 compat, but also support ref-as-prop pattern for React 19; test against all three |
| `ref` forwarding | Power users need ref access to the underlying `<img>` element for measurement, intersection observers, etc. | Low | forwardRef wrapper (React 17/18) + ref as prop (React 19) |
| Semantic HTML | Renders a plain `<img>` tag (not a div with background-image); works with native browser behaviors (drag, right-click save, print) | Low | Already the natural implementation |
| Spread remaining props to `<img>` | Lets developers add `loading="lazy"`, `decoding="async"`, `data-*`, `aria-*`, `draggable`, etc. without the library needing to know about them | Low | `...restProps` on the `<img>` element; TypeScript: extend `ImgHTMLAttributes<HTMLImageElement>` |
| Changeset-based changelog | Professional versioning; consumers can track exactly what changed between versions | Low | Already in project plan via changesets |

## Anti-Features

Features to explicitly NOT build. These are tempting but wrong for this library.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Built-in styling props (border, padding, bgColor, borderRadius) | favicon-stealer has 6+ styling props that duplicate CSS. Bloats API surface, increases bundle size, creates opinions that clash with user design systems. Every styling prop is a maintenance burden. | Expose `className` and `style` props. Let CSS do CSS. |
| Direct favicon.ico fetch from target domain | Unreliable (many sites block direct access), adds latency (DNS lookup + HTTP request before fallback), CORS issues in browsers, timeouts on dead domains. favicon-stealer does this as primary strategy and it is slow. | Use Google faviconV2 CDN exclusively. Single request, always works, no CORS issues. |
| Multiple fallback service cascade (Google > DuckDuckGo > favicon.im) | Each additional service adds latency, complexity, and a dependency on third-party uptime. favicon-stealer cascades through multiple services. | Google CDN is reliable enough alone. naturalWidth detection handles the "no favicon" case cleanly. |
| Canvas/ImageData comparison for fallback detection | Requires CORS headers (Google CDN does not send them), needs crossOrigin attribute (which breaks the request), brittle pixel comparison | naturalWidth check is simpler, faster, and works without CORS. |
| `useSiteIcon` hook API | Doubles the API surface for marginal benefit. A hook that returns `{ src, status }` sounds nice but the component already encapsulates all the logic. Hooks encourage reimplementing the rendering logic. | Ship one component. If someone needs the hook pattern, they can wrap `<SiteIcon>` or copy the detection logic (it is ~10 lines). |
| Caching layer / in-memory favicon cache | Browser already caches images via HTTP cache headers. Adding a JS cache adds complexity, memory management concerns, and cache invalidation bugs. | Trust the browser's native image cache. Google's CDN sends proper cache headers. |
| Server-side favicon fetching/scraping | Completely different problem domain (Node.js HTTP, HTML parsing, etc.). Would add massive bundle size and dependencies. | This is a client-side React component. Server fetching is a different package. |
| Theming / dark mode favicon inversion | Overly opinionated; most favicons look fine on any background. Inversion algorithms produce ugly results on colorful icons. | Let consumers handle dark mode via their own CSS/wrapper if needed. |
| `crossOrigin` attribute on img | Google's faviconV2 CDN does not send CORS headers. Adding crossOrigin causes the request to fail entirely. This is a trap that looks like best practice but breaks the core functionality. | Do NOT set crossOrigin. Document why in code comments for future maintainers. |
| Animated/transition effects | Loading spinners, fade-ins, skeleton screens. Opinionated visual behavior that clashes with consumer UIs. | Render fallback immediately, swap to favicon when loaded. Consumers can add transitions via CSS or wrapper components. |

## Feature Dependencies

```
Domain input normalization ──> Favicon URL construction ──> Image loading
                                                              │
                                                              v
                                                     naturalWidth check
                                                              │
                                              ┌───────────────┴───────────────┐
                                              v                               v
                                     Real favicon found              Fallback triggered
                                     (render <img>)                  (render fallback prop
                                              │                       or default icon)
                                              v
                                     onResolved callback
                                     (status: 'loaded')

TypeScript types ──> All props
ESM + CJS build ──> Package consumption
README + badges ──> npm discoverability
Demo site ──> Adoption conversion
```

Key dependency chains:
- `fallback` prop requires naturalWidth detection to work (detection triggers fallback render)
- `onResolved` requires naturalWidth detection to report status
- SSR compatibility requires fallback as initial render (naturalWidth only works client-side)
- `ref` forwarding requires forwardRef for React 17/18, but native ref prop for React 19
- Demo site requires the published package to demonstrate

## MVP Recommendation

### Must ship in v1.0.0 (Table Stakes)

1. **SiteIcon component** with `domain`, `size`, `fallback`, `className`, `style`, `alt` props
2. **Domain normalization** -- accept full URLs, extract hostname
3. **naturalWidth fallback detection** -- the core innovation, without this the library has no reason to exist
4. **SSR compatibility** -- render fallback on server, detect on client
5. **TypeScript strict with shipped .d.ts** -- non-negotiable for 2026 React ecosystem
6. **Dual ESM + CJS** -- required for Next.js/Vite/CRA compatibility
7. **README** with badges, install, quick example, full API table, comparison to alternatives
8. **Spread remaining props** (`...restProps` on `<img>`) -- tiny effort, massive DX improvement
9. **ref forwarding** -- expected for any component rendering a DOM element

### Ship in v1.0.0 but lower priority

10. **`onResolved` callback** -- low effort, high value for power users
11. **package.json keywords** optimized for npm search
12. **Bundlephobia badge** proving < 1KB claim

### Ship shortly after v1.0.0

13. **Demo site** with interactive playground -- high impact for adoption but does not block library release
14. **CodeSandbox/StackBlitz example** -- embed link in README
15. **Comparison table** in README vs favicon-stealer and DIY approaches

### Defer indefinitely

- Hook API (`useSiteIcon`)
- Styling props (border, padding, etc.)
- Multiple fallback services
- Caching layer
- Server-side fetching
- Theming/dark mode

## Package Marketing & Discoverability Features

### What makes npm libraries "famous" (research findings)

**README quality is the #1 factor.** The npm page IS the marketing page. Most developers spend < 10 seconds before deciding. The README must answer four questions instantly: What is this? Can it solve my problem? How do I use it? Am I allowed to use it?

**Recommended README structure (cognitive funneling):**
1. Package name + one-line description
2. Badges (npm version, bundle size, license, CI, downloads)
3. Install command (`npm install react-site-icon`)
4. Quick example (3-5 lines of JSX showing basic usage)
5. "Why this library?" section (comparison to alternatives)
6. Full API/props table
7. Advanced usage examples (SSR, custom fallback, onResolved)
8. License

**Badge strategy (5 badges, no more):**
- npm version (signals active maintenance)
- Bundle size via Bundlephobia (proves < 1KB claim)
- License (MIT = green light)
- CI status (tests pass)
- Weekly downloads (social proof; hide until > 100/week)

**Keywords for npm discoverability:**
npm search indexes: title, description, readme content, and keywords field. Target these keywords in package.json:
`favicon`, `site-icon`, `website-icon`, `react`, `react-component`, `domain-favicon`, `google-favicon`, `site-favicon`, `link-preview`, `bookmark`

**Demo site as conversion funnel:**
No competing favicon library has an interactive demo. A "try any domain" playground with instant results is the single most convincing sales tool. Host on GitHub Pages (free, same repo).

**GitHub repository signals:**
- Clear description and topics
- Issue templates
- Contributing guide (signals openness)
- Clean commit history
- Semantic versioning via changesets

**TypeScript is non-negotiable:**
Libraries without types are invisible to a large portion of the React ecosystem. TypeScript-first with strict mode and shipped declarations is expected, not a differentiator.

## Sources

- [favicon-stealer GitHub](https://github.com/iAmCorey/favicon-stealer) -- PRIMARY competitor analysis (47 stars, 12 props, waterfall fetch strategy)
- [favicon-stealer npm](https://www.npmjs.com/package/favicon-stealer) -- Package details and version history
- [Google Favicon API blog post](https://dev.to/derlin/get-favicons-from-any-website-using-a-hidden-google-api-3p1e) -- API endpoint documentation, limitations
- [Jim Nielsen: Displaying Favicons for Any Domain](https://blog.jim-nielsen.com/2021/displaying-favicons-for-any-domain/) -- Comprehensive overview of all favicon API approaches
- [npm search algorithm docs](https://blog.npmjs.org/post/156076312840/search-update.html) -- How npm search ranking works
- [Gleb Bahmutov: How I Organize README](https://glebbahmutov.com/blog/how-i-organize-readme/) -- README structure best practices, badge strategy
- [npm official docs: About package README files](https://docs.npmjs.com/about-package-readme-files/) -- README requirements and display
- [awesome-micro-npm-packages](https://github.com/parro-it/awesome-micro-npm-packages) -- What makes small npm packages successful
- [Shields.io](https://shields.io/) -- Badge generation service
- [React 19 forwardRef deprecation](https://react.dev/reference/react/forwardRef) -- ref as prop migration for React 19 support
- [React image fallback patterns](https://dev.to/frontenddeveli/configure-fallback-images-in-react-and-nextjs-54ej) -- SSR-compatible fallback strategies
- [SSR img onError bug](https://github.com/code-soubhik/react-nextjs-ssr-onerror-img-issue-fix) -- Known React/Next.js SSR issue with image error handling
- [Bundlephobia](https://bundlephobia.com/) -- Independent bundle size verification
