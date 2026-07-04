# Deployment and CI/CD Architecture Guide

This document outlines the recommended deployment pipeline and CI/CD configurations for the `news-pulse` monorepo, targeting **Vercel** for the Next.js frontend, **Render** for the Express backend, and **GitHub Actions** for CI/CD automation.

---

## 1. High-Level Deployment Architecture

```mermaid
graph TD
    subgraph GitHub Repository
        Code[Monorepo Code Base]
    end

    subgraph CI/CD (GitHub Actions)
        Lint[Lint & Typecheck]
        Test[Scraper/Backend Tests]
    end

    subgraph Vercel (Frontend)
        NextApp[Next.js App]
    end

    subgraph Render (Backend & Scraper)
        DockerApp[Docker Runtime: Node.js + Python]
        DB[(PostgreSQL Managed DB)]
    end

    Code -->|Push to main| Lint & Test
    Lint & Test -->|Success| NextApp
    Lint & Test -->|Success| DockerApp
    DockerApp -->|Spawns| Scraper[Python Scraper]
    DockerApp -->|Prisma Client| DB
    NextApp -->|Fetch API /api| DockerApp
```

---

## 2. Backend Deployment on Render

Because the Express backend triggers the Python scraper as a child process, the runtime environment **must contain both Node.js and Python** along with all pip packages. 

Using Render's native Node.js web service will fail because Python is not pre-installed. The most robust solution is to deploy the backend on Render using **Docker**.

### Suggested `backend/Dockerfile` (Multi-stage Node + Python environment)
Create this file in the `backend/` directory to construct the container:

```dockerfile
# 1. Base Image with Node.js and Python
# NOTE: Alpine ships with OpenSSL 3.x. The binaryTargets field in schema.prisma
# must include "linux-musl-openssl-3.0.x" so Prisma bundles the correct engine.
FROM nikolaik/python-nodejs:python3.10-nodejs18-alpine

WORKDIR /app

# 2. Install global packages and monorepo dependencies
COPY package*.json ./
COPY turbo.json ./
COPY backend/package*.json ./backend/
COPY db/package*.json ./db/
COPY db/prisma ./db/prisma/

RUN npm install

# 3. Copy Scraper and install dependencies
COPY scraper/requirements.txt ./scraper/
RUN pip install -r scraper/requirements.txt
COPY scraper/ ./scraper/

# 4. Copy backend source code and compile
COPY backend/ ./backend/
RUN npx prisma generate --schema=db/prisma/schema.prisma
RUN npm run build --workspace=backend

ENV PORT=5000
EXPOSE 5000

WORKDIR /app/backend
CMD ["npm", "run", "start"]
```

### Render Configuration Steps
1. Create a new **Web Service** on Render.
2. Select your repository.
3. Choose **Docker** as the Runtime (Render will automatically detect the Dockerfile).
4. Point the **Docker Context** to the root folder `.` and **Docker Path** to `./backend/Dockerfile`.
5. Define the following environment variables:
   - `DATABASE_URL`: Connection string of your production database.
   - `PORT`: `5000`
   - `SCRAPER_PYTHON_PATH`: `python3`

---

## 3. Frontend Deployment on Vercel

Vercel natively supports monorepos and Next.js applications.

### Vercel Configuration Steps
1. Create a new project on Vercel.
2. Under **Root Directory**, choose the `frontend` folder.
3. Vercel will automatically detect the Next.js framework.
4. Under **Build & Development Settings**, configure:
   - **Build Command**: `next build`
5. Under **Environment Variables**, define:
   - `NEXT_PUBLIC_API_URL`: `https://your-render-backend-url.onrender.com/api` (points to your Render web service).

---

## 4. CI/CD Pipeline (GitHub Actions)

Create a workflow file `.github/workflows/ci.yml` to run tests and typechecks automatically on pull requests and pushes to `main`.

### Suggested `.github/workflows/ci.yml`
```yaml
name: CI

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  lint-and-typecheck:
    name: Code Quality & Build Checks
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'
          cache: 'pip'

      # Install node dependencies
      - name: Install Node Dependencies
        run: npm install

      # Verify backend and database layers build
      - name: Build Database & Generate Prisma Client
        run: |
          npm run db:generate
          npm run typecheck --workspace=db

      - name: Build Backend
        run: npm run build --workspace=backend

      # Verify frontend builds
      - name: Build Frontend
        run: npm run build --workspace=frontend
        env:
          NEXT_PUBLIC_API_URL: "http://localhost:5000/api"

      # Install Python Scraper dependencies & run tests
      - name: Install Scraper Dependencies
        run: |
          pip install -r scraper/requirements.txt

      - name: Run Scraper Tests
        run: |
          cd scraper
          pytest
```
