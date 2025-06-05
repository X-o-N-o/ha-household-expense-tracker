#!/bin/bash

# Create GitHub Pages APT repository using GitHub Releases
echo "Setting up GitHub Pages APT repository..."

GITHUB_USER="your-username"
REPO_NAME="household-expense-tracker"
PACKAGE_NAME="household-expense-tracker"
VERSION="2.0.0"

# Create docs directory for GitHub Pages
mkdir -p docs/{dists/stable/main/binary-all,pool/main}

# Build the Debian package
echo "Building Debian package..."
./build-deb-package.sh

if [ ! -f "../${PACKAGE_NAME}_${VERSION}-1_all.deb" ]; then
    echo "ERROR: Debian package not found. Build failed."
    exit 1
fi

# Copy package to repository pool
cp "../${PACKAGE_NAME}_${VERSION}-1_all.deb" "docs/pool/main/"

# Create Packages file
echo "Creating repository metadata..."
cd docs
dpkg-scanpackages pool/ /dev/null > dists/stable/main/binary-all/Packages
gzip -k dists/stable/main/binary-all/Packages

# Create Release file
cat > dists/stable/Release << EOF
Origin: ${GITHUB_USER}
Label: Household Expense Tracker
Suite: stable
Codename: stable
Version: 1.0
Date: $(date -Ru)
Architectures: all
Components: main
Description: APT repository for Household Expense Tracker
MD5Sum:
$(md5sum dists/stable/main/binary-all/Packages | cut -d' ' -f1) $(stat -c%s dists/stable/main/binary-all/Packages) main/binary-all/Packages
$(md5sum dists/stable/main/binary-all/Packages.gz | cut -d' ' -f1) $(stat -c%s dists/stable/main/binary-all/Packages.gz) main/binary-all/Packages.gz
SHA256:
$(sha256sum dists/stable/main/binary-all/Packages | cut -d' ' -f1) $(stat -c%s dists/stable/main/binary-all/Packages) main/binary-all/Packages
$(sha256sum dists/stable/main/binary-all/Packages.gz | cut -d' ' -f1) $(stat -c%s dists/stable/main/binary-all/Packages.gz) main/binary-all/Packages.gz
EOF

# Create index.html for GitHub Pages
cat > index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Household Expense Tracker APT Repository</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .code { background: #f4f4f4; padding: 10px; border-radius: 5px; }
        .install-btn { 
            background: #007cba; color: white; padding: 15px 30px; 
            text-decoration: none; border-radius: 5px; display: inline-block;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <h1>Household Expense Tracker APT Repository</h1>
    
    <h2>Quick Installation</h2>
    <div class="code">
        curl -sSL https://${GITHUB_USER}.github.io/${REPO_NAME}/install.sh | bash
    </div>
    
    <h2>Manual Installation</h2>
    <div class="code">
        echo 'deb [trusted=yes] https://${GITHUB_USER}.github.io/${REPO_NAME} stable main' | sudo tee /etc/apt/sources.list.d/household-expense-tracker.list<br>
        sudo apt-get update<br>
        sudo apt-get install household-expense-tracker
    </div>
    
    <h2>Features</h2>
    <ul>
        <li>Complete expense tracking with categories</li>
        <li>Analytics dashboard with charts</li>
        <li>Dark mode interface</li>
        <li>CSV/PDF data export</li>
        <li>Zero-configuration PostgreSQL setup</li>
    </ul>
    
    <p>Access after installation: <a href="http://localhost:5000">http://localhost:5000</a></p>
    
    <p><a href="https://github.com/${GITHUB_USER}/${REPO_NAME}">GitHub Repository</a></p>
</body>
</html>
EOF

# Create installation script for users
cat > install.sh << EOF
#!/bin/bash

echo "Installing Household Expense Tracker..."

# Check if running as root
if [ "\$EUID" -eq 0 ]; then
    echo "Please run this script as a regular user (not root)"
    exit 1
fi

# Add APT repository
echo "Adding APT repository..."
echo 'deb [trusted=yes] https://${GITHUB_USER}.github.io/${REPO_NAME} stable main' | sudo tee /etc/apt/sources.list.d/household-expense-tracker.list > /dev/null

# Update package list
echo "Updating package list..."
sudo apt-get update

# Install package
echo "Installing household-expense-tracker..."
sudo apt-get install -y household-expense-tracker

echo ""
echo "=== Installation Complete ==="
echo ""
echo "Household Expense Tracker is now installed and running!"
echo ""
echo "Access your application:"
echo "  Local:   http://localhost:5000"
echo "  Network: http://\$(hostname -I | awk '{print \$1}'):5000"
echo ""
echo "Service management:"
echo "  Status:  sudo systemctl status household-expense-tracker"
echo "  Restart: sudo systemctl restart household-expense-tracker"
echo "  Logs:    journalctl -u household-expense-tracker -f"
echo ""
echo "To remove: sudo apt-get remove household-expense-tracker"
echo ""
EOF

chmod +x install.sh

cd ..

# Create GitHub workflow for automatic updates
mkdir -p .github/workflows
cat > .github/workflows/update-apt-repo.yml << EOF
name: Update APT Repository

on:
  release:
    types: [published]
  push:
    branches: [main]
    paths: ['debian/**', 'package.json']

jobs:
  update-repository:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        sudo apt-get update
        sudo apt-get install -y build-essential devscripts debhelper
        npm install
        
    - name: Build Debian package
      run: |
        chmod +x build-deb-package.sh
        ./build-deb-package.sh
        
    - name: Update APT repository
      run: |
        chmod +x github-pages-apt-setup.sh
        ./github-pages-apt-setup.sh
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: \${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./docs
        force_orphan: true
EOF

echo ""
echo "=== GitHub Pages APT Repository Setup Complete ==="
echo ""
echo "Files created:"
echo "  docs/ - GitHub Pages APT repository"
echo "  docs/install.sh - One-line installation script"
echo "  .github/workflows/update-apt-repo.yml - Automatic updates"
echo ""
echo "Setup steps:"
echo "1. Commit and push all files to GitHub"
echo "2. Enable GitHub Pages in repository settings (source: docs/)"
echo "3. Users can install with ONE COMMAND:"
echo ""
echo "   curl -sSL https://${GITHUB_USER}.github.io/${REPO_NAME}/install.sh | bash"
echo ""
echo "Or manually:"
echo "   echo 'deb [trusted=yes] https://${GITHUB_USER}.github.io/${REPO_NAME} stable main' | sudo tee /etc/apt/sources.list.d/household-expense-tracker.list"
echo "   sudo apt-get update && sudo apt-get install household-expense-tracker"