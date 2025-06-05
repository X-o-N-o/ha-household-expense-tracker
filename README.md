# Household Expense Tracker - Home Assistant Add-on

A comprehensive household expense tracking web application that provides advanced financial management through interactive and personalized features.

## Features

- **Real-time collaborative expense tracking** between two users
- **Dynamic expense categorization system** with custom icons and colors
- **Advanced data visualization** with charts and analytics
- **CSV and PDF export functionality** with detailed reports
- **Multilingual support** (German interface)
- **Responsive design** with dark mode support
- **Historical data preservation** for trend analysis

## Installation

### Method 1: Add Repository (Recommended)

1. In Home Assistant, go to **Supervisor** → **Add-on Store**
2. Click the three dots menu (⋮) in the top right
3. Select **Repositories**
4. Add this repository URL: `https://github.com/yourusername/ha-household-expense-tracker`
5. Find "Household Expense Tracker" in the add-on store and click **Install**

### Method 2: Manual Installation

1. Copy all files to your Home Assistant `addons/household-expense-tracker/` directory
2. Go to **Supervisor** → **Add-on Store**
3. Find "Household Expense Tracker" and click **Install**

## Configuration

```yaml
database_url: ""  # Optional: External PostgreSQL database URL
user1_name: "You"  # Name for first user
user2_name: "Partner"  # Name for second user
```

### Configuration Options

- **database_url** (optional): External PostgreSQL database connection string. If not provided, uses local SQLite database.
- **user1_name**: Display name for the first user (default: "You")
- **user2_name**: Display name for the second user (default: "Partner")

## Usage

1. Start the add-on
2. Access the web interface at `http://homeassistant.local:5000`
3. Begin tracking your household expenses
4. Use the analytics dashboard to monitor spending patterns
5. Export reports in CSV or PDF format

## Database

By default, the add-on uses a local SQLite database stored in `/data/expenses.db`. For better performance and backup capabilities, you can configure an external PostgreSQL database using the `database_url` option.

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/yourusername/ha-household-expense-tracker).