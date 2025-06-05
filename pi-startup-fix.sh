#!/bin/bash

# Comprehensive fix for Raspberry Pi startup issues
echo "Applying Raspberry Pi startup fixes..."

# Create environment file with IPv4 forcing
cat > .env << EOF
DATABASE_URL=postgresql://expense_user:expense_$(openssl rand -hex 8)@127.0.0.1:5432/expense_tracker
NODE_ENV=production
PORT=5000
PGHOST=127.0.0.1
PGPORT=5432
EOF

# Configure PostgreSQL for IPv4 connections
echo "Configuring PostgreSQL for IPv4..."

# Stop PostgreSQL
sudo systemctl stop postgresql

# Find PostgreSQL configuration directory
PG_VERSION=$(ls /etc/postgresql/ | head -1)
PG_CONFIG="/etc/postgresql/$PG_VERSION/main"

# Configure PostgreSQL to listen on IPv4
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '127.0.0.1'/" "$PG_CONFIG/postgresql.conf"
sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '127.0.0.1'/" "$PG_CONFIG/postgresql.conf"

# Update pg_hba.conf for IPv4 authentication
cat << 'EOF' | sudo tee "$PG_CONFIG/pg_hba.conf"
# Database administrative login by Unix domain socket
local   all             postgres                                peer

# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
EOF

# Start PostgreSQL
sudo systemctl start postgresql
sleep 3

# Extract database credentials from environment
DB_NAME="expense_tracker"
DB_USER="expense_user"
DB_PASS=$(grep DATABASE_URL .env | cut -d: -f3 | cut -d@ -f1)

# Recreate database with proper IPv4 configuration
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Test database connection
echo "Testing database connection..."
export $(cat .env | xargs)
if PGPASSWORD="$DB_PASS" psql -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
    echo "Database connection successful"
    
    # Initialize database schema
    echo "Setting up database schema..."
    npm run db:push
else
    echo "Database connection failed"
    exit 1
fi

# Create robust production startup script
cat > production-start.sh << 'EOF'
#!/bin/bash

echo "Starting Household Expense Tracker..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "ERROR: .env file not found"
    exit 1
fi

# Verify required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not set"
    exit 1
fi

# Test database connection
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

echo "Testing database connection to $DB_HOST:$DB_PORT..."
if timeout 5 bash -c "</dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; then
    echo "Database connection successful"
else
    echo "ERROR: Cannot connect to database"
    echo "Run ./pi-startup-fix.sh to reconfigure"
    exit 1
fi

# Check if application is built
if [ ! -f "dist/index.js" ]; then
    echo "Application not built. Building now..."
    npm run build
fi

# Get network IP for display
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "=== Household Expense Tracker v2.0.0 ==="
echo "Status: Starting"
echo "Database: Connected"
echo "Local: http://localhost:$PORT"
echo "Network: http://$LOCAL_IP:$PORT"
echo "========================================="
echo ""

# Start application with error handling
node dist/index.js || {
    echo ""
    echo "ERROR: Application failed to start"
    echo "Try rebuilding: npm run build"
    exit 1
}
EOF

chmod +x production-start.sh

echo ""
echo "Raspberry Pi startup fix complete!"
echo ""
echo "To start the application:"
echo "  ./production-start.sh"
echo ""
echo "Database configured for IPv4 connections"
echo "Application ready for production use"