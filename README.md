# Household Expense Tracker v2.0.0

A comprehensive household expense tracking web application with advanced financial management features, dark mode, and zero-configuration installation for Raspberry Pi.

## Features

- **Expense Management**: Track fixed and variable expenses with categories
- **Split Calculations**: Automatically calculate expense splits between users
- **Analytics Dashboard**: Visual charts and monthly trends
- **Data Export**: CSV and PDF export with complete historical data
- **Dark Mode**: Default dark theme with toggle option
- **Multi-Year Tracking**: Historical expense data across multiple years

## Quick Installation

### APT Installation (Empfohlen)
```bash
# Lokale Installation
git clone https://github.com/your-username/household-expense-tracker.git
cd household-expense-tracker
./build-deb-package.sh
sudo dpkg -i ../household-expense-tracker_*.deb
sudo apt-get install -f
```

### Raspberry Pi (Zero Configuration)
```bash
git clone https://github.com/your-username/household-expense-tracker.git
cd household-expense-tracker
chmod +x quick-install-pi.sh
./quick-install-pi.sh
```

Beide Methoden installieren automatisch:
- Node.js und PostgreSQL
- Sichere Datenbankzugangsdaten
- Systemd Service
- Automatischer Start

Zugriff: `http://your-pi-ip:5000`

### Home Assistant Addon
1. **Add Repository**:
   - Go to Supervisor → Add-on Store → ⋮ → Repositories
   - Add: `https://github.com/your-username/household-expense-tracker`

2. **Install**:
   - Find "Household Expense Tracker" and install
   - Configure database URL in addon settings
   - Start the addon

3. **Access**: `http://homeassistant.local:5000`

## Installation Options

- **APT Package** - `./build-deb-package.sh` (Empfohlen)
- **Quick Setup** - `./quick-install-pi.sh` 
- **Manual Setup** - `./npm-install-pi.sh`
- **Service Install** - `./install-pi.sh`
- **Home Assistant** - Addon über Repository
- **Troubleshooting** - `./diagnostic-pi.sh`

## Configuration

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode

### Database
Uses PostgreSQL with automatic schema initialization. SQLite schema also available in `shared/schema-sqlite.ts`.

## Development

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Charts**: Recharts
- **Export**: jsPDF, CSV generation

## Version 2.0.0 Highlights

- Zero-configuration Raspberry Pi installation
- Enhanced database export with historical data
- Dark mode as default setting
- Home Assistant addon support
- Automated PostgreSQL setup
- Complete systemd service integration

## License

MIT License - see LICENSE file for details.