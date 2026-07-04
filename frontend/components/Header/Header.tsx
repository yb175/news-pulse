import React, { useState, useEffect } from 'react';
import { SOURCES_LIST } from '../../lib/constants';

interface HeaderProps {
  lastUpdated: Date | null;
  isRefetching?: boolean;
}

export default function Header({ lastUpdated, isRefetching = false }: HeaderProps) {
  // Simple tick timer to force-render relative timestamp updates every 10 seconds
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  // Compute relative time string on every render
  // Only meaningful when we actually have a timestamp
  const diffMs = lastUpdated ? Date.now() - lastUpdated.getTime() : null;
  const diffSecs = diffMs !== null ? Math.floor(diffMs / 1000) : null;
  const diffMins = diffSecs !== null ? Math.floor(diffSecs / 60) : null;

  let timeString = '';
  if (diffSecs === null) {
    timeString = ''; // no data yet — shimmer will show instead
  } else if (diffSecs < 30) {
    timeString = 'Updated Just now';
  } else if (diffSecs < 60) {
    timeString = 'Updated < 1 min ago';
  } else if (diffMins === 1) {
    timeString = 'Updated 1 min ago';
  } else {
    timeString = `Updated ${diffMins} min ago`;
  }

  // Show shimmer when: initial load (no timestamp yet) OR background refetch in progress
  const showShimmer = isRefetching || !lastUpdated;

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 40px',
      height: '82px',
      boxSizing: 'border-box',
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--surface-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Left side: Serif broadsheet title logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ 
          fontFamily: 'var(--font-serif)', 
          fontSize: '26px', 
          fontWeight: 750, 
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          textTransform: 'uppercase'
        }}>
          News Pulse
        </h1>
      </div>
      
      {/* Right side: Dynamic system status metadata stack */}
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-end', 
          gap: '2px',
          textAlign: 'right' 
        }}
      >
        <span 
          className="mono-font" 
          style={{ 
            fontSize: '12px', 
            fontWeight: 'bold', 
            color: 'var(--text-primary)',
            letterSpacing: '0.05em'
          }}
        >
          {SOURCES_LIST.map(s => s.replace(/ News$/, '').toUpperCase()).join(' • ')}
        </span>
        {showShimmer ? (
          <span
            className="shimmer"
            style={{
              display: 'inline-block',
              width: '110px',
              height: '11px',
              borderRadius: '3px',
              marginTop: '1px',
            }}
          />
        ) : (
          <span className="mono-font timestamp-text">
            {timeString}
          </span>
        )}
        <span 
          className="mono-font eyebrow-red"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent-red)' }} />
          Live Coverage
        </span>
      </div>
    </header>
  );
}
