import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

export interface SiteIconProps extends Omit<
  ComponentPropsWithoutRef<'img'>,
  'src' | 'width' | 'height' | 'onLoad' | 'onError'
> {
  /** Domain to fetch the favicon for (e.g. "github.com" or "https://github.com/user/repo") */
  domain: string;
  /** Requested favicon size in pixels (default: 32) */
  size?: number;
  /** Content to render when no favicon is available */
  fallback?: ReactNode;
  /** Detection strategy: "lazy" shows fallback during detection, "eager" shows img immediately, "hidden" shows sized placeholder (default: "lazy") */
  strategy?: 'lazy' | 'eager' | 'hidden';
  /** Called when detection completes. `true` if favicon found, `false` if globe detected or error. */
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

  // Task 2 will replace this return with full detection state machine + strategy render.
  // For now, render fallback when no valid domain, img otherwise.
  if (!normalizedDomain) {
    onResolved?.(false);
    return <>{fallback}</>;
  }

  // strategy used in Task 2's loading-state render branching
  void strategy;

  return (
    <img ref={ref} src={src} alt="" width={size} height={size} {...rest} />
  );
});

export { SiteIcon };
