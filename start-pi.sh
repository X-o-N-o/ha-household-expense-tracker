#!/bin/bash

# Start script for Raspberry Pi
export NODE_ENV=production
export PORT=5000

# Load environment variables if .env file exists
if [ -f .env ]; then
    echo "Loading environment variables from .env..."
    export $(cat .env | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Warning: DATABASE_URL not set. Using default local PostgreSQL..."
    export DATABASE_URL="postgresql://expense_user:expense_pass@localhost:5432/expense_tracker"
fi

# Start the application
echo "Starting Household Expense Tracker..."
echo "Database: $DATABASE_URL"
echo "Server will be available at: http://$(hostname -I | awk '{print $1}'):5000"
node dist/index.js