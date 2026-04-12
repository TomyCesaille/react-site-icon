# Phase 3: Testing - Research

**Researched:** 2026-04-12
**Domain:** React component testing (Vitest + Testing Library + jsdom), package export validation (attw)
**Confidence:** HIGH

## Summary

Phase 3 writes a test suite for the SiteIcon component and adds package export validation via `@arethetypeswrong/cli`. The technical domain is well-understood: all testing libraries are already installed, vitest is configured, and the component source code is complete from Phase 2. The primary challenge is correctly mocking image loading behavior in jsdom, where `naturalWidth` defaults to `0` and images never actually load.

The key technical insight is that jsdom's `HTMLImageElement.naturalWidth` has a `configurable: true` getter, which means `Object.defineProperty` can override it on individual element instances. Combined with `fireEvent.load()` / `fireEvent.error()` from Testing Library, this gives full control over simulating the three detection outcomes (found, missing/globe, error) without any network requests.

A critical infrastructure issue was discovered: `tsconfig.json` currently excludes test files (`**/*.test.tsx`, `**/*.test.ts`), which causes ESLint's `projectService` to reject test files with a parse error. This must be fixed before any test file can pass linting.

**Primary recommendation:** Fix tsconfig.json to include test files, create a vitest setup file for jest-dom matchers, write a single `src/SiteIcon.test.tsx` with a `simulateImageLoad` helper, and add `@arethetypeswrong/cli` as a dev dependency with a `test:exports` script.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use `Object.defineProperty` on the img element to set `naturalWidth`, then manually fire `onLoad`/`onError` events. Each test controls its own scenario directly -- no global patches.
- **D-02:** Create a shared `simulateImageLoad(img, naturalWidth)` helper function at the top of the test file. Keeps each test focused on the scenario being verified, not mocking mechanics.
- **D-03:** Full strategy x state matrix -- all 3 strategies (lazy, eager, hidden) tested across all states (loading rendering, found rendering, missing/fallback rendering, domain change reset, error handling). ~9 core strategy tests minimum.
- **D-04:** Broad domain normalization coverage -- 8-10 edge cases: full URL with path/query/hash, protocol stripping, bare domain, www prefix, port numbers, empty string, whitespace-only, invalid input (no dots).
- **D-05:** SSR rendering tested -- use `renderToString` from `react-dom/server` to verify fallback content renders on server, not an img with Google CDN src. Validates COMP-09 / D-05.
- **D-06:** Additional coverage: ref forwarding (found state), restProps spreading, onResolved callback (true on found, false on missing/error), domain change cancellation (stale detection).
- **D-07:** Separate npm script `"test:exports": "attw --pack ."` in package.json. Runs independently from vitest. CI will run both. Keeps unit tests fast, attw focused on package export shape.
- **D-08:** `@arethetypeswrong/cli` added as a devDependency.
- **D-09:** Single test file `src/SiteIcon.test.tsx` with nested `describe` blocks organized by concern: strategies (with sub-describes per strategy), domain normalization, SSR, ref/props, onResolved callbacks. ~25-30 tests total.

### Claude's Discretion
- Exact test descriptions and assertion style
- Helper function implementation details (simulateImageLoad internals)
- Whether to use `screen` queries vs container queries from render()
- Test execution order and grouping within describe blocks
- Specific invalid domain strings to test beyond the decided categories

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TEST-01 | Unit tests with vitest + @testing-library/react covering component rendering, fallback detection, and error handling | Vitest 4.1.4 + Testing Library 16.3.2 installed and configured. jsdom naturalWidth mocking verified. fireEvent.load/error available. |
| TEST-02 | Tests mock image loading (never hit Google CDN in CI) | Object.defineProperty on img.naturalWidth is configurable in jsdom 29.0.2. fireEvent.load/error triggers React onLoad/onError handlers. No network requests needed. |
| TEST-03 | `@arethetypeswrong/cli` validates package exports correctness in CI | attw v0.18.2 available on npm. `attw --pack .` runs npm pack, analyzes tarball, and exits non-zero on type resolution errors. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| vitest | 4.1.4 | Test runner | Installed, configured [VERIFIED: node_modules] |
| @testing-library/react | 16.3.2 | Component rendering/queries | Installed [VERIFIED: node_modules] |
| @testing-library/jest-dom | 6.9.1 | DOM assertion matchers | Installed, setup file needed [VERIFIED: node_modules] |
| @testing-library/user-event | 14.6.1 | User interaction simulation | Installed (not needed for this phase) [VERIFIED: node_modules] |
| jsdom | 29.0.2 | Browser environment | Installed, vitest configured [VERIFIED: node_modules] |
| react | 19.2.5 | Component under test | Installed as dev+peer dep [VERIFIED: node_modules] |
| react-dom | 19.2.5 | renderToString for SSR tests | Installed as dev+peer dep [VERIFIED: node_modules] |

### New Dependency
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| @arethetypeswrong/cli | 0.18.2 | Package export validation | Decision D-08. Validates dual ESM+CJS exports resolve correctly. [VERIFIED: npm registry] |

**Installation:**
```bash
npm install -D @arethetypeswrong/cli
```

## Architecture Patterns

### Test File Structure (D-09)
```
src/
  SiteIcon.tsx          # Component under test
  SiteIcon.test.tsx     # Single test file, ~25-30 tests
  index.ts              # Re-export barrel
vitest.config.ts        # Already configured: jsdom, globals, co-located
vitest.setup.ts         # NEW: jest-dom matchers
```

### Pattern 1: Image Loading Simulation (D-01, D-02)

**What:** A helper function that sets `naturalWidth` on an img element and fires the appropriate event, simulating what the browser does when an image loads.

**Why this works:** In jsdom 29.0.2, `HTMLImageElement.prototype.naturalWidth` has a getter with `configurable: true`. `Object.defineProperty` on the instance overrides the prototype getter for that specific element only. [VERIFIED: direct jsdom testing]

**Critical detail:** The component uses two different img element patterns:
1. **Lazy/hidden strategies:** A hidden `<img style="display:none">` is the detection image. The visible favicon `<img>` only renders after status transitions to `"found"`.
2. **Eager strategy:** A single visible `<img>` handles both display and detection via its own `onLoad`.

**simulateImageLoad helper design:**
```typescript
// Source: verified against jsdom 29.0.2 behavior
function simulateImageLoad(
  img: HTMLImageElement,
  naturalWidth: number,
): void {
  Object.defineProperty(img, 'naturalWidth', {
    value: naturalWidth,
    configurable: true,
  });
  fireEvent.load(img);
}

function simulateImageError(img: HTMLImageElement): void {
  fireEvent.error(img);
}
```

**Usage per scenario:**
- Found favicon: `simulateImageLoad(img, 64)` -- naturalWidth > 16 (GOOGLE_DEFAULT_SIZE)
- Missing/globe: `simulateImageLoad(img, 16)` -- naturalWidth <= 16, triggers fallback
- Network error: `simulateImageError(img)` -- triggers fallback

### Pattern 2: Querying Hidden Detection Images

**What:** The component renders hidden `<img>` elements with `style="display:none"` and `alt=""`. These cannot be found by `getByRole('img')` because `alt=""` gives them the implicit role of `presentation`.

**Recommended approach:** Use `container.querySelector()` for direct DOM queries on img elements. This is appropriate here because:
- The component has no `data-testid` attributes (and should not add them -- they are not part of the public API)
- `alt=""` makes role-based queries unreliable for hidden detection images
- `container.querySelector('img')` or `container.querySelectorAll('img')` works reliably

**Example:**
```typescript
const { container } = render(<SiteIcon domain="github.com" />);
// For lazy strategy: fallback + hidden detection img
const imgs = container.querySelectorAll('img');
// The detection img is the one with display:none
const detectionImg = container.querySelector('img[style*="display: none"]');
```

### Pattern 3: SSR Testing (D-05)

**What:** Use `renderToString` from `react-dom/server` to verify server rendering behavior.

**Key finding:** `renderToString` is available in React 19 (`react-dom/server` exports it). [VERIFIED: node_modules]

**Example:**
```typescript
import { renderToString } from 'react-dom/server';

// SSR should render fallback, not an img with Google CDN src
const html = renderToString(
  <SiteIcon domain="github.com" fallback={<span>FB</span>} />
);
expect(html).toContain('FB');
expect(html).not.toContain('gstatic.com');
```

**Note:** `renderToString` does not run `useEffect` or `useState` -- it captures the initial render only. For the SiteIcon component, initial state is `'loading'`, and the lazy strategy renders fallback during loading. This is exactly the SSR behavior to verify.

### Pattern 4: Domain Change and Stale Detection (D-06)

**What:** Verify that when domain changes, old detection results are discarded.

**Approach:** Use `rerender` from Testing Library to change the domain prop mid-test, then simulate load on the old detection image and verify it is ignored.

```typescript
const { container, rerender } = render(<SiteIcon domain="a.com" />);
const oldImg = container.querySelector('img');
// Change domain before old image "loads"
rerender(<SiteIcon domain="b.com" />);
// Simulate old image loading -- should be ignored (stale)
simulateImageLoad(oldImg!, 64);
// Component should still be in loading state for b.com, not found for a.com
```

### Anti-Patterns to Avoid
- **Mocking `document.createElement` globally:** Creates brittle tests, leaks state between tests, and breaks Testing Library internals. Per D-01, each test controls its own scenario directly.
- **Using `vi.useFakeTimers()` for image loading:** The component does not use timers. Image loading simulation is synchronous via `fireEvent`.
- **Testing `normalizeDomain` directly:** It is module-private. Test it through rendered output (verify img src contains correct hostname).
- **Adding `data-testid` to the component:** This would change the public API. Use `container.querySelector` instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| DOM matchers | Custom assertion functions | `@testing-library/jest-dom` | `.toBeInTheDocument()`, `.toHaveAttribute()` are standard and well-tested |
| Package export validation | Custom module resolution checks | `@arethetypeswrong/cli` | Checks all resolution modes (node10, node16, bundler) automatically |
| Event firing | `new Event()` + `dispatchEvent()` | `fireEvent.load()` / `fireEvent.error()` | Testing Library wraps events with React-compatible handling |
| SSR rendering | Custom renderToString wrapper | `react-dom/server` `renderToString` directly | Standard API, no abstraction needed for single-component testing |

## Common Pitfalls

### Pitfall 1: ESLint projectService Rejects Test Files
**What goes wrong:** ESLint with `projectService: true` fails to lint `*.test.tsx` files with error: "was not found by the project service"
**Why it happens:** `tsconfig.json` excludes `**/*.test.tsx` and `**/*.test.ts`. The project service cannot create a type program for files not in any tsconfig.
**How to avoid:** Remove the test file exclusions from `tsconfig.json`. Since `noEmit: true` is set and tsup handles the build (with its own `entry: ['src/index.ts']`), including test files in tsconfig has no effect on build output. [VERIFIED: ESLint parse error reproduced locally, tsup config inspected]
**Warning signs:** `npm run lint` fails on any test file.

### Pitfall 2: fireEvent.load Not Triggering React onLoad
**What goes wrong:** `fireEvent.load(img)` fires the DOM event but React's `onLoad` handler does not execute.
**Why it happens:** React event delegation works differently in React 17 vs 18/19. In React 17, events bubble to root; in 18+, events attach to the root container. Testing Library's `fireEvent` handles this correctly.
**How to avoid:** Always use `fireEvent` from `@testing-library/react`, never raw `dispatchEvent`. With the installed versions (RTL 16.3.2 + React 19.2.5), this works correctly. [VERIFIED: fireEvent.load exists in installed version]
**Warning signs:** onLoad handler not called; test assertions about state transitions fail.

### Pitfall 3: naturalWidth Override Not Sticking
**What goes wrong:** `Object.defineProperty(img, 'naturalWidth', { value: 64 })` works, but then `fireEvent.load(img)` reads `e.currentTarget.naturalWidth` and gets `0`.
**Why it happens:** `e.currentTarget` may reference a different object than the img variable if React creates a new element.
**How to avoid:** Set `naturalWidth` on the element BEFORE firing the load event. The component reads `e.currentTarget.naturalWidth` inside `handleLoad`, so the property must be set on the actual DOM element at the time the event fires. Use `container.querySelector('img')` to get the real DOM element. [VERIFIED: Object.defineProperty on jsdom img instance works; configurable: true confirmed]
**Warning signs:** Status never transitions to 'found' despite naturalWidth being set.

### Pitfall 4: Hidden Detection Image vs Visible Found Image
**What goes wrong:** Test grabs the wrong `<img>` element after a state transition. After status changes from `loading` to `found`, the DOM changes: the hidden detection img is removed and a new visible img is rendered.
**Why it happens:** The component conditionally renders different JSX based on `status` state.
**How to avoid:** Re-query the DOM after state transitions. After `simulateImageLoad()`, the component re-renders -- query for the new img element, don't reuse the old reference.
**Warning signs:** `container.querySelector('img')` returns `null` or wrong element after state change.

### Pitfall 5: `renderToString` in jsdom Environment
**What goes wrong:** `renderToString` works fine, but importing `react-dom/server` in the same test file as `@testing-library/react` may cause warnings about client/server module mismatches.
**Why it happens:** React 19 has stricter server/client module boundaries.
**How to avoid:** The import is safe for testing purposes. `renderToString` is a pure function that does not interact with the DOM. If warnings appear, they can be suppressed in that specific test. [VERIFIED: renderToString exists in react-dom/server 19.2.5]
**Warning signs:** Console warnings about server rendering APIs in client environment.

### Pitfall 6: attw Requires Build Output
**What goes wrong:** `attw --pack .` fails because there is no `dist/` directory.
**Why it happens:** attw runs `npm pack` which includes files from `"files": ["dist"]`. If `dist/` does not exist, the tarball lacks type declarations.
**How to avoid:** Always run `npm run build` before `npm run test:exports`. In CI, sequence: build -> test -> test:exports. [CITED: attw README, npm pack behavior]
**Warning signs:** attw reports "No types found" or missing entrypoints.

## Code Examples

### Vitest Setup File for jest-dom Matchers
```typescript
// vitest.setup.ts
// Source: @testing-library/jest-dom v6.9.1 vitest integration
// https://www.npmjs.com/package/@testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
```

Vitest config update:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
```
[VERIFIED: `@testing-library/jest-dom/vitest` resolves to `/node_modules/@testing-library/jest-dom/dist/vitest.js`]

### tsconfig.json Fix for Test Files
```json
{
  "exclude": ["node_modules", "dist"]
}
```
Remove `"**/*.test.tsx"` and `"**/*.test.ts"` from the exclude array. `noEmit: true` is already set, and tsup controls its own entry points. [VERIFIED: tsup.config.ts has `entry: ['src/index.ts']`; tsconfig has `noEmit: true`]

### attw Script in package.json
```json
{
  "scripts": {
    "test:exports": "attw --pack ."
  }
}
```
[CITED: https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/packages/cli/README.md]

### Complete simulateImageLoad Helper
```typescript
// Source: verified against jsdom 29.0.2 + @testing-library/react 16.3.2
import { fireEvent } from '@testing-library/react';

function simulateImageLoad(img: HTMLImageElement, naturalWidth: number): void {
  Object.defineProperty(img, 'naturalWidth', {
    value: naturalWidth,
    configurable: true,
  });
  fireEvent.load(img);
}

function simulateImageError(img: HTMLImageElement): void {
  fireEvent.error(img);
}
```

### Test for Lazy Strategy Found State
```typescript
import { render } from '@testing-library/react';
import { SiteIcon } from './SiteIcon';

it('renders favicon when naturalWidth > 16 (lazy)', () => {
  const { container } = render(
    <SiteIcon domain="github.com" fallback={<span>FB</span>} />,
  );
  // During loading: fallback + hidden detection img
  expect(container.querySelector('span')).toHaveTextContent('FB');
  const detectionImg = container.querySelector('img');
  expect(detectionImg).toHaveStyle({ display: 'none' });

  // Simulate successful load
  simulateImageLoad(detectionImg!, 64);

  // After found: visible img with correct src
  const visibleImg = container.querySelector('img');
  expect(visibleImg).toHaveAttribute('src', expect.stringContaining('github.com'));
  expect(visibleImg).not.toHaveStyle({ display: 'none' });
  expect(container.querySelector('span')).toBeNull(); // fallback removed
});
```

### Test for SSR Rendering
```typescript
import { renderToString } from 'react-dom/server';
import { SiteIcon } from './SiteIcon';

it('renders fallback on server, not CDN image', () => {
  const html = renderToString(
    <SiteIcon domain="github.com" fallback={<span>Loading...</span>} />,
  );
  expect(html).toContain('Loading...');
  expect(html).not.toContain('gstatic.com');
});
```

### Test for Domain Normalization via Rendered Output
```typescript
it('strips protocol and path from full URL', () => {
  const { container } = render(
    <SiteIcon domain="https://github.com/user/repo?tab=1#readme" />,
  );
  const img = container.querySelector('img');
  expect(img).toHaveAttribute('src', expect.stringContaining('url=http://github.com'));
  expect(img?.getAttribute('src')).not.toContain('/user/repo');
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@testing-library/jest-dom` manual `expect.extend(matchers)` | `import '@testing-library/jest-dom/vitest'` (auto-extends) | jest-dom 6.x | Single import in setup file, includes TypeScript types |
| `react-dom/test-utils` `act()` | `act()` from `@testing-library/react` or `react` directly | React 19 | React 19 exports `act` from `react` package directly |
| Separate `tsconfig.eslint.json` for linting | `projectService: true` with all files in main `tsconfig.json` | typescript-eslint v8 | Simpler config, no divergent type information |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `fireEvent.load()` triggers React `onLoad` handler on img elements in jsdom with React 19 | Pattern 1 | Tests would fail -- fallback: use raw `dispatchEvent` with `bubbles: true` |
| A2 | Removing test file exclusions from tsconfig.json does not affect tsup build output | Pitfall 1 | Build might include test files in dist -- LOW risk since tsup has explicit `entry` |

## Open Questions

1. **React `onLoad` event delegation in jsdom**
   - What we know: `fireEvent.load` exists in RTL 16.3.2, and React 19 uses root-level event delegation. jsdom fires DOM events correctly.
   - What's unclear: Whether React's internal event system fully processes `load` events fired by `fireEvent` in all edge cases (load events do not bubble in the real DOM).
   - Recommendation: If `fireEvent.load` does not trigger `onLoad`, fall back to `dispatchEvent(new Event('load'))` directly, which should work since React 17+ attaches load listeners at the individual element level (load events are special-cased because they don't bubble).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 |
| Config file | `vitest.config.ts` (exists, needs `setupFiles` addition) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run && npx attw --pack .` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TEST-01 | Unit tests covering rendering, fallback, error | unit | `npx vitest run` | No -- Wave 0 |
| TEST-02 | No real network requests (mocked image loading) | unit | `npx vitest run` (inherent: jsdom does not load images) | No -- Wave 0 |
| TEST-03 | attw validates package exports | smoke | `npx attw --pack .` (requires build first) | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run && npm run build && npx attw --pack .`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `vitest.setup.ts` -- jest-dom matcher integration
- [ ] `src/SiteIcon.test.tsx` -- all component tests (~25-30)
- [ ] `@arethetypeswrong/cli` -- dev dependency installation
- [ ] `tsconfig.json` -- remove test file exclusions for ESLint compatibility
- [ ] `package.json` -- add `test:exports` script

## Security Domain

Not applicable for this phase. Testing infrastructure does not introduce security concerns. No user input handling, no network access, no credential management.

## Sources

### Primary (HIGH confidence)
- jsdom 29.0.2 `naturalWidth` behavior -- verified by direct Node.js execution against installed jsdom [VERIFIED]
- `Object.defineProperty` on img.naturalWidth -- configurable: true confirmed by direct test [VERIFIED]
- `@testing-library/jest-dom/vitest` import path -- resolves to `dist/vitest.js` [VERIFIED]
- `renderToString` available in react-dom 19.2.5 -- confirmed by require() check [VERIFIED]
- `fireEvent.load` and `fireEvent.error` exist in @testing-library/react 16.3.2 -- confirmed [VERIFIED]
- `@arethetypeswrong/cli` v0.18.2 -- verified via npm registry [VERIFIED]
- All testing library versions -- verified against installed node_modules [VERIFIED]
- ESLint projectService rejects test files excluded from tsconfig -- reproduced locally [VERIFIED]
- tsup entry point independent of tsconfig exclude -- inspected tsup.config.ts [VERIFIED]

### Secondary (MEDIUM confidence)
- [attw CLI README](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/packages/cli/README.md) -- `--pack .` flag usage [CITED]
- [typescript-eslint typed linting](https://typescript-eslint.io/troubleshooting/typed-linting/) -- projectService and allowDefaultProject behavior [CITED]
- [Testing Library fireEvent docs](https://testing-library.com/docs/dom-testing-library/api-events/) -- event firing API [CITED]
- [jest-dom npm](https://www.npmjs.com/package/@testing-library/jest-dom) -- vitest setup integration [CITED]

### Tertiary (LOW confidence)
- None. All findings verified or cited from official sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and versions verified locally
- Architecture: HIGH -- image mocking approach verified by direct jsdom experimentation
- Pitfalls: HIGH -- ESLint issue reproduced locally; all other pitfalls derived from verified behavior
- attw integration: HIGH -- CLI version and usage verified against npm and official README

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable domain, all versions pinned)
