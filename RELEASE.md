# Household Expense Tracker v2.0.0

## What's New in v2.0.0

### Zero-Configuration Raspberry Pi Installation
- Complete automated setup with PostgreSQL database
- One-command installation: `./npm-install-pi.sh`
- Automatic service configuration and startup

### Enhanced Data Management
- Full database export including historical expenses (5+ years)
- Complete CSV export with current and historical data
- Improved backup and restore functionality

### Dark Mode as Default
- Application now starts in dark mode automatically
- Fixed initialization issues across all pages
- Consistent theme loading on first visit

### Home Assistant Integration
- Ready-to-install addon configuration
- Local build support for easy deployment
- Automated database setup within addon

## Installation Options

### Raspberry Pi (Recommended)
```bash
git clone https://github.com/your-username/household-expense-tracker.git
cd household-expense-tracker
./npm-install-pi.sh
```

### Home Assistant Addon
1. Add repository: `https://github.com/your-username/household-expense-tracker`
2. Install "Household Expense Tracker" addon
3. Configure database URL in addon settings
4. Start the addon

### Manual Installation
See `README-RASPBERRY-PI.md` for detailed instructions.

## Technical Improvements
- Enhanced database schema management
- Improved error handling and logging
- Streamlined build process
- Better security with automated credential generation

## Files Ready for GitHub

All files are prepared and ready for upload to your GitHub repository.