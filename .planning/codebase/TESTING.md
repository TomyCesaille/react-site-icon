# Testing Patterns

**Analysis Date:** 2026-04-19

## Test Framework

**Runner:**
- Vitest ^4.1.4
- Config: `vitest.config.ts`
- Environment: `jsdom` (via `jsdom` ^29.0.2)
- Globals: `true` (no need to import `describe`, `it`, `expect`, `vi`)
- TypeScript globals: `"types": ["vitest/globals"]` in `tsconfig.json`

**Assertion Library:**
- Vitest built-in `expect` (Jest-compatible)
- `@testing-library/jest-dom` ^6.9.1 for DOM matchers (`.toBeInTheDocument()`, `.toHaveAttribute()`, `.toHaveStyle()`, `.toHaveTextContent()`, `.toHaveClass()`)

**Setup File:**
- `vitest.setup.ts`: imports `@testing-library/jest-dom/vitest` to register custom matchers

**Run Commands:**
```bash
npm run test              # Run all tests once (vitest run)
npm run test:watch        # Watch mode (vitest)
npm run test:exports      # Export validation (attw --pack .)
```

## Test File Organization

**Location:**
- Co-located with source: test files live next to the component they test
- `src/SiteIcon.test.tsx` tests `src/SiteIcon.tsx`

**Naming:**
- `{ComponentName}.test.tsx` for React component tests
- Match the source file name exactly

**Structure:**
```
src/
├── index.ts              # Barrel export (not tested directly)
├── SiteIcon.tsx           # Component source
└── SiteIcon.test.tsx      # Component tests
```

**Include Pattern:**
- Vitest config: `include: ['src/**/*.test.{ts,tsx}']`

## Test Structure

**Suite Organization:**
```typescript
// -- Helpers --
function simulateImageLoad(img: HTMLImageElement, naturalWidth: number): void { ... }
function simulateImageError(img: HTMLImageElement): void { ... }

// -- Constants --
const CDN_HOST = 't1.gstatic.com/faviconV2';

describe('SiteIcon', () => {
  // ===== SECTION NAME =====
  describe('section name', () => {
    it('does specific thing', () => { ... });
    it('handles edge case', () => { ... });
  });
});
```

**Patterns:**
- Single top-level `describe` matching the component name
- Nested `describe` blocks for feature groups, organized by:
  - Strategy variants: `'lazy strategy'`, `'eager strategy'`, `'hidden strategy'`
  - Behaviors: `'domain normalization'`, `'SSR'`, `'ref and props'`, `'onResolved callback'`, `'domain change'`, `'hydration (pre-loaded images)'`, `'default props'`
- Section dividers with `// ===== UPPERCASE NAME =====` comments
- No `beforeEach` / `afterEach` at the top level; only used in specific `describe` blocks when needed (e.g., hydration tests use `afterEach` to restore spies)
- Each test is self-contained: renders, simulates, asserts

**Test Naming:**
- Start with a verb describing the behavior: `'renders fallback and hidden detection img during loading'`
- Describe expected outcome, not implementation: `'calls with true when favicon found'`
- Edge cases explicitly named: `'shows fallback for whitespace-only string domain'`

## Rendering

**Library:** `@testing-library/react` ^16.3.2

**Pattern:** Use `render()` and access `container` for DOM queries:
```typescript
const { container } = render(
  <SiteIcon domain="github.com" fallback={<span>FB</span>} />,
);
const img = container.querySelector('img')!;
```

**DOM Queries:**
- Use `container.querySelector()` and `container.querySelectorAll()` for element access
- Non-null assertion `!` allowed in tests (ESLint rule relaxed)
- No `screen` usage; `container` is the primary query surface
- Attribute selectors for specific elements: `container.querySelector('span[style*="inline-block"]')`

**Rerender Pattern:**
```typescript
const { container, rerender } = render(
  <SiteIcon domain="a.com" fallback={<span>FB</span>} onResolved={onResolved} />,
);
// ... simulate something ...
rerender(
  <SiteIcon domain="b.com" fallback={<span>FB</span>} onResolved={onResolved} />,
);
```

**SSR Testing:**
```typescript
import { renderToString } from 'react-dom/server';

const html = renderToString(
  <SiteIcon domain="github.com" fallback={<span>Loading...</span>} />,
);
expect(html).toContain('Loading...');
```

## Mocking

**Framework:** Vitest built-in `vi` (global)

**Image Event Simulation (core pattern):**
```typescript
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

This is the central testing pattern: the component relies on `naturalWidth` after image load to detect Google's globe fallback. Tests simulate this by setting `naturalWidth` via `Object.defineProperty` before firing the `load` event.

**Prototype Spying (hydration tests):**
```typescript
let completeSpy: ReturnType<typeof vi.spyOn>;
let naturalWidthSpy: ReturnType<typeof vi.spyOn>;

// In test:
completeSpy = vi
  .spyOn(HTMLImageElement.prototype, 'complete', 'get')
  .mockReturnValue(true);
naturalWidthSpy = vi
  .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
  .mockReturnValue(64);

// Cleanup:
afterEach(() => {
  completeSpy?.mockRestore();
  naturalWidthSpy?.mockRestore();
});
```

**Callback Spies:**
```typescript
const onResolved = vi.fn();
render(<SiteIcon domain="github.com" onResolved={onResolved} />);
// ... simulate load ...
expect(onResolved).toHaveBeenCalledWith(true);
expect(onResolved).toHaveBeenCalledTimes(1);
```

**What to Mock:**
- Image `naturalWidth` property (to simulate CDN responses)
- Image `complete` property (to simulate pre-cached/hydration scenarios)
- Callback functions (`vi.fn()`) to verify invocation

**What NOT to Mock:**
- React rendering pipeline
- DOM events (use `fireEvent` from testing-library)
- The component itself (always render the real component)
- URL construction (test via attribute assertions on rendered `src`)

## Fixtures and Factories

**Test Data:**
- Constants defined at top of test file: `const CDN_HOST = 't1.gstatic.com/faviconV2';`
- Domain strings inline: `'github.com'`, `'gitlab.com'`, `'a.com'`, `'b.com'`
- Fallback elements inline: `<span>FB</span>`
- No external fixture files or factory functions

**Magic Numbers:**
- `64`: represents a real favicon naturalWidth (favicon found)
- `16`: represents Google's globe fallback naturalWidth (favicon missing)
- `0`: represents a failed image load naturalWidth
- `24`: minimum fetch size for detection accuracy

## Coverage

**Requirements:** None enforced via config. No coverage thresholds configured in `vitest.config.ts`.

**CI Enforcement:** Tests must pass (`npm run test`), but no minimum coverage percentage.

**View Coverage:**
```bash
npx vitest run --coverage     # Not configured but available via Vitest
```

## Test Types

**Unit Tests:**
- All tests are unit tests exercising the `SiteIcon` component
- Test individual behaviors: rendering states, prop handling, normalization, callbacks
- Synchronous: no async/await needed (events fire synchronously in jsdom)
- Test file: `src/SiteIcon.test.tsx` (644 lines, 40+ test cases)

**SSR Tests:**
- Server-side rendering tested via `renderToString` from `react-dom/server`
- Verifies initial HTML output contains expected content
- Lives within the same test file under `describe('SSR', ...)`

**Integration Tests:**
- Not present. The library is a single component with no service dependencies.

**E2E Tests:**
- Not used. The demo site (`docs/`) and `examples/basic/` are manual validation only.

**Export Validation:**
- `npm run test:exports` uses `@arethetypeswrong/cli` (`attw --pack .`)
- Validates dual ESM/CJS exports and type declarations are correct
- Runs in CI as a quality gate

## Common Patterns

**Parameterized Testing:**
```typescript
it.each([12, 24, 28, 32, 40, 48, 50, 64, 96, 128] as const)(
  'fetches size=%i directly (no workaround needed)',
  (s) => {
    const { container } = render(<SiteIcon domain="github.com" size={s} />);
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute(
      'src',
      expect.stringContaining('size=' + String(s)),
    );
  },
);
```

**Attribute Assertion with Partial Match:**
```typescript
expect(img).toHaveAttribute('src', expect.stringContaining(CDN_HOST));
expect(img).toHaveAttribute('src', expect.stringContaining('url=http://github.com'));
```

**Negative Assertions:**
```typescript
expect(container.querySelector('img')).toBeNull();
expect(container.querySelector('span')).toBeNull();
expect(img.getAttribute('src')).not.toContain('/user/repo');
```

**Style Assertions:**
```typescript
expect(detectionImg).toHaveStyle({ display: 'none' });
expect(span).toHaveStyle({ display: 'inline-block', width: '24px', height: '24px' });
```

**Ref Forwarding Test:**
```typescript
import { createRef } from 'react';

const ref = createRef<HTMLImageElement>();
const { container } = render(<SiteIcon domain="github.com" ref={ref} />);
// ... simulate found state ...
expect(ref.current).toBeInstanceOf(HTMLImageElement);
```

**Stale Event Handling Test:**
```typescript
const { container, rerender } = render(<SiteIcon domain="a.com" ... />);
const oldImg = container.querySelector('img')!;
rerender(<SiteIcon domain="b.com" ... />);
// Simulate the OLD domain's image loading -- should be ignored
simulateImageLoad(oldImg, 64);
// Assert component still shows loading state for b.com
```

## Test Organization by Feature

| describe Block | Tests | What It Validates |
|----------------|-------|-------------------|
| `lazy strategy` | 4 | Loading state, found, globe detection, error |
| `eager strategy` | 4 | Visible during loading, found, globe detection, error |
| `hidden strategy` | 4 | Sized placeholder, found, globe detection, error |
| `domain normalization` | 8 | URL parsing, protocols, ports, empty/whitespace, subdomains |
| `SSR` | 2 | Server render includes fallback and detection img |
| `ref and props` | 3 | Ref forwarding, restProps spreading, size attributes |
| `onResolved callback` | 4 | Called with true/false for found/globe/error/empty |
| `domain change` | 2 | Stale load ignored, reset to loading |
| `hydration (pre-loaded images)` | 5 | Pre-cached image detection for lazy/eager, globe, error |
| `default props` | 6 | Default strategy/size, size=16 workaround, parameterized sizes |

**Total: ~42 test cases in a single test file.**

---

*Testing analysis: 2026-04-19*
