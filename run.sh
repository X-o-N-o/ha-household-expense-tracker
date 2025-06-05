#!/usr/bin/with-contenv bashio

# Get configuration from Home Assistant
DATABASE_URL=$(bashio::config 'database_url')
USER1_NAME=$(bashio::config 'user1_name' || echo "You")
USER2_NAME=$(bashio::config 'user2_name' || echo "Partner")

# Export environment variables
export DATABASE_URL
export USER1_NAME  
export USER2_NAME
export NODE_ENV=production
export PORT=5000

# Change to app directory
cd /app

bashio::log.info "Starting Household Expense Tracker..."
bashio::log.info "Database: ${DATABASE_URL}"
bashio::log.info "User 1: ${USER1_NAME}, User 2: ${USER2_NAME}"

# Start the application
exec npm run start