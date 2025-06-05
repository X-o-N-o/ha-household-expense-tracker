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
sudo apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Setup database automatically
echo "Configuring database..."
DB_NAME="expense_tracker"
DB_USER="expense_user"
DB_PASS="expense_$(openssl rand -hex 8)"

# Create database and user
sudo -u postgres createdb $DB_NAME
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

# Set database URL
export DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"

# Save to environment file
echo "DATABASE_URL=$DATABASE_URL" > .env
echo "NODE_ENV=production" >> .env
echo "PORT=5000" >> .env

echo "Database configured: $DATABASE_URL"

# Install dependencies and build
echo "Installing and building application..."
npm install
npm run build

# Initialize database schema
echo "Setting up database tables..."
npm run db:push

# Create startup script
cat > start.sh << 'EOF'
#!/bin/bash
export $(cat .env | xargs)
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