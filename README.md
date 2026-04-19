# react-site-icon

A React component to display any website's favicon from its domain. Zero dependencies. < 1KB.

[![npm](https://img.shields.io/npm/v/react-site-icon)](https://www.npmjs.com/package/react-site-icon)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-site-icon)](https://bundlephobia.com/package/react-site-icon)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](#)
[![license](https://img.shields.io/npm/l/react-site-icon)](https://github.com/TomyCesaille/react-site-icon/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/TomyCesaille/react-site-icon/ci.yml?branch=main)](https://github.com/TomyCesaille/react-site-icon/actions/workflows/ci.yml)

```tsx
import { SiteIcon } from 'react-site-icon';

<SiteIcon domain="github.com" />
```

```tsx
<SiteIcon
  domain="example.com"
  fallback={<span>?</span>}
/>
```

[Try it on StackBlitz](https://stackblitz.com/fork/github/TomyCesaille/react-site-icon/tree/main/examples/basic)

## Why

Most favicon solutions have the same problem: **no reliable fallback detection.**

Google's [faviconV2 CDN](https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://github.com&size=64) returns a favicon for any domain. When the domain has no favicon, it returns a **default globe icon that is always 16x16 pixels**, regardless of the size you requested. This size mismatch is the detection mechanism:

```
                    react-site-icon
                         |
           Google faviconV2 CDN request
                  (single request)
                         |
                   +-----+-----+
                   |           |
              Real favicon   Default globe
              (64x64 px)    (always 16x16)
                   |           |
           naturalWidth > 16  naturalWidth = 16
                   |           |
              Show <img>   Show fallback
```

After the image loads, we check `naturalWidth` on the `<img>` element. A real favicon comes back at the requested size (e.g. 64x64). The default globe is always 16x16. One comparison, zero CORS issues, single network request.

**Why other approaches fail:**

- **Direct `fetch()` to Google CDN** -- blocked by CORS. Google doesn't send `Access-Control-Allow-Origin`.
- **Canvas pixel comparison** -- requires `crossOrigin` attribute, which Google's CDN rejects. Canvas is tainted.
- **Fetching from target domain** -- unreliable. Many sites don't serve `/favicon.ico`, return redirects, or have restrictive CORS. Adds latency from a second request.

## Install

```bash
npm install react-site-icon
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `domain` | `string` | required | Domain to fetch the favicon for (e.g. `"github.com"` or `"https://github.com/user/repo"`) |
| `size` | `number` | `32` | Requested favicon size in pixels. Supported: 12, 16, 24, 28, 32, 40, 48, 50, 64, 96, 128. Other values return a different size from the CDN. |
| `fallback` | `ReactNode` | `null` | Content to render when no favicon is available |
| `strategy` | `'lazy' \| 'eager' \| 'hidden'` | `'lazy'` | Detection strategy (see [Strategies](#strategies)) |
| `onResolved` | `(found: boolean) => void` | -- | Called when detection completes. `true` = found, `false` = globe/error |

All standard `<img>` props (`className`, `style`, `alt`, `loading`, `decoding`, `data-*`, `aria-*`) are spread onto the underlying element. `src`, `width`, `height`, `onLoad`, `onError` are reserved.

## Strategies

### `lazy` (default)

Shows fallback during detection, swaps to favicon when found.

```tsx
<SiteIcon domain="github.com" fallback={<Spinner />} />
```

### `eager`

Shows the `<img>` immediately. May flash Google's default globe briefly before detection completes.

```tsx
<SiteIcon domain="github.com" strategy="eager" />
```

### `hidden`

Renders a sized empty placeholder during detection. Prevents layout shift.

```tsx
<SiteIcon domain="github.com" strategy="hidden" />
```

### When to use which

| Strategy | During detection | Best for |
|----------|-----------------|----------|
| `lazy` | Shows fallback | Lists with loading states |
| `eager` | Shows `<img>` directly | Above-the-fold content, fastest paint |
| `hidden` | Sized empty placeholder | Preventing layout shift |

## Advanced

### SSR

On the server, `SiteIcon` renders the fallback (for `lazy`) or a placeholder (for `hidden`). Detection runs on the client after hydration. No `window` or `document` access during SSR.

### Ref forwarding

```tsx
const imgRef = useRef<HTMLImageElement>(null);

<SiteIcon ref={imgRef} domain="github.com" />
```

The ref points to the `<img>` element when a favicon is found. When the fallback renders, the ref is `null`.

### `onResolved` callback

Track favicon availability:

```tsx
function FaviconWithStatus({ domain }: { domain: string }) {
  const [found, setFound] = useState<boolean | null>(null);

  return (
    <div>
      <SiteIcon domain={domain} onResolved={setFound} />
      {found === false && <span>No favicon available</span>}
    </div>
  );
}
```

> Memoize `onResolved` if you don't want re-fires on re-render.

## Compare

| Feature | react-site-icon | favicon-stealer | DIY Google CDN | DIY domain fetch | Proxy services |
|---------|:-:|:-:|:-:|:-:|:-:|
| Bundle size | < 1KB | ~3.5KB | 0 | 0 | 0 |
| Dependencies | 0 | 2 | 0 | 0 | 0 |
| Fallback detection | Yes | No | No | No | No |
| Network requests | 1 | 1-2 | 1 | 1+ (may fail) | 1 |
| React versions | 17, 18, 19 | 19 only | Any | Any | Any |
| SSR compatible | Yes | Unknown | Manual | Manual | Manual |
| TypeScript | Full | Full | Manual | Manual | Manual |

## Contributing

```bash
git clone https://github.com/TomyCesaille/react-site-icon.git
cd react-site-icon
npm install
npm test
```

PRs welcome.

## License

[MIT](./LICENSE)
