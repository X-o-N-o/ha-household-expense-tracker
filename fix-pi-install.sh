#!/bin/bash

# Fix for Raspberry Pi installation issues
echo "Fixing Raspberry Pi installation..."

# Stop any running services
sudo systemctl stop postgresql 2>/dev/null || true

# Reconfigure PostgreSQL for local connections
echo "Configuring PostgreSQL..."

# Find PostgreSQL version directory
PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oE '[0-9]+\.[0-9]+' | head -1)
PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"

if [ ! -d "$PG_CONFIG_DIR" ]; then
    # Fallback: find any PostgreSQL config directory
    PG_CONFIG_DIR=$(find /etc/postgresql -name "postgresql.conf" -type f | head -1 | xargs dirname)
fi

echo "PostgreSQL config directory: $PG_CONFIG_DIR"

# Configure PostgreSQL for local connections
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost,127.0.0.1'/" "$PG_CONFIG_DIR/postgresql.conf"
sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = 'localhost,127.0.0.1'/" "$PG_CONFIG_DIR/postgresql.conf"

# Update pg_hba.conf for local authentication
sudo cp "$PG_CONFIG_DIR/pg_hba.conf" "$PG_CONFIG_DIR/pg_hba.conf.backup"
cat << 'EOF' | sudo tee "$PG_CONFIG_DIR/pg_hba.conf"
# Database administrative login by Unix domain socket
local   all             postgres                                peer

# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
EOF

# Start PostgreSQL
echo "Starting PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Wait for PostgreSQL to be ready
sleep 5

# Test PostgreSQL connection
echo "Testing PostgreSQL connection..."
if sudo -u postgres psql -c "\l" >/dev/null 2>&1; then
    echo "PostgreSQL is running successfully"
else
    echo "PostgreSQL connection failed. Checking logs..."
    sudo journalctl -u postgresql -n 20
fi

# Create database and user with proper settings
DB_NAME="expense_tracker"
DB_USER="expense_user"
DB_PASS="expense_$(openssl rand -hex 8)"

echo "Setting up database..."

# Drop existing database and user if they exist
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"

# Create new database and user
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

# Set database URL with IPv4 explicitly
export DATABASE_URL="postgresql://$DB_USER:$DB_PASS@127.0.0.1:5432/$DB_NAME"

# Save to environment file
echo "DATABASE_URL=$DATABASE_URL" > .env
echo "NODE_ENV=production" >> .env
echo "PORT=5000" >> .env

# Force IPv4 for PostgreSQL connections
echo "PGHOST=127.0.0.1" >> .env
echo "PGPORT=5432" >> .env
echo "PGUSER=$DB_USER" >> .env
echo "PGPASSWORD=$DB_PASS" >> .env
echo "PGDATABASE=$DB_NAME" >> .env

echo "Database URL: $DATABASE_URL"

# Test database connection
echo "Testing database connection..."
if PGPASSWORD="$DB_PASS" psql -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
    echo "Database connection successful"
else
    echo "Database connection failed"
    echo "Trying to fix connection issues..."
    
    # Additional troubleshooting
    sudo systemctl restart postgresql
    sleep 3
    
    if PGPASSWORD="$DB_PASS" psql -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        echo "Database connection now successful"
    else
        echo "Database connection still failing. Manual intervention needed."
    fi
fi

# Initialize database schema
echo "Initializing database schema..."
export DATABASE_URL="$DATABASE_URL"
npm run db:push

# Create improved start script
cat > start.sh << 'EOF'
#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if database URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not set"
    exit 1
fi

# Test database connection before starting
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

echo "Testing database connection to $DB_HOST:$DB_PORT..."
if timeout 5 bash -c "</dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; then
    echo "Database connection successful"
else
    echo "Database connection failed. Please check PostgreSQL service."
    exit 1
fi

# Start the application
echo "Starting Household Expense Tracker..."
echo "Database: $DATABASE_URL"
echo "Server will be available at: http://$(hostname -I | awk '{print $1}'):5000"
node dist/index.js
EOF

chmod +x start.sh

echo ""
echo "Fix complete!"
echo ""
echo "Database Details:"
echo "  Database Name: $DB_NAME"
echo "  Database User: $DB_USER"
echo "  Database URL: $DATABASE_URL"
echo ""
echo "To start the application:"
echo "  ./start.sh"
echo ""
echo "To check PostgreSQL status:"
echo "  sudo systemctl status postgresql"