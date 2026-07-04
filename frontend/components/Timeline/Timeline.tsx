import React from 'react';
import TimelineItem from './TimelineItem';
import TimelineLegend from './TimelineLegend';
import { TimelineCluster } from '../../lib/api';

interface TimelineProps {
  items: TimelineCluster[];
  selectedClusterId: string | null;
  onSelectCluster: (id: string) => void;
}

export default function Timeline({ items, selectedClusterId, onSelectCluster }: TimelineProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Temporal News Feed</h2>
        <TimelineLegend />
      </div>

      {items.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No timeline events found matching search criteria.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '10px' }}>
          {items.map(item => (
            <TimelineItem
              key={item.clusterId}
              item={item}
              isSelected={selectedClusterId === item.clusterId}
              onSelect={onSelectCluster}
            />
          ))}
        </div>
      )}
    </div>
  );
}
