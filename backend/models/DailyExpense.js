const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyExpense = sequelize.define('DailyExpense', {
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
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  indexes: [
    {
      fields: ['userId', 'expenseDate']
    }
  ]
});

module.exports = DailyExpense;
