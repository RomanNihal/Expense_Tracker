const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MonthlyIncome = sequelize.define('MonthlyIncome', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    defaultValue: 'Regular Income'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
});

module.exports = MonthlyIncome;
