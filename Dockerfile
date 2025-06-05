ARG BUILD_FROM
FROM $BUILD_FROM

# Install Node.js and npm
RUN apk add --no-cache nodejs npm sqlite

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy application source files
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY *.config.* ./
COPY components.json ./
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Copy and setup run script
COPY run.sh /
RUN chmod a+x /run.sh

# Create data directory for SQLite database
RUN mkdir -p /data

# Expose port
EXPOSE 5000

CMD ["/run.sh"]