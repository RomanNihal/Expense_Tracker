const User = require('./User');
const MonthlyIncome = require('./MonthlyIncome');
const FixedExpense = require('./FixedExpense');
const SavingsGoal = require('./SavingsGoal');
const DailyExpense = require('./DailyExpense');

// Relationships
User.hasMany(MonthlyIncome, { foreignKey: 'userId', onDelete: 'CASCADE' });
MonthlyIncome.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(FixedExpense, { foreignKey: 'userId', onDelete: 'CASCADE' });
FixedExpense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(SavingsGoal, { foreignKey: 'userId', onDelete: 'CASCADE' });
SavingsGoal.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(DailyExpense, { foreignKey: 'userId', onDelete: 'CASCADE' });
DailyExpense.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  MonthlyIncome,
  FixedExpense,
  SavingsGoal,
  DailyExpense
};
