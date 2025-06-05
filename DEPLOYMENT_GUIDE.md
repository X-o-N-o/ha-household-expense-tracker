# Home Assistant Addon Deployment Guide

## Files to Upload to GitHub Repository

Upload all these files to your GitHub repository: `https://github.com/X-o-N-o/ha-household-expense-tracker.git`

### Required Addon Files:
- `config.yaml` - Home Assistant addon configuration
- `Dockerfile` - Container build instructions  
- `build.yaml` - Multi-architecture build configuration
- `run.sh` - Startup script for the addon
- `README.md` - Addon documentation
- `repository.yaml` - Repository metadata

### Application Files:
- `package.json` - Node.js dependencies
- `package-lock.json` - Dependency lock file
- All files in `client/` directory
- All files in `server/` directory  
- All files in `shared/` directory
- `vite.config.ts`
- `tailwind.config.ts`
- `postcss.config.js`
- `drizzle.config.ts`

## GitHub Repository Setup Steps:

1. **Clone or initialize your repository:**
   ```bash
   git clone https://github.com/X-o-N-o/ha-household-expense-tracker.git
   cd ha-household-expense-tracker
   ```

2. **Copy all files to the repository directory**

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Initial Home Assistant addon release"
   git push origin main
   ```

## Home Assistant Installation:

1. In Home Assistant, go to **Supervisor** → **Add-on Store**
2. Click the three dots menu (⋮) → **Repositories**  
3. Add repository URL: `https://github.com/X-o-N-o/ha-household-expense-tracker`
4. Find "Household Expense Tracker" in the store and install
5. Configure user names in the addon configuration
6. Start the addon
7. Access at `http://homeassistant.local:5000`

## Configuration Options:

```yaml
database_url: ""  # Optional: External PostgreSQL URL
user1_name: "Danzel"  # Your name
user2_name: "Partner"  # Partner's name
```

The addon will automatically create a local SQLite database if no external database is configured.