import React from 'react';

export default function TimelineLegend() {
  return (
    <div style={{ display: 'flex', gap: '20px', fontSize: '11px', color: 'var(--text-secondary)', padding: '8px 12px', borderBottom: '1px solid var(--border-color)', margin: '10px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
        <span>Single Source</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }}></span>
        <span>Clustered Timeline Event (Multi-Source)</span>
      </div>
    </div>
  );
}
