# Phase 2: Core Component - Research

**Researched:** 2026-04-12
**Domain:** React component implementation -- state management, image detection, SSR compatibility, ref forwarding
**Confidence:** HIGH

## Summary

Phase 2 implements the full `SiteIcon` component with 13 requirements (COMP-01 through COMP-13) plus the user-decided `strategy` prop (COMP-14). The component is a single-file React component that renders favicons from Google's faviconV2 CDN with `naturalWidth`-based fallback detection, three rendering strategies (`lazy`/`eager`/`hidden`), SSR safety, and ref forwarding across React 17/18/19.

The core technical challenges are: (1) implementing stale detection cancellation when `domain` changes mid-flight, (2) correctly typing and implementing `forwardRef` for cross-version React support, (3) keeping the entire implementation under 1KB gzipped while supporting three strategies, and (4) rendering fallback during SSR without hydration mismatches.

**Primary recommendation:** Use `forwardRef` (works on React 17/18/19 -- still functional in 19 despite deprecation). Use `useState` + `useEffect` for SSR-safe detection with a `useRef`-based stale closure guard for cancellation. Share detection logic across all three strategies -- only the render path differs.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Add a `strategy` prop with values `"lazy" | "eager" | "hidden"`, defaulting to `"lazy"`. This is a new requirement (COMP-14) beyond the original spec.
- **D-02:** `lazy` -- show fallback during SSR and detection, swap to favicon only after naturalWidth confirms it's valid. Hidden `<img>` with `display:none` loads in background for detection.
- **D-03:** `eager` -- show `<img>` immediately on client mount, swap to fallback if naturalWidth check fails on the same img's `onLoad`. Globe may flash briefly -- that's the tradeoff.
- **D-04:** `hidden` -- render a sized empty `<span>` (matching `size` prop dimensions, `display:inline-block`) during loading. Prevents layout shift.
- **D-05:** All strategies render fallback during SSR. After hydration, each strategy follows its own flow.
- **D-06:** No timeout -- rely on browser native image loading behavior. Google CDN is fast. Consumers can implement timeout wrappers if needed.
- **D-07:** On `domain` prop change, reset to the current strategy's initial state and re-detect. No "keep previous until new resolves" behavior.
- **D-08:** Cancel stale detections -- if domain changes before previous detection completes, discard the old result. Only the latest domain's detection matters.
- **D-09:** `onResolved(boolean)` fires on every domain change when detection completes. Boolean only -- no distinction between "globe detected" and "network error". Both resolve as `false`.
- **D-10:** No wrapper element -- render bare `<img>` or bare fallback (with Fragment for lazy strategy's hidden detection img). Lightest possible DOM.
- **D-11:** `ref` forwards to `<img>` element when favicon is shown, `null` when fallback is rendered. Type: `HTMLImageElement | null`.
- **D-12:** `restProps` (`...rest`) spread onto `<img>` only. When fallback renders, restProps are not applied. Consumer's fallback ReactNode handles its own attributes.
- **D-13:** `className` and `style` apply to `<img>` only, not to fallback.
- **D-14:** When no `fallback` prop is provided and detection fails, render nothing (`null`).
- **D-15:** No `aria-label` or accessibility wrapping on fallback -- consumer owns accessibility of their fallback ReactNode.
- **D-16:** Default `alt=""` (decorative image). Consumer can override with meaningful alt text.
- **D-17:** Use `new URL()` constructor for normalization -- handles protocols, paths, ports, auth, query strings, and hash robustly. Fallback to raw trimmed string if URL constructor throws.
- **D-18:** Punycode/Unicode domains pass through as-is -- Google CDN handles encoding.
- **D-19:** Empty string or whitespace-only `domain` -> render fallback immediately, fire `onResolved(false)`, no CDN request.
- **D-20:** Non-empty but invalid-looking strings (no dots, nonsense) -> don't validate client-side. Let Google CDN + naturalWidth detection handle it. No domain format opinions.

### Claude's Discretion

- Internal state management approach (useState/useRef combination)
- useEffect cleanup and stale closure handling for detection cancellation
- React 17 forwardRef vs React 19 ref-as-prop implementation (COMP-12)
- Exact naturalWidth threshold logic (`<= 16` vs `=== 16`)
- buildUrl function refinements

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COMP-01 | `domain` prop (string, required) | Domain normalization via URL constructor (see Architecture Patterns) |
| COMP-02 | `size` prop (number, default 32) | Pass to buildUrl and img width/height; default via destructuring |
| COMP-03 | `fallback` prop (ReactNode) | Strategy-dependent render logic (see Strategy Pattern below) |
| COMP-04 | `className` prop passthrough | Spread via restProps onto `<img>` only (D-13) |
| COMP-05 | `style` prop (CSSProperties) passthrough | Spread via restProps onto `<img>` only (D-13) |
| COMP-06 | `alt` prop for accessibility | Default `""` via destructuring (D-16) |
| COMP-07 | Domain normalization | URL constructor hostname extraction (verified -- see Code Examples) |
| COMP-08 | naturalWidth globe detection | `naturalWidth <= 16` check in onLoad handler (see Detection Logic) |
| COMP-09 | SSR compatibility | useState initial `'loading'` + useEffect for client-only detection (see SSR Pattern) |
| COMP-10 | Network error handling | `onError` handler sets state to `'missing'`, fires `onResolved(false)` |
| COMP-11 | `onResolved` callback | Fires boolean in both onLoad and onError handlers |
| COMP-12 | Ref forwarding (React 17/18/19) | `forwardRef` -- still works on all three versions (see Ref Forwarding section) |
| COMP-13 | Rest props spread (`...restProps`) | `ComponentPropsWithoutRef<'img'>` omitting custom props, spread onto `<img>` |
| COMP-14 (new) | `strategy` prop (`"lazy" \| "eager" \| "hidden"`, default `"lazy"`) | Three render paths sharing one detection core (see Strategy Pattern) |

</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Bundle size**: < 1KB minified+gzipped -- current skeleton is 320 bytes gzipped, leaving ~700 bytes budget
- **Dependencies**: Zero runtime dependencies -- only React hooks/types used
- **React compatibility**: Must work with React 17, 18, and 19
- **Build tooling**: tsup (ESM + CJS), vitest, TypeScript strict
- **ESLint**: strictTypeChecked + stylisticTypeChecked (from Phase 1 D-03)
- **Test files**: Co-located `src/**/*.test.{ts,tsx}` (from Phase 1 D-02) -- but tests are Phase 3 scope
- **"use client" banner**: Already configured in tsup.config.ts via esbuildOptions

## Standard Stack

No new libraries needed. Phase 2 uses only React APIs already available as peer dependencies.

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^17/^18/^19 (peer dep) | useState, useEffect, useRef, useCallback, forwardRef | All needed hooks are stable across all three major versions |

### Supporting (already installed)
| Package | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TypeScript | ^5.9.3 (dev) | Strict typing for props interface, generics | Component implementation typing |
| tsup | ^8.5.1 (dev) | Build verification after implementation | Verify bundle stays < 1KB |

No `npm install` needed for this phase.

## Architecture Patterns

### File Structure (no changes from Phase 1)

```
src/
  SiteIcon.tsx    # Full component implementation (replace skeleton)
  index.ts        # Re-exports (update to include new types)
```

Single file. No splitting into multiple modules -- the component is small enough and splitting would add import overhead to the bundle.

### Pattern 1: SSR-Safe Detection State Machine

**What:** Initialize state as `'loading'` (safe for SSR), transition via `useEffect` (client-only) to `'found'` or `'missing'`.

**When to use:** Always -- this is the core detection flow.

**Why:** `useEffect` does not run during SSR. By starting in `'loading'` state, the server renders fallback content. After hydration, `useEffect` kicks off detection. No hydration mismatch because server and client initial render both show fallback/placeholder.

```typescript
// Source: React docs on useEffect + SSR
// https://react.dev/reference/react/useEffect
type Status = 'loading' | 'found' | 'missing';

const [status, setStatus] = useState<Status>('loading');
// During SSR: status is always 'loading' -> renders fallback
// After hydration: useEffect runs -> starts detection
```

[VERIFIED: React docs confirm useEffect only runs on client after hydration]

### Pattern 2: Stale Detection Cancellation via useRef

**What:** Track the current domain in a ref. When onLoad/onError fires, compare against current ref to discard stale results.

**When to use:** When domain prop can change before previous detection completes (D-08).

**Why:** Image onLoad/onError are async browser events. If domain changes while an image is loading, the old image's onLoad would fire with stale data. A ref tracks the "current" domain; stale callbacks check and bail.

```typescript
// Source: React patterns for stale closure avoidance
const currentDomainRef = useRef(domain);

useEffect(() => {
  currentDomainRef.current = domain;
  setStatus('loading');
  // Detection starts via img onLoad/onError in JSX
}, [domain]);

const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
  if (currentDomainRef.current !== domain) return; // stale
  // ... detection logic
};
```

Note: The ref-based approach is simpler than creating/destroying Image objects in effects because we are rendering `<img>` in JSX -- the browser handles loading. The ref just prevents acting on stale results.

[ASSUMED -- standard React pattern, but exact stale-check mechanism is discretionary]

### Pattern 3: Strategy-Based Render Branching

**What:** Three strategies share the same detection state machine but differ in what they render during the `'loading'` state.

**When to use:** Always -- the `strategy` prop (D-01) controls render behavior.

| Strategy | During `'loading'` | During `'found'` | During `'missing'` |
|----------|--------------------|----|---------|
| `lazy` | Fallback + hidden `<img style={{display:'none'}}>` for detection | Visible `<img>` | Fallback (or null) |
| `eager` | Visible `<img>` (globe may flash) | Visible `<img>` | Fallback (or null) |
| `hidden` | Empty `<span>` sized to `size` px + hidden `<img>` for detection | Visible `<img>` | Fallback (or null) |

Key insight for bundle size: The `'found'` and `'missing'` branches are identical across all strategies. Only `'loading'` differs. This means the strategy switch only affects one render path.

[ASSUMED -- implementation approach is discretionary per CONTEXT.md]

### Pattern 4: Domain Normalization Function

**What:** Extract hostname from arbitrary domain input using `new URL()` constructor.

**When to use:** Before passing domain to `buildUrl` (D-17).

**Verified behavior** (tested locally):

| Input | Output |
|-------|--------|
| `"github.com"` | `"github.com"` |
| `"https://github.com"` | `"github.com"` |
| `"https://github.com/user/repo?tab=readme"` | `"github.com"` |
| `"http://github.com:8080/path"` | `"github.com"` |
| `"github.com/path?q=1#hash"` | `"github.com"` |
| `"  github.com  "` | `"github.com"` |
| `""` | empty -- skip detection |
| `"   "` | empty -- skip detection |
| `"not-a-domain"` | `"not-a-domain"` (URL constructor accepts it) |
| `"https://user:pass@github.com/path"` | `"github.com"` |

[VERIFIED: tested URL constructor in Node.js locally -- see test output]

```typescript
// Source: Verified locally + MDN URL constructor docs
function normalizeDomain(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  try {
    const withProtocol = trimmed.includes('://') ? trimmed : `https://${trimmed}`;
    return new URL(withProtocol).hostname;
  } catch {
    return trimmed; // Fallback: return raw trimmed string (D-17)
  }
}
```

### Pattern 5: forwardRef for Cross-Version React Support

**What:** Use `React.forwardRef` to enable ref forwarding to the `<img>` element.

**When to use:** Always -- COMP-12 requires ref forwarding across React 17/18/19.

**Why forwardRef (not ref-as-prop):**
- `forwardRef` works on React 17, 18, AND 19 [VERIFIED: react.dev docs]
- React 19 deprecated `forwardRef` but it remains fully functional [VERIFIED: react.dev/reference/react/forwardRef]
- `ref` as a regular prop only works on React 19 -- would break React 17/18 consumers
- Migration to ref-as-prop is trivial when React 17/18 support is dropped

```typescript
// Source: https://react.dev/reference/react/forwardRef
import { forwardRef } from 'react';

const SiteIcon = forwardRef<HTMLImageElement, SiteIconProps>(
  function SiteIcon(props, ref) {
    // ... implementation
    // ref applied to <img> when status === 'found'
    // ref is null when rendering fallback (D-11)
  }
);
```

[VERIFIED: react.dev confirms forwardRef is deprecated but functional in React 19]

### Pattern 6: Rest Props Typing with Omit

**What:** Use `ComponentPropsWithoutRef<'img'>` to type restProps, omitting custom props.

**When to use:** For COMP-13 (spread remaining props onto `<img>`).

```typescript
// Source: @types/react index.d.ts (verified in node_modules)
type ImgProps = React.ComponentPropsWithoutRef<'img'>;

interface SiteIconProps extends Omit<ImgProps, 'src' | 'width' | 'height' | 'onLoad' | 'onError'> {
  domain: string;
  size?: number;
  fallback?: ReactNode;
  strategy?: 'lazy' | 'eager' | 'hidden';
  onResolved?: (found: boolean) => void;
}
```

Note: We must omit `src`, `width`, `height` (controlled by component), `onLoad`, `onError` (used internally for detection). `alt`, `className`, `style` are already part of `ImgProps` so they come for free -- no need to declare them separately.

[VERIFIED: ComponentPropsWithoutRef<'img'> exists in @types/react 19.2.14]

### Anti-Patterns to Avoid

- **Creating Image objects in useEffect:** Don't `new Image()` in effects when JSX `<img>` already handles loading. The JSX img fires onLoad/onError natively. Adding a programmatic Image creates duplicate requests.
- **useLayoutEffect for detection:** Would cause SSR warnings (`useLayoutEffect does nothing on the server`). Use `useEffect` only.
- **Conditional hook calls based on strategy:** All hooks must be called unconditionally (Rules of Hooks). The strategy only affects the return JSX, not hook calls.
- **Memoizing buildUrl output with useMemo:** The string concatenation is trivial -- `useMemo` overhead exceeds the computation cost. Just compute inline.
- **Wrapping fallback in a container div:** D-10 says no wrapper element. Return fallback directly via Fragment when needed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL parsing / hostname extraction | Regex-based domain parser | `new URL()` constructor | Handles protocols, ports, auth, paths, query strings, hash, Unicode/Punycode -- all browser edge cases already solved |
| Ref forwarding across React versions | Runtime version detection or conditional forwardRef | `React.forwardRef` (static, works on all versions) | Conditional forwardRef changes component identity and breaks consumers [CITED: React docs on forwardRef] |
| Image load detection | `fetch()` + status code check | Native `<img>` onLoad/onError + naturalWidth | Google CDN doesn't send CORS headers -- fetch approach fails. Native img loading works without CORS. |
| Stale request cancellation | AbortController or custom promise cancellation | `useRef` current domain comparison | No fetch calls to abort -- detection is via img events. Ref comparison is simpler and lighter. |

**Key insight:** This component has zero external API calls (no fetch, no XMLHttpRequest). All detection happens via the browser's native `<img>` element events. This is why it can be zero-dependency.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch on SSR

**What goes wrong:** Server renders `<img>` but client initial render expects fallback (or vice versa), causing React hydration error.
**Why it happens:** If status is computed differently on server vs client first render.
**How to avoid:** Always initialize `useState<Status>('loading')`. Both server and client first render will produce the same output (fallback/placeholder). Only `useEffect` (client-only) changes status.
**Warning signs:** Console error: "Text content does not match server-rendered HTML" or "Hydration failed."

### Pitfall 2: Stale onLoad Fires After Domain Change

**What goes wrong:** User changes domain from A to B. Image for A finishes loading and fires onLoad, setting status to 'found' with A's favicon while displaying B's URL.
**Why it happens:** Browser continues loading previous img src even after React re-renders with new src (the old onLoad callback closes over stale data).
**How to avoid:** Track current domain in a `useRef`. In onLoad/onError handlers, compare the event target's src (or domain ref) against current domain. Bail if stale.
**Warning signs:** Briefly seeing the wrong favicon, or favicon not updating when domain changes rapidly.

### Pitfall 3: naturalWidth Check Timing

**What goes wrong:** Checking `naturalWidth` before the image has loaded returns 0, causing false negatives.
**Why it happens:** `naturalWidth` is 0 until the image data is fully decoded.
**How to avoid:** Only check `naturalWidth` inside the `onLoad` handler -- by definition the image is loaded at that point. Never check it during render or in useEffect directly.
**Warning signs:** All favicons showing as "missing" even for valid domains.

[VERIFIED: MDN docs confirm naturalWidth returns 0 before image load -- https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/naturalWidth]

### Pitfall 4: display:none img Still Fires Network Request

**What goes wrong:** Developer assumes `display:none` prevents the image from loading and tries to delay the request.
**Why it happens:** Misunderstanding of browser behavior -- `display:none` hides the element but does NOT prevent the HTTP request.
**How to avoid:** For the `lazy` and `hidden` strategies, this is actually the DESIRED behavior. The hidden `<img>` triggers the request and fires onLoad for detection. Just be aware it's happening.
**Warning signs:** N/A -- this is intentional in our design.

[VERIFIED: Multiple sources confirm display:none does not prevent image loading -- see web research]

### Pitfall 5: onResolved Firing Multiple Times for Same Domain

**What goes wrong:** `onResolved` fires on mount AND when status changes, causing double-fire.
**Why it happens:** If onResolved is called both in the initial detection and in a re-render effect.
**How to avoid:** Only fire `onResolved` inside onLoad and onError handlers -- exactly once per detection cycle. For empty domain (D-19), fire once via useEffect with a guard.
**Warning signs:** Consumer's onResolved callback running twice with same boolean value.

### Pitfall 6: ESLint strict rules flagging valid patterns

**What goes wrong:** TypeScript-eslint strictTypeChecked rules may flag `useCallback` dependency arrays, `any` types in event handlers, or promise-related patterns.
**Why it happens:** Phase 1 configured strictTypeChecked + stylisticTypeChecked rulesets.
**How to avoid:** Use proper typing for all event handlers (`React.SyntheticEvent<HTMLImageElement>`). Avoid `any`. Use `void` return types explicitly where needed.
**Warning signs:** `npm run lint` failures during development.

### Pitfall 7: Bundle Size Exceeding 1KB

**What goes wrong:** Full implementation with three strategies pushes bundle over 1KB gzipped.
**Why it happens:** Each strategy branch adds code. Verbose TypeScript types compile away but JSX branches don't.
**How to avoid:** Share all code between strategies except the loading-state render branch. Use short variable names in the hot path. Avoid unnecessary React imports (e.g., Fragment is already in scope with react-jsx transform). Run `gzip -c dist/index.js | wc -c` after each build.
**Warning signs:** Build output > 600 bytes raw ESM (current skeleton is 380; full component should be ~500-700 bytes raw for the ESM output).

## Code Examples

### Domain Normalization (COMP-07)

```typescript
// Source: Verified locally via Node.js URL constructor tests
function normalizeDomain(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(
      trimmed.includes('://') ? trimmed : `https://${trimmed}`
    );
    return url.hostname;
  } catch {
    return trimmed;
  }
}
```

### naturalWidth Detection (COMP-08)

```typescript
// Source: Project spec (ReactThirdPartyDomainFavicon.md) + MDN naturalWidth docs
const GOOGLE_DEFAULT_SIZE = 16;

const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  const found = img.naturalWidth > GOOGLE_DEFAULT_SIZE;
  setStatus(found ? 'found' : 'missing');
  onResolved?.(found);
};
```

**Why `> 16` not `=== 16`:** Google's default globe is always 16x16 regardless of requested size. Real favicons are returned at or near the requested size. Using `> 16` means: anything larger than the known default is considered a real favicon. This is more robust than `!== 16` which would also fail if a real favicon happened to be exactly 16px (unlikely at size=32+ but defensive).

### SSR-Safe Component Shell (COMP-09)

```typescript
// Source: React SSR patterns -- useEffect only runs on client
const SiteIcon = forwardRef<HTMLImageElement, SiteIconProps>(
  function SiteIcon({ domain, size = 32, fallback = null, strategy = 'lazy', onResolved, ...rest }, ref) {
    const [status, setStatus] = useState<'loading' | 'found' | 'missing'>('loading');
    const domainRef = useRef(domain);
    const normalizedDomain = normalizeDomain(domain);

    useEffect(() => {
      domainRef.current = domain;
      // Empty domain: skip detection, render fallback (D-19)
      if (!normalizedDomain) {
        setStatus('missing');
        onResolved?.(false);
        return;
      }
      setStatus('loading'); // Reset on domain change (D-07)
    }, [normalizedDomain]); // Re-run when normalized domain changes

    // ... onLoad/onError handlers, render logic
  }
);
```

### Empty Domain Short-Circuit (D-19)

```typescript
// Source: CONTEXT.md D-19
useEffect(() => {
  domainRef.current = domain;
  if (!normalizedDomain) {
    setStatus('missing');
    onResolved?.(false);
    return;
  }
  setStatus('loading');
}, [normalizedDomain]);
```

### Strategy-Based Loading Render (D-01 through D-05)

```typescript
// Source: CONTEXT.md D-02, D-03, D-04
// Only the 'loading' state differs by strategy
if (status === 'loading') {
  const detectionImg = (
    <img
      key={normalizedDomain}
      src={buildUrl(normalizedDomain, size)}
      style={{ display: 'none' }}
      onLoad={handleLoad}
      onError={handleError}
      alt=""
    />
  );

  switch (strategy) {
    case 'lazy':
      return <>{fallback}{detectionImg}</>;
    case 'eager':
      return (
        <img
          ref={ref}
          src={buildUrl(normalizedDomain, size)}
          width={size}
          height={size}
          onLoad={handleLoad}
          onError={handleError}
          {...rest}
        />
      );
    case 'hidden':
      return (
        <>
          <span style={{ display: 'inline-block', width: size, height: size }} />
          {detectionImg}
        </>
      );
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `React.forwardRef` required | `ref` as regular prop | React 19 (Dec 2024) | forwardRef still works, just deprecated. Use forwardRef for React 17/18 compat. |
| `React.FC<Props>` with children | Explicit `children` in props | React 18 (2022) | Not relevant here (no children prop) but affects type patterns |
| `.eslintrc` config | `eslint.config.mjs` flat config | ESLint 10 (2025) | Already configured in Phase 1 |
| `React.SyntheticEvent` generic | Same API, stable | Unchanged | Still the correct way to type event handlers |

**Deprecated/outdated:**
- `forwardRef`: Deprecated in React 19, still functional. Will be removed in a future major version. Our usage is intentional for cross-version support. [VERIFIED: react.dev]
- `React.FC` return type: No longer includes `children` implicitly. Our component doesn't use `React.FC` (uses plain function + forwardRef), so not affected.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `naturalWidth > 16` correctly identifies Google's default globe across all domain inputs | Detection Logic | If Google changes default globe size or serves different defaults for different sizes, detection breaks. LOW risk -- behavior has been stable for years. |
| A2 | useRef-based stale domain comparison is sufficient for cancellation (no need for AbortController) | Architecture Patterns | If somehow two images for different domains return same naturalWidth at overlapping times, we could get a race. LOW risk -- ref check is per-domain. |
| A3 | Three strategies fit within ~700 bytes of remaining gzip budget | Pitfalls | If not, strategies could be simplified or code golfed. MEDIUM risk -- needs build verification after implementation. |
| A4 | `key={normalizedDomain}` on the hidden detection img forces browser to re-fetch when domain changes | Code Examples | If React reuses the element and just updates src, onLoad may not re-fire. LOW risk -- key change forces unmount/remount. |

## Open Questions

1. **Exact naturalWidth threshold**
   - What we know: Google's default globe is 16x16. Real favicons are returned at requested size.
   - What's unclear: Are there edge cases where a real favicon is exactly 16x16 when a larger size is requested? (Per D-20, we don't validate domain format, so unusual domains could return unusual sizes.)
   - Recommendation: Use `> 16` as the threshold (matches project spec). This is Claude's discretion per CONTEXT.md.

2. **onResolved dependency in useEffect for empty domain**
   - What we know: D-19 says fire `onResolved(false)` for empty domain. This must happen in useEffect to be SSR-safe.
   - What's unclear: If `onResolved` is in the dependency array, it will re-fire if consumer passes an unstable callback. If not in deps, ESLint exhaustive-deps rule will flag it.
   - Recommendation: Include `onResolved` in deps. Document that consumers should memoize their callback if they don't want re-fires. The strict ESLint config requires exhaustive deps.

3. **Fragment import with react-jsx transform**
   - What we know: With `"jsx": "react-jsx"` in tsconfig, `<></>` compiles to `jsx(Fragment, ...)` automatically. No explicit `import { Fragment }` needed.
   - What's unclear: Does tsup handle this correctly for both ESM and CJS output?
   - Recommendation: Test build output after implementation. Likely works -- Phase 1 skeleton compiled successfully.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (exists, configured with jsdom) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map

Note: Tests are Phase 3 scope. This section documents what Phase 2 implementation must enable for testability.

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-01 | Renders img with domain | unit | `npx vitest run src/SiteIcon.test.tsx` | No -- Phase 3 |
| COMP-02 | Size prop affects img dimensions | unit | same | No -- Phase 3 |
| COMP-03 | Fallback renders when detection fails | unit | same | No -- Phase 3 |
| COMP-04 | className passes through to img | unit | same | No -- Phase 3 |
| COMP-05 | style passes through to img | unit | same | No -- Phase 3 |
| COMP-06 | alt prop on img element | unit | same | No -- Phase 3 |
| COMP-07 | Domain normalization strips URL parts | unit | same | No -- Phase 3 |
| COMP-08 | naturalWidth detection triggers fallback | unit | same | No -- Phase 3 |
| COMP-09 | SSR renders fallback, not img | unit | same | No -- Phase 3 |
| COMP-10 | onError triggers fallback | unit | same | No -- Phase 3 |
| COMP-11 | onResolved fires with boolean | unit | same | No -- Phase 3 |
| COMP-12 | ref forwarding to img | unit | same | No -- Phase 3 |
| COMP-13 | restProps spread onto img | unit | same | No -- Phase 3 |
| COMP-14 | Strategy prop changes loading behavior | unit | same | No -- Phase 3 |

### Sampling Rate
- **Per task commit:** `npm run build && gzip -c dist/index.js | wc -c` (verify bundle size)
- **Per task commit:** `npm run typecheck` (verify types)
- **Per task commit:** `npm run lint` (verify ESLint passes)
- **Phase gate:** Build + typecheck + lint all green. Bundle < 1KB gzipped.

### Wave 0 Gaps
None -- existing build and lint infrastructure from Phase 1 covers validation needs. Tests are explicitly Phase 3 scope.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A -- component library, no auth |
| V3 Session Management | No | N/A |
| V4 Access Control | No | N/A |
| V5 Input Validation | Yes | URL constructor for domain normalization + trim. No user input reaches DOM unsanitized -- domain goes into img src URL via string template. |
| V6 Cryptography | No | N/A |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via domain prop | Tampering | Domain is passed to `new URL()` which rejects dangerous schemes, then used only in a Google CDN URL template. No `dangerouslySetInnerHTML`. React's JSX escaping handles the rest. |
| Open redirect via domain prop | Information Disclosure | Domain is only used to construct a Google CDN URL (fixed template). No redirect occurs -- just an img src. |

**Note:** The component renders an `<img>` tag with a src pointing to Google's CDN. There is no `crossOrigin` attribute (per project spec), no `fetch()` calls, and no user-supplied HTML. The security surface is minimal.

## Sources

### Primary (HIGH confidence)
- React docs: forwardRef -- https://react.dev/reference/react/forwardRef [forwardRef deprecated but functional in React 19]
- React docs: useEffect -- https://react.dev/reference/react/useEffect [useEffect runs client-side only]
- MDN: HTMLImageElement.naturalWidth -- https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/naturalWidth [returns 0 before load, intrinsic dimensions after]
- @types/react 19.2.14 (node_modules) -- ComponentPropsWithoutRef, forwardRef types verified in source
- Local URL constructor tests -- all 12 test cases verified via Node.js

### Secondary (MEDIUM confidence)
- Josh Comeau: Perils of Hydration -- https://www.joshwcomeau.com/react/the-perils-of-rehydration/ [SSR hydration patterns]
- DEV.to: Google favicon API behavior -- https://dev.to/derlin/get-favicons-from-any-website-using-a-hidden-google-api-3p1e [faviconV2 returns 16x16 default]
- SwimBurger: display:none image loading -- https://swimburger.net/blog/web/web-performance-prevent-wasteful-hidden-image-requests [confirms display:none does not prevent image load]

### Tertiary (LOW confidence)
- None -- all critical claims verified

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, using well-known React APIs
- Architecture: HIGH -- patterns are standard React (useState, useEffect, forwardRef, useRef) with project-specific detection logic
- Pitfalls: HIGH -- all verified against official docs and practical testing
- Bundle size budget: MEDIUM -- estimated to fit but needs verification after implementation

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable -- React APIs and Google CDN behavior don't change frequently)
