import React from 'react';

export function ClusterDetailsSkeleton() {
  return (
    <div style={{ padding: '24px' }}>
      {/* Back button on mobile/tablet */}
      <div className="shimmer" style={{ width: '80px', height: '30px', marginBottom: '24px', borderRadius: '4px' }} />
      
      {/* Big Editorial Title */}
      <div className="shimmer" style={{ width: '100%', height: '36px', marginBottom: '12px' }} />
      <div className="shimmer" style={{ width: '85%', height: '36px', marginBottom: '8px' }} />
      <div className="shimmer" style={{ width: '50%', height: '36px', marginBottom: '24px' }} />

      {/* Thin line */}
      <div style={{ height: '1px', borderBottom: '1px solid #222', opacity: 0.15, marginBottom: '24px' }} />

      {/* Article snippet list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="paper-card" style={{ opacity: 0.8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="shimmer" style={{ width: '80px', height: '14px', borderRadius: '2px' }} />
              <div className="shimmer" style={{ width: '60px', height: '12px', borderRadius: '2px', marginLeft: 'auto' }} />
            </div>
            
            {/* Snippet Title */}
            <div className="shimmer" style={{ width: '95%', height: '22px', marginBottom: '8px' }} />
            <div className="shimmer" style={{ width: '60%', height: '22px', marginBottom: '12px' }} />

            {/* Snippet Summary */}
            <div className="shimmer" style={{ width: '100%', height: '14px', marginBottom: '6px' }} />
            <div className="shimmer" style={{ width: '98%', height: '14px', marginBottom: '16px' }} />

            {/* Button */}
            <div className="shimmer" style={{ width: '100px', height: '30px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
