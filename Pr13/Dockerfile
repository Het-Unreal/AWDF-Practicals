# ==============================================================================
# Multi-Stage Build Dockerfile for React Frontend (Supplementary Problem 2)
# Stage 1: Build static distribution bundles
# Stage 2: Production preview server with minimal footprint
# ==============================================================================

# --- Stage 1: Build Environment ---
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build production bundle
COPY . .
RUN npm run build

# --- Stage 2: Minimal Production Runtime ---
FROM node:18-alpine
WORKDIR /app

# Install only minimal dependencies needed for previewing built assets
COPY package*.json ./
RUN npm install --omit=dev

# Copy only the compiled dist assets from build stage (discarding heavy node_modules & dev tooling)
COPY --from=build /app/dist ./dist
COPY --from=build /app/vite.config.js ./

# Expose Vite preview port
EXPOSE 5173

# Run preview server bound to all interfaces
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
