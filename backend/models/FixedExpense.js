const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FixedExpense = sequelize.define('FixedExpense', {
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING
  },
  lastApplied: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = FixedExpense;
