#!/usr/bin/env node

// Database setup script for automated PostgreSQL configuration
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  console.log(`${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Failed: ${description}`);
    return false;
  }
}

function setupDatabase() {
  console.log('Setting up PostgreSQL database...');
  
  // Generate secure credentials
  const dbName = 'expense_tracker';
  const dbUser = 'expense_user';
  const dbPass = `expense_pass_${Date.now()}`;
  const databaseUrl = `postgresql://${dbUser}:${dbPass}@localhost:5432/${dbName}`;
  
  // Create database and user
  const commands = [
    `sudo -u postgres psql -c "CREATE DATABASE ${dbName};"`,
    `sudo -u postgres psql -c "CREATE USER ${dbUser} WITH PASSWORD '${dbPass}';"`,
    `sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};"`,
    `sudo -u postgres psql -c "ALTER USER ${dbUser} CREATEDB;"`
  ];
  
  for (const command of commands) {
    if (!runCommand(command, 'Configuring database')) {
      process.exit(1);
    }
  }
  
  // Save configuration
  const envContent = `DATABASE_URL=${databaseUrl}\nNODE_ENV=production\nPORT=5000\n`;
  fs.writeFileSync('.env', envContent);
  
  console.log('Database setup complete!');
  console.log(`Database URL: ${databaseUrl}`);
  
  // Initialize schema
  process.env.DATABASE_URL = databaseUrl;
  runCommand('npm run db:push', 'Initializing database schema');
  
  return databaseUrl;
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };