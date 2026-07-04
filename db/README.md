# Database Module

This package houses the PostgreSQL configuration and Prisma ORM schemas.

## Setup Instructions

### 1. Start the local Database
Ensure Docker is running and execute:
```bash
npm run db:up
```
This spins up the database container on port `5432` in the background.

### 2. Generate Prisma Client
Generates TypeScript interfaces based on `schema.prisma`.
```bash
npm run db:generate
```

### 3. Run Migrations
Synchronizes models to the database schema.
```bash
npm run db:migrate
```

### 4. Seed Database
Fills the PostgreSQL database with mock timeline, cluster, and article data.
```bash
npm run db:seed
```

### 5. Access Prisma Studio
View database data through an interactive web-based interface.
```bash
npx prisma studio
```
