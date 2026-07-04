import React from 'react';
import { TimelineCardSkeleton } from './TimelineCardSkeleton';

export function TimelineListSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <TimelineCardSkeleton />
      <TimelineCardSkeleton />
      <TimelineCardSkeleton />
      <TimelineCardSkeleton />
    </div>
  );
}
