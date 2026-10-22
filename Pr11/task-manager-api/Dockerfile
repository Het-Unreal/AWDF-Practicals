# Dockerfile for Node.js / Express Backend
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package descriptors first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose API port
EXPOSE 5000

# Set default environment variables
ENV PORT=5000 \
    NODE_ENV=production

# Start Express server
CMD ["node", "server.js"]
