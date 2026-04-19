# Phase 2: Core Component - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the full SiteIcon component with all props (COMP-01 through COMP-14), domain normalization, naturalWidth fallback detection, SSR safety, and a user-selectable detection strategy. The skeleton from Phase 1 (`src/SiteIcon.tsx`) is the starting point.

</domain>

<decisions>
## Implementation Decisions

### Detection Strategy Prop
- **D-01:** Add a `strategy` prop with values `"lazy" | "eager" | "hidden"`, defaulting to `"lazy"`. This is a new requirement (COMP-14) beyond the original spec.
- **D-02:** `lazy` — show fallback during SSR and detection, swap to favicon only after naturalWidth confirms it's valid. Hidden `<img>` with `display:none` loads in background for detection.
- **D-03:** `eager` — show `<img>` immediately on client mount, swap to fallback if naturalWidth check fails on the same img's `onLoad`. Globe may flash briefly — that's the tradeoff.
- **D-04:** `hidden` — render a sized empty `<span>` (matching `size` prop dimensions, `display:inline-block`) during loading. Prevents layout shift.
- **D-05:** All strategies render fallback during SSR. After hydration, each strategy follows its own flow.

### Detection Behavior
- **D-06:** No timeout — rely on browser native image loading behavior. Google CDN is fast. Consumers can implement timeout wrappers if needed.
- **D-07:** On `domain` prop change, reset to the current strategy's initial state and re-detect. No "keep previous until new resolves" behavior.
- **D-08:** Cancel stale detections — if domain changes before previous detection completes, discard the old result. Only the latest domain's detection matters.
- **D-09:** `onResolved(boolean)` fires on every domain change when detection completes. Boolean only — no distinction between "globe detected" and "network error". Both resolve as `false`.

### DOM Structure
- **D-10:** No wrapper element — render bare `<img>` or bare fallback (with Fragment for lazy strategy's hidden detection img). Lightest possible DOM.
- **D-11:** `ref` forwards to `<img>` element when favicon is shown, `null` when fallback is rendered. Type: `HTMLImageElement | null`.
- **D-12:** `restProps` (`...rest`) spread onto `<img>` only. When fallback renders, restProps are not applied. Consumer's fallback ReactNode handles its own attributes.
- **D-13:** `className` and `style` apply to `<img>` only, not to fallback.

### Fallback Behavior
- **D-14:** When no `fallback` prop is provided and detection fails, render nothing (`null`).
- **D-15:** No `aria-label` or accessibility wrapping on fallback — consumer owns accessibility of their fallback ReactNode.

### Accessibility
- **D-16:** Default `alt=""` (decorative image). Consumer can override with meaningful alt text.

### Domain Normalization
- **D-17:** Use `new URL()` constructor for normalization — handles protocols, paths, ports, auth, query strings, and hash robustly. Fallback to raw trimmed string if URL constructor throws.
- **D-18:** Punycode/Unicode domains pass through as-is — Google CDN handles encoding.

### Invalid Input
- **D-19:** Empty string or whitespace-only `domain` → render fallback immediately, fire `onResolved(false)`, no CDN request.
- **D-20:** Non-empty but invalid-looking strings (no dots, nonsense) → don't validate client-side. Let Google CDN + naturalWidth detection handle it. No domain format opinions.

### Claude's Discretion
- Internal state management approach (useState/useRef combination)
- useEffect cleanup and stale closure handling for detection cancellation
- React 17 forwardRef vs React 19 ref-as-prop implementation (COMP-12)
- Exact naturalWidth threshold logic (`<= 16` vs `=== 16`)
- buildUrl function refinements

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Spec
- `ReactThirdPartyDomainFavicon.md` — Original project spec with API design, ~40-line implementation sketch, and design principles
- `CLAUDE.md` §Recommended Stack — Technology versions and rationale

### Requirements
- `.planning/REQUIREMENTS.md` §Component API (COMP-01 through COMP-13) — All component requirements
- `.planning/REQUIREMENTS.md` — COMP-14 to be added: `strategy` prop with `"lazy" | "eager" | "hidden"` values, default `"lazy"`

### Prior Phase Context
- `.planning/phases/01-project-scaffolding-and-build-pipeline/01-CONTEXT.md` — Phase 1 decisions (build pipeline, skeleton component structure, ESLint strict rules)

### Existing Code
- `src/SiteIcon.tsx` — Skeleton component from Phase 1 (starting point for this phase)
- `src/index.ts` — Re-export barrel file

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SiteIcon.tsx` skeleton — basic component with `domain`, `size`, `className`, `style`, `alt` props and `buildUrl` helper. Needs: `fallback`, `onResolved`, `strategy`, `ref`, `restProps`, state management, detection logic, normalization.
- `index.ts` — re-exports `SiteIcon` and `SiteIconProps`. Will need to export updated props type (with `strategy`).

### Established Patterns
- Props interface defined in same file as component (`SiteIconProps` in `SiteIcon.tsx`)
- `buildUrl` helper as const arrow function in module scope
- Default prop values via destructuring defaults

### Integration Points
- Phase 3 (Testing) will test against the component built here — all detection states, strategies, normalization edge cases
- Phase 5 (Documentation) will document the props API including the new `strategy` prop
- Phase 6 (Demo Site) will use the component interactively

</code_context>

<specifics>
## Specific Ideas

- The `ReactThirdPartyDomainFavicon.md` spec has a ~40-line implementation sketch — use it as a reference but adapt for the strategy prop and decisions above
- The `buildUrl` helper already works and produces correct Google faviconV2 URLs
- Bundle size constraint (< 1KB) means the three strategies should share as much code as possible — the difference is primarily in what renders, not in detection logic

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-core-component*
*Context gathered: 2026-04-12*
