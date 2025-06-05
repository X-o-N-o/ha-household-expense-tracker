# Installation Guide - Household Expense Tracker v2.0.0

## Raspberry Pi Installation (Recommended)

### Option 1: Quick Installation
```bash
git clone https://github.com/your-username/household-expense-tracker.git
cd household-expense-tracker
chmod +x npm-install-pi.sh
./npm-install-pi.sh
```

### Option 2: Manual Installation
```bash
git clone https://github.com/your-username/household-expense-tracker.git
cd household-expense-tracker
chmod +x install-pi.sh
./install-pi.sh
```

### Option 3: Fix Existing Installation
If you encounter database connection issues:
```bash
chmod +x fix-pi-install.sh
./fix-pi-install.sh
```

## Troubleshooting

### Database Connection Issues
1. **PostgreSQL not accessible**: Run `./fix-pi-install.sh`
2. **Permission denied**: Ensure scripts are executable with `chmod +x *.sh`
3. **Service not starting**: Check PostgreSQL status with `sudo systemctl status postgresql`

### Application Startup Issues
1. **Path resolution errors**: Use `./production-start.sh` instead of `./start.sh`
2. **Build errors**: Run `npm run build` manually
3. **Port conflicts**: Change PORT in `.env` file

### Common Solutions
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check application logs
journalctl -u household-expense-tracker -f

# Rebuild application
npm run build
```

## Startup Scripts

- `npm-install-pi.sh` - Complete automated installation
- `install-pi.sh` - Full installation with systemd service
- `fix-pi-install.sh` - Database configuration fix
- `production-start.sh` - Robust production startup
- `start.sh` - Simple startup script

## Home Assistant Addon

1. Add repository: `https://github.com/your-username/household-expense-tracker`
2. Install "Household Expense Tracker" addon
3. Configure database URL in addon settings
4. Start the addon

## Manual Development Setup

```bash
npm install
npm run dev
```

Access at: `http://localhost:5000`

## Production Deployment

```bash
npm install
npm run build
npm start
```

## Environment Variables

Create `.env` file:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/database
NODE_ENV=production
PORT=5000
```

## Database Setup

PostgreSQL is automatically configured by the installation scripts. For manual setup:

```sql
CREATE DATABASE expense_tracker;
CREATE USER expense_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE expense_tracker TO expense_user;
```

## Service Management

```bash
# Start service
sudo systemctl start household-expense-tracker

# Enable auto-start
sudo systemctl enable household-expense-tracker

# Check status
sudo systemctl status household-expense-tracker

# View logs
journalctl -u household-expense-tracker -f
```