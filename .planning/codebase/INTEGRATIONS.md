# External Integrations

**Analysis Date:** 2026-04-19

## APIs & External Services

**Google Favicon CDN:**
- Service: Google's faviconV2 CDN (`t1.gstatic.com/faviconV2`)
- Purpose: Fetches website favicons by domain name
- URL pattern: `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://{domain}&size={size}`
- Implementation: `buildUrl()` function in `src/SiteIcon.tsx` (line 52-53)
- Auth: None required (public CDN)
- Rate limits: Unknown / not documented by Google
- Fallback behavior: Returns a 16x16 globe icon when no favicon exists -- the library detects this via `naturalWidth` check

## Data Storage

**Databases:**
- None. This is a client-side React component library with no backend.

**File Storage:**
- Local filesystem only (build artifacts in `dist/`)

**Caching:**
- Browser-native image caching only. The CDN URL is deterministic per domain+size, so browsers cache favicon responses automatically.
- The component handles pre-cached images via `img.complete` check in the `checkComplete` ref callback (`src/SiteIcon.tsx` line 96-103)

## Authentication & Identity

**Auth Provider:**
- Not applicable. The library has no auth requirements.

## Monitoring & Observability

**Error Tracking:**
- None. Errors are handled locally via `onError` handler and `onResolved(false)` callback.

**Logs:**
- None. No `console.log` or logging framework used in library code.

## CI/CD & Deployment

**Hosting:**
- npm registry: Library published via `npm publish --provenance --access public`
- GitHub Pages: Demo site deployed via Astro build + `actions/deploy-pages`

**CI Pipeline (GitHub Actions):**

1. **CI** (`.github/workflows/ci.yml`):
   - Triggers: Push to `main`, pull requests
   - Steps: lint, typecheck, unit tests, export validation (`attw`), format check, build, bundle size check (< 1KB gzipped)

2. **Deploy Demo** (`.github/workflows/deploy.yml`):
   - Triggers: Push to `main`, manual dispatch
   - Steps: Check `docs/` exists, quality gates, build Astro site (`withastro/action@v6`), deploy to GitHub Pages (`actions/deploy-pages@v4`)

3. **Release** (`.github/workflows/release.yml`):
   - Triggers: Push to `main`
   - Steps: Build library, create "Version Packages" PR via `changesets/action@v1`, check if version differs from npm, publish with OIDC provenance, create GitHub Release via `gh release create`

**Key GitHub Actions used:**
- `actions/checkout@v4`
- `actions/setup-node@v4`
- `changesets/action@v1` - Creates version bump PRs
- `withastro/action@v6` - Builds Astro site for Pages
- `actions/deploy-pages@v4` - Deploys to GitHub Pages

## Environment Configuration

**Required env vars:**
- `GITHUB_TOKEN` (provided automatically by GitHub Actions) - Used by changesets/action and gh release create

**Secrets location:**
- No custom secrets. npm publishing uses OIDC trusted publishing (no `NPM_TOKEN` needed).
- `GITHUB_TOKEN` is auto-provided by GitHub Actions.

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Third-Party Badges (Demo Site)

The demo site (`docs/src/pages/index.astro`) and README reference external badge services:
- `img.shields.io/npm/v/react-site-icon` - npm version badge
- `img.shields.io/bundlephobia/minzip/react-site-icon` - Bundle size badge
- `img.shields.io/badge/TypeScript-*` - TypeScript badge
- `img.shields.io/npm/l/react-site-icon` - License badge
- `img.shields.io/github/actions/workflow/status/TomyCesaille/react-site-icon/ci.yml` - CI status badge

---

*Integration audit: 2026-04-19*
