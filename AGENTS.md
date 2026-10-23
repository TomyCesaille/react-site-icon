# AGENTS

## Bundle size badge (check on every release)

The bundle size badge is hardcoded, not dynamic: the shields.io Bundlephobia badge (`img.shields.io/bundlephobia/minzip/...`) is almost always "rate limited by upstream service". It must be kept in sync by hand.

- **Where** — the same value appears in two places; update both:
  - `README.md`: `https://img.shields.io/badge/bundlephobia-903%20B-blue`
  - `docs/src/pages/index.astro` (demo site hero badges): same URL
- **Current value** — `903 B`, Bundlephobia's minified+gzipped size for `v1.0.0` and `v1.0.1` (identical `dist/index.js`).
- **What the number is** — Bundlephobia's own `gzip` figure. Bundlephobia re-bundles the ESM entry with webpack, so it does **not** match CI's `gzip -c dist/index.js | wc -c` (877 B for the same file). Never put the CI number on the badge.
- **How to check, as part of every release PR:**
  1. Compare the new build with the last published one:
     ```sh
     npm run build
     PREV=$(mktemp -d) && npm pack react-site-icon@latest --pack-destination "$PREV" --silent >/dev/null
     tar xzf "$PREV"/*.tgz -C "$PREV"
     cmp dist/index.js "$PREV/package/dist/index.js" && echo "unchanged: badge stays"
     ```
  2. If `dist/index.js` is unchanged, the badge stays. Say so in the PR.
  3. If it changed, Bundlephobia can only measure it once published. After the release, read the real value (the API works directly, only the shields proxy is rate-limited) and update both locations plus "Current value" above in a follow-up commit:
     ```sh
     curl -s 'https://bundlephobia.com/api/size?package=react-site-icon@<version>' | jq .gzip
     ```
