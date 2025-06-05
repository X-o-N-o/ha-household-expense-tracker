#!/usr/bin/with-contenv bashio

# Get configuration from Home Assistant
DATABASE_URL=$(bashio::config 'database_url')
USER1_NAME=$(bashio::config 'user1_name')
USER2_NAME=$(bashio::config 'user2_name')

# Set default database URL if not provided
if [ -z "$DATABASE_URL" ]; then
    # Create SQLite database for addon
    DATABASE_URL="sqlite:///data/expenses.db"
fi

# Export environment variables
export DATABASE_URL
export USER1_NAME
export USER2_NAME
export NODE_ENV=production
export PORT=5000

# Change to app directory
cd /app

# Initialize database if needed
if [[ "$DATABASE_URL" == sqlite* ]]; then
    mkdir -p /data
    npm run db:push || true
fi

# Start the application
bashio::log.info "Starting Household Expense Tracker..."
bashio::log.info "Web interface available on port 5000"

exec npm run start