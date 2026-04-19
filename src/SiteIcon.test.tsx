import { createRef } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { SiteIcon } from './SiteIcon';

// -- Helpers (D-01, D-02) --

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

// -- Constants --

const CDN_HOST = 't1.gstatic.com/faviconV2';

describe('SiteIcon', () => {
  // ===== LAZY STRATEGY =====

  describe('lazy strategy', () => {
    it('renders fallback and hidden detection img during loading', () => {
      const { container } = render(
        <SiteIcon domain="github.com" fallback={<span>FB</span>} />,
      );
      expect(container.querySelector('span')).toHaveTextContent('FB');
      const detectionImg = container.querySelector('img');
      expect(detectionImg).not.toBeNull();
      expect(detectionImg).toHaveStyle({ display: 'none' });
      expect(detectionImg).toHaveAttribute('alt', '');
    });

    it('renders visible img with CDN src when favicon found', () => {
      const { container } = render(
        <SiteIcon domain="github.com" fallback={<span>FB</span>} />,
      );
      const detectionImg = container.querySelector('img')!;
      simulateImageLoad(detectionImg, 64);

      const visibleImg = container.querySelector('img');
      expect(visibleImg).not.toBeNull();
      expect(visibleImg).toHaveAttribute(
        'src',
        expect.stringContaining(CDN_HOST),
      );
      expect(visibleImg).toHaveAttribute(
        'src',
        expect.stringContaining('url=http://github.com'),
      );
      expect(container.querySelector('span')).toBeNull();
    });

    it('renders fallback when globe detected (naturalWidth <= 16)', () => {
      const { container } = render(
        <SiteIcon domain="github.com" fallback={<span>FB</span>} />,
      );
      const detectionImg = container.querySelector('img')!;
      simulateImageLoad(detectionImg, 16);

      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('span')).toHaveTextContent('FB');
    });

    it('renders fallback on detection error', () => {
      const { container } = render(
        <SiteIcon domain="github.com" fallback={<span>FB</span>} />,
      );
      const detectionImg = container.querySelector('img')!;
      simulateImageError(detectionImg);

      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('span')).toHaveTextContent('FB');
    });
  });

  // ===== EAGER STRATEGY =====

  describe('eager strategy', () => {
    it('renders visible img with handlers during loading', () => {
      const { container } = render(
        <SiteIcon domain="github.com" strategy="eager" size={48} />,
      );
      const img = container.querySelector('img');
      expect(img).not.toBeNull();
      expect(img).toHaveAttribute('src', expect.stringContaining(CDN_HOST));
      expect(img).toHaveAttribute('width', '48');
      expect(img).toHaveAttribute('height', '48');
    });

    it('keeps visible img when favicon found', () => {
      const { container } = render(
        <SiteIcon domain="github.com" strategy="eager" />,
      );
      const img = container.querySelector('img')!;
      simulateImageLoad(img, 64);

      const foundImg = container.querySelector('img');
      expect(foundImg).not.toBeNull();
      expect(foundImg).toHaveAttribute(
        'src',
        expect.stringContaining('url=http://github.com'),
      );
    });

    it('renders fallback when globe detected', () => {
      const { container } = render(
        <SiteIcon
          domain="github.com"
          strategy="eager"
          fallback={<span>FB</span>}
        />,
      );
      const img = container.querySelector('img')!;
      simulateImageLoad(img, 16);

      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('span')).toHaveTextContent('FB');
    });

    it('renders fallback on error', () => {
      const { container } = render(
        <SiteIcon
          domain="github.com"
          strategy="eager"
          fallback={<span>FB</span>}
        />,
      );
      const img = container.querySelector('img')!;
      simulateImageError(img);

      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('span')).toHaveTextContent('FB');
    });
  });

  // ===== HIDDEN STRATEGY =====

  describe('hidden strategy', () => {
    it('renders sized span and hidden detection img during loading', () => {
      const { container } = render(
        <SiteIcon domain="github.com" strategy="hidden" size={24} />,
      );
      const span = container.querySelector('span');
      expect(span).not.toBeNull();
      expect(span).toHaveStyle({
        display: 'inline-block',
        width: '24px',
        height: '24px',
      });

      const detectionImg = container.querySelector('img');
      expect(detectionImg).not.toBeNull();
      expect(detectionImg).toHaveStyle({ display: 'none' });
    });

    it('renders visible img when favicon found', () => {
      const { container } = render(
        <SiteIcon domain="github.com" strategy="hidden" />,
      );
      const detectionImg = container.querySelector('img')!;
      simulateImageLoad(detectionImg, 64);

      expect(container.querySelector('span')).toBeNull();
      const visibleImg = container.querySelector('img');
      expect(visibleImg).not.toBeNull();
      expect(visibleImg).toHaveAttribute(
        'src',
        expect.stringContaining('url=http://github.com'),
      );
    });

    it('renders fallback when globe detected', () => {
      const { container } = render(
        <SiteIcon
          domain="github.com"
          strategy="hidden"
          fallback={<span>FB</span>}
        />,
      );
      const detectionImg = container.querySelector('img')!;
      simulateImageLoad(detectionImg, 16);

      // No detection img, no placeholder span with inline-block style
      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('span[style*="inline-block"]')).toBeNull();
      // Fallback span is rendered
      expect(container).toHaveTextContent('FB');
    });

    it('renders fallback on error', () => {
      const { container } = render(
        <SiteIcon
          domain="github.com"
          strategy="hidden"
          fallback={<span>FB</span>}
        />,
      );
      const detectionImg = container.querySelector('img')!;
      simulateImageError(detectionImg);

      // No detection img, no placeholder span with inline-block style
      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('span[style*="inline-block"]')).toBeNull();
      // Fallback span is rendered
      expect(container).toHaveTextContent('FB');
    });
  });

  // ===== DOMAIN NORMALIZATION =====

  describe('domain normalization', () => {
    it('strips protocol and path from full URL', () => {
      const { container } = render(
        <SiteIcon domain="https://github.com/user/repo?tab=1#readme" />,
      );
      const img = container.querySelector('img')!;
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining('url=http://github.com'),
      );
      expect(img.getAttribute('src')).not.toContain('/user/repo');
    });

    it('strips http protocol', () => {
      const { container } = render(<SiteIcon domain="http://example.com" />);
      const img = container.querySelector('img')!;
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining('url=http://example.com'),
      );
    });

    it('handles bare domain', () => {
      const { container } = render(<SiteIcon domain="github.com" />);
      const img = container.querySelector('img')!;
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining('url=http://github.com'),
      );
    });

    it('preserves www prefix', () => {
      const { container } = render(<SiteIcon domain="www.github.com" />);
      const img = container.querySelector('img')!;
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining('url=http://www.github.com'),
      );
    });

    it('strips port number', () => {
      const { container } = render(<SiteIcon domain="localhost:3000" />);
      const img = container.querySelector('img')!;
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining('url=http://localhost'),
      );
      expect(img.getAttribute('src')).not.toContain(':3000');
    });

    it('shows fallback for empty string domain', () => {
      const { container } = render(
        <SiteIcon domain="" fallback={<span>FB</span>} />,
      );
      // Empty domain enters loading state on first render with an empty-src detection img
      // Fallback is still rendered alongside the detection img (lazy default)
      expect(container.querySelector('span')).toHaveTextContent('FB');
    });

    it('shows fallback for whitespace-only string domain', () => {
      const { container } = render(
        <SiteIcon domain="   " fallback={<span>FB</span>} />,
      );
      // Whitespace trims to empty, same behavior as empty string
      expect(container.querySelector('span')).toHaveTextContent('FB');
    });

    it('passes through invalid input (no dots) to CDN URL', () => {
      const { container } = render(<SiteIcon domain="notadomain" />);
      const img = container.querySelector('img')!;
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining('url=http://notadomain'),
      );
    });

    it('handles domain with subdomain and path', () => {
      const { container } = render(
        <SiteIcon domain="https://docs.google.com/spreadsheets/d/123" />,
      );
      const img = container.querySelector('img')!;
      expect(img).toHaveAttribute(
        'src',
        expect.stringContaining('url=http://docs.google.com'),
      );
      expect(img.getAttribute('src')).not.toContain('/spreadsheets');
    });
  });

  // ===== SSR =====

  describe('SSR', () => {
    it('includes fallback content in server-rendered HTML', () => {
      const html = renderToString(
        <SiteIcon domain="github.com" fallback={<span>Loading...</span>} />,
      );
      // Lazy strategy renders fallback + hidden detection img during loading
      // Server captures the initial loading state
      expect(html).toContain('Loading...');
    });

    it('includes detection img in server-rendered HTML for lazy strategy', () => {
      const html = renderToString(
        <SiteIcon domain="github.com" fallback={<span>Loading...</span>} />,
      );
      // The lazy strategy renders a hidden detection img during loading
      // This is expected: the img will trigger detection on hydration
      expect(html).toContain('github.com');
    });
  });

  // ===== REF AND PROPS =====

  describe('ref and props', () => {
    it('forwards ref to img element in found state', () => {
      const ref = createRef<HTMLImageElement>();
      const { container } = render(<SiteIcon domain="github.com" ref={ref} />);
      const detectionImg = container.querySelector('img')!;
      simulateImageLoad(detectionImg, 64);

      expect(ref.current).toBeInstanceOf(HTMLImageElement);
      expect(ref.current).toHaveAttribute(
        'src',
        expect.stringContaining('github.com'),
      );
    });

    it('spreads restProps onto img in found state', () => {
      const { container } = render(
        <SiteIcon
          domain="github.com"
          data-testid="my-icon"
          aria-label="GitHub"
          className="icon-class"
        />,
      );
      const detectionImg = container.querySelector('img')!;
      simulateImageLoad(detectionImg, 64);

      const visibleImg = container.querySelector('img')!;
      expect(visibleImg).toHaveAttribute('data-testid', 'my-icon');
      expect(visibleImg).toHaveAttribute('aria-label', 'GitHub');
      expect(visibleImg).toHaveClass('icon-class');
    });

    it('applies size as width and height attributes', () => {
      const { container } = render(<SiteIcon domain="github.com" size={64} />);
      const detectionImg = container.querySelector('img')!;
      simulateImageLoad(detectionImg, 64);

      const visibleImg = container.querySelector('img')!;
      expect(visibleImg).toHaveAttribute('width', '64');
      expect(visibleImg).toHaveAttribute('height', '64');
    });
  });

  // ===== onResolved CALLBACK =====

  describe('onResolved callback', () => {
    it('calls with true when favicon found', () => {
      const onResolved = vi.fn();
      const { container } = render(
        <SiteIcon domain="github.com" onResolved={onResolved} />,
      );
      const detectionImg = container.querySelector('img')!;
      simulateImageLoad(detectionImg, 64);

      expect(onResolved).toHaveBeenCalledWith(true);
      expect(onResolved).toHaveBeenCalledTimes(1);
    });

    it('calls with false when globe detected', () => {
      const onResolved = vi.fn();
      const { container } = render(
        <SiteIcon domain="github.com" onResolved={onResolved} />,
      );
      const detectionImg = container.querySelector('img')!;
      simulateImageLoad(detectionImg, 16);

      expect(onResolved).toHaveBeenCalledWith(false);
      expect(onResolved).toHaveBeenCalledTimes(1);
    });

    it('calls with false on error', () => {
      const onResolved = vi.fn();
      const { container } = render(
        <SiteIcon domain="github.com" onResolved={onResolved} />,
      );
      const detectionImg = container.querySelector('img')!;
      simulateImageError(detectionImg);

      expect(onResolved).toHaveBeenCalledWith(false);
      expect(onResolved).toHaveBeenCalledTimes(1);
    });

    it('calls with false for empty domain', () => {
      const onResolved = vi.fn();
      render(<SiteIcon domain="" onResolved={onResolved} />);

      expect(onResolved).toHaveBeenCalledWith(false);
    });
  });

  // ===== DOMAIN CHANGE =====

  describe('domain change', () => {
    it('ignores stale load from previous domain', () => {
      const onResolved = vi.fn();
      const { container, rerender } = render(
        <SiteIcon
          domain="a.com"
          fallback={<span>FB</span>}
          onResolved={onResolved}
        />,
      );
      const oldImg = container.querySelector('img')!;

      rerender(
        <SiteIcon
          domain="b.com"
          fallback={<span>FB</span>}
          onResolved={onResolved}
        />,
      );

      // Simulate the old domain's image loading -- should be ignored
      simulateImageLoad(oldImg, 64);

      // Component should still show loading state for b.com (fallback + detection img)
      const currentImg = container.querySelector('img');
      expect(currentImg).not.toBeNull();
      expect(currentImg).toHaveAttribute(
        'src',
        expect.stringContaining('url=http://b.com'),
      );
    });

    it('resets to loading state when domain changes', () => {
      const { container, rerender } = render(
        <SiteIcon domain="github.com" fallback={<span>FB</span>} />,
      );
      const detectionImg = container.querySelector('img')!;
      simulateImageLoad(detectionImg, 64);

      // Now in found state
      expect(container.querySelector('img')).toHaveAttribute(
        'src',
        expect.stringContaining('url=http://github.com'),
      );

      // Change domain
      rerender(<SiteIcon domain="gitlab.com" fallback={<span>FB</span>} />);

      // Should be back in loading state
      expect(container.querySelector('span')).toHaveTextContent('FB');
      const newDetectionImg = container.querySelector('img');
      expect(newDetectionImg).toHaveAttribute(
        'src',
        expect.stringContaining('url=http://gitlab.com'),
      );
    });
  });

  // ===== HYDRATION (PRE-LOADED IMAGES) =====

  describe('hydration (pre-loaded images)', () => {
    let completeSpy: ReturnType<typeof vi.spyOn>;
    let naturalWidthSpy: ReturnType<typeof vi.spyOn>;

    afterEach(() => {
      completeSpy?.mockRestore();
      naturalWidthSpy?.mockRestore();
    });

    it('resolves favicon when detection img is already loaded at mount (lazy)', () => {
      completeSpy = vi
        .spyOn(HTMLImageElement.prototype, 'complete', 'get')
        .mockReturnValue(true);
      naturalWidthSpy = vi
        .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
        .mockReturnValue(64);

      const { container } = render(
        <SiteIcon domain="github.com" fallback={<span>FB</span>} />,
      );

      // Should have transitioned to "found" -- visible img, no fallback
      const visibleImg = container.querySelector('img');
      expect(visibleImg).not.toBeNull();
      expect(visibleImg).toHaveAttribute(
        'src',
        expect.stringContaining('url=http://github.com'),
      );
      expect(visibleImg).not.toHaveStyle({ display: 'none' });
      expect(container.querySelector('span')).toBeNull();
    });

    it('shows fallback when pre-loaded detection img has globe (lazy)', () => {
      completeSpy = vi
        .spyOn(HTMLImageElement.prototype, 'complete', 'get')
        .mockReturnValue(true);
      naturalWidthSpy = vi
        .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
        .mockReturnValue(16);

      const { container } = render(
        <SiteIcon domain="github.com" fallback={<span>FB</span>} />,
      );

      // Should have transitioned to "missing" -- fallback rendered, no img
      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('span')).toHaveTextContent('FB');
    });

    it('resolves favicon when img is already loaded at mount (eager)', () => {
      completeSpy = vi
        .spyOn(HTMLImageElement.prototype, 'complete', 'get')
        .mockReturnValue(true);
      naturalWidthSpy = vi
        .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
        .mockReturnValue(64);

      const { container } = render(
        <SiteIcon
          domain="github.com"
          strategy="eager"
          fallback={<span>FB</span>}
        />,
      );

      // Should have transitioned to "found" -- visible img remains
      const visibleImg = container.querySelector('img');
      expect(visibleImg).not.toBeNull();
      expect(visibleImg).toHaveAttribute(
        'src',
        expect.stringContaining('url=http://github.com'),
      );
      expect(container.querySelector('span')).toBeNull();
    });

    it('calls onResolved when img is pre-loaded', () => {
      completeSpy = vi
        .spyOn(HTMLImageElement.prototype, 'complete', 'get')
        .mockReturnValue(true);
      naturalWidthSpy = vi
        .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
        .mockReturnValue(64);

      const onResolved = vi.fn();
      render(
        <SiteIcon domain="github.com" onResolved={onResolved} />,
      );

      expect(onResolved).toHaveBeenCalledWith(true);
      expect(onResolved).toHaveBeenCalledTimes(1);
    });

    it('shows fallback when pre-loaded detection img has naturalWidth=0 (error)', () => {
      completeSpy = vi
        .spyOn(HTMLImageElement.prototype, 'complete', 'get')
        .mockReturnValue(true);
      naturalWidthSpy = vi
        .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
        .mockReturnValue(0);

      const { container } = render(
        <SiteIcon domain="github.com" fallback={<span>FB</span>} />,
      );

      // Should have transitioned to "missing" -- fallback rendered, no img
      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('span')).toHaveTextContent('FB');
    });
  });

  // ===== DEFAULT PROPS =====

  describe('default props', () => {
    it('defaults to lazy strategy', () => {
      const { container } = render(
        <SiteIcon domain="github.com" fallback={<span>FB</span>} />,
      );
      // Lazy shows fallback + hidden detection img
      expect(container.querySelector('span')).toHaveTextContent('FB');
      const img = container.querySelector('img');
      expect(img).toHaveStyle({ display: 'none' });
    });

    it('defaults to size 32', () => {
      const { container } = render(<SiteIcon domain="github.com" />);
      const img = container.querySelector('img')!;
      expect(img).toHaveAttribute('src', expect.stringContaining('size=32'));
    });

    it('renders no visible content when empty domain and no fallback', () => {
      const { container } = render(<SiteIcon domain="" />);
      // No fallback provided, no visible text content
      expect(container.querySelector('span')).toBeNull();
      expect(container.textContent).toBe('');
    });
  });
});
