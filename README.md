# News Pulse Monorepo

News Pulse is a pipeline and web platform for aggregating news articles, parsing RSS feeds, deduplicating articles, clustering them into key news timelines, and showing a visual timeline interface.

## Repository Structure

```text
news-pulse/
├── docs/                             # Architecture & designs
├── db/                               # Shared Database & Prisma
├── scraper/                          # Python Ingestion Pipeline
├── backend/                          # Express.js REST API
└── frontend/                         # Next.js UI Application
```

## Quick Start

### 1. Requirements
Ensure you have the following installed:
- Node.js 18+ & npm
- Python 3.10+
- Docker & Docker Compose

### 2. Configure Environment
Copy `.env.example` to `.env` and adjust the variables if needed.
```bash
cp .env.example .env
```

### 3. Spin Up Local Database
```bash
npm run db:up
```

### 4. Setup Database Models & Seed
Run Prisma migrations and seed the database with mock data.
```bash
npm run db:migrate
npm run db:seed
```

### 5. Running the Application in Development Mode
You can start the backend and frontend concurrently:
```bash
npm run dev
```
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Frontend App**: [http://localhost:3000](http://localhost:3000)

### 6. Running the Scraper
To manually run the ingestion scraper:
```bash
cd scraper
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
