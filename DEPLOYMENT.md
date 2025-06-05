# Home Assistant Addon Deployment Guide

This guide explains how to deploy the Household Expense Tracker as a Home Assistant addon.

## Quick Start

1. **Download the complete project files** from this Replit environment
2. **Create addon directory** in your Home Assistant installation:
   ```
   /config/addons/household-expense-tracker/
   ```
3. **Copy all files** to the addon directory
4. **Restart Home Assistant**
5. **Install addon** via Settings > Add-ons > Local add-ons

## File Structure

Your addon directory should contain:
```
household-expense-tracker/
├── config.yaml          # Addon configuration
├── Dockerfile           # Container build instructions  
├── build.yaml           # Build configuration
├── run.sh              # Startup script
├── README.md           # Documentation
├── CHANGELOG.md        # Version history
├── package.json        # Node.js dependencies
├── package-lock.json   # Dependency lock file
├── vite.config.ts      # Build configuration
├── tailwind.config.ts  # Styling configuration
├── tsconfig.json       # TypeScript configuration
├── drizzle.config.ts   # Database configuration
├── server/             # Backend code
├── client/             # Frontend code
├── shared/             # Shared schemas
└── components.json     # UI components config
```

## Configuration Options

Configure the addon via the Home Assistant UI:

- **Database URL**: Optional PostgreSQL connection string
- **User Names**: Customize household member names
- **Split Percentage**: Set default expense split ratio

## Database Setup

### SQLite (Recommended for most users)
- Automatic setup, no configuration needed
- Data stored in `/addon_configs/household-expense-tracker/data/`

### PostgreSQL (For advanced users)
- Requires external PostgreSQL database
- Configure connection string in addon options

## Accessing the Application

After installation and startup:
- Web interface: `http://homeassistant.local:5000`
- Or use your Home Assistant IP: `http://192.168.1.xxx:5000`

## Troubleshooting

### Addon Won't Start
- Check Home Assistant logs: Settings > Add-ons > Household Expense Tracker > Log
- Verify all files are copied correctly
- Ensure port 5000 is available

### Database Connection Issues
- SQLite: Check `/addon_configs/` directory permissions
- PostgreSQL: Verify connection string format

### Network Access Issues
- Check Home Assistant firewall settings
- Verify port 5000 is not blocked
- Try accessing via direct IP address

## Data Backup

### SQLite
Backup file: `/addon_configs/household-expense-tracker/data/expenses.db`

### PostgreSQL
Use standard PostgreSQL backup tools

## Updates

To update the addon:
1. Replace all files with new versions
2. Restart the addon via Home Assistant UI
3. Check changelog for breaking changes

## Production Considerations

- Enable Home Assistant SSL for secure access
- Set up regular database backups
- Monitor addon resource usage
- Configure addon to start automatically

## Support

For issues:
1. Check addon logs in Home Assistant
2. Verify configuration settings
3. Review this deployment guide
4. Check file permissions and structure