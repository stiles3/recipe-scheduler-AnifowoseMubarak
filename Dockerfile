# Stage 1: Builder - install dependencies and build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build the application (outputs to /app/dist)
RUN npm run build

# Verify build output
RUN ls -la dist/

# Stage 2: API - production image
FROM node:18-alpine AS api

WORKDIR /app

# Copy production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built files from dist
COPY --from=builder /app/dist ./dist

# Copy any other required files (like package.json for start script)
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["npm", "start"]

# Stage 3: Worker - separate image for background jobs
FROM node:18-alpine AS worker

WORKDIR /app

# Copy production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built files from dist
COPY --from=builder /app/dist ./dist

# Copy any other required files
COPY --from=builder /app/package.json ./

CMD ["npm", "run", "worker"]

# Stage 4: Setup DB - runs initialization scripts
FROM node:18-alpine AS setup-db

WORKDIR /app

# Copy only what's needed for DB setup
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/scripts/createTable.js ./dist/scripts/
COPY --from=builder /app/package.json ./

CMD ["node", "dist/scripts/createTable.js"]