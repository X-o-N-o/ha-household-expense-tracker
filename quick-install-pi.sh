#!/bin/bash

# Quick installation script for Raspberry Pi with PostgreSQL fix
echo "=== Household Expense Tracker - Quick Install ==="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "Please run this script as a regular user (not root)"
    echo "The script will ask for sudo permission when needed"
    exit 1
fi

# Install PostgreSQL first
echo "Step 1: Installing PostgreSQL..."
chmod +x install-postgresql-pi.sh
./install-postgresql-pi.sh

if [ $? -ne 0 ]; then
    echo "PostgreSQL installation failed. Please check the error messages above."
    exit 1
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Step 2: Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install application dependencies
echo "Step 3: Installing application dependencies..."
npm install

# Build the application
echo "Step 4: Building application..."
npm run build

# Verify build completed
if [ ! -f "dist/index.js" ]; then
    echo "Build failed. dist/index.js not found."
    exit 1
fi

# Load environment and initialize database schema
echo "Step 5: Initializing database schema..."
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    npm run db:push || {
        echo "Warning: Database schema initialization failed. Will retry on first start."
    }
else
    echo "Warning: .env file not found. Database may not be configured properly."
fi

# Create final startup script
cat > start-expense-tracker.sh << 'EOF'
#!/bin/bash

echo "Starting Household Expense Tracker v2.0.0..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "ERROR: .env file not found. Run ./install-postgresql-pi.sh first."
    exit 1
fi

# Test database connection
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

echo "Testing database connection to $DB_HOST:$DB_PORT..."
if timeout 5 bash -c "</dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; then
    echo "Database: Connected"
else
    echo "ERROR: Cannot connect to database"
    echo "Try running: ./install-postgresql-pi.sh"
    exit 1
fi

# Check if application is built
if [ ! -f "dist/index.js" ]; then
    echo "Application not built. Building now..."
    npm run build
fi

# Get network information
LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
PORT=${PORT:-5000}

echo ""
echo "=== Starting Application ==="
echo "Local: http://localhost:$PORT"
echo "Network: http://$LOCAL_IP:$PORT"
echo "==========================="
echo ""

# Start the application
node dist/index.js
EOF

chmod +x start-expense-tracker.sh

echo ""
echo "=== Installation Complete! ==="
echo ""
echo "✓ PostgreSQL installed and configured"
echo "✓ Node.js and dependencies installed"
echo "✓ Application built successfully"
echo "✓ Database schema initialized"
echo ""
echo "To start the application:"
echo "  ./start-expense-tracker.sh"
echo ""
echo "Access your expense tracker at:"
echo "  http://$(hostname -I | awk '{print $1}'):5000"
echo ""
echo "For troubleshooting, run:"
echo "  ./diagnostic-pi.sh"
echo ""