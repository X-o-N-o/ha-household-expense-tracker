#!/bin/bash

# Complete PostgreSQL installation and configuration for Raspberry Pi
echo "Installing and configuring PostgreSQL for Raspberry Pi..."

# Update package list
sudo apt-get update

# Install PostgreSQL and required packages
echo "Installing PostgreSQL packages..."
sudo apt-get install -y postgresql postgresql-contrib postgresql-client

# Determine PostgreSQL version and service name
PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" 2>/dev/null | grep -oE '[0-9]+\.[0-9]+' | head -1)
if [ -z "$PG_VERSION" ]; then
    PG_VERSION=$(ls /etc/postgresql/ 2>/dev/null | head -1)
fi

echo "PostgreSQL version: $PG_VERSION"

# Start PostgreSQL service using multiple methods
echo "Starting PostgreSQL service..."
SERVICE_STARTED=false

# Method 1: Standard systemctl
if systemctl list-unit-files | grep -q "^postgresql.service"; then
    echo "Using postgresql.service"
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    SERVICE_STARTED=true
elif systemctl list-unit-files | grep -q "postgresql@"; then
    echo "Using versioned PostgreSQL service"
    if [ -n "$PG_VERSION" ]; then
        sudo systemctl start postgresql@$PG_VERSION-main
        sudo systemctl enable postgresql@$PG_VERSION-main
        SERVICE_STARTED=true
    fi
fi

# Method 2: Service command fallback
if [ "$SERVICE_STARTED" = false ]; then
    echo "Using service command"
    sudo service postgresql start
    sudo update-rc.d postgresql enable
    SERVICE_STARTED=true
fi

# Wait for PostgreSQL to start
sleep 5

# Verify PostgreSQL is running
if sudo -u postgres psql -c "\l" >/dev/null 2>&1; then
    echo "PostgreSQL is running successfully"
else
    echo "PostgreSQL may not be running properly. Checking status..."
    sudo systemctl status postgresql 2>/dev/null || sudo service postgresql status
    exit 1
fi

# Configure PostgreSQL for local connections
echo "Configuring PostgreSQL for local connections..."

# Find configuration directory
PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"
if [ ! -d "$PG_CONFIG_DIR" ]; then
    PG_CONFIG_DIR=$(find /etc/postgresql -name "postgresql.conf" -type f | head -1 | xargs dirname)
fi

echo "PostgreSQL config directory: $PG_CONFIG_DIR"

# Backup original configurations
sudo cp "$PG_CONFIG_DIR/postgresql.conf" "$PG_CONFIG_DIR/postgresql.conf.backup" 2>/dev/null || true
sudo cp "$PG_CONFIG_DIR/pg_hba.conf" "$PG_CONFIG_DIR/pg_hba.conf.backup" 2>/dev/null || true

# Configure postgresql.conf
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '127.0.0.1,localhost'/" "$PG_CONFIG_DIR/postgresql.conf"
sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '127.0.0.1,localhost'/" "$PG_CONFIG_DIR/postgresql.conf"

# Configure pg_hba.conf for authentication
cat << 'EOF' | sudo tee "$PG_CONFIG_DIR/pg_hba.conf"
# Database administrative login by Unix domain socket
local   all             postgres                                peer

# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             localhost               md5
EOF

# Restart PostgreSQL to apply changes
echo "Restarting PostgreSQL to apply configuration..."
if systemctl list-unit-files | grep -q "^postgresql.service"; then
    sudo systemctl restart postgresql
elif systemctl list-unit-files | grep -q "postgresql@" && [ -n "$PG_VERSION" ]; then
    sudo systemctl restart postgresql@$PG_VERSION-main
else
    sudo service postgresql restart
fi

sleep 3

# Create database and user
echo "Setting up database and user..."
DB_NAME="expense_tracker"
DB_USER="expense_user"
DB_PASS="expense_$(openssl rand -hex 8)"

# Create database and user
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

# Test database connection
echo "Testing database connection..."
if PGPASSWORD="$DB_PASS" psql -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
    echo "Database connection successful"
else
    echo "Database connection failed. Troubleshooting..."
    
    # Additional troubleshooting
    sudo systemctl restart postgresql 2>/dev/null || sudo service postgresql restart
    sleep 3
    
    if PGPASSWORD="$DB_PASS" psql -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        echo "Database connection now successful after restart"
    else
        echo "Database connection still failing"
        exit 1
    fi
fi

# Create environment file
echo "Creating environment configuration..."
cat > .env << EOF
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@127.0.0.1:5432/$DB_NAME
NODE_ENV=production
PORT=5000
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=$DB_USER
PGPASSWORD=$DB_PASS
PGDATABASE=$DB_NAME
EOF

echo ""
echo "PostgreSQL installation and configuration complete!"
echo ""
echo "Database Details:"
echo "  Name: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASS"
echo "  Host: 127.0.0.1"
echo "  Port: 5432"
echo ""
echo "Environment file created: .env"
echo "PostgreSQL service status: $(systemctl is-active postgresql 2>/dev/null || echo "Running via service command")"