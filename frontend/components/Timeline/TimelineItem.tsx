import React from 'react';
import { TimelineCluster } from '../../lib/api';

interface TimelineItemProps {
  item: TimelineCluster;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function TimelineItem({ item, isSelected, onSelect }: TimelineItemProps) {
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const startTimeStr = formatTime(item.startTime);
  const endTimeStr = formatTime(item.endTime);
  const startDateStr = formatDate(item.startTime);

  return (
    <div
      onClick={() => onSelect(item.clusterId)}
      className={`paper-card ${isSelected ? 'active' : ''}`}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      {/* Editorial Accent Bar (Deep Red) */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: 'var(--accent-red)',
          borderRadius: '4px 0 0 4px'
        }} />
      )}

      {/* Header Row: Date & Article Count Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span 
          className="mono-font" 
          style={{ 
            fontSize: '10px', 
            fontWeight: 'bold', 
            color: 'var(--accent-red)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {startDateStr}
        </span>
        <span 
          className="mono-font" 
          style={{ 
            fontSize: '9px', 
            fontWeight: 'bold', 
            padding: '2px 6px',
            border: '1px solid var(--border-color)',
            borderRadius: '2px',
            background: 'var(--bg-color)',
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {item.articleCount} {item.articleCount === 1 ? 'Article' : 'Articles'}
        </span>
      </div>

      {/* Title / Topic headline */}
      <h3 
        style={{ 
          fontSize: '15px', 
          fontWeight: 700, 
          fontFamily: 'var(--font-serif)',
          color: 'var(--text-primary)',
          lineHeight: '1.3',
          margin: 0
        }}
      >
        {item.label}
      </h3>

      {/* Footer Row: Time range & Source Badges */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '2px',
          gap: '8px'
        }}
      >
        {/* Time range */}
        <span 
          className="mono-font" 
          style={{ 
            fontSize: '10px', 
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em'
          }}
        >
          {startTimeStr} → {endTimeStr}
        </span>

        {/* Source Badges */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {item.sources && item.sources.slice(0, 3).map((source) => (
            <span
              key={source}
              className="mono-font"
              style={{
                fontSize: '9px',
                fontWeight: 'bold',
                padding: '2px 6px',
                border: '1px solid var(--border-color)',
                borderRadius: '2px',
                background: 'var(--bg-color)',
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
              }}
            >
              {source.replace(/\s+News$/i, '')}
            </span>
          ))}
          {item.sources && item.sources.length > 3 && (
            <span
              className="mono-font"
              style={{
                fontSize: '9px',
                fontWeight: 'bold',
                padding: '2px 4px',
                border: '1px solid var(--border-color)',
                borderRadius: '2px',
                background: 'var(--bg-color)',
                color: 'var(--text-secondary)'
              }}
            >
              +{item.sources.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
