# Deployment Guide - Household Expense Tracker v2.0.0

## GitHub Release Setup

### Repository Structure
```
household-expense-tracker/
├── client/                 # React frontend
├── server/                 # Express backend
├── shared/                 # Shared schemas
├── npm-install-pi.sh      # Quick Raspberry Pi setup
├── install-pi.sh          # Full Pi installation
├── fix-pi-install.sh      # Database fix script
├── production-start.sh    # Production startup
├── config.yaml            # Home Assistant addon config
├── package.json           # Dependencies
├── README.md              # Main documentation
└── INSTALLATION_GUIDE.md  # Detailed setup guide
```

### Release Checklist
- [x] Version updated to 2.0.0 in all configs
- [x] Database export with historical data
- [x] Dark mode set as default
- [x] PostgreSQL automated setup
- [x] Home Assistant addon configuration
- [x] Installation scripts with error handling
- [x] Documentation complete

## Deployment Options

### 1. Raspberry Pi Installation
**Target Users:** Home users wanting dedicated device
**Requirements:** Raspberry Pi with Raspbian OS

Installation command:
```bash
curl -sSL https://raw.githubusercontent.com/your-username/household-expense-tracker/main/npm-install-pi.sh | bash
```

### 2. Home Assistant Addon
**Target Users:** Home Assistant users
**Requirements:** Home Assistant OS with Supervisor

Repository URL: `https://github.com/your-username/household-expense-tracker`

### 3. Docker Deployment
**Target Users:** Advanced users with Docker knowledge
**Requirements:** Docker and Docker Compose

### 4. Manual Installation
**Target Users:** Developers and system administrators
**Requirements:** Node.js 18+, PostgreSQL

## Production Configuration

### Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/database
NODE_ENV=production
PORT=5000
```

### Security Considerations
- Database credentials auto-generated during Pi installation
- HTTPS should be configured via reverse proxy
- Regular backups recommended for database

### Performance Optimization
- Built assets are minified and optimized
- Static files served efficiently
- Database queries optimized with proper indexing

## Monitoring and Maintenance

### Health Checks
- Database connectivity test on startup
- Service status monitoring via systemd
- Application logs via journalctl

### Backup Strategy
- Database export functionality built-in
- CSV export for data portability
- Configuration files should be backed up

### Updates
- Pull latest from GitHub repository
- Run `npm run build` to rebuild application
- Restart service: `sudo systemctl restart household-expense-tracker`

## Support and Documentation

- **Installation Issues:** See INSTALLATION_GUIDE.md
- **Feature Documentation:** README.md
- **Technical Details:** API documentation in code
- **Version History:** CHANGELOG.md

## Release Package Complete

All files are prepared and ready for GitHub release:
- Automated installation scripts
- Complete documentation
- Home Assistant addon configuration
- Production-ready application build