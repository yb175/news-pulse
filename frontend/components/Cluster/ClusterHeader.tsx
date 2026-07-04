import React from 'react';
import { ClusterDetails } from '../../lib/api';

interface ClusterHeaderProps {
  cluster: ClusterDetails;
}

export default function ClusterHeader({ cluster }: ClusterHeaderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
        {cluster.label}
      </h3>
    </div>
  );
}
