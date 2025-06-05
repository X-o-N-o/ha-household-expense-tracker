# Upload Instructions for GitHub Repository

## Repository: https://github.com/X-o-N-o/ha-household-expense-tracker.git

### Required Files for Home Assistant Addon:

**Root Directory Files:**
- config.yaml (Addon configuration)
- Dockerfile (Container build)
- build.yaml (Multi-arch build)
- run.sh (Startup script)
- README.md (Documentation)
- repository.yaml (Repository metadata)
- CHANGELOG.md (Version history)
- .gitignore (Git ignore rules)
- package.json (Dependencies)
- package-lock.json (Lock file)
- vite.config.ts (Build config)
- tailwind.config.ts (Styling config)
- postcss.config.js (CSS processing)
- drizzle.config.ts (Database config)
- tsconfig.json (TypeScript config)
- components.json (UI components)
- DEPLOYMENT_GUIDE.md (Setup guide)
- UPLOAD_INSTRUCTIONS.md (This file)

**Application Directories:**
- client/ (Frontend React application)
- server/ (Backend Express server)
- shared/ (Shared TypeScript schemas)

### Steps to Upload:

1. **Initialize Git repository:**
```bash
git clone https://github.com/X-o-N-o/ha-household-expense-tracker.git
cd ha-household-expense-tracker
```

2. **Copy all files from your Replit project to the repository directory**

3. **Commit and push:**
```bash
git add .
git commit -m "Initial Home Assistant addon release v1.0.0"
git push origin main
```

### Installation in Home Assistant:

1. Supervisor → Add-on Store → Three dots menu → Repositories
2. Add: https://github.com/X-o-N-o/ha-household-expense-tracker
3. Install "Household Expense Tracker" addon
4. Configure user names in addon settings
5. Start addon
6. Access at http://homeassistant.local:5000

The addon includes:
- Automatic SQLite database setup
- CSV/PDF export functionality  
- Multi-user expense tracking
- Category management with icons
- Analytics dashboard
- German language support