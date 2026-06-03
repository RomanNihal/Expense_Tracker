const { FixedIncome, FixedExpense, SavingsGoal, Transaction, SavingLog } = require('../models');

const { Op } = require('sequelize');

// In-memory lock to prevent race conditions during auto-apply
const applyLocks = new Set();

// Helper to auto-apply fixed income/expenses for the current month
const autoApplyFixedItems = async (userId) => {
  if (applyLocks.has(userId)) return;
  applyLocks.add(userId);

  try {
    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7); // YYYY-MM
    const firstOfMonth = `${currentMonthStr}-01`;

    // 1. Apply Fixed Income
    const fixedIncomes = await FixedIncome.findAll({ where: { userId } });
    for (const item of fixedIncomes) {
      if (item.lastApplied === currentMonthStr) continue;

      const itemName = `Fixed: ${item.source}`;
      await Transaction.create({
        userId,
        name: itemName,
        amount: item.amount,
        type: 'INCOME',
        expenseDate: firstOfMonth,
        isFixed: true
      });
      
      item.lastApplied = currentMonthStr;
      await item.save();
    }

    // 2. Apply Fixed Expenses
    const fixedExpenses = await FixedExpense.findAll({ where: { userId } });
    for (const item of fixedExpenses) {
      if (item.lastApplied === currentMonthStr) continue;

      const itemName = `Fixed: ${item.name}`;
      await Transaction.create({
        userId,
        name: itemName,
        amount: item.amount,
        type: 'EXPENSE',
        expenseDate: firstOfMonth,
        isFixed: true
      });

      item.lastApplied = currentMonthStr;
      await item.save();
    }

    // 3. Apply Savings Goals (skip overdue ones)
    const activeGoals = await SavingsGoal.findAll({ where: { userId, isActive: true, isCompleted: false } });
    for (const goal of activeGoals) {
      if (goal.lastApplied === currentMonthStr) continue;

      // Check if goal period has elapsed — skip if overdue
      const startMonthStr = goal.startMonth || goal.createdAt?.toISOString?.().slice(0, 7) || goal.createdAt?.slice(0, 7);
      if (startMonthStr) {
        const [sy, sm] = startMonthStr.split('-').map(Number);
        const [cy, cm] = currentMonthStr.split('-').map(Number);
        const monthsElapsed = (cy * 12 + cm) - (sy * 12 + sm);
        if (monthsElapsed >= goal.targetMonths) continue;
      }

      const itemName = `Savings: ${goal.name}`;
      await Transaction.create({
        userId,
        name: itemName,
        amount: goal.monthlySavings,
        type: 'SAVINGS',
        expenseDate: firstOfMonth,
        isFixed: true
      });

      goal.lastApplied = currentMonthStr;
      await goal.save();
    }
  } catch (error) {
    console.error('Auto-apply error:', error);
  } finally {
    applyLocks.delete(userId);
  }
};



exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Auto-apply fixed items for this month if not already done
    await autoApplyFixedItems(userId);

    // 1. Calculate Wallet Balance
    // Sum of all INCOME - Sum of all EXPENSE - Sum of all SAVINGS
    const transactions = await Transaction.findAll({ where: { userId } });

    let totalBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let monthlySavings = 0;

    const currentMonthPrefix = now.toISOString().slice(0, 7);

    transactions.forEach(t => {
      const amt = parseFloat(t.amount);
      if (t.type === 'INCOME') {
        totalBalance += amt;
        if (t.expenseDate.startsWith(currentMonthPrefix)) monthlyIncome += amt;
      } else if (t.type === 'EXPENSE') {
        totalBalance -= amt;
        if (t.expenseDate.startsWith(currentMonthPrefix)) monthlyExpenses += amt;
      } else if (t.type === 'SAVINGS') {
        totalBalance -= amt;
        if (t.expenseDate.startsWith(currentMonthPrefix)) monthlySavings += amt;
      }
    });

    // 2. Get Fixed Settings for display
    const fixedIncomes = await FixedIncome.findAll({ where: { userId } });
    const fixedExpenses = await FixedExpense.findAll({ where: { userId } });
    const activeGoals = await SavingsGoal.findAll({ where: { userId, isActive: true, isCompleted: false } });

    // Calculate actual total savings from SavingLog
    const logs = await SavingLog.findAll({ where: { userId } });

    const savingsBalance = logs.reduce((acc, log) => {
      if (log.type === 'DEPOSIT' || log.type === 'GOAL_COMPLETION') return acc + parseFloat(log.amount);
      if (log.type === 'WITHDRAWAL') return acc - parseFloat(log.amount);
      return acc;
    }, 0);

    // 3. Today's Expenses
    const todayExpenses = transactions
      .filter(t => t.expenseDate === todayStr && t.type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // 4. Days remaining
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysRemaining = (lastDayOfMonth - now.getDate()) + 1;

    // 5. Recommended daily budget (Balance / Days remaining)
    const recommendedDaily = daysRemaining > 0 ? (totalBalance / daysRemaining) : 0;

    res.json({
      success: true,
      data: {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        monthlySavings,
        todayExpenses,
        daysRemaining,
        recommendedDaily: Math.max(0, recommendedDaily),
        fixedIncomes,
        fixedExpenses,
        activeGoals,
        savingsBalance,
        recentTransactions: transactions.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate)).slice(0, 10)
      }
    });


  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

