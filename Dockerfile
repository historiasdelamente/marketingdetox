FROM node:20-slim

WORKDIR /app

# Install Claude CLI
RUN npm install -g @anthropic-ai/claude-code

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --production

# Copy app code
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
