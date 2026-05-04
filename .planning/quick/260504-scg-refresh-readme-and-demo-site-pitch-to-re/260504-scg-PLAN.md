---
plan_id: 260504-scg
title: Refresh README and demo site pitch to reflect full library value
type: quick
status: planned
created: 2026-05-04
mode: quick
---

# Plan: Refresh README and demo site pitch

## Goal

The current pitch (README "Why" + demo site hero subtitle + "Why react-site-icon?" bullets) frames the library around a single insight — "no other lib does reliable fallback detection." That undersells the lib. The actual `SiteIcon.tsx` source embodies several non-obvious behaviors that make favicons "just work":

- Auto-bumps the CDN fetch size to 24 when `size=16` (otherwise the real icon and Google's globe are both 16px and indistinguishable).
- Exposes only Google-supported sizes (`SiteIconSize` whitelist) so icons are never blurry-upscaled.
- `URL`-based domain normalization — accepts hostname, full URL, URL with path.
- Three render strategies for layout-shift control (`lazy`/`eager`/`hidden`).
- Hydration-aware: post-mount `.complete` check via ref-callback handles SSR pre-fetched / browser-cached images.
- Stale-domain guard: rapid prop changes never show the wrong icon.
- Single CDN request — no canvas, no CORS hacks, no waterfall.

Reframe the pitch from **"we solved fallback detection"** to **"favicons sound easy; they aren't — we hide the mess."** Keep the existing globe-detection diagram and "Why other approaches fail" section as the deep-dive — they're great content, just no longer the only story.

User has confirmed:
- **Voice:** keep current concise/technical tone (no marketing fluff).
- **Hero subtitle (demo site):** `"Display any site's favicon effortlessly. Zero deps. < 1KB"`

## Files

- `README.md` — rewrite the opening tagline and the "Why" section's leading paragraph + add a "What it handles for you" bulleted list before the technical deep-dive. Keep the diagram and "Why other approaches fail" intact.
- `docs/src/pages/index.astro` — update hero subtitle to the user-approved line; expand the `.why` `<ul>` from 3 generic bullets to 5 concrete bullets that name the hidden work.

## Tasks

### Task 1 — Rewrite README pitch

**Files:** `README.md`

**Action:**

1. Replace the line-3 tagline:
   - **From:** `A React component to display any website's favicon from its domain. Zero dependencies. < 1KB.`
   - **To:** `Display any site's favicon effortlessly. One prop in, the right icon out. Zero dependencies. < 1KB.`

2. Replace the "## Why" opening paragraph (currently a single sentence about fallback detection). New structure:

   ```markdown
   ## Why

   Favicons sound easy. They aren't. Different CDNs, missing icons, blurry upscales, layout shift, SSR caching, default-globe placeholders that look like real favicons — most "just give me a favicon" libraries punt on these.

   **`react-site-icon` handles them for you:**

   - **Reliable fallback detection.** Distinguishes real favicons from Google's default globe via a `naturalWidth` check (see [How it works](#how-it-works) below) — no other React favicon library does this.
   - **Sharp at every size.** Only exposes sizes Google's CDN actually serves (`12 | 16 | 24 | 28 | 32 | 40 | 48 | 50 | 64 | 96 | 128`) — no blurry upscaling. At `size={16}` the lib transparently fetches `24px` so detection still works, then renders at the size you asked for.
   - **Forgiving domain input.** `"github.com"`, `"https://github.com"`, `"https://github.com/user/repo"` — all work. Internally normalized to hostname.
   - **Three render strategies.** Pick `lazy` (fallback during load), `eager` (fastest paint), or `hidden` (zero layout shift).
   - **SSR + hydration aware.** Renders fallback on the server. Post-mount, checks `img.complete` via a ref callback so browser-cached / SSR-prefetched images don't get stuck on the fallback.
   - **Stale-prop safe.** Change `domain` mid-load and you'll never see the previous domain's icon flash through.
   - **One CDN request.** No canvas pixel-comparison, no `crossOrigin` tainting, no second fetch to the target domain.

   ### How it works
   ```

3. Rename the existing `## Why` H2 deep-dive content (the diagram + "Why other approaches fail") to live under a new `### How it works` H3 inside the same `## Why` section. Keep all of that content verbatim — it's the technical proof, just demoted from headline to deep-dive.

**Verify:**
- `grep -c "fallback detection" README.md` still finds the term (we kept the diagram).
- `grep "naturalWidth" README.md` still finds the original detection explanation.
- `grep "Display any site's favicon effortlessly" README.md` finds the new tagline.
- `grep "Sharp at every size" README.md` finds the new bullet.
- README still has exactly one `## Why` H2 (no duplicates from the rewrite).

**Done when:** README opens with the broader pitch, lists 7 concrete things the lib handles, and still contains the technical deep-dive (diagram + alternatives table).

---

### Task 2 — Refresh demo site hero + Why bullets

**Files:** `docs/src/pages/index.astro`

**Action:**

1. Update the hero subtitle (line ~37):
   - **From:** `<p class="subtitle">Zero dependencies. &lt; 1KB.</p>`
   - **To:** `<p class="subtitle">Display any site's favicon effortlessly. Zero deps. &lt; 1KB.</p>`

2. Replace the three `<li>` items in the `.why ul` with five concrete bullets that name the hidden work, in this order:

   ```html
   <ul>
     <li>Reliably distinguishes real favicons from Google's default globe — no other lib does.</li>
     <li>Sharp at every size. Auto-bumps the fetch to 24px when you ask for 16px so detection still works.</li>
     <li>Accepts any domain shape — hostname, URL, URL with path. Normalized internally.</li>
     <li>SSR-safe and hydration-aware. Cached or prefetched images don't get stuck on the fallback.</li>
     <li>&lt; 1KB minified + gzipped. Zero runtime dependencies. Works with React 17, 18, and 19.</li>
   </ul>
   ```

3. Do NOT touch the corner banner, badges, footer, or any CSS — copy-only edits.

**Verify:**
- `grep "effortlessly" docs/src/pages/index.astro` finds the new subtitle.
- `grep "Auto-bumps" docs/src/pages/index.astro` finds the size-bump bullet.
- `grep -c "<li>" docs/src/pages/index.astro` returns exactly 5 (was 3).
- `cd docs && npx astro build` exits 0.

**Done when:** Demo site hero shows the new subtitle and the "Why react-site-icon?" section lists 5 specific value bullets.

---

## must_haves

### truths
- README's opening tagline reads "Display any site's favicon effortlessly. One prop in, the right icon out. Zero dependencies. < 1KB."
- README's `## Why` section opens with "Favicons sound easy. They aren't." paragraph.
- README contains a bulleted list of at least 7 specific behaviors the lib handles, including "Reliable fallback detection", "Sharp at every size", "Forgiving domain input", "Three render strategies", "SSR + hydration aware", "Stale-prop safe", and "One CDN request".
- README still contains the existing globe-detection ASCII diagram and "Why other approaches fail" content (now under `### How it works`).
- Demo site hero subtitle reads "Display any site's favicon effortlessly. Zero deps. < 1KB." (with `&lt;` HTML entity).
- Demo site `.why ul` has exactly 5 `<li>` elements covering: globe detection, size auto-bump at 16, domain input flexibility, SSR/hydration awareness, bundle/zero-deps/React-versions.
- No code under `src/` is modified.
- No new dependencies added.

### artifacts
- `README.md` — rewritten opening + Why intro + new `### How it works` subsection containing the existing deep-dive.
- `docs/src/pages/index.astro` — hero subtitle and `.why ul` updated; nothing else changed.

### key_links
- Source of truth for the lib's behavior: `src/SiteIcon.tsx` (currently 203 lines).
- Existing "Why" framing being replaced: `README.md:26-50`.
- Existing demo-site hero: `docs/src/pages/index.astro:36-37`.
- Existing demo-site bullets: `docs/src/pages/index.astro:55-59`.

## Out of scope

- Comparison table at the bottom of README (`## Compare`) — leave as-is; can be revisited later.
- API table — leave as-is; the technical reference is fine.
- Strategies section — leave as-is.
- The library's source code (`src/`) — pitch refresh is documentation-only.
- The corner banner, badges, footer, theme toggle — all untouched.
- Other badges' clickability — only the npm one was approved last task.
