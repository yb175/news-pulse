#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=/app/db/prisma/schema.prisma

echo "Starting server..."
exec npm run start
