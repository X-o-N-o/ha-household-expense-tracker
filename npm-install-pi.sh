#!/bin/bash

# NPM-based installation for Raspberry Pi
echo "Setting up Household Expense Tracker with automated PostgreSQL..."

# Update system
sudo apt-get update

# Install Node.js if needed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PostgreSQL
echo "Installing PostgreSQL..."
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Wait for installation to complete
sleep 2

# Find and start PostgreSQL service
echo "Starting PostgreSQL service..."
if systemctl list-unit-files | grep -q "postgresql.service"; then
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
elif systemctl list-unit-files | grep -q "postgresql@"; then
    # Handle versioned PostgreSQL service
    PG_VERSION=$(ls /etc/postgresql/ 2>/dev/null | head -1)
    sudo systemctl start postgresql@$PG_VERSION-main
    sudo systemctl enable postgresql@$PG_VERSION-main
else
    echo "PostgreSQL service not found, trying alternative method..."
    sudo service postgresql start
fi

# Verify PostgreSQL is running
sleep 3
if pgrep -x "postgres" > /dev/null; then
    echo "PostgreSQL is running"
else
    echo "Warning: PostgreSQL may not have started properly"
    echo "Attempting to start manually..."
    sudo -u postgres /usr/lib/postgresql/*/bin/pg_ctl start -D /var/lib/postgresql/*/main/
fi

# Setup database automatically
echo "Configuring database..."
DB_NAME="expense_tracker"
DB_USER="expense_user"
DB_PASS="expense_$(openssl rand -hex 8)"

# Create database and user
sudo -u postgres createdb $DB_NAME 2>/dev/null || echo "Database may already exist"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || echo "User may already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

# Configure PostgreSQL to accept local connections
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf
echo "host all all 127.0.0.1/32 md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
echo "local all all md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL to apply changes
sudo systemctl restart postgresql
sleep 3

# Set database URL with IPv4 explicitly to avoid ::1 connection issues
export DATABASE_URL="postgresql://$DB_USER:$DB_PASS@127.0.0.1:5432/$DB_NAME"

# Save to environment file with all necessary variables
echo "DATABASE_URL=$DATABASE_URL" > .env
echo "NODE_ENV=production" >> .env
echo "PORT=5000" >> .env
echo "PGHOST=127.0.0.1" >> .env
echo "PGPORT=5432" >> .env
echo "PGUSER=$DB_USER" >> .env
echo "PGPASSWORD=$DB_PASS" >> .env
echo "PGDATABASE=$DB_NAME" >> .env

echo "Database configured: $DATABASE_URL"

# Install dependencies and build
echo "Installing and building application..."
npm install
npm run build

# Test database connection before schema setup
echo "Testing database connection..."
if PGPASSWORD="$DB_PASS" psql -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
    echo "Database connection successful"
    
    # Initialize database schema
    echo "Setting up database tables..."
    npm run db:push || {
        echo "Warning: Database schema setup failed. Will retry on first start."
    }
else
    echo "Warning: Database connection failed. Will configure on first start."
fi

# Create robust startup script
cat > start.sh << 'EOF'
#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Test database connection
if [ -n "$DATABASE_URL" ]; then
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    
    echo "Testing database connection to $DB_HOST:$DB_PORT..."
    if timeout 5 bash -c "</dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; then
        echo "Database connection successful"
    else
        echo "Database connection failed. Please check PostgreSQL service."
        exit 1
    fi
else
    echo "DATABASE_URL not set. Please run ./fix-pi-install.sh"
    exit 1
fi

echo "Starting Household Expense Tracker..."
echo "Access at: http://$(hostname -I | awk '{print $1}'):5000"
node dist/index.js
EOF

chmod +x start.sh

echo ""
echo "Installation complete!"
echo ""
echo "To start the application:"
echo "  ./start.sh"
echo ""
echo "Or run as service:"
echo "  ./install-pi.sh"
echo ""
echo "Access at: http://$(hostname -I | awk '{print $1}'):5000"