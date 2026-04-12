# Phase 2: Core Component - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 02-core-component
**Areas discussed:** Detection UX flow, Wrapper vs bare img, Invalid domain handling

---

## Detection UX Flow

| Option | Description | Selected |
|--------|-------------|----------|
| strategy prop | Named values `"lazy" \| "eager" \| "hidden"` — explicit, self-documenting, extensible | ✓ |
| eager boolean | Simpler `eager` boolean — only covers 2 of 3 strategies | |

**User's choice:** strategy prop
**Notes:** User wanted to build all three strategies and let consumers choose

| Option | Description | Selected |
|--------|-------------|----------|
| Fallback-first default | Safest default — no flash of Google's globe | ✓ |
| Eager default | Fastest perceived load for common case | |

**User's choice:** Fallback-first default

| Option | Description | Selected |
|--------|-------------|----------|
| No timeout | Rely on browser native behavior, Google CDN is fast | ✓ |
| Optional timeout prop | Adds API surface and bundle size for edge case | |

**User's choice:** No timeout

| Option | Description | Selected |
|--------|-------------|----------|
| Re-detect with strategy | Reset to strategy's initial state on domain change | ✓ |
| Keep previous until new resolves | Smoother transition but more complex state | |

**User's choice:** Re-detect with strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Add to requirements | Add COMP-14 for strategy prop, ensures traceability | ✓ |
| Implementation detail | Don't formally track, COMP-08/09 implicitly cover it | |

**User's choice:** Add to requirements (COMP-14)

| Option | Description | Selected |
|--------|-------------|----------|
| Sized empty span | Reserves layout space, prevents content shift | ✓ |
| Render nothing | Simplest but causes layout shift | |

**User's choice:** Sized empty span (for hidden strategy)

| Option | Description | Selected |
|--------|-------------|----------|
| Cancel stale | Only latest domain's detection matters | ✓ |
| Let all resolve | Each detection independent, last wins | |

**User's choice:** Cancel stale detections

| Option | Description | Selected |
|--------|-------------|----------|
| Every domain change | Fire onResolved each time a new domain resolves | ✓ |
| Only on state change | Only when boolean result differs from previous | |

**User's choice:** Every domain change

| Option | Description | Selected |
|--------|-------------|----------|
| Boolean only | true = found, false = fallback (globe OR error) | ✓ |
| Status enum | 'found' \| 'not-found' \| 'error' | |

**User's choice:** Boolean only

| Option | Description | Selected |
|--------|-------------|----------|
| Fallback on server, img on client | All strategies render fallback during SSR | ✓ |
| Img tag on server for eager | Risk hydration mismatch, globe may flash | |

**User's choice:** Fallback on server for all strategies

| Option | Description | Selected |
|--------|-------------|----------|
| Short names | "lazy" \| "eager" \| "hidden" — familiar from HTML loading | ✓ |
| Descriptive names | "fallback-first" \| "eager" \| "hidden" | |

**User's choice:** Short names (lazy, eager, hidden)

| Option | Description | Selected |
|--------|-------------|----------|
| Nothing (null) | No fallback prop = render nothing on failure | ✓ |
| Sized empty placeholder | Invisible but reserves space | |
| Default generic icon | Built-in globe SVG, adds ~200-300 bytes | |

**User's choice:** Nothing (null)

| Option | Description | Selected |
|--------|-------------|----------|
| Same img onLoad | Use visible img's onLoad for naturalWidth check | ✓ |
| Separate hidden probe | Parallel hidden Image() probe | |

**User's choice:** Same img onLoad (for eager strategy)

| Option | Description | Selected |
|--------|-------------|----------|
| Hidden img | display:none img loads in background during lazy | ✓ |
| No img until client effect | Create via useEffect or new Image() | |

**User's choice:** Hidden img approach (for lazy strategy)

| Option | Description | Selected |
|--------|-------------|----------|
| Empty string default | alt="" marks image as decorative | ✓ |
| Auto-generated alt | "Favicon for {domain}" — may be noisy | |

**User's choice:** Empty string (decorative image)

| Option | Description | Selected |
|--------|-------------|----------|
| No aria on fallback | Consumer owns fallback accessibility | ✓ |
| Wrap with aria-label | Extra span wrapping consumer content | |

**User's choice:** No aria on fallback

---

## Wrapper vs Bare Img

| Option | Description | Selected |
|--------|-------------|----------|
| No wrapper | Bare img or bare fallback, Fragment for lazy detection | ✓ |
| Span wrapper | Consistent sizing but extra DOM node, ref type changes | |
| Conditional wrapper | Clean img, wrapper only for fallback, DOM structure changes | |

**User's choice:** No wrapper

| Option | Description | Selected |
|--------|-------------|----------|
| null when fallback | ref.current = null when fallback renders | ✓ |
| Always point to something | Wrap fallback in span for ref target | |

**User's choice:** null when fallback

| Option | Description | Selected |
|--------|-------------|----------|
| Only on img | restProps spread onto img only, not fallback | ✓ |
| Wrapper needed for restProps | Contradicts no-wrapper decision | |

**User's choice:** Only on img

---

## Invalid Domain Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Render fallback immediately | Skip CDN for empty/whitespace, fire onResolved(false) | ✓ |
| Let Google CDN handle it | Wastes network request for obvious invalid | |
| Throw/console.warn | Help developers catch mistakes | |

**User's choice:** Render fallback immediately (no CDN request)

| Option | Description | Selected |
|--------|-------------|----------|
| Don't validate, let CDN handle | No regex validation, no domain format opinions | ✓ |
| Basic validation | Check for at least one dot | |

**User's choice:** Don't validate — let CDN + naturalWidth handle it

| Option | Description | Selected |
|--------|-------------|----------|
| Pass through as-is | Google CDN handles punycode/Unicode encoding | ✓ |
| Normalize to punycode | Adds complexity, possibly URL API dependency | |

**User's choice:** Pass through as-is

| Option | Description | Selected |
|--------|-------------|----------|
| URL constructor | new URL().hostname for robust parsing, fallback to raw string | ✓ |
| Regex approach | Simpler but misses edge cases (ports, auth, IPv6) | |

**User's choice:** URL constructor

---

## Claude's Discretion

- Internal state management approach (useState/useRef)
- useEffect cleanup for stale detection cancellation
- React 17 forwardRef vs React 19 ref-as-prop (COMP-12)
- Exact naturalWidth threshold logic
- buildUrl refinements

## Deferred Ideas

None — discussion stayed within phase scope
