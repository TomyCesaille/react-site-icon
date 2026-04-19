# Phase 5: Documentation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 05-documentation
**Areas discussed:** README tone & depth, Comparison table, StackBlitz example, Badge selection

---

## README tone & depth

| Option | Description | Selected |
|--------|-------------|----------|
| Developer-concise | Terse, code-forward. Minimal prose, let the code examples and comparison table do the talking. | ✓ |
| Friendly-explanatory | Warmer, more context. Explains the problem before the solution. | |
| Marketing-forward | Bold claims up front, feature bullets, then code. | |

**User's choice:** Developer-concise
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| One paragraph | Brief explanation of naturalWidth detection. | |
| Detailed with diagram | Full explanation with ASCII flow diagram showing detection mechanism. | ✓ |
| Just bullet points | 3-4 bullet points, no prose. | |

**User's choice:** Detailed with diagram
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Full strategy docs | Dedicated section with code example per strategy + when-to-use table. | ✓ |
| Brief mention only | Note strategy prop in API table, one-liner descriptions. | |
| Default only | Only show lazy in examples. | |

**User's choice:** Full strategy docs
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, grouped section | One 'Advanced' section with SSR, ref forwarding, onResolved examples. | ✓ |
| Inline in API table | Usage notes in the API table description column. | |
| Skip advanced examples | API table is sufficient. | |

**User's choice:** Yes, grouped section
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Basic + fallback | Two examples above the fold: bare minimum then with fallback. | ✓ |
| Bare minimum only | Just one import and one render line. | |
| Kitchen sink | One example with all props. | |

**User's choice:** Basic + fallback
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Brief inline section | Short section: clone, install, test commands, PRs welcome. | ✓ |
| Link to future file | One line pointing to non-existent CONTRIBUTING.md. | |
| Skip entirely | No contributing section in v1. | |

**User's choice:** Brief inline section
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Why → Install → API → Strategies → Advanced → Compare | Hook with 'why' first, then practical docs, comparison last. | ✓ |
| Install → API → Strategies → Why → Advanced → Compare | Action-first: usage before explanation. | |
| Why → Compare → Install → API → Strategies → Advanced | Differentiation up front before usage docs. | |

**User's choice:** Why → Install → API → Strategies → Advanced → Compare
**Notes:** None

---

## Comparison table

| Option | Description | Selected |
|--------|-------------|----------|
| favicon-stealer | Closest npm competitor, waterfall strategy, 15+ styling props. | ✓ |
| DIY with Google CDN | Direct <img> with Google URL, no fallback detection. | ✓ |
| DIY with target domain | Fetching favicon.ico directly, CORS/timeout issues. | ✓ |
| favicon.im / other services | Third-party favicon proxy services. | ✓ |

**User's choice:** All four alternatives
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Bundle size | Minified+gzipped size comparison. | ✓ |
| Fallback detection | Whether approach detects Google's default globe. | ✓ |
| Network requests | Number of requests per favicon. | ✓ |
| Dependencies | Zero deps vs N deps. | ✓ |

**User's choice:** All four dimensions
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Mixed | Numbers where meaningful, checkmarks for booleans. | ✓ |
| All qualitative | Checkmarks and crosses only. | |
| All quantitative | Exact numbers everywhere. | |

**User's choice:** Mixed
**Notes:** None

---

## StackBlitz example

| Option | Description | Selected |
|--------|-------------|----------|
| Multi-domain showcase | 4-5 domains showing both success and fallback in one view. | ✓ |
| Minimal single domain | Just one SiteIcon render. | |
| Interactive playground | Input field for live domain testing. | |

**User's choice:** Multi-domain showcase
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Default only | Just lazy strategy in StackBlitz. | ✓ |
| All three strategies | Side-by-side of lazy, eager, hidden. | |
| Default + one alternate | Lazy and eager side by side. | |

**User's choice:** Default only
**Notes:** None

---

## Badge selection

| Option | Description | Selected |
|--------|-------------|----------|
| Required 4 only | npm version, Bundlephobia size, MIT license, CI status. | ✓ |
| Add TypeScript badge | Blue 'TypeScript' badge for TS support signal. | ✓ |
| Add npm downloads badge | Weekly downloads count. | |
| Add 'zero dependencies' badge | Custom badge for zero runtime deps. | |

**User's choice:** Required 4 + TypeScript badge (5 total)
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| npm → size → TS → license → CI | Version first, size second, TypeScript, license, CI last. | ✓ |
| npm → CI → size → TS → license | Version then CI status first. | |
| You decide | Claude picks order. | |

**User's choice:** npm → size → TS → license → CI
**Notes:** None

---

## Claude's Discretion

- ASCII diagram design for naturalWidth detection flow
- Specific domains in StackBlitz showcase
- Badge image URLs and shield.io parameters
- One-line description wording
- Code example formatting (JSX vs TSX)

## Deferred Ideas

None — discussion stayed within phase scope
