const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
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
  type: {
    type: DataTypes.ENUM('EXPENSE', 'INCOME', 'SAVINGS'),
    allowNull: false,
    defaultValue: 'EXPENSE'
  },
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'expenseDate' // Explicitly use the old column name for compatibility
  },
  isFixed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  indexes: [
    {
      fields: ['userId', 'expenseDate']
    }
  ]
});

module.exports = Transaction;
