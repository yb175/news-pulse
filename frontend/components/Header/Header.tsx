import React, { useState, useEffect } from 'react';
import { SOURCES_LIST } from '../../lib/constants';

interface HeaderProps {
  lastUpdated: Date | null;
}

export default function Header({ lastUpdated }: HeaderProps) {
  // Simple tick timer to force-render relative timestamp updates every 10 seconds
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  // Compute relative time string on every render
  const diffMs = lastUpdated ? Date.now() - lastUpdated.getTime() : 0;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  
  let timeString = 'Updated Just now';
  if (diffSecs >= 30 && diffSecs < 60) {
    timeString = 'Updated < 1 min ago';
  } else if (diffSecs >= 60 && diffMins === 1) {
    timeString = 'Updated 1 min ago';
  } else if (diffSecs >= 60) {
    timeString = `Updated ${diffMins} min ago`;
  }

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
        <span className="mono-font timestamp-text">
          {timeString}
        </span>
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
