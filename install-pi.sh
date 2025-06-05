#!/bin/bash

# Household Expense Tracker - Raspberry Pi Installation Script
echo "Installing Household Expense Tracker on Raspberry Pi..."

# Update package list
echo "Updating package list..."
sudo apt-get update

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm not found. Please install Node.js first."
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Install and configure PostgreSQL
echo "Installing PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL service
echo "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
echo "Setting up database..."
DB_NAME="expense_tracker"
DB_USER="expense_user"
DB_PASS="expense_pass_$(date +%s)"

sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

# Create database URL
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"

echo "Database created successfully!"
echo "Database URL: $DATABASE_URL"

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building application..."
npm run build

# Initialize database schema
echo "Initializing database schema..."
export DATABASE_URL="$DATABASE_URL"
npm run db:push

# Save database credentials
echo "Saving database configuration..."
cat > .env <<EOF
DATABASE_URL=$DATABASE_URL
NODE_ENV=production
PORT=5000
EOF

# Create systemd service file
echo "Creating systemd service..."
sudo tee /etc/systemd/system/expense-tracker.service > /dev/null <<EOF
[Unit]
Description=Household Expense Tracker
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=pi
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
Environment=PORT=5000
Environment=DATABASE_URL=$DATABASE_URL
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
echo "Enabling service..."
sudo systemctl daemon-reload
sudo systemctl enable expense-tracker.service

echo ""
echo "============================================"
echo "Installation complete!"
echo "============================================"
echo ""
echo "Database Details:"
echo "  Database Name: $DB_NAME"
echo "  Database User: $DB_USER" 
echo "  Database URL: $DATABASE_URL"
echo ""
echo "To start the application:"
echo "  sudo systemctl start expense-tracker"
echo ""
echo "To check status:"
echo "  sudo systemctl status expense-tracker"
echo ""
echo "To view logs:"
echo "  sudo journalctl -u expense-tracker -f"
echo ""
echo "The application will be available at: http://$(hostname -I | awk '{print $1}'):5000"
echo ""
echo "Starting the service now..."
sudo systemctl start expense-tracker

if sudo systemctl is-active --quiet expense-tracker; then
    echo ""
    echo "✓ Service started successfully!"
    echo "✓ Access your expense tracker at: http://$(hostname -I | awk '{print $1}'):5000"
else
    echo ""
    echo "⚠ Service failed to start. Check logs with:"
    echo "  sudo journalctl -u expense-tracker -f"
fi