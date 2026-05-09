const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FixedIncome = sequelize.define('FixedIncome', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  lastApplied: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = FixedIncome;
