# News Pulse

News Pulse is a premium, newspaper-style intelligence workstation that aggregates, parses, deduplicates, and clusters live news feeds into an interactive, high-density dashboard. 

The application is structured as a monorepo containing a Python-based scraper ingestion pipeline, a Node/Express backend API, and a Next.js frontend web app.

---

## 1. System Architecture & Data Flow

News Pulse uses a decoupled architecture where the scraping pipeline, the backend REST API, and the frontend user interface communicate via a shared PostgreSQL database, HTTP endpoints, and Server-Sent Events (SSE).

### High-Level System Design

![System Architecture](./docs/architecture.png)

### Design Note: Manual Refresh Trigger

> The manual **"Refresh"** trigger is intentionally not exposed on the frontend.

Since ingestion hits live RSS feeds and writes to a shared production database, exposing an unthrottled trigger to all users risked redundant scraper runs under concurrent clicks.

**Instead:**
- Ingestion runs on a **15-minute schedule** automatically
- `POST /ingest/trigger` remains available for on-demand / testing use, but isn't wired to a public UI button
- Live updates reach the frontend via **SSE**, with no user action required


## 2. Subsystem Architectures

### A. 4-Layer Backend Architecture Flow
The Express-based backend API is built using a clean 4-layer architecture for strict separation of concerns, testability, and framework independence.

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

### B. Ingestion Trigger Pipeline Flow
When a manual ingestion run is triggered, the Express backend spawns the Python scraper in a background child process asynchronously and returns an immediate response without blocking the client.

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

### C. Scheduled Worker Abstraction
A background scheduler runs as an interval timer inside the backend process to automate periodic news ingestion.

```mermaid
graph LR
    ServerBoot["Server Boot (server.ts)"] -->|Initializes| Worker["startIngestionWorker()"]
    Worker -->|setInterval timer| IntervalTimer{"15 Minutes Elapsed?"}
    IntervalTimer -->|Yes| Trigger["IngestionService.triggerIngestion()"]
    Trigger -->|1. Create job record| DB[("Database")]
    Trigger -->|2. Run background Scraper| Scraper["Python Process"]
    IntervalTimer -->|No| Idle["Wait"]
```

### D. Scraper Pipeline Class Diagram
The ingestion pipeline is implemented in Python and designed using standard OOP patterns. Below is the class design diagram representing the components of the news scraper.

![Scraper Class Diagram](./scraper/class_diagram.png)

---

## 3. Database Schema

We use PostgreSQL as our database, modeled using Prisma. The database schema design centers around three primary tables: `IngestionJob` (for tracking scrapers), `Cluster` (representing a grouping of similar news), and `Article` (which stores the actual parsed articles).

### Entity Relationship Diagram
```mermaid
erDiagram
    IngestionJob {
        String id PK
        JobStatus status
        DateTime startedAt
        DateTime completedAt
        Int articlesFound
        String logs
    }
    Cluster {
        String id PK
        String title
        String summary
        DateTime createdAt
        DateTime updatedAt
    }
    Article {
        String id PK
        String title
        String url UK
        String source
        String author
        String body
        String bodySnippet
        DateTime publishedAt
        DateTime scrapedAt
        String clusterId FK
    }
    Cluster ||--o{ Article : contains
```

---

## 4. Repository Structure

Below is the directory structure of the monorepo:

```text
news-pulse/
├── .env.example
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Continuous Integration workflow
│       └── react-doctor.yml           # React health & diagnostics workflow
├── .gitignore
├── README.md                          # Root documentation (this file)
├── backend/                           # Express.js REST API
│   ├── Dockerfile
│   ├── README.md                      # Backend specific developer docs
│   ├── entrypoint.sh
│   ├── package.json
│   ├── src/
│   │   ├── app.ts                     # Express app setup
│   │   ├── controllers/               # Route requests & HTTP interfaces
│   │   ├── jobs/                      # Background runner jobs & workers
│   │   ├── lib/                       # Prisma client initialization
│   │   ├── middleware/                # Error handling & middleware logic
│   │   ├── repositories/              # Direct database query layers
│   │   ├── routes/                    # Route registrations
│   │   ├── services/                  # Business & orchestration logic
│   │   ├── tests/                     # Unit and integration test suites
│   │   ├── types/
│   │   └── server.ts                  # Backend server entrypoint
│   ├── tsconfig.json
│   └── vitest.config.ts
├── db/                                # Shared Database & Prisma schema configuration
│   ├── README.md                      # DB-specific setup instructions
│   ├── docker/
│   │   └── docker-compose.yml         # Local PostgreSQL container definition
│   ├── package.json
│   ├── prisma/
│   │   ├── migrations/                # Database migration scripts
│   │   ├── schema.prisma              # Database schema definitions
│   │   └── seed.ts                    # Development database seeding script
│   └── tsconfig.json
├── docs/                              # Global design & decisions docs
│   ├── api-design.md                  # REST endpoint definitions
│   ├── architecture.png               # System architecture design
│   ├── database-schema.md             # Detailed DB models layout
│   ├── decisions.md                   # Architecture Decision Records (ADRs)
│   └── deployment-guide.md            # Production deployment guidelines
├── frontend/                          # Next.js UI Application
│   ├── README.md                      # Frontend-specific architecture documentation
│   ├── app/                           # Next.js App Router Pages
│   │   ├── globals.css                # Global styles, variables, typography
│   │   ├── layout.tsx                 # Root layout & typeface loads
│   │   ├── page.tsx                   # Workstation layout & SSE handler
│   │   └── providers.tsx              # React Query Client wrapping
│   ├── components/                    # UI Components
│   │   ├── Cluster/                   # Articles, Details pane, and Headers
│   │   ├── Filters/                   # Dropdown search filter components
│   │   ├── Header/                    # Application title & update tickers
│   │   ├── Refresh/                   # Hard-sync user actions
│   │   ├── Skeleton/                  # Shimmer loaders for loading states
│   │   └── Timeline/                  # Chronological timeline column
│   ├── hooks/                         # React hooks for timeline & pagination logic
│   ├── lib/                           # API utilities & constants
│   ├── package.json
│   └── tsconfig.json
├── scraper/                           # Python RSS Ingestion Pipeline
│   ├── README.md                      # Scraper documentation & unit tests guide
│   ├── class_diagram.png              # Class design illustration
│   ├── clustering/                    # Jaccard similarities & clustering logic
│   ├── config.py                      # Configurations & environment loads
│   ├── deduplication/                 # Duplication detection strategies
│   ├── extraction/                    # BeautifulSoup article details scraper
│   ├── main.py                        # Scraper execution entry point
│   ├── models/                        # Datatypes & Pydantic models
│   ├── normalization/                 # Parsing feeds to normalized items
│   ├── persistence/                   # Storing scraped articles to DB
│   ├── providers/                     # Source-specific feed parsers (BBC, NPR, Guardian)
│   ├── requirements.txt               # Python package dependencies
│   ├── tests/                         # Unit and integration test suites
│   └── utils/
├── package.json                       # Turborepo root workspace settings
└── turbo.json                         # Turborepo pipeline settings
```

---

## 5. Environment Configuration

The monorepo uses a single `.env` file at the root for overall settings.

### Root Environment Variables (`.env`)

| Variable | Example | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/newspulse?schema=public` | PostgreSQL connection string used by Prisma. |
| `PORT` | `5000` | Port for the backend Express API server. |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | The endpoint the Next.js frontend uses to query the backend. |
| `SCRAPER_PYTHON_PATH` | `python3` | The path or binary name for Python to run the scraper. |
| `SCRAPER_INTERVAL_MINUTES` | `60` | The background interval for automated scraper execution (in minutes). |

### Database symlink `.env`
Prisma commands executed inside the `db/` folder require a `.env` file in the same directory. To keep a single source of truth, we symlink `db/.env` to the root `.env`:
```bash
# Run from the project root directory
ln -sf "$(pwd)/.env" db/.env
```

---

## 6. Local Development Setup

Follow these steps to set up and run the entire ecosystem locally:

### 1. Prerequisites
Verify you have the following installed:
- Node.js 18+ & npm
- Python 3.10+
- Docker & Docker Compose

### 2. Setup Environment Configuration
Copy the template variables and create the database symlink:
```bash
cp .env.example .env
ln -sf "$(pwd)/.env" db/.env
```

### 3. Spin Up PostgreSQL Database
Using Docker, start the PostgreSQL container:
```bash
npm run db:up
```

### 4. Setup Schema and Database Seed
Generate the Prisma client, deploy database migrations, and seed mock data:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. Running the Application
Start both the backend REST API and the frontend Next.js workstation concurrently using Turborepo:
```bash
npm run dev
```
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Frontend App**: [http://localhost:3000](http://localhost:3000)

### 6. Executing the Python Ingestion Pipeline Manually
To manually run the pipeline scraper:
```bash
# Set up Python virtual environment in scraper directory
cd scraper
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run the ingestion scraper
PYTHONPATH=. python main.py
```

---

## 7. Running Tests

You can run automated test suites for both Node.js and Python subsystems.

### Backend REST API Tests
Backend tests use Vitest:
```bash
npm run test --workspace=backend
```

### Scraper Ingestion Pipeline Tests
Scraper tests use Pytest:
```bash
cd scraper
source .venv/bin/activate
PYTHONPATH=. pytest
```
