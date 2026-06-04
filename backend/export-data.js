/**
 * export-data.js
 * Run this BEFORE deploying to export your local SQLite data.
 * It creates an exports/ folder with one JSON file per table.
 *
 * Usage:  node export-data.js
 */

const sequelize = require('./config/database');
const models = require('./models');
const fs = require('fs');
const path = require('path');

async function exportData() {
  console.log('Connecting to SQLite database...');
  await sequelize.authenticate();

  const outputDir = path.join(__dirname, 'exports');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const tableNames = ['User', 'FixedIncome', 'FixedExpense', 'MonthlyIncome', 'SavingsGoal', 'SavingLog', 'Transaction'];

  for (const name of tableNames) {
    const model = models[name];
    if (!model) { console.log(`  ⚠  Model "${name}" not found, skipping.`); continue; }
    const rows = await model.findAll({ raw: true });
    const file = path.join(outputDir, `${name}.json`);
    fs.writeFileSync(file, JSON.stringify(rows, null, 2), 'utf8');
    console.log(`  ✓  ${rows.length.toString().padStart(4)} rows  →  exports/${name}.json`);
  }

  console.log('\nExport complete. Commit the exports/ folder or copy it somewhere safe.');
  process.exit(0);
}

exportData().catch(err => {
  console.error('Export failed:', err.message);
  process.exit(1);
});
