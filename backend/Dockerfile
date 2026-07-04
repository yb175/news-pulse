# Use a base image containing both Node.js 18 and Python 3.10
FROM nikolaik/python-nodejs:python3.10-nodejs18-alpine

WORKDIR /app

# Copy root configurations and workspace declarations
COPY package*.json ./
COPY turbo.json ./
COPY backend/package*.json ./backend/
COPY db/package*.json ./db/
COPY db/prisma ./db/prisma/

# Install Node monorepo dependencies
RUN npm install

# Copy Python scraper requirements and install them via pip
COPY scraper/requirements.txt ./scraper/
RUN pip install -r scraper/requirements.txt
COPY scraper/ ./scraper/

# Copy Backend codebase and build TypeScript
COPY backend/ ./backend/
RUN npx prisma generate --schema=db/prisma/schema.prisma
RUN npm run build --workspace=backend

ENV PORT=5000
EXPOSE 5000

# Set running directory to backend
WORKDIR /app/backend
CMD ["npm", "run", "start"]
