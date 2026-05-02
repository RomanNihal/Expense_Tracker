const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavingsGoal = sequelize.define('SavingsGoal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  targetMonths: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  monthlySavings: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = SavingsGoal;
