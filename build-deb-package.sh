#!/bin/bash

# Build Debian package for household-expense-tracker
echo "Building Debian package for APT installation..."

# Check if required tools are installed
if ! command -v dpkg-buildpackage &> /dev/null; then
    echo "Installing Debian packaging tools..."
    sudo apt-get update
    sudo apt-get install -y build-essential devscripts debhelper
fi

# Make Debian scripts executable
chmod +x debian/postinst debian/prerm debian/postrm debian/rules

# Clean previous builds
rm -f ../household-expense-tracker_*.deb ../household-expense-tracker_*.changes ../household-expense-tracker_*.buildinfo

# Build the package
echo "Building package..."
dpkg-buildpackage -us -uc -b

if [ $? -eq 0 ]; then
    echo ""
    echo "=== Debian Package Built Successfully ==="
    echo ""
    ls -la ../household-expense-tracker_*.deb
    echo ""
    echo "To install the package:"
    echo "  sudo dpkg -i ../household-expense-tracker_*.deb"
    echo "  sudo apt-get install -f  # Fix any dependency issues"
    echo ""
    echo "To create a repository:"
    echo "  1. Upload .deb file to your server"
    echo "  2. Create Packages file: dpkg-scanpackages . /dev/null | gzip -9c > Packages.gz"
    echo "  3. Users can add your repository:"
    echo "     echo 'deb [trusted=yes] http://your-server.com/repo ./' | sudo tee /etc/apt/sources.list.d/household-expense-tracker.list"
    echo "     sudo apt-get update"
    echo "     sudo apt-get install household-expense-tracker"
    echo ""
else
    echo "Package build failed. Check the errors above."
    exit 1
fi