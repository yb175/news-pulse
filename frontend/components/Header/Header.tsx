import React, { useState, useEffect } from 'react';

interface HeaderProps {
  lastUpdated: Date;
}

export default function Header({ lastUpdated }: HeaderProps) {
  const [timeString, setTimeString] = useState('Just now');

  useEffect(() => {
    const updateTime = () => {
      const diffMs = Date.now() - lastUpdated.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      
      if (diffSecs < 30) {
        setTimeString('Updated Just now');
      } else if (diffSecs < 60) {
        setTimeString('Updated < 1 min ago');
      } else if (diffMins === 1) {
        setTimeString('Updated 1 min ago');
      } else {
        setTimeString(`Updated ${diffMins} min ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [lastUpdated]);

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
            fontSize: '11px', 
            fontWeight: 'bold', 
            color: 'var(--text-primary)',
            letterSpacing: '0.05em'
          }}
        >
          BBC • NPR • GUARDIAN
        </span>
        <span 
          className="mono-font" 
          style={{ 
            fontSize: '10px', 
            color: 'var(--text-secondary)',
          }}
        >
          {timeString}
        </span>
        <span 
          className="mono-font" 
          style={{ 
            fontSize: '9px', 
            color: 'var(--accent-red)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
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
