import { useState, useEffect, useCallback } from 'react';
import { fetchTimeline, TimelineCluster } from '../lib/api';

export function useTimeline(days: number = 7) {
  const [timeline, setTimeline] = useState<TimelineCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTimeline(days, selectedSources);
      setTimeline(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [days, selectedSources]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  return { timeline, loading, error, selectedSources, setSelectedSources, refetch: loadTimeline };
}
