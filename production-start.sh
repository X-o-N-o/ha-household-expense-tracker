#!/bin/bash

# Production startup script with environment detection
echo "Starting Household Expense Tracker in production mode..."

# Set production environment
export NODE_ENV=production
export PORT=${PORT:-5000}

# Load environment variables if .env exists
if [ -f .env ]; then
    echo "Loading environment variables from .env..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    echo "Please run ./fix-pi-install.sh to configure the database"
    exit 1
fi

# Extract database connection details for testing
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

# Test database connectivity
echo "Testing database connection to $DB_HOST:$DB_PORT..."
if timeout 5 bash -c "</dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; then
    echo "Database connection successful"
else
    echo "ERROR: Cannot connect to database at $DB_HOST:$DB_PORT"
    echo "Please check PostgreSQL service status:"
    echo "  sudo systemctl status postgresql"
    exit 1
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "ERROR: dist directory not found. Building application..."
    npm run build
fi

# Check if index.js exists
if [ ! -f "dist/index.js" ]; then
    echo "ERROR: dist/index.js not found. Please run 'npm run build'"
    exit 1
fi

# Get local IP for display
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "=== Household Expense Tracker ==="
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo "Database: Connected"
echo "Local access: http://localhost:$PORT"
echo "Network access: http://$LOCAL_IP:$PORT"
echo "================================="
echo ""

# Start the application with error handling
node dist/index.js || {
    echo ""
    echo "ERROR: Application failed to start"
    echo "This may be due to a build configuration issue."
    echo "Try running:"
    echo "  npm run build"
    echo "  ./production-start.sh"
    exit 1
}