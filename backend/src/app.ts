import express from 'express';
import cors from 'cors';
import timelineRouter from './routes/timeline.routes';
import clusterRouter from './routes/cluster.routes';
import ingestRouter from './routes/ingest.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/timeline', timelineRouter);
app.use('/api/clusters', clusterRouter);
app.use('/api/ingest', ingestRouter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Fallback Route
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint Not Found' });
});

export default app;
