# API Design

## Base URL
`/api`

---

# 1. Get Timeline

Returns summarized cluster data for rendering the timeline.

## Endpoint
`GET /timeline`

## Query Parameters (Optional)

| Parameter | Type | Description |
| --- | --- | --- |
| sources | string[] (comma-separated) | Filter by sources (e.g. `BBC News,NPR,The Guardian`) |

### Example
`GET /timeline?sources=BBC News,NPR`

---

## Response
```json
[
  {
    "clusterId": "c1",
    "label": "Apple WWDC",
    "startTime": "2026-07-03T08:15:00Z",
    "endTime": "2026-07-03T13:20:00Z",
    "articleCount": 5
  },
  {
    "clusterId": "c2",
    "label": "Middle East",
    "startTime": "2026-07-03T07:40:00Z",
    "endTime": "2026-07-03T18:45:00Z",
    "articleCount": 9
  }
]
```

---

**Purpose**: Frontend Timeline.

---

# 2. Get All Clusters

Returns cluster summaries.

## Endpoint
`GET /clusters`

---

## Response
```json
[
  {
    "id": "c1",
    "label": "Apple WWDC",
    "articleCount": 5,
    "timeRange": {
      "start": "2026-07-03T08:15:00Z",
      "end": "2026-07-03T13:20:00Z"
    }
  }
]
```

---

**Purpose**: Cluster List.

---

# 3. Get Cluster Details

Returns all articles inside a cluster.

## Endpoint
`GET /clusters/:id`

### Example
`GET /clusters/c1`

---

## Response
```json
{
  "id": "c1",
  "label": "Apple WWDC",
  "articles": [
    {
      "id": "a1",
      "title": "Apple launches...",
      "summary": "Full summary text here...",
      "source": "BBC News",
      "url": "https://example.com/wwdc-1",
      "publishedAt": "2026-07-03T08:15:00Z"
    },
    {
      "id": "a2",
      "title": "WWDC Announcements",
      "summary": "Snippet description...",
      "source": "NPR",
      "url": "https://example.com/wwdc-2",
      "publishedAt": "2026-07-03T13:20:00Z"
    }
  ]
}
```

---

**Purpose**: Cluster Details panel.

---

# 4. Trigger Ingestion

Starts Python pipeline.

## Endpoint
`POST /ingest/trigger`

### Request Body
```json
{}
```
*No body required.*

---

## Response
```json
{
  "jobId": "job_123",
  "status": "queued"
}
```

---

**Purpose**: Refresh button.

---

# 5. Check Job Status

Frontend polls until completed.

## Endpoint
`GET /ingest/status/:jobId`

### Example
`GET /ingest/status/job_123`

---

## Response (Running)
```json
{
  "jobId": "job_123",
  "status": "running"
}
```

---

## Response (Completed)
```json
{
  "jobId": "job_123",
  "status": "completed",
  "completedAt": "2026-07-03T14:30:00Z"
}
```

---

## Response (Failed)
```json
{
  "jobId": "job_123",
  "status": "failed",
  "error": "RSS fetch failed."
}
```

---

# Error Responses

## 400 Bad Request
```json
{
  "error": "Invalid request."
}
```

---

## 404 Not Found
```json
{
  "error": "Cluster not found."
}
```

---

## 500 Internal Server Error
```json
{
  "error": "Internal Server Error."
}
```

---

# Frontend API Flow

## Initial Page Load
```
Frontend
   │
   ▼
GET /timeline
   │
   ▼
Render Timeline
```

---

## User Clicks Cluster
```
Timeline
   │
   ▼
GET /clusters/:id
   │
   ▼
Render Articles
```

---

## User Refreshes
```
POST /ingest/trigger
   │
   ▼
jobId
   │
   ▼
Poll
   │
   ▼
GET /ingest/status/:jobId
   │
   ▼
Completed
   │
   ▼
GET /timeline
   │
   ▼
Timeline Updated
```

---

# API ↔ UI Mapping

| Frontend Component | Endpoint |
| --- | --- |
| Timeline | `GET /timeline` |
| Cluster Details | `GET /clusters/:id` |
| Refresh Button | `POST /ingest/trigger` |
| Polling | `GET /ingest/status/:jobId` |
| Source Filter | `GET /timeline?sources=BBC News,NPR` |
