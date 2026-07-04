import React from 'react';
import { useCluster } from '../../hooks/useCluster';
import ClusterHeader from './ClusterHeader';
import ArticleCard from './ArticleCard';

interface ClusterDetailsProps {
  clusterId: string | null;
  onClose: () => void;
}

export default function ClusterDetails({ clusterId, onClose }: ClusterDetailsProps) {
  const { cluster, loading, error } = useCluster(clusterId);

  if (!clusterId) {
    return (
      <div className="glass-panel" style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '300px', color: 'var(--text-secondary)' }}>
        Select a cluster from the timeline to see related articles and aggregate summaries.
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', minHeight: '400px', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>CLUSTER ANALYSIS</span>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}>✕ Close</button>
      </div>

      {loading && <div style={{ color: 'var(--text-secondary)' }}>Loading cluster data...</div>}
      {error && <div style={{ color: '#ef4444' }}>Error: {error}</div>}

      {cluster && (
        <>
          <ClusterHeader cluster={cluster} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '450px' }}>
            <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Aggregated Articles ({cluster.articles.length})</h4>
            {cluster.articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
