'use client';

import React, { useState } from 'react';
import Header from '../components/Header/Header';
import Timeline from '../components/Timeline/Timeline';
import SourceFilter from '../components/Filters/SourceFilter';
import ClusterDetails from '../components/Cluster/ClusterDetails';
import RefreshButton from '../components/Refresh/RefreshButton';
import { useTimeline } from '../hooks/useTimeline';

export default function Home() {
  const { timeline, loading, error, selectedSources, setSelectedSources, refetch } = useTimeline();
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Header />
      
      <main style={{ flexGrow: 1, padding: '40px', maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: '300px 1fr 400px', gap: '30px' }}>
        {/* Left column: Actions & Filters */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <RefreshButton onRefreshCompleted={refetch} />
          <SourceFilter selectedSources={selectedSources} onChange={setSelectedSources} />
        </section>

        {/* Center column: Timeline */}
        <section>
          {loading && <div style={{ color: 'var(--text-secondary)' }}>Loading news timelines...</div>}
          {error && <div style={{ color: '#ef4444' }}>Error: {error}</div>}
          {!loading && !error && (
            <Timeline
              items={timeline}
              selectedClusterId={selectedClusterId}
              onSelectCluster={setSelectedClusterId}
            />
          )}
        </section>

        {/* Right column: Selected Cluster Details */}
        <section>
          <ClusterDetails
            clusterId={selectedClusterId}
            onClose={() => setSelectedClusterId(null)}
          />
        </section>
      </main>
    </div>
  );
}
