const sequelize = require('./config/database');
const { DataTypes } = require('sequelize');

async function migrate() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('Starting migration...');

    // 1. Check and add currentAmount to SavingsGoals
    const tableInfo = await queryInterface.describeTable('SavingsGoals');
    
    if (!tableInfo.currentAmount) {
      console.log('Adding currentAmount to SavingsGoals...');
      await queryInterface.addColumn('SavingsGoals', 'currentAmount', {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      });
    }

    if (!tableInfo.isCompleted) {
      console.log('Adding isCompleted to SavingsGoals...');
      await queryInterface.addColumn('SavingsGoals', 'isCompleted', {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      });
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
