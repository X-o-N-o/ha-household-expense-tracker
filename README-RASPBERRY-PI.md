# Raspberry Pi Installation Guide

## Zero-Configuration Installation

**Everything is automated - no manual configuration needed!**

1. **Clone and install:**
```bash
git clone https://github.com/your-username/household-expense-tracker.git
cd household-expense-tracker
chmod +x install-pi.sh
./install-pi.sh
```

That's it! The script automatically:
- Installs Node.js 18+
- Installs and configures PostgreSQL
- Creates database and user with secure credentials
- Builds the application
- Sets up systemd service for auto-start
- Starts the application

## What Gets Installed

### Automatically Installed Components
- Node.js 18+ (if not present)
- PostgreSQL database server
- Local database: `expense_tracker`
- Database user with secure random password
- Systemd service for auto-startup

### Prerequisites
- Raspberry Pi with Raspberry Pi OS
- Internet connection for package downloads
- sudo privileges

### Step-by-Step Installation

1. **Install Node.js (if not already installed):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Clone and install:**
```bash
git clone https://github.com/your-username/household-expense-tracker.git
cd household-expense-tracker
npm install
npm run build
```

3. **Set up environment variables:**
```bash
export DATABASE_URL="postgresql://username:password@host:port/database"
export NODE_ENV=production
export PORT=5000
```

4. **Start the application:**
```bash
./start-pi.sh
```

## Running as a Service

The installation script automatically creates a systemd service. To manage it:

```bash
# Start the service
sudo systemctl start expense-tracker

# Stop the service
sudo systemctl stop expense-tracker

# Restart the service
sudo systemctl restart expense-tracker

# Check status
sudo systemctl status expense-tracker

# View logs
sudo journalctl -u expense-tracker -f
```

## Configuration

### Database Setup
You need to provide your PostgreSQL database connection string:

```bash
export DATABASE_URL="postgresql://username:password@host:port/database"
```

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required)
- `PORT` - Port to run the server on (default: 5000)
- `NODE_ENV` - Set to "production" for production deployment

## Accessing the Application

Once running, access the application at:
```
http://your-pi-ip-address:5000
```

To find your Pi's IP address:
```bash
hostname -I
```

## Troubleshooting

### Service not starting
Check the logs:
```bash
sudo journalctl -u expense-tracker -f
```

### Database connection issues
Ensure your DATABASE_URL is correct and the database is accessible from your Pi.

### Port already in use
Change the PORT environment variable:
```bash
export PORT=3000
```

### Memory issues
If you encounter memory issues during build, try:
```bash
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build
```

## Updating the Application

To update to a newer version:
```bash
git pull origin main
npm install
npm run build
sudo systemctl restart expense-tracker
```

## Uninstalling

To remove the application:
```bash
sudo systemctl stop expense-tracker
sudo systemctl disable expense-tracker
sudo rm /etc/systemd/system/expense-tracker.service
sudo systemctl daemon-reload
rm -rf household-expense-tracker/
```