# News Pulse - Backend API Documentation

This directory contains the Express-based backend API for the News Pulse application. The backend handles querying, aggregating, and formatting news timelines and clusters, as well as orchestrating and scheduling background ingestion runs.

---

## 1. Architectural Abstractions

The backend is built following a clean **4-Layer Architecture** to achieve strict separation of concerns, testability, and framework independence.

> [!TIP]
> **How to render diagrams:** If your Markdown reader does not render Mermaid diagrams natively, copy the block contents below and paste them into the online [Mermaid Live Editor](https://mermaid.live).

### 4-Layer Architecture Flow
```mermaid
graph TD
    Client["Client (Frontend / Pollers)"] -->|HTTP Request| Router["1. Express Router (Routes mapping)"]
    Router -->|Controller Delegation| Controller["2. Controller Layer (Input validation, status mapping)"]
    Controller -->|Calls Service| Service["3. Service Layer (Business rules, DTO mapping)"]
    Service -->|Uses Repository| Repository["4. Repository Layer (Data queries & access only)"]
    Repository -->|ORM queries| ORM["Prisma ORM Client"]
    ORM -->|SQL commands| DB["Database (PostgreSQL)"]
    
    %% Error Flow
    Controller -.->|error catch / next| ErrorHandler["Centralized Error Handler Middleware"]
    ErrorHandler -.->|formatted JSON| Client
```

* **Express Router Layer**: Handles routing paths and HTTP verbs. Uses `router.route()` chains to return a `405 Method Not Allowed` fallback on registered endpoints for unsupported verbs, and delegates unknown paths to the `404 Endpoint Not Found` catch-all.
* **Controller Layer**: Responsible for request parameter parsing and input validations (e.g. checking UUID formats). Delegates execution to the Service Layer and forwards any user/database error to the Express next-chain handler (`next(error)`).
* **Service Layer**: House for pure business logic, sorting algorithms, and mapping raw database models to DTO structures. Free of Express/HTTP or Prisma database connections.
* **Repository Layer**: Responsible solely for database query execution via Prisma Client. Free of business logic or DTO mapping.

---

## 2. Ingestion Trigger Pipeline Flow

Spawns the Python scraper in a background child process asynchronously, returning an immediate queued response to the API client without blocking.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Controller as IngestController
    participant Service as IngestionService
    participant Repo as IngestionJobRepository
    participant Runner as PythonRunner
    participant Process as Python Scraper (main.py)

    Client->>Controller: POST /api/ingest/trigger
    Controller->>Service: triggerIngestion()
    Service->>Repo: createJob() (status = PENDING)
    Repo-->>Service: job record
    Service->>Runner: launch(jobId)
    
    note over Runner, Process: Spawn Child Process (Async)
    Runner->>Process: spawn("python3", ["main.py"])
    Runner->>Repo: updateStatus(jobId, RUNNING, 0)
    
    Service-->>Controller: jobId
    Controller-->>Client: 200 OK { jobId, status: "queued" }
    
    loop Gather Logs
        Process->>Runner: stdout / stderr streams
    end
    
    Process-->>Runner: process exit (code)
    alt Exit Code = 0
        Runner->>Repo: updateStatus(jobId, COMPLETED, articlesCount, logs)
    else Exit Code != 0
        Runner->>Repo: updateStatus(jobId, FAILED, 0, logs)
    end
```

---

## 3. Scheduled Worker Abstraction

A scheduled ingestion worker runs as a background interval inside the node server process.

```mermaid
graph LR
    ServerBoot["Server Boot (server.ts)"] -->|Initializes| Worker["startIngestionWorker()"]
    Worker -->|setInterval timer| IntervalTimer{"15 Minutes Elapsed?"}
    IntervalTimer -->|Yes| Trigger["IngestionService.triggerIngestion()"]
    Trigger -->|1. Create job record| DB[("Database")]
    Trigger -->|2. Run background Scraper| Scraper["Python Process"]
    IntervalTimer -->|No| Idle["Wait"]
```

---

## 4. Key Architectural & Business Assumptions

### A. Sources Filter Logic (Timeline API)
* **At-Least-One Rule**: A cluster is included in the timeline if it contains **at least one article** matching the requested source names.
* **Case-Insensitive Substring Match**: Source name filters are case-insensitive and match substrings. For example, a search for `"BBC"` matches `"BBC News"`, `"BBC World"`, and `"BBC"`.
* **Malformed Inputs Graceful Fallback**: If the `sources` query parameter is empty, contains only spaces, or is malformed (e.g. `sources=,,`), it is ignored, and the timeline defaults to unfiltered clusters instead of returning a `400 Bad Request`.

### B. Cluster Summary Sorting (Cluster Listing API)
* **Sorting Rule**: Cluster summaries are sorted by start time descending (`timeRange.start DESC`), showing the newest activity first.
* **Empty Clusters**: Clusters with no articles (and therefore no start/end time ranges) are pushed to the end of the list.

### C. Article DTO Property Mapping (Cluster Details API)
* **Field Mapping**: In the database, the `Article` model uses `bodySnippet` to store the article text preview. In the API DTO schemas, the frontend expects `summary`. The Service Layer explicitly maps `bodySnippet` to `summary` to avoid leaking database schema details to clients.
* **Sorting Rule**: Articles inside a cluster are sorted descending by publication date (`publishedAt DESC`).

### D. Ingestion Job States Mapping
* **Prisma Enums to API Statuses**: The database stores ingestion job status using a Prisma Enum (`JobStatus`), while the API returns lowercase string categories. The mapping is:
  - Database `PENDING` $\rightarrow$ API `'queued'`
  - Database `RUNNING` $\rightarrow$ API `'running'`
  - Database `COMPLETED` $\rightarrow$ API `'completed'`
  - Database `FAILED` $\rightarrow$ API `'failed'`

---

## 5. API Endpoint Specifications

All endpoints use centralized error mapping and return standard JSON error structures:

* **`400 Bad Request`**: Malformed request payload or parameters. Returns `{ "error": "Reason" }`.
* **`404 Not Found`**: Resource or endpoint path not found. Returns `{ "error": "Reason" }`.
* **`405 Method Not Allowed`**: Endpoint path matched but HTTP verb is not supported. Returns `{ "error": "Method Not Allowed" }`.
* **`500 Internal Server Error`**: System error or database connection issue. Returns `{ "error": "Internal Server Error." }`.

### 1. Timeline Endpoint
Returns aggregated cluster metadata for rendering the timeline.

* **Path**: `/api/timeline`
* **Method**: `GET`
* **Query Parameters**:
  * `days` *(optional, positive integer)*: The timeline lookback window in days. Defaults to `7`.
  * `sources` *(optional, string)*: Comma-separated list of source filter values (e.g. `BBC,NPR`).
* **Success Response (200 OK)**:
  ```json
  [
    {
      "clusterId": "6454dbd2-5076-43c9-bd41-2e8fd765cdc2",
      "label": "AI Standard Alliance",
      "startTime": "2026-07-04T10:00:00.000Z",
      "endTime": "2026-07-04T14:00:00.000Z",
      "articleCount": 3
    }
  ]
  ```

### 2. Cluster Summaries Listing
Returns basic summaries for all active clusters.

* **Path**: `/api/clusters`
* **Method**: `GET`
* **Query Parameters**: None.
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "6454dbd2-5076-43c9-bd41-2e8fd765cdc2",
      "label": "AI Standard Alliance",
      "articleCount": 3,
      "timeRange": {
        "start": "2026-07-04T10:00:00.000Z",
        "end": "2026-07-04T14:00:00.000Z"
      }
    }
  ]
  ```

### 3. Cluster Details
Returns the detailed information and full articles belonging to a specific cluster.

* **Path**: `/api/clusters/:id`
* **Method**: `GET`
* **Path Parameters**:
  * `id` *(required, UUID)*: Unique identifier of the cluster.
* **Success Response (200 OK)**:
  ```json
  {
    "id": "6454dbd2-5076-43c9-bd41-2e8fd765cdc2",
    "label": "AI Standard Alliance",
    "articles": [
      {
        "id": "8c4ab7a2-f903-4b09-a1b7-d86b72a0c441",
        "title": "Major Tech Players Sign Safety Accord",
        "summary": "Following recent policy concerns, tech organizations signed an accord...",
        "source": "BBC News",
        "url": "http://bbc.com/news/12345",
        "publishedAt": "2026-07-04T14:00:00.000Z"
      }
    ]
  }
  ```

### 4. Trigger Ingestion
Manually triggers the background scraper execution, returning immediately.

* **Path**: `/api/ingest/trigger`
* **Method**: `POST`
* **Success Response (200 OK)**:
  ```json
  {
    "jobId": "f784e2a1-bd08-410a-8bf8-d62be0429f52",
    "status": "queued"
  }
  ```

### 5. Ingestion Job Status
Queries the current state of an ingestion execution.

* **Path**: `/api/ingest/status/:jobId`
* **Method**: `GET`
* **Path Parameters**:
  * `jobId` *(required, UUID)*: Unique identifier of the ingestion job.
* **Success Response (200 OK)**:
  * For completed runs:
    ```json
    {
      "jobId": "f784e2a1-bd08-410a-8bf8-d62be0429f52",
      "status": "completed",
      "completedAt": "2026-07-04T14:15:32.000Z"
    }
    ```

---

## 6. Developing & Running Locally

### Install Dependencies
```bash
npm install
```

### Start Development Server
Starts the Express API server (by default listening on port `5000`):
```bash
npm run dev
```

### Run Tests
Executes unit and integration test suites using Vitest:
```bash
npm run test
```

### Database Seeding
Populate the development database with mock news articles and clusters (run this command from the monorepo root directory):
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/newspulse?schema=public" npm run db:seed
```
Alternatively, run the seed script directly from the `backend/` directory via Prisma CLI:
```bash
npx prisma db seed
```
