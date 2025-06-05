# Raspberry Pi Troubleshooting Guide

## Common Installation Issues

### Issue 1: PostgreSQL Connection Refused (::1:5432)
**Error:** `connect ECONNREFUSED ::1:5432`
**Cause:** PostgreSQL trying to connect via IPv6 instead of IPv4

**Solution:**
```bash
./pi-startup-fix.sh
```

Or manually:
```bash
# Force IPv4 connections
export PGHOST=127.0.0.1
export DATABASE_URL="postgresql://user:pass@127.0.0.1:5432/database"

# Reconfigure PostgreSQL
sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '127.0.0.1'/" /etc/postgresql/*/main/postgresql.conf
sudo systemctl restart postgresql
```

### Issue 2: Path Resolution Error in Production
**Error:** `TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received undefined`
**Cause:** Build configuration issue with import.meta.dirname

**Solution:**
```bash
# Use the production startup script instead
./production-start.sh
```

### Issue 3: Database Schema Setup Fails
**Error:** Database connection works but schema push fails

**Solution:**
```bash
# Load environment and run schema setup
export $(cat .env | xargs)
npm run db:push
```

## Quick Fix Command
```bash
chmod +x pi-startup-fix.sh
./pi-startup-fix.sh
./production-start.sh
```

## Manual Database Reset
```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS expense_tracker;"
sudo -u postgres psql -c "DROP USER IF EXISTS expense_user;"
sudo -u postgres psql -c "CREATE DATABASE expense_tracker;"
sudo -u postgres psql -c "CREATE USER expense_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE expense_tracker TO expense_user;"
```

## Verify Installation
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
PGPASSWORD=your_password psql -h 127.0.0.1 -U expense_user -d expense_tracker -c "SELECT 1;"

# Check application files
ls -la dist/
cat .env
```

## Service Management
```bash
# If using systemd service
sudo systemctl status household-expense-tracker
sudo journalctl -u household-expense-tracker -f
```