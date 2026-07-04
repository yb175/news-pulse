import React from 'react';
import { TimelineCluster } from '../../lib/api';

interface TimelineItemProps {
  item: TimelineCluster;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function TimelineItem({ item, isSelected, onSelect }: TimelineItemProps) {
  const isClustered = item.articleCount > 1;
  
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      style={{
        display: 'flex',
        gap: '20px',
        cursor: 'pointer',
        position: 'relative',
        paddingBottom: '24px'
      }}
    >
      {/* Visual connection line */}
      <div style={{
        position: 'absolute',
        left: '119px',
        top: '12px',
        bottom: 0,
        width: '2px',
        background: 'var(--border-color)',
        zIndex: 1
      }}></div>

      {/* Date & Time Range */}
      <div style={{ width: '100px', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {startTimeStr} - {endTimeStr}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{startDateStr}</span>
      </div>

      {/* Visual node marker */}
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: isClustered ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.2)',
        border: isSelected ? '3px solid #ffffff' : '2px solid var(--bg-color)',
        boxShadow: isClustered ? '0 0 8px rgba(6, 182, 212, 0.6)' : 'none',
        marginTop: '6px',
        zIndex: 2,
        flexShrink: 0
      }}></div>

      {/* Content card */}
      <div
        className="glass-panel"
        style={{
          flexGrow: 1,
          padding: '16px',
          background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--panel-bg)',
          borderColor: isSelected ? 'var(--accent-blue)' : 'var(--border-color)',
          transform: isSelected ? 'scale(1.01)' : 'none',
          boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.2)' : 'none'
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {item.label}
        </h3>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
            {item.articleCount} {item.articleCount === 1 ? 'article' : 'articles grouped'}
          </span>
        </div>
      </div>
    </div>
  );
}
