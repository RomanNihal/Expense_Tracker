const { MonthlyIncome, FixedExpense, SavingsGoal, DailyExpense } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed
    const todayStr = now.toISOString().split('T')[0];

    // 1. Get Monthly Income (Sum of all entries this month)
    const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const incomeSum = await MonthlyIncome.sum('amount', {
      where: { 
        userId, 
        date: { [Op.gte]: startOfMonth } 
      }
    });
    const monthlyIncome = incomeSum ? parseFloat(incomeSum) : 0;

    // 2. Get Fixed Expenses
    const fixedExpensesList = await FixedExpense.findAll({ where: { userId } });
    const totalFixedExpensesSum = fixedExpensesList.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // 3. Get Active Savings Goal
    const savingsGoal = await SavingsGoal.findOne({
      where: { userId, isActive: true }
    });
    const monthlySavingsAmount = savingsGoal ? parseFloat(savingsGoal.monthlySavings) : 0;

    // 4. Calculate Total Fixed (Fixed + Savings)
    const totalFixedCosts = totalFixedExpensesSum + monthlySavingsAmount;

    // 5. Calculate Days Remaining in Month
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = (lastDayOfMonth - currentDay) + 1; // Include today

    // 6. Calculate Max Daily Expense
    // Rule: (Income - Total Fixed Costs) / Days Remaining
    const availableForDaily = monthlyIncome - totalFixedCosts;
    
    // We need to subtract daily expenses ALREADY spent this month except today? 
    // Actually the rule in the doc says: (Monthly Income - Total Fixed Expenses) / Days Remaining
    // But usually we should subtract what we already spent this month to get the NEW daily limit.
    // Let's stick to the doc's simple rule first, or refine it.
    // The doc says: maxDailyExpense: number, // (income - fixed - savings) / daysRemaining
    // This implies it's a STATIC goal for the month if we haven't spent anything.
    // Let's implement it as: (Income - Fixed - Savings - SpentInPreviousDaysOfMonth) / DaysRemaining
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const spentBeforeToday = await DailyExpense.sum('amount', {
      where: {
        userId,
        expenseDate: {
          [Op.between]: [startOfMonth, yesterdayStr]
        }
      }
    }) || 0;

    const remainingBudget = monthlyIncome - totalFixedCosts - spentBeforeToday;
    const maxDailyExpense = daysRemaining > 0 ? (remainingBudget / daysRemaining) : 0;

    // 7. Today's Expenses
    const todayExpenses = await DailyExpense.sum('amount', {
      where: { userId, expenseDate: todayStr }
    }) || 0;

    // 8. Remaining Today
    const remainingToday = maxDailyExpense - todayExpenses;

    // 9. Total Monthly Expenses
    const monthlyExpensesTotal = await DailyExpense.sum('amount', {
      where: {
        userId,
        expenseDate: {
          [Op.gte]: startOfMonth
        }
      }
    }) || 0;

    res.json({
      success: true,
      data: {
        monthlyIncome,
        totalFixedExpenses: totalFixedExpensesSum,
        monthlySavingsAmount,
        totalFixedCosts, // Sum of both
        daysRemaining,
        maxDailyExpense: Math.max(0, maxDailyExpense),
        todayExpenses,
        remainingToday,
        monthlyExpensesTotal,
        savingsGoal: savingsGoal || null,
        fixedExpenses: fixedExpensesList
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
