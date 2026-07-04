import { useState, useEffect } from 'react';
import { fetchClusterDetails, ClusterDetails } from '../lib/api';

export function useCluster(clusterId: string | null) {
  const [cluster, setCluster] = useState<ClusterDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clusterId) {
      setCluster(null);
      return;
    }

    async function loadCluster(id: string) {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchClusterDetails(id);
        setCluster(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadCluster(clusterId);
  }, [clusterId]);

  return { cluster, loading, error };
}
