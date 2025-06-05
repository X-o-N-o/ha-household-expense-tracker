# Changelog

## [2.0.0] - 2025-01-05

### 🎉 Major Features
- **Zero-Configuration Raspberry Pi Installation**: Complete automated setup with PostgreSQL database
- **Enhanced Database Export/Import**: Full backup including historical expenses across multiple years
- **Home Assistant Addon Support**: Ready-to-install addon with local build configuration
- **Dark Mode as Default**: Application now starts in dark mode by default

### ✨ New Features
- Automated PostgreSQL setup script for Raspberry Pi
- Complete database export including historical expenses (last 5 years)
- Enhanced CSV export with historical data and type indicators
- Systemd service configuration for auto-startup
- Zero-configuration installation scripts
- Environment file management for easy deployment

### 🔧 Improvements
- Dark mode initialization moved to app level for consistent loading
- Enhanced error handling in export functionality
- Better database schema management for historical data
- Improved installation documentation with multiple setup options
- Streamlined build process for production deployment

### 🐛 Bug Fixes
- Fixed dark mode not loading on dashboard first visit
- Resolved database export missing historical expenses
- Fixed CSV export only showing current year data
- Corrected Home Assistant addon Docker image references

### 📦 Installation Options
- `npm-install-pi.sh`: Quick setup with automatic PostgreSQL
- `install-pi.sh`: Full installation with systemd service
- Manual installation guide for advanced users
- Home Assistant addon via GitHub repository

### 🔒 Security
- Automated secure database credential generation
- Random password generation for database users
- Proper PostgreSQL user permissions and isolation

### 📚 Documentation
- Complete Raspberry Pi installation guide
- Zero-configuration setup instructions
- Home Assistant addon installation guide
- Troubleshooting and maintenance documentation
- APT package installation with Debian packaging
- Professional deployment and service management

### 📦 APT Package Installation (New)
- Professional Debian package (.deb) creation
- Automated PostgreSQL configuration during installation
- Systemd service integration with proper permissions
- Clean removal and purge options
- Dependency management through APT system