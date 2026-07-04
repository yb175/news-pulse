import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ArticleCard from './ArticleCard';
import { fetchClusterDetails } from '../../lib/api';
import { ClusterDetailsSkeleton } from '../Skeleton/SkeletonLoader';

interface ClusterDetailsProps {
  clusterId: string | null;
  onClose: () => void;
}

const emptyDetailsStyle: React.CSSProperties = {
  padding: '40px', 
  display: 'flex', 
  flexDirection: 'column',
  justifyContent: 'center', 
  alignItems: 'center', 
  height: '100%', 
  minHeight: '300px', 
  textAlign: 'center',
  color: 'var(--text-secondary)',
  background: 'var(--surface-color)',
  borderStyle: 'dashed'
};

const dismissButtonStyle: React.CSSProperties = {
  marginTop: '16px', 
  padding: '6px 12px', 
  border: '1px solid var(--accent-red)', 
  background: 'transparent', 
  color: 'var(--accent-red)', 
  fontWeight: 'bold',
  borderRadius: '4px',
  cursor: 'pointer'
};

export default function ClusterDetails({ clusterId, onClose }: ClusterDetailsProps) {
  const {
    data: cluster,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['cluster', clusterId],
    queryFn: () => fetchClusterDetails(clusterId!),
    enabled: !!clusterId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  if (!clusterId) {
    return (
      <div 
        className="paper-card" 
        style={emptyDetailsStyle}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '16px', opacity: 0.5 }}>
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
        </svg>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>No Cluster Selected</h3>
        <p style={{ fontSize: '13px', maxWidth: '300px', lineHeight: '1.5' }}>
          Select a news cluster from the timeline index to inspect detailed timelines, grouped sources, and full coverage details.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <ClusterDetailsSkeleton />;
  }

  if (isError) {
    return (
      <div style={{ color: 'var(--accent-red)', padding: '24px', border: '1px solid var(--accent-red)', borderRadius: '4px', background: '#FADBD8' }}>
        <h3 className="mono-font" style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>ERROR_LOADING_CLUSTER</h3>
        <p style={{ fontSize: '14px' }}>{error instanceof Error ? error.message : 'Could not fetch cluster articles.'}</p>
        <button 
          type="button"
          onClick={onClose} 
          style={dismissButtonStyle}
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Detail header action metadata */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="mono-font eyebrow-red">
          Coverage Detail
        </span>
        <button 
          type="button"
          onClick={onClose} 
          className="mono-font close-btn"
        >
          <span>✕ Close</span>
        </button>
      </div>

      {cluster && (
        <>
          {/* Large Editorial Headline */}
          <h2 
            style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              fontFamily: 'var(--font-serif)',
              color: 'var(--text-primary)',
              lineHeight: '1.3',
              margin: 0
            }}
          >
            {cluster.label}
          </h2>

          <div style={{ height: '1px', background: 'var(--border-color)', opacity: 0.15 }} />

          {/* List of articles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 className="mono-font eyebrow-gray">
              Grouped Coverage ({cluster.articles.length} Snippets)
            </h3>
            <div className="articles-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cluster.articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Responsive columns for article grids on wider screen (like Tablet) */}
      <style>{`
        @media (min-width: 768px) and (max-width: 1024px) {
          .articles-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
