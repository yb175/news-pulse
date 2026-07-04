# News Pulse Frontend – Architecture & System Design

This directory houses the frontend interface for **News Pulse**, a premium, newspaper-style intelligence workstation that aggregates, clusters, and streams live news feeds.

---

## 1. Core Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management & Caching**: [TanStack Query (React Query) v5](https://tanstack.com/query/latest)
- **Styling**: Vanilla CSS (focused on high-information density, premium editorial typography, and ink-charcoal aesthetics)

---

## 2. System Design & Data Flow

```mermaid
graph TD
    subgraph Browser (Client Layer)
        UI[User Interface Components]
        TQ[TanStack Query Cache]
        ES[SSE EventSource Listener]
    end

    subgraph Backend API (Node.js/Express)
        API[Express Controller Routes]
        SSE[SSE Broadcasting Service]
        SCH[Background Scheduler]
    end

    subgraph Scraper (Python)
        SCR[Python Ingestion Script]
    end

    DB[(PostgreSQL Database)]

    %% Connections
    UI -->|useQuery / Fetch| TQ
    TQ -->|HTTP GET /api/timeline| API
    API -->|Prisma Client| DB
    ES -->|Listen to /api/updates| SSE
    SCH -->|Trigger Scraper| SCR
    SCR -->|Clustered Articles| DB
    SCR -->|Exit Code 0| SSE
    SSE -->|Broadcast 'news-updated' event| ES
    ES -->|Invalidate Query Cache| TQ
```

---

## 3. Key Architectural Decisions

### A. Server-Owned State with TanStack Query
We replaced client-side Redux with **TanStack Query** (`@tanstack/react-query`) because the timeline and cluster data are fully owned by the server. 
- **Caching**: The query cache handles background fetches, automatic stale-time logic, and instant UI transitions on back-and-forth timeline selection.
- **Providers**: Configured via a client-side wrapper in `app/providers.tsx` which wraps the root layout.

### B. Real-Time Synchronization via Server-Sent Events (SSE)
To keep the dashboard updated without backend restarts or polling:
- The frontend initiates a single HTTP SSE subscription at `/api/updates` in `app/page.tsx`.
- On backend scheduled scraper runs, the finished status triggers an SSE broadcast to all connected clients.
- When the client receives the `news-updated` signal, TanStack Query invalidates the timeline cache:
  ```typescript
  queryClient.invalidateQueries({ queryKey: ['timeline'] });
  ```
  This triggers a silent, background data update that instantly renders new clusters.

### C. Responsive Column Layout & Scroll Mechanics
- To offer a dashboard experience matching professional newsroom workstations, the viewport height is locked to `100vh` on desktop displays.
- Scrolling of the global window is disabled, and the timeline sidebar (`.timeline-sidebar`) and cluster detail pane (`.details-pane`) have independent scrollbars. This keeps the header and layout controls static.

### D. Dynamic Relative Update Ticker
- The `<Header />` component receives the `lastUpdated` Date stamp.
- An internal React `useEffect` interval recalculates the relative time string every 10 seconds (e.g. `Updated Just now`, `Updated 2 min ago`), keeping the user aware of data freshness.

---

## 4. Visual Design & Theme System

The UI uses a **Broadsheet/Newspaper** Brutalist visual identity, staying away from modern SaaS gradients or flashy animations:
- **Canvas Colors**: Curated warm paper canvas (`#F8F5EE`), flat white cards (`#FFFDF8`), and charcoal ink (`#2B2B2B`).
- **Accent Theme**: Deep editorial red (`#B23A2A`) for active states and live indicators.
- **Border Weight**: Clean `1px` charcoal borders (`border: 1px solid var(--border-color)`).
- **Transitions**: Constrained to a fast `150ms` transition curve to preserve a crisp, snappier feel.
- **Skeleton Shimmer**: Custom newspaper-shaped shimmer skeletons (`SkeletonLoader.tsx`) show layout structures during loading states.

---

## 5. Directory Structure

```text
frontend/
├── app/
│   ├── globals.css         # Typography, layout classes, and design tokens
│   ├── layout.tsx          # Root font imports (Libre Baskerville, Inter)
│   ├── page.tsx            # Main page column structure & SSE connection
│   └── providers.tsx       # TanStack QueryClient wrapping
├── components/
│   ├── Cluster/
│   │   ├── ArticleCard.tsx # Visually secondary news cards
│   │   └── ClusterDetails.tsx # Selected topic detail container
│   ├── Filters/
│   │   └── SourceFilter.tsx # Multi-source selection dropdown
│   ├── Header/
│   │   └── Header.tsx      # Serif branding & dynamic update ticker
│   ├── Refresh/
│   │   └── RefreshButton.tsx # Manual sync feed action
│   ├── Skeleton/
│   │   └── SkeletonLoader.tsx # Editorial shimmer blocks
│   └── Timeline/
│       ├── Timeline.tsx    # Left-hand timeline column & pagination
│       └── TimelineItem.tsx # Curated cluster item card with left red accent bar
└── lib/
    └── api.ts              # Fetch requests & typescript interfaces
```

---

## 6. How to Run Locally

1. Install dependencies in the workspace root:
   ```bash
   npm install
   ```
2. Launch the frontend developer server (runs Next.js on port 3000):
   ```bash
   npm run dev --workspace=frontend
   ```
3. To run the production build:
   ```bash
   npm run build --workspace=frontend
   ```
