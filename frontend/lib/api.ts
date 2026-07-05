const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface TimelineCluster {
  clusterId: string;
  label: string;
  startTime: string;
  endTime: string;
  articleCount: number;
  sources: string[];
}

export interface ClusterSummary {
  id: string;
  label: string;
  articleCount: number;
  timeRange: {
    start: string;
    end: string;
  };
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
}

export interface ClusterDetails {
  id: string;
  label: string;
  articles: Article[];
}

export interface IngestJobResponse {
  jobId: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  completedAt?: string;
  error?: string;
}

export async function fetchTimeline(days: number = 7, sources?: string[]): Promise<TimelineCluster[]> {
  let url = `${API_BASE_URL}/timeline?days=${days}`;
  if (sources && sources.length > 0) {
    url += `&sources=${sources.join(',')}`;
  }
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch timeline');
  }
  return res.json();
}

export async function fetchClusters(): Promise<ClusterSummary[]> {
  const res = await fetch(`${API_BASE_URL}/clusters`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch clusters list');
  }
  return res.json();
}

export async function fetchClusterDetails(id: string): Promise<ClusterDetails> {
  const res = await fetch(`${API_BASE_URL}/clusters/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch cluster details');
  }
  return res.json();
}

export async function triggerIngestion(): Promise<{ jobId: string; status: string }> {
  const res = await fetch(`${API_BASE_URL}/ingest/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  if (!res.ok) {
    throw new Error('Failed to trigger ingestion');
  }
  return res.json();
}

export async function checkJobStatus(jobId: string): Promise<IngestJobResponse> {
  const res = await fetch(`${API_BASE_URL}/ingest/status/${jobId}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to check job status');
  }
  return res.json();
}

export interface LatestJobResponse {
  completedAt: string | null;
}

export async function fetchLatestJob(): Promise<LatestJobResponse> {
  const res = await fetch(`${API_BASE_URL}/ingest/latest`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch latest job status');
  }
  return res.json();
}
