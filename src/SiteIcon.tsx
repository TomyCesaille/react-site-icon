import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

/** Supported favicon sizes from Google's faviconV2 CDN. */
export type SiteIconSize =
  12 | 16 | 24 | 28 | 32 | 40 | 48 | 50 | 64 | 96 | 128;

export interface SiteIconProps extends Omit<
  ComponentPropsWithoutRef<'img'>,
  'src' | 'width' | 'height' | 'onLoad' | 'onError'
> {
  /** Domain to fetch the favicon for (e.g. "github.com" or "https://github.com/user/repo") */
  domain: string;
  /** Requested favicon size in pixels. At size 16, the component internally fetches 24px for detection accuracy. (default: 32) */
  size?: SiteIconSize;
  /** Content to render when no favicon is available */
  fallback?: ReactNode;
  /** Detection strategy: "lazy" shows fallback during detection, "eager" shows img immediately, "hidden" shows sized placeholder (default: "lazy") */
  strategy?: 'lazy' | 'eager' | 'hidden';
  /** Called when detection completes. `true` if favicon found, `false` if globe detected or error. Memoize if you don't want re-fires on re-render. */
  onResolved?: (found: boolean) => void;
}

function normalizeDomain(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  try {
    return new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
      .hostname;
  } catch {
    return trimmed;
  }
}

const buildUrl = (domain: string, size: number): string =>
  `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=${String(size)}`;

const GOOGLE_GLOBE_SIZE = 16;
const DETECTION_MIN_FETCH_SIZE = 24;

const SiteIcon = forwardRef<HTMLImageElement, SiteIconProps>(function SiteIcon(
  {
    domain,
    size = 32,
    fallback = null,
    strategy = 'lazy',
    onResolved,
    ...rest
  },
  ref,
) {
  const normalizedDomain = normalizeDomain(domain);
  // Request 24px when size is exactly 16 so detection can distinguish real favicons from the 16px globe
  const fetchSize =
    size === GOOGLE_GLOBE_SIZE ? DETECTION_MIN_FETCH_SIZE : size;
  const src = normalizedDomain ? buildUrl(normalizedDomain, fetchSize) : '';

  const [status, setStatus] = useState<'loading' | 'found' | 'missing'>(
    normalizedDomain ? 'loading' : 'missing',
  );
  // Track previous domain via state to detect changes during render (no ref access)
  const [prevDomain, setPrevDomain] = useState(normalizedDomain);
  // Ref for stale detection in event handlers only (not accessed during render)
  const domainRef = useRef(normalizedDomain);
  // Ref callback for post-mount hydration check (.complete detection)
  // When the img element mounts, check if the browser already loaded it (SSR pre-fetch / cache).
  // Using a ref callback avoids calling setState inside useEffect (lint-safe).
  const statusRef = useRef(status);
  const onResolvedRef = useRef(onResolved);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    onResolvedRef.current = onResolved;
  }, [onResolved]);

  const checkComplete = useCallback((img: HTMLImageElement | null) => {
    if (!img || statusRef.current !== 'loading') return;
    if (img.complete) {
      const found = img.naturalWidth > GOOGLE_GLOBE_SIZE;
      setStatus(found ? 'found' : 'missing');
      onResolvedRef.current?.(found);
    }
  }, []);

  // Domain change: reset status during render
  // This is the React-approved "adjust state during render" pattern
  if (prevDomain !== normalizedDomain) {
    setPrevDomain(normalizedDomain);
    setStatus(normalizedDomain ? 'loading' : 'missing');
  }

  // Sync ref for stale detection in handlers
  useEffect(() => {
    domainRef.current = normalizedDomain;
  }, [normalizedDomain]);

  // Fire onResolved(false) for empty domain
  useEffect(() => {
    if (!normalizedDomain) {
      onResolved?.(false);
    }
  }, [normalizedDomain, onResolved]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    if (domainRef.current !== normalizedDomain) return; // stale
    const found = e.currentTarget.naturalWidth > GOOGLE_GLOBE_SIZE;
    setStatus(found ? 'found' : 'missing');
    onResolved?.(found);
  };

  const handleError = (): void => {
    if (domainRef.current !== normalizedDomain) return; // stale
    setStatus('missing');
    onResolved?.(false);
  };

  // Found: identical for all strategies
  if (status === 'found') {
    return (
      <img ref={ref} src={src} width={size} height={size} alt="" {...rest} />
    );
  }

  // Missing: identical for all strategies
  if (status === 'missing') {
    return <>{fallback}</>;
  }

  // Loading: differs by strategy
  const detectionImg = (
    <img
      ref={checkComplete}
      key={normalizedDomain}
      src={src}
      style={{ display: 'none' }}
      onLoad={handleLoad}
      onError={handleError}
      alt=""
    />
  );

  switch (strategy) {
    case 'eager':
      // Show img immediately, detect on same img's onLoad
      return (
        <img
          ref={(el) => {
            checkComplete(el);
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
          }}
          src={src}
          width={size}
          height={size}
          alt=""
          onLoad={handleLoad}
          onError={handleError}
          {...rest}
        />
      );
    case 'hidden':
      // Sized empty span + hidden detection img
      return (
        <>
          <span
            style={{ display: 'inline-block', width: size, height: size }}
          />
          {detectionImg}
        </>
      );
    default:
      // Fallback + hidden detection img
      return (
        <>
          {fallback}
          {detectionImg}
        </>
      );
  }
});

export { SiteIcon };
