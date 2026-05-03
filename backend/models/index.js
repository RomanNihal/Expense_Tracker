const User = require('./User');
const MonthlyIncome = require('./MonthlyIncome');
const FixedExpense = require('./FixedExpense');
const FixedIncome = require('./FixedIncome');
const SavingsGoal = require('./SavingsGoal');
const Transaction = require('./Transaction');

// Relationships
User.hasMany(MonthlyIncome, { foreignKey: 'userId', onDelete: 'CASCADE' });
MonthlyIncome.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(FixedExpense, { foreignKey: 'userId', onDelete: 'CASCADE' });
FixedExpense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(FixedIncome, { foreignKey: 'userId', onDelete: 'CASCADE' });
FixedIncome.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(SavingsGoal, { foreignKey: 'userId', onDelete: 'CASCADE' });
SavingsGoal.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Transaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  MonthlyIncome,
  FixedExpense,
  FixedIncome,
  SavingsGoal,
  Transaction
};
