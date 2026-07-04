# Architecture Decision Records (ADR)

This document tracks decisions made regarding the technology choices and directory layout for `news-pulse`.

## ADR 1: Monorepo Structure with Turborepo
- **Context**: The project combines a Python scraper, a Node/Express backend API, and a Next.js frontend web app.
- **Decision**: Adopt a monorepo structure orchestrated by Turborepo.
- **Consequences**:
  - Code dependencies and build pipelines are managed from the root directory.
  - Simplified package sharing (e.g., sharing the database schema between backend and db helper scripts).
  - Faster local compilation and execution.

## ADR 2: PostgreSQL with Prisma ORM
- **Context**: The app stores structured data (Articles, Clusters, Ingestion Jobs) that need relational integrity.
- **Decision**: Use PostgreSQL as the relational database, accessed via Prisma.
- **Consequences**:
  - PostgreSQL handles relations and concurrent reads/writes well during scraping.
  - Prisma provides automatic typescript types and easy-to-write database migrations.

## ADR 3: Decoupled Python Scraper Pipeline
- **Context**: Content scraping, HTML parsing, extraction, and clustering (using embeddings/keywords) are complex tasks suited to Python's rich data processing ecosystem.
- **Decision**: Keep the scraper as a standalone Python project, which can be run independently or triggered from the Node backend.
- **Consequences**:
  - Enables clean separation of concerns.
  - Allows backend to execute scraper dynamically using process spawning or background job queues.
