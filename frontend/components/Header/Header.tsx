import React from 'react';

export default function Header() {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 40px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(13, 15, 18, 0.8)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'var(--accent-gradient)',
          boxShadow: '0 0 12px var(--accent-cyan)'
        }}></div>
        <h1 className="gradient-text" style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
          NEWS PULSE
        </h1>
      </div>
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
        Aggregating, Deduplicating & Clustering Live News
      </div>
    </header>
  );
}
