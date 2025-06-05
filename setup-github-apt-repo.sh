#!/bin/bash

# Setup GitHub-based APT repository for household-expense-tracker
echo "Setting up GitHub APT repository..."

# Configuration
GITHUB_USER="your-username"
REPO_NAME="household-expense-tracker"
PACKAGE_NAME="household-expense-tracker"
VERSION="2.0.0"

# Create repository structure
mkdir -p apt-repo/{dists/stable/main/binary-amd64,pool/main}

# Build the Debian package
echo "Building Debian package..."
./build-deb-package.sh

if [ ! -f "../${PACKAGE_NAME}_${VERSION}-1_all.deb" ]; then
    echo "ERROR: Debian package not found. Build failed."
    exit 1
fi

# Copy package to repository pool
cp "../${PACKAGE_NAME}_${VERSION}-1_all.deb" "apt-repo/pool/main/"

# Create Packages file
echo "Creating repository metadata..."
cd apt-repo
dpkg-scanpackages pool/ /dev/null > dists/stable/main/binary-amd64/Packages
gzip -k dists/stable/main/binary-amd64/Packages

# Create Release file
cat > dists/stable/Release << EOF
Origin: ${GITHUB_USER}
Label: Household Expense Tracker Repository
Suite: stable
Codename: stable
Version: 1.0
Date: $(date -Ru)
Architectures: all amd64
Components: main
Description: APT repository for Household Expense Tracker
MD5Sum:
$(md5sum dists/stable/main/binary-amd64/Packages | cut -d' ' -f1) $(stat -c%s dists/stable/main/binary-amd64/Packages) main/binary-amd64/Packages
$(md5sum dists/stable/main/binary-amd64/Packages.gz | cut -d' ' -f1) $(stat -c%s dists/stable/main/binary-amd64/Packages.gz) main/binary-amd64/Packages.gz
SHA1:
$(sha1sum dists/stable/main/binary-amd64/Packages | cut -d' ' -f1) $(stat -c%s dists/stable/main/binary-amd64/Packages) main/binary-amd64/Packages
$(sha1sum dists/stable/main/binary-amd64/Packages.gz | cut -d' ' -f1) $(stat -c%s dists/stable/main/binary-amd64/Packages.gz) main/binary-amd64/Packages.gz
SHA256:
$(sha256sum dists/stable/main/binary-amd64/Packages | cut -d' ' -f1) $(stat -c%s dists/stable/main/binary-amd64/Packages) main/binary-amd64/Packages
$(sha256sum dists/stable/main/binary-amd64/Packages.gz | cut -d' ' -f1) $(stat -c%s dists/stable/main/binary-amd64/Packages.gz) main/binary-amd64/Packages.gz
EOF

cd ..

# Create user installation script
cat > install-from-github.sh << EOF
#!/bin/bash

# Install Household Expense Tracker directly from GitHub
echo "Installing Household Expense Tracker from GitHub..."

# Add repository key (trusted for this example)
echo "Adding APT repository..."
echo "deb [trusted=yes] https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/main/apt-repo stable main" | sudo tee /etc/apt/sources.list.d/household-expense-tracker.list

# Update package list
sudo apt-get update

# Install the package
sudo apt-get install -y ${PACKAGE_NAME}

echo ""
echo "Installation complete!"
echo "Access your expense tracker at: http://localhost:5000"
echo ""
echo "Service management:"
echo "  sudo systemctl status household-expense-tracker"
echo "  sudo systemctl restart household-expense-tracker"
echo "  journalctl -u household-expense-tracker -f"
EOF

chmod +x install-from-github.sh

echo ""
echo "=== GitHub APT Repository Setup Complete ==="
echo ""
echo "Files created:"
echo "  apt-repo/ - APT repository structure"
echo "  install-from-github.sh - User installation script"
echo ""
echo "To deploy:"
echo "1. Commit and push apt-repo/ directory to your GitHub repository"
echo "2. Users can install with:"
echo "   curl -sSL https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/main/install-from-github.sh | bash"
echo ""
echo "Or manual installation:"
echo "   echo 'deb [trusted=yes] https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/main/apt-repo stable main' | sudo tee /etc/apt/sources.list.d/household-expense-tracker.list"
echo "   sudo apt-get update"
echo "   sudo apt-get install household-expense-tracker"