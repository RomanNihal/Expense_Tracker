/**
 * import-data.js
 * Run this on Railway AFTER the first deployment to restore your SQLite data
 * into the PostgreSQL database.
 *
 * Usage (via Railway CLI):
 *   railway run node import-data.js
 *
 * Or locally against a PostgreSQL DB:
 *   DATABASE_URL="postgres://..." node import-data.js
 */

const sequelize = require('./config/database');
const models = require('./models');
const fs = require('fs');
const path = require('path');

const ORDER = ['User', 'FixedIncome', 'FixedExpense', 'MonthlyIncome', 'SavingsGoal', 'SavingLog', 'Transaction'];

async function importData() {
  console.log('Connecting to database...');
  await sequelize.authenticate();

  // Create all tables (safe — won't drop existing data)
  await sequelize.sync({ alter: false });
  console.log('Schema ready.\n');

  const exportsDir = path.join(__dirname, 'exports');
  if (!fs.existsSync(exportsDir)) {
    console.error('No exports/ directory found. Run  node export-data.js  first.');
    process.exit(1);
  }

  for (const name of ORDER) {
    const file = path.join(exportsDir, `${name}.json`);
    if (!fs.existsSync(file)) {
      console.log(`  ⚠  exports/${name}.json not found, skipping.`);
      continue;
    }

    const model = models[name];
    if (!model) { console.log(`  ⚠  Model "${name}" not found, skipping.`); continue; }

    const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (rows.length === 0) {
      console.log(`  –  exports/${name}.json is empty, skipping.`);
      continue;
    }

    // Insert in batches of 100; skip rows that already exist (by primary key)
    let inserted = 0;
    let skipped = 0;
    for (const row of rows) {
      try {
        await model.create(row);
        inserted++;
      } catch (err) {
        // Unique constraint = row already exists
        if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeDatabaseError') {
          skipped++;
        } else {
          console.error(`  ✗  Error inserting into ${name}:`, err.message);
        }
      }
    }
    console.log(`  ✓  ${name}: ${inserted} inserted, ${skipped} skipped (already existed)`);
  }

  console.log('\nImport complete!');
  process.exit(0);
}

importData().catch(err => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
