# Phase 3: Testing - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 03-testing
**Areas discussed:** Image loading mock approach, Test coverage matrix, attw integration, Test file organization

---

## Image Loading Mock Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Object.defineProperty on img | After render, grab the img element, define naturalWidth via Object.defineProperty, then fire onLoad/onError manually. Direct, no global patches. | ✓ |
| Global Image constructor mock | Replace window.Image with a mock class. Control naturalWidth and fire events from the mock. More isolated from DOM. | |
| Custom jsdom resource loader | Configure jsdom with a custom resource loader that intercepts image URLs and sets properties. Closest to real behavior but complex. | |

**User's choice:** Object.defineProperty on img
**Notes:** Chosen for directness — each test explicitly controls its scenario.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Shared helper function | A simulateImageLoad(img, naturalWidth) helper at the top of the test file. DRY without over-abstracting. | ✓ |
| Inline per test | Each test does its own Object.defineProperty + fireEvent. More verbose but fully self-contained. | |
| You decide | Claude picks the approach. | |

**User's choice:** Shared helper function
**Notes:** None.

---

## Test Coverage Matrix

| Option | Description | Selected |
|--------|-------------|----------|
| Full matrix | All 3 strategies × all states (found/missing/loading, domain change, error handling). ~9 core test cases. | ✓ |
| One strategy full, others light | Test lazy exhaustively, eager and hidden get 1-2 tests each. | |
| You decide | Claude picks coverage depth. | |

**User's choice:** Full matrix
**Notes:** None.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Broad coverage | 8-10 normalization cases: full URL, protocol strip, bare domain, www, ports, empty, whitespace, invalid. | ✓ |
| Key paths only | 4-5 cases: bare domain, full URL, empty, invalid. | |
| You decide | Claude picks. | |

**User's choice:** Broad coverage
**Notes:** None.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, verify fallback renders | Test renderToString produces fallback, not img with src. Validates COMP-09 / D-05. | ✓ |
| Skip SSR tests | SSR behavior implicit from useState initial state. | |
| You decide | Claude decides. | |

**User's choice:** Yes, verify fallback renders
**Notes:** None.

---

## attw Integration

| Option | Description | Selected |
|--------|-------------|----------|
| Separate npm script | Add `"test:exports": "attw --pack ."` to package.json. Runs independently from vitest. CI runs both. | ✓ |
| Vitest test case | A test file that shells out to attw. One `npm test` command runs all. | |
| CI-only check | attw runs only in GitHub Actions, not locally. | |

**User's choice:** Separate npm script
**Notes:** None.

---

## Test File Organization

| Option | Description | Selected |
|--------|-------------|----------|
| Single file, nested describes | One SiteIcon.test.tsx with nested describe blocks by concern. ~25-30 tests. | ✓ |
| Split by concern | Multiple files: SiteIcon.test.tsx, normalization.test.ts, exports.test.ts. | |
| You decide | Claude organizes however is most maintainable. | |

**User's choice:** Single file, nested describes
**Notes:** Component is 157 lines — one test file keeps everything together.

---

## Claude's Discretion

- Exact test descriptions and assertion style
- Helper function implementation details
- screen vs container queries
- Test execution order within describe blocks
- Specific invalid domain strings

## Deferred Ideas

None — discussion stayed within phase scope.
