import { SiteIcon } from 'react-site-icon';
import { useState } from 'react';

const domains = [
  'github.com',
  'google.com',
  'stackoverflow.com',
  'npmjs.com',
  'this-domain-does-not-exist-xyz.com',
];

export function App() {
  const [custom, setCustom] = useState('');
  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
        maxWidth: 480,
      }}
    >
      <h1>react-site-icon</h1>
      <p>Display any website's favicon from its domain.</p>

      {domains.map((domain) => (
        <div
          key={domain}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.75rem',
          }}
        >
          <SiteIcon
            domain={domain}
            size={32}
            fallback={
              <span
                style={{
                  display: 'inline-block',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#e5e7eb',
                }}
              />
            }
          />
          <code>{domain}</code>
        </div>
      ))}

      <hr style={{ margin: '1.5rem 0' }} />
      <h2>Try any domain</h2>
      <input
        type="text"
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        placeholder="Enter a domain..."
        style={{
          padding: '0.5rem',
          fontSize: '1rem',
          width: '100%',
          marginBottom: '0.75rem',
        }}
      />
      {custom && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SiteIcon
            domain={custom}
            size={32}
            fallback={
              <span
                style={{
                  display: 'inline-block',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#e5e7eb',
                }}
              />
            }
          />
          <code>{custom}</code>
        </div>
      )}
    </div>
  );
}
