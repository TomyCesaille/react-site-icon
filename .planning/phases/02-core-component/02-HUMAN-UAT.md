---
status: partial
phase: 02-core-component
source: [02-VERIFICATION.md]
started: 2026-04-12T19:30:00Z
updated: 2026-04-12T19:30:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Live Favicon Resolution
expected: GitHub's octocat favicon renders as a visible image, not Google's default globe
result: [pending]

### 2. Fallback for Unknown Domain
expected: The fallback `<span>?</span>` renders after detection completes, not the default globe
result: [pending]

### 3. SSR Hydration Behavior
expected: Server HTML contains fallback content (not img). After hydration, detection runs and resolves to found or missing.
result: [pending]

### 4. Eager Strategy Visual Timing
expected: The img element is rendered immediately with the CDN src, before detection completes
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
