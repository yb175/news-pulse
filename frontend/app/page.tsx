'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '../components/Header/Header';
import Timeline from '../components/Timeline/Timeline';
import SourceFilter from '../components/Filters/SourceFilter';
import ClusterDetails from '../components/Cluster/ClusterDetails';
import RefreshButton from '../components/Refresh/RefreshButton';
import { fetchTimeline, fetchLatestJob } from '../lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Home() {
  const queryClient = useQueryClient();
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);

  // TanStack Query for Timelines
  const {
    data: timeline = [],
    isLoading,
    isError,
    error,
    refetch: refetchTimeline,
    isRefetching: isRefetchingTimeline,
  } = useQuery({
    queryKey: ['timeline', selectedSources],
    queryFn: () => fetchTimeline(7, selectedSources),
    staleTime: 5 * 60 * 1000, // 5 minutes fresh time
  });

  // TanStack Query for latest ingestion job status
  const {
    data: latestJob = null,
    refetch: refetchLatestJob,
    isRefetching: isRefetchingLatestJob,
  } = useQuery({
    queryKey: ['latestJob'],
    queryFn: fetchLatestJob,
    staleTime: 5 * 60 * 1000, // 5 minutes fresh time
  });

  // Calculate active selected cluster during render (Derived State)
  const activeClusterId = selectedClusterId && timeline.some(t => t.clusterId === selectedClusterId)
    ? selectedClusterId
    : (timeline[0]?.clusterId || null);

  // Derive "last updated" from the completedAt timestamp of the most recent completed ingestion job.
  const lastUpdatedDate = latestJob?.completedAt
    ? new Date(latestJob.completedAt)
    : null;

  const isSyncing = isRefetchingTimeline || isRefetchingLatestJob;

  const handleRefresh = async () => {
    refetchTimeline();
    refetchLatestJob();
  };

  // Server-Sent Events (SSE) for instant sync on ingest
  useEffect(() => {
    const sseUrl = `${API_BASE_URL}/updates`;
    console.log(`[SSE] Connecting to ${sseUrl}`);
    const eventSource = new EventSource(sseUrl);

    eventSource.addEventListener('news-updated', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Ingest update event received:', data);
        
        // Invalidate active queries to trigger silent background refetch
        queryClient.invalidateQueries({ queryKey: ['timeline'] });
        queryClient.invalidateQueries({ queryKey: ['cluster'] });
        queryClient.invalidateQueries({ queryKey: ['latestJob'] });
      } catch (err) {
        console.error('[SSE] Failed to parse SSE event data:', err);
      }
    });

    return () => {
      console.log('[SSE] Closing connection');
      eventSource.close();
    };
  }, [queryClient]);

  return (
    <div className="app-wrapper">
      <Header lastUpdated={lastUpdatedDate} isRefetching={isSyncing} />
      
      {/* Editorial Responsive Layout */}
      <main className="app-container" style={{ maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {/* Left column: Coverage Timelines & Filters */}
        <section 
          className="timeline-sidebar"
          style={{ 
            padding: '20px 24px', 
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <h2 className="mono-font" style={{ fontSize: '12px', letterSpacing: '0.05em', color: 'var(--accent-red)', textTransform: 'uppercase' }}>
              Coverage Index
            </h2>
            {isSyncing && (
              <span className="mono-font" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                syncing...
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <RefreshButton onRefresh={handleRefresh} isRefreshing={isSyncing} />
              <SourceFilter selectedSources={selectedSources} onChange={setSelectedSources} />
            </div>
            <div className="thin-hr" style={{ margin: 0 }} />
          </div>

          {isError && (
            <div style={{ color: 'var(--accent-red)', padding: '16px', border: '1px solid var(--accent-red)', borderRadius: '4px', background: '#FADBD8' }}>
              <p className="mono-font" style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>CONNECTION_ERROR</p>
              <p style={{ fontSize: '13px' }}>{error instanceof Error ? error.message : 'Failed to fetch timeline data.'}</p>
            </div>
          )}

          <Timeline
            items={timeline}
            isLoading={isLoading}
            isRefetching={isSyncing}
            selectedClusterId={activeClusterId}
            onSelectCluster={setSelectedClusterId}
          />
        </section>

        {/* Right column: Selected Cluster Details */}
        <section className="details-pane" style={{ padding: '20px 40px' }}>
          <ClusterDetails
            clusterId={activeClusterId}
            onClose={() => setSelectedClusterId(null)}
          />
        </section>
      </main>
    </div>
  );
}
