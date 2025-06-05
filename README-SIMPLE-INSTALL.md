# Simple Installation Guide

## One-Command Installation

**Complete zero-configuration setup:**

```bash
git clone https://github.com/your-username/household-expense-tracker.git
cd household-expense-tracker
./npm-install-pi.sh
```

This automatically:
- Installs Node.js and PostgreSQL
- Creates secure database with random credentials
- Builds the application
- Sets up all configuration files

## Start the Application

```bash
./start.sh
```

Access at: `http://your-pi-ip:5000`

## What Gets Created

- PostgreSQL database: `expense_tracker`
- Secure database user with random password
- Environment file (`.env`) with all settings
- Built application ready to run

## Full Service Installation

For auto-startup and service management:

```bash
./install-pi.sh
```

Then manage with:
```bash
sudo systemctl start expense-tracker
sudo systemctl status expense-tracker
```

## No Configuration Required

Everything is automated - just run the script and start using your expense tracker!