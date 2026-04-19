import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

export interface SiteIconProps extends Omit<
  ComponentPropsWithoutRef<'img'>,
  'src' | 'width' | 'height' | 'onLoad' | 'onError'
> {
  /** Domain to fetch the favicon for (e.g. "github.com" or "https://github.com/user/repo") */
  domain: string;
  /** Requested favicon size in pixels. Supported sizes: 12, 16, 24, 28, 32, 40, 48, 50, 64, 96, 128. Other values will return a different size from the CDN. (default: 32) */
  size?: number;
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

const GOOGLE_DEFAULT_SIZE = 16;

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
  const src = normalizedDomain ? buildUrl(normalizedDomain, size) : '';

  const [status, setStatus] = useState<'loading' | 'found' | 'missing'>(
    'loading',
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
      const found = img.naturalWidth > GOOGLE_DEFAULT_SIZE;
      setStatus(found ? 'found' : 'missing');
      onResolvedRef.current?.(found);
    }
  }, []);

  // Domain change: reset status during render (D-07, D-19)
  // This is the React-approved "adjust state during render" pattern
  if (prevDomain !== normalizedDomain) {
    setPrevDomain(normalizedDomain);
    setStatus(normalizedDomain ? 'loading' : 'missing');
  }

  // Sync ref for stale detection in handlers (D-08)
  useEffect(() => {
    domainRef.current = normalizedDomain;
  }, [normalizedDomain]);

  // Fire onResolved(false) for empty domain (D-19)
  useEffect(() => {
    if (!normalizedDomain) {
      onResolved?.(false);
    }
  }, [normalizedDomain, onResolved]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    if (domainRef.current !== normalizedDomain) return; // stale (D-08)
    const found = e.currentTarget.naturalWidth > GOOGLE_DEFAULT_SIZE;
    setStatus(found ? 'found' : 'missing');
    onResolved?.(found);
  };

  const handleError = (): void => {
    if (domainRef.current !== normalizedDomain) return; // stale (D-08)
    setStatus('missing');
    onResolved?.(false);
  };

  // Found: identical for all strategies (D-10, D-11, D-12, D-13)
  if (status === 'found') {
    return (
      <img ref={ref} src={src} width={size} height={size} alt="" {...rest} />
    );
  }

  // Missing: identical for all strategies (D-14)
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
      // D-03: Show img immediately, detect on same img's onLoad
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
      // D-04: Sized empty span + hidden detection img
      return (
        <>
          <span
            style={{ display: 'inline-block', width: size, height: size }}
          />
          {detectionImg}
        </>
      );
    default:
      // 'lazy' (D-02): Fallback + hidden detection img
      return (
        <>
          {fallback}
          {detectionImg}
        </>
      );
  }
});

export { SiteIcon };
