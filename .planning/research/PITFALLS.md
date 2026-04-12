# Domain Pitfalls

**Domain:** React npm component library (favicon resolver with Google faviconV2 CDN)
**Researched:** 2026-04-12

---

## Critical Pitfalls

Mistakes that cause broken installs for consumers, failed publishes, or architectural rewrites.

### Pitfall 1: Wrong package.json `exports` Field — Breaks Consumer Imports

**What goes wrong:** Consumers get "Cannot find module" or "Could not resolve" errors when importing the library. TypeScript users get no type completions. The package appears broken even though it works locally.

**Why it happens:** The `exports` field has strict ordering and conditional resolution rules that are unintuitive. Three specific mistakes dominate:

1. **`types` condition not listed first** in each export block. TypeScript resolves top-down and stops at the first match. If `import` appears before `types`, TypeScript never finds the declarations.
2. **Single `.d.ts` file for both ESM and CJS.** TypeScript interprets each declaration file as either ESM or CJS based on extension. A `.d.ts` paired with a `.cjs` entrypoint causes the CJS path to resolve to ESM-typed declarations, producing false type errors for consumers.
3. **Missing `.d.cts` file for the CJS entrypoint.** tsup generates `.d.ts` (ESM) and `.d.cts` (CJS) when configured correctly, but if `dts` is misconfigured, only `.d.ts` is emitted and the `require.types` path 404s.

**Consequences:** Package installs fine but imports fail for some (or all) consumers depending on their module resolution settings. TypeScript users with `moduleResolution: "node16"` or `"bundler"` are most affected.

**Prevention:**
```json
{
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  }
}
```

**Detection:** Run `npx @arethetypeswrong/cli --pack .` before every publish. It checks all TypeScript resolution modes (node10, node16-cjs, node16-esm, bundler) and flags mismatches. Add it to CI.

**Phase:** Must be correct in the initial build/packaging phase. Fixing later means a breaking change for consumers already importing the package.

**Confidence:** HIGH -- verified via official TypeScript docs, `arethetypeswrong` tool, and multiple practitioner reports.

---

### Pitfall 2: tsup Strips the `"use client"` Directive

**What goes wrong:** Next.js App Router users import the component and get the error: "You're importing a component that needs useState/useEffect. It only works in a Client Component but none of its parents are marked with 'use client'."

**Why it happens:** tsup (via esbuild) strips `"use client"` directives from source files during bundling. The directive is treated as a regular string expression and discarded. Since react-site-icon uses `useState`, `useEffect`, and `useRef`, it must be marked as a client component for RSC-aware frameworks.

**Consequences:** The library is unusable in Next.js 13+ App Router without the consumer manually wrapping it in their own `"use client"` file. This is the most common complaint in React library GitHub issues since 2023.

**Prevention:** Use the tsup `banner` option to inject the directive:
```typescript
// tsup.config.ts
export default defineConfig({
  banner: { js: '"use client";' },
  // ...
});
```

**Warning signs:** Test the built output by inspecting `dist/index.js` -- the first line must be `"use client";`. Automate this check in CI with a simple grep.

**Detection:** `head -1 dist/index.js` should output `"use client";`.

**Phase:** Build configuration phase. Must be set from the first release.

**Confidence:** HIGH -- confirmed via tsup issue #835, multiple React library repositories.

---

### Pitfall 3: npm Classic Tokens Revoked -- Publish Workflow Silently Fails

**What goes wrong:** GitHub Actions publish workflow authenticates with npm, appears to run, but npm rejects the token. The workflow may succeed (exit 0) without actually publishing because error handling around the publish step is insufficient.

**Why it happens:** npm permanently revoked all classic tokens on December 9, 2025. Tutorials, templates, and starter repos from before that date use `NPM_TOKEN` secrets containing classic automation tokens. These tokens no longer authenticate. New granular tokens have a maximum 90-day validity and require 2FA.

**Consequences:** You think the package published but it did not. Users report the version does not exist on npm.

**Prevention:** Use OIDC trusted publishing (no tokens stored in GitHub secrets):
1. Configure trusted publisher on npmjs.com at `https://www.npmjs.com/package/react-site-icon/access` (not the general settings page -- this specific URL is required).
2. Add `id-token: write` permission to the publish job.
3. Use npm CLI >= 11.5.1 (add `npm install -g npm@latest` step before publish).
4. Include `--provenance` flag explicitly (auto-generation is unreliable despite docs claiming otherwise).
5. Ensure `package.json` has a `repository` field matching the GitHub repo URL exactly.

**Detection:** After every publish, verify the version exists: `npm view react-site-icon version`. Add this as a post-publish step in CI.

**Phase:** CI/CD setup phase. Get this right before the first publish attempt.

**Confidence:** HIGH -- confirmed via npm changelog (Dec 9, 2025 revocation), multiple migration guides.

---

### Pitfall 4: React Peer Dependency Range Excludes Valid Versions

**What goes wrong:** Consumers on React 17 or React 19 get `ERESOLVE` errors during `npm install`. They must use `--legacy-peer-deps` to install, which erodes trust in the package.

**Why it happens:** Three specific mistakes:
1. **Too narrow range** like `"react": "^18.0.0"` -- excludes React 17 and 19.
2. **Too precise** like `"react": "18.2.0"` -- excludes even React 18.3.
3. **Forgetting `react-dom`** -- declaring `react` as peer dep but not `react-dom`, or declaring mismatched ranges between them.

**Consequences:** The library claims React 17-19 support (a project requirement) but npm disagrees. Users file issues or abandon the package. npm 7+ enforces peer deps strictly by default.

**Prevention:**
```json
{
  "peerDependencies": {
    "react": "^17.0.0 || ^18.0.0 || ^19.0.0",
    "react-dom": "^17.0.0 || ^18.0.0 || ^19.0.0"
  }
}
```

This component uses no APIs that changed between React 17-19 (`useState`, `useEffect`, `useRef`, `useCallback`, JSX). The `||` range syntax explicitly declares each major version as supported.

Do NOT include `react` or `react-dom` in `dependencies` or `devDependencies` for the published package. They belong only in `peerDependencies` (and `devDependencies` for testing, but the published `files` array should not include tests).

**Detection:** Test installation in fresh projects with React 17, 18, and 19 before the first publish. Automate with a matrix CI job.

**Phase:** Package configuration phase. Must be set correctly before first publish; changing peer deps later is a semver-minor change at best.

**Confidence:** HIGH -- standard npm behavior, confirmed across multiple sources.

---

### Pitfall 5: Accidentally Publishing Source, Tests, or Config Files to npm

**What goes wrong:** The published tarball contains `src/`, `tsconfig.json`, test files, `.github/`, or the entire docs site. Package size bloats from <1KB to hundreds of KB. In worst cases, secrets in `.env` files get published.

**Why it happens:** Without an explicit `files` field in `package.json`, npm publishes everything not excluded by `.gitignore` or `.npmignore`. Since this project has a single repo with library + demo site, the demo site and its dependencies could easily leak into the npm package.

**Consequences:** Violates the <1KB bundle size constraint. Consumers download unnecessary files. Possible exposure of CI config or environment details.

**Prevention:**
```json
{
  "files": ["dist"]
}
```

Use a whitelist (`files`), not a blacklist (`.npmignore`). Only the `dist/` directory should be in the published package. Always verify before publishing:
```bash
npm pack --dry-run
```

This lists every file that would be included. Add this as a CI step.

**Detection:** `npm pack --dry-run | wc -l` should show only dist files plus package.json/README/LICENSE. The tarball size should be well under 10KB for this library.

**Phase:** Package configuration phase, before first publish.

**Confidence:** HIGH -- standard npm best practice, confirmed via npm blog.

---

## Moderate Pitfalls

### Pitfall 6: Google faviconV2 Rate Limiting in Demo Site / Tests

**What goes wrong:** The demo site's interactive playground fires dozens of requests during user testing. Google's faviconV2 endpoint returns 429 or degraded responses after ~55 consecutive requests from the same IP.

**Why it happens:** Google's favicon API is undocumented and rate-limited. It is designed for Chrome's internal use, not as a public API. There is no published rate limit, no API key, and no way to increase quotas.

**Prevention:**
- Demo site: Debounce domain input (300-500ms) so typing "github.com" does not fire 10 requests.
- Demo site: Cache results in the browser (the `<img>` tag's natural browser cache handles this for repeated domains).
- Tests: Use mocked image responses, never hit Google's CDN in CI. Mock at the `<img>` `src` level by intercepting `onLoad`/`onError`.
- Document in README that this depends on Google's undocumented CDN and could change without notice.

**Detection:** If the demo site shows the fallback for domains that should have favicons, rate limiting may be the cause. Check the Network tab for 429 responses.

**Phase:** Demo site phase and testing phase.

**Confidence:** MEDIUM -- rate limit (~55 requests) reported by a single practitioner; no official documentation exists for this API's limits.

---

### Pitfall 7: `naturalWidth` Detection Fails on SSR / Pre-render

**What goes wrong:** The component tries to read `naturalWidth` during server-side rendering and either throws (no `Image` constructor in Node) or always returns 0, triggering the fallback for every domain.

**Why it happens:** `naturalWidth` is a browser-only DOM property. During SSR (Next.js, Remix, Astro SSR), the component renders on the server where `Image` objects and DOM properties do not exist. If the detection logic runs unconditionally, it breaks.

**Prevention:**
- Render the fallback on the server (safe default).
- Gate all `naturalWidth` logic behind `useEffect` (which only runs in the browser).
- Never read `naturalWidth` during render -- only in an `onLoad` callback within `useEffect`.
- The component must be a pure fallback-render on the server, then hydrate with the actual favicon check on the client.

**Detection:** Test with `@testing-library/react`'s `renderToString` or build a simple Next.js test page. If the fallback always shows, the SSR path is broken.

**Phase:** Core component implementation phase.

**Confidence:** HIGH -- standard React SSR behavior, and the PROJECT.md explicitly lists SSR-compatibility as a requirement.

---

### Pitfall 8: tsup Does Not Externalize React by Default

**What goes wrong:** The built bundle includes React itself (~40KB min+gzip). Consumers end up with two copies of React at runtime, causing the "hooks can only be called inside a function component" error and doubling their bundle size.

**Why it happens:** tsup bundles everything by default. If `react` and `react-dom` are not marked as `external`, tsup inlines them into the output. This is especially insidious because it "works" in local testing (where only one copy exists) but breaks in consumer projects.

**Prevention:**
```typescript
// tsup.config.ts
export default defineConfig({
  external: ['react', 'react-dom'],
  // ...
});
```

tsup does auto-externalize `peerDependencies` when `--external` is not set, but only if you are using the CLI flags. In `tsup.config.ts`, explicit is safer. Verify by checking that `dist/index.js` does not contain `React.createElement` or `jsx-runtime` code.

**Detection:** Check built output size. If `dist/index.js` is larger than ~5KB (for a <1KB component), React is likely bundled in. Also run `npx bundlephobia dist/index.js` or inspect the file directly.

**Phase:** Build configuration phase.

**Confidence:** HIGH -- confirmed via tsup docs, multiple library starters.

---

### Pitfall 9: Astro Demo Site 404s on GitHub Pages Due to Missing `base` Path

**What goes wrong:** Demo site deploys successfully but all pages return 404, or the index loads but CSS/JS assets are broken (white page with console errors).

**Why it happens:** GitHub Pages serves project repos under `https://username.github.io/repo-name/`. Astro generates asset paths relative to `/` by default. Without `base: '/repo-name'`, all asset references point to the wrong location.

**Prevention:**
```javascript
// astro.config.mjs (in /docs)
export default defineConfig({
  site: 'https://jorislacance.github.io',
  base: '/ReactThirdPartyDomainFavicon',
  // ...
});
```

Also in the GitHub Actions workflow, use the Astro action's `path` parameter to point to the docs subdirectory:
```yaml
- uses: withastro/action@v2
  with:
    path: ./docs
```

Ensure the lockfile for the docs directory is committed (the Astro action auto-detects package manager via lockfile).

**Detection:** After deploy, visit the GitHub Pages URL and check the browser console for 404 errors on JS/CSS assets.

**Phase:** Demo site / deployment phase.

**Confidence:** HIGH -- confirmed via Astro official deployment docs.

---

### Pitfall 10: Changesets "Version Packages" PR Blocked by Branch Protection

**What goes wrong:** The Changesets GitHub Action tries to create or update a "Version Packages" PR that bumps `package.json` version and updates `CHANGELOG.md`. Branch protection rules on `main` block the bot from pushing, and the PR is never created or is stuck.

**Why it happens:** Teams enable branch protection (require reviews, require status checks) on `main`. The `GITHUB_TOKEN` used by GitHub Actions does not have permission to bypass these protections. The changesets action needs to push commits directly to a PR branch and sometimes to `main`.

**Prevention:**
- Option A: Allow the GitHub Actions bot to bypass branch protection (simplest for solo/small projects).
- Option B: Use a Personal Access Token (PAT) or GitHub App token with bypass permissions as the `GITHUB_TOKEN` for the changesets action.
- Ensure the workflow has `contents: write` and `pull-requests: write` permissions.

**Detection:** The changesets action logs will show permission errors. The "Version Packages" PR will not appear or will not update after merging changesets.

**Phase:** CI/CD setup phase.

**Confidence:** HIGH -- well-documented in changesets/action repository.

---

## Minor Pitfalls

### Pitfall 11: `"sideEffects": false` Drops CSS in Consumer Builds

**What goes wrong:** If the library ever ships CSS (even a tiny reset or utility class), setting `"sideEffects": false` in package.json causes Webpack and Rollup to tree-shake the CSS import away, resulting in unstyled components.

**Why it happens:** Bundlers treat `sideEffects: false` as a promise that all code is pure. CSS imports are side-effectful by nature (they modify the global style sheet).

**Prevention:** For this specific project, the component has zero CSS (styling via `className`/`style` props). Set `"sideEffects": false` safely. But if CSS is ever added, change to:
```json
{ "sideEffects": ["**/*.css"] }
```

**Detection:** If consumers report unstyled components after tree-shaking, this is likely the cause.

**Phase:** Package configuration phase. Review if CSS is ever introduced.

**Confidence:** HIGH -- well-documented Webpack/Rollup behavior.

---

### Pitfall 12: tsup `dts` Generation Slow or Failing

**What goes wrong:** Build times balloon from <1 second to 5-30 seconds, or the build crashes with out-of-memory errors during `.d.ts` generation.

**Why it happens:** tsup's `--dts` flag runs a full TypeScript compilation pass under the hood (equivalent to `tsc --emitDeclarationOnly`). For larger entry points or complex types, this is slow. The `experimentalDts` option has known bugs producing broken declarations.

**Prevention:** For a tiny single-component library:
- Use `--dts` (stable), not `experimentalDts`.
- Keep the public API surface small (one component, one props interface).
- If dts becomes a bottleneck, consider running `tsc --emitDeclarationOnly` separately and letting tsup handle only the JS output.

**Detection:** If `tsup` build takes >5 seconds for a single-file library, dts generation is the bottleneck.

**Phase:** Build configuration phase.

**Confidence:** MEDIUM -- confirmed via tsup issues #945 and #1050, but this library is small enough that it is unlikely to be severely affected.

---

### Pitfall 13: `naturalWidth` Check Timing -- Reading Before Image Loads

**What goes wrong:** `naturalWidth` returns 0 even for valid favicons because the check runs before the image has finished loading.

**Why it happens:** The `<img>` element's `naturalWidth` is 0 until the image data is decoded. If you read it during render or in `useEffect` without waiting for the `onLoad` event, you always get 0 and always show the fallback.

**Prevention:** Only read `naturalWidth` inside the `<img>` element's `onLoad` callback:
```typescript
const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.naturalWidth <= 16) {
    // This is the default globe fallback
    setShowFallback(true);
  }
};
```

Never read `naturalWidth` synchronously in render or in a `useEffect` without the load event.

**Detection:** If fallback shows for all domains (not just unknown ones), this timing bug is almost certainly the cause.

**Phase:** Core component implementation phase.

**Confidence:** HIGH -- standard browser image loading behavior, and core to this library's detection mechanism.

---

### Pitfall 14: Forgetting `repository` Field Breaks npm Provenance and Linking

**What goes wrong:** npm publish with `--provenance` fails silently or with a cryptic error. The npm package page does not link back to the GitHub repository.

**Why it happens:** npm provenance verification matches the `repository` URL in `package.json` against the GitHub Actions OIDC claim. If they do not match, provenance attestation fails. Separately, npm uses this field to populate the "Repository" link on the package page.

**Prevention:**
```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/jorislacance/ReactThirdPartyDomainFavicon.git"
  }
}
```

The URL format must match exactly, including the `git+https://` prefix.

**Detection:** After first publish, check the npm package page for the repository link and the provenance badge.

**Phase:** Package configuration phase, before first publish.

**Confidence:** HIGH -- confirmed via npm trusted publishing docs and practitioner reports.

---

### Pitfall 15: Changesets Bot Not Commenting on PRs / Missing Changesets Not Caught

**What goes wrong:** PRs merge without changesets, so the next release does not include the change in the CHANGELOG or version bump. Features ship without documentation.

**Why it happens:** The Changesets bot (which comments on PRs missing changesets) must be installed as a GitHub App. Simply adding the GitHub Action is not enough -- the bot and the action are separate. Also, without a CI check that fails on missing changesets, it is purely advisory.

**Prevention:**
- Install the Changesets bot GitHub App on the repository.
- Add a CI check: `npx changeset status --since=main` that fails if there are unreleased changes without changesets.
- For this solo project, the simpler approach is to include `npx changeset` in the pre-push workflow as a reminder.

**Detection:** If the "Version Packages" PR never appears or its CHANGELOG entries are incomplete, changesets are being forgotten.

**Phase:** CI/CD setup phase.

**Confidence:** MEDIUM -- depends on project workflow discipline; less critical for a solo maintainer.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Core component | naturalWidth timing (#13), SSR crash (#7) | Gate all detection in onLoad + useEffect |
| Build config (tsup) | Missing "use client" (#2), React bundled in output (#8), slow dts (#12) | banner config, explicit external, verify dist output |
| Package.json setup | Wrong exports (#1), peer dep range (#4), files leaking (#5), sideEffects (#11), missing repository (#14) | Use exact exports template above, run attw + npm pack --dry-run in CI |
| CI/CD publishing | Dead npm tokens (#3), missing OIDC setup, branch protection blocking changesets (#10) | OIDC trusted publishing, explicit permissions, post-publish verification |
| Demo site | GitHub Pages 404 (#9), rate limiting in playground (#6) | Set base path, debounce input, use Astro action path param |
| Changesets | Forgotten changesets (#15), blocked version PR (#10) | Install bot, add CI status check |

---

## Sources

- [TypeScript Modules Reference -- types condition ordering](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
- [Are The Types Wrong? validation tool](https://arethetypeswrong.github.io/)
- [Dual Publishing ESM and CJS Modules with tsup -- John Reilly](https://johnnyreilly.com/dual-publishing-esm-cjs-modules-with-tsup-and-are-the-types-wrong)
- [TypeScript in 2025 ESM/CJS publishing -- Liran Tal](https://lirantal.com/blog/typescript-in-2025-with-esm-and-cjs-npm-publishing)
- [tsup "use client" banner -- tsup issue #835](https://github.com/egoist/tsup/issues/835)
- [tsup dts slow generation -- tsup issue #945](https://github.com/egoist/tsup/issues/945)
- [npm classic tokens revoked Dec 9, 2025](https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/)
- [npm trusted publishing OIDC -- Phil Nash](https://philna.sh/blog/2026/01/28/trusted-publishing-npm/)
- [npm trusted publishing docs](https://docs.npmjs.com/trusted-publishers/)
- [Google faviconV2 API analysis -- derlin](https://dev.to/derlin/get-favicons-from-any-website-using-a-hidden-google-api-3p1e)
- [Astro GitHub Pages deployment guide](https://docs.astro.build/en/guides/deploy/github/)
- [Astro GitHub Action -- withastro/action](https://github.com/withastro/action)
- [Changesets GitHub Action](https://github.com/changesets/action)
- [npm publishing what you mean -- npm blog](https://blog.npmjs.org/post/165769683050/publishing-what-you-mean-to-publish.html)
- [Guide to package.json exports field -- Hiroki Osame](https://hirok.io/posts/package-json-exports)
- [Webpack tree shaking sideEffects docs](https://webpack.js.org/guides/tree-shaking/)
