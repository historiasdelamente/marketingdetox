FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev for build)
RUN npm ci

# Copy app code (bust cache on each deploy)
ARG CACHE_BUST=1
COPY . .

# Create data directory for SQLite
RUN mkdir -p data output

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
