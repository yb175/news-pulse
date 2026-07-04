import React from 'react';

export function TimelineCardSkeleton() {
  return (
    <div className="paper-card" style={{ marginBottom: '16px', opacity: 0.8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        {/* Topic Tag */}
        <div className="shimmer" style={{ width: '60px', height: '14px', borderRadius: '2px' }} />
        {/* Article Count */}
        <div className="shimmer" style={{ width: '40px', height: '14px', borderRadius: '2px', marginLeft: 'auto' }} />
      </div>
      
      {/* Title */}
      <div className="shimmer" style={{ width: '90%', height: '20px', marginBottom: '8px' }} />
      <div className="shimmer" style={{ width: '70%', height: '20px', marginBottom: '12px' }} />
      
      {/* Time & Badges */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
        <div className="shimmer" style={{ width: '80px', height: '12px', borderRadius: '2px' }} />
        <div className="shimmer" style={{ width: '40px', height: '16px', borderRadius: '8px', marginLeft: 'auto' }} />
        <div className="shimmer" style={{ width: '40px', height: '16px', borderRadius: '8px' }} />
      </div>
    </div>
  );
}
