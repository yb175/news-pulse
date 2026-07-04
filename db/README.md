# Database Module

This package houses the PostgreSQL configuration and Prisma ORM schemas.

## Environment Configuration

Prisma CLI resolves environment variables from a `.env` file located in the **same directory as `schema.prisma`** (i.e. `db/`). The monorepo root `.env` is not automatically picked up when running Prisma commands from inside `db/`.

### Required Variable

| Variable | Example | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/newspulse?schema=public` | PostgreSQL connection string used by Prisma for migrations, seeding, and the Prisma Client at runtime |

### How `db/.env` is wired

`db/.env` is a **symlink** pointing to the monorepo root `.env`:

```
db/.env → /home/<you>/projects/news-pulse/.env
```

This means both the root tooling and the Prisma CLI inside `db/` share the same single source of truth — no duplication required.

> [!IMPORTANT]
> `db/.env` (the symlink) is gitignored. If you clone a fresh copy of the repo, re-create it with:
> ```bash
> ln -sf "$(pwd)/.env" db/.env
> ```
> Run this from the **monorepo root**.

### First-time setup

1. Copy the example file at the monorepo root and fill in your values:
   ```bash
   cp .env.example .env
   ```
2. Create the symlink so Prisma can find it:
   ```bash
   ln -sf "$(pwd)/.env" db/.env
   ```

---

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
