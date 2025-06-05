#!/bin/bash

# Comprehensive diagnostic tool for Raspberry Pi installation
echo "=== Household Expense Tracker Diagnostics ==="
echo ""

# Check system information
echo "1. System Information:"
echo "   OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "   Node.js: $(node --version 2>/dev/null || echo "Not installed")"
echo "   NPM: $(npm --version 2>/dev/null || echo "Not installed")"
echo ""

# Check PostgreSQL
echo "2. PostgreSQL Status:"
if systemctl is-active --quiet postgresql; then
    echo "   Status: Running"
    echo "   Version: $(sudo -u postgres psql -t -c 'SELECT version();' 2>/dev/null | head -1 | xargs || echo "Unable to connect")"
else
    echo "   Status: Not running"
fi
echo ""

# Check database connectivity
echo "3. Database Connection:"
if [ -f .env ]; then
    source .env
    if [ -n "$DATABASE_URL" ]; then
        echo "   DATABASE_URL: Set"
        DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
        DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
        
        echo "   Host: $DB_HOST"
        echo "   Port: $DB_PORT"
        echo "   User: $DB_USER"
        echo "   Database: $DB_NAME"
        
        # Test connection
        if timeout 3 bash -c "</dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; then
            echo "   Connection: SUCCESS"
        else
            echo "   Connection: FAILED"
        fi
    else
        echo "   DATABASE_URL: Not set"
    fi
else
    echo "   .env file: Not found"
fi
echo ""

# Check application files
echo "4. Application Files:"
echo "   package.json: $([ -f package.json ] && echo "Found" || echo "Missing")"
echo "   dist/index.js: $([ -f dist/index.js ] && echo "Found" || echo "Missing")"
echo "   node_modules: $([ -d node_modules ] && echo "Found" || echo "Missing")"
echo ""

# Check port availability
echo "5. Port Status:"
PORT=${PORT:-5000}
if netstat -tlnp 2>/dev/null | grep -q ":$PORT "; then
    echo "   Port $PORT: In use"
    netstat -tlnp 2>/dev/null | grep ":$PORT "
else
    echo "   Port $PORT: Available"
fi
echo ""

# Provide recommendations
echo "6. Recommendations:"
if ! systemctl is-active --quiet postgresql; then
    echo "   - Start PostgreSQL: sudo systemctl start postgresql"
fi

if [ ! -f .env ]; then
    echo "   - Run database setup: ./fix-pi-install.sh"
fi

if [ ! -f dist/index.js ]; then
    echo "   - Build application: npm run build"
fi

if [ -f .env ] && [ -f dist/index.js ] && systemctl is-active --quiet postgresql; then
    echo "   - System appears ready. Try: ./production-start.sh"
fi

echo ""
echo "=== End Diagnostics ==="