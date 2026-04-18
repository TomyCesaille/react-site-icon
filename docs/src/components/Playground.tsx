import { useState } from 'react';
import { SiteIcon } from 'react-site-icon';

const DEFAULT_DOMAINS = [
  'github.com',
  'google.com',
  'stackoverflow.com',
  'npmjs.com',
  'twitter.com',
  'reddit.com',
  'dev.to',
  'this-domain-does-not-exist-xyz.com',
];

export default function Playground() {
  const [domain, setDomain] = useState('');
  const [size, setSize] = useState(32);
  const [strategy, setStrategy] = useState<'lazy' | 'eager' | 'hidden'>(
    'lazy',
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const trimmed = domain.trim();
  const allDomains = trimmed ? [trimmed, ...DEFAULT_DOMAINS] : DEFAULT_DOMAINS;
  const displayDomain = trimmed || 'github.com';

  return (
    <section
      style={{
        background: 'var(--bg-secondary)',
        padding: 'var(--space-lg)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '20px',
          fontWeight: 700,
          lineHeight: 1.2,
          color: 'var(--text)',
          margin: '0 0 var(--space-md) 0',
        }}
      >
        Try any domain
      </h2>

      <label
        htmlFor="domain-input"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
        }}
      >
        Domain to preview
      </label>
      <input
        id="domain-input"
        type="text"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="github.com, stackoverflow.com, any URL..."
        style={{
          width: '100%',
          padding: '8px 16px',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          fontSize: '16px',
          fontFamily: 'inherit',
          color: 'var(--text)',
          backgroundColor: 'var(--bg)',
          outline: 'none',
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 'var(--space-lg)',
          marginTop: 'var(--space-md)',
        }}
      >
        {allDomains.map((d) => (
          <div
            key={d}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              padding: 'var(--space-sm)',
            }}
          >
            <SiteIcon
              domain={d}
              size={size}
              strategy={strategy}
              fallback={
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: size,
                    height: size,
                    fontSize: size,
                    lineHeight: '1',
                    color: 'var(--text-muted)',
                  }}
                  aria-hidden="true"
                >
                  ?
                </span>
              }
            />
            <span
              style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {d}
            </span>
          </div>
        ))}
      </div>

      <pre
        style={{
          background: 'var(--code-bg)',
          padding: 'var(--space-md)',
          borderRadius: '4px',
          border: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          overflowX: 'auto',
          marginTop: 'var(--space-md)',
          lineHeight: '1.5',
        }}
        aria-label="Generated code example"
      >
        <code>
          <span className="token-keyword">import</span>
          {' { '}
          <span className="token-tag">SiteIcon</span>
          {' } '}
          <span className="token-keyword">from</span>{' '}
          <span className="token-string">'react-site-icon'</span>
          {';'}
          {'\n\n'}
          {'<'}
          <span className="token-tag">SiteIcon</span>
          {'\n'}
          {'  '}
          <span className="token-attr">domain</span>
          {'='}
          <span className="token-string">"{displayDomain}"</span>
          {'\n'}
          {size !== 32 && (
            <>
              {'  '}
              <span className="token-attr">size</span>
              {'={'}
              {size}
              {'}'}
              {'\n'}
            </>
          )}
          {strategy !== 'lazy' && (
            <>
              {'  '}
              <span className="token-attr">strategy</span>
              {'='}
              <span className="token-string">"{strategy}"</span>
              {'\n'}
            </>
          )}
          {'  '}
          <span className="token-attr">fallback</span>
          {'={<'}
          <span className="token-tag">span</span>
          {'>?</'}
          <span className="token-tag">span</span>
          {'>}'}
          {'\n'}
          {'/>'}
        </code>
      </pre>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        aria-expanded={showAdvanced}
        aria-controls="advanced-panel"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--accent)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '14px',
          padding: 'var(--space-sm) 0',
          marginTop: 'var(--space-sm)',
        }}
      >
        {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
      </button>

      <div
        id="advanced-panel"
        style={{
          maxHeight: showAdvanced ? '200px' : '0',
          overflow: 'hidden',
          transition: 'max-height 200ms ease-out',
        }}
      >
        <div
          style={{
            padding: 'var(--space-md) 0',
            display: 'flex',
            gap: 'var(--space-lg)',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              fontSize: '14px',
              color: 'var(--text)',
            }}
          >
            Strategy:{' '}
            <select
              value={strategy}
              onChange={(e) =>
                setStrategy(e.target.value as 'lazy' | 'eager' | 'hidden')
              }
              style={{
                fontFamily: 'inherit',
                fontSize: '14px',
                padding: '4px 8px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg)',
                color: 'var(--text)',
              }}
            >
              <option value="lazy">lazy</option>
              <option value="eager">eager</option>
              <option value="hidden">hidden</option>
            </select>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              fontSize: '14px',
              color: 'var(--text)',
            }}
          >
            Size: {size}px{' '}
            <input
              type="range"
              min={16}
              max={128}
              step={1}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              style={{ accentColor: 'var(--accent)' }}
            />
          </label>
        </div>
      </div>
    </section>
  );
}
