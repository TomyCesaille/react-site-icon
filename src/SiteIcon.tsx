import type { CSSProperties, ReactNode } from 'react';

export interface SiteIconProps {
  /** Domain to fetch the favicon for (e.g. "github.com") */
  domain: string;
  /** Requested favicon size in pixels */
  size?: number;
  /** Content to render when no favicon is available */
  fallback?: ReactNode;
  /** CSS class for the img element */
  className?: string;
  /** Inline styles for the img element */
  style?: CSSProperties;
  /** Alt text for the favicon image */
  alt?: string;
}

const buildUrl = (domain: string, size: number): string =>
  `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=${String(size)}`;

export function SiteIcon({
  domain,
  size = 32,
  className,
  style,
  alt = '',
}: SiteIconProps): React.JSX.Element {
  return (
    <img
      src={buildUrl(domain, size)}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={style}
    />
  );
}
