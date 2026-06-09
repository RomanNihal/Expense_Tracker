const { SavingsGoal, Transaction, SavingLog } = require('../models');
const { Op } = require('sequelize');

exports.getGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.findAll({ where: { userId: req.user.id, isActive: true } });
    res.json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addGoal = async (req, res) => {
  try {
    const { name, targetAmount, targetMonths } = req.body;
    const monthlySavings = targetAmount / targetMonths;
    
    // Removed: Deactivating previous goals. Multiple goals are now supported.

    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7);

    const goal = await SavingsGoal.create({
      userId: req.user.id,
      name,
      targetAmount,
      targetMonths,
      monthlySavings,
      isActive: true,
      startMonth: currentMonthStr
    });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { name, targetAmount, targetMonths } = req.body;
    const goal = await SavingsGoal.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

    const oldName = goal.name;
    const nameChanged = name && name !== oldName;

    if (name) goal.name = name;
    if (targetAmount) goal.targetAmount = parseFloat(targetAmount);
    if (targetMonths) {
      goal.targetMonths = parseInt(targetMonths);
      goal.monthlySavings = goal.targetAmount / goal.targetMonths;
    }
    await goal.save();

    // If name changed, sync all related wallet transactions and vault logs
    if (nameChanged) {
      await Transaction.update(
        { name: `Savings: ${name}` },
        { where: { userId: req.user.id, name: `Savings: ${oldName}`, type: 'SAVINGS' } }
      );
      await SavingLog.update(
        { description: `Completed Goal: ${name}` },
        { where: { userId: req.user.id, description: `Completed Goal: ${oldName}` } }
      );
      await SavingLog.update(
        { description: `Partial Save: ${name}` },
        { where: { userId: req.user.id, description: `Partial Save: ${oldName}` } }
      );
    }

    // If monthly savings changed, update the current month's transaction amount
    if (targetAmount || targetMonths) {
      const now = new Date();
      const currentMonthStr = now.toISOString().slice(0, 7);
      await Transaction.update(
        { amount: goal.monthlySavings },
        {
          where: {
            userId: req.user.id,
            name: `Savings: ${goal.name}`,
            type: 'SAVINGS',
            expenseDate: { [Op.like]: `${currentMonthStr}%` }
          }
        }
      );
    }

    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

    // 1. Deactivate the goal
    goal.isActive = false;
    await goal.save();

    // 2. Remove the current month's automated transaction for this goal so totals update
    const { Transaction } = require('../models');
    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7);
    const itemName = `Savings: ${goal.name}`;

    await Transaction.destroy({
      where: {
        userId: req.user.id,
        name: itemName,
        type: 'SAVINGS',
        expenseDate: { [Op.like]: `${currentMonthStr}%` }
      }
    });

    res.json({ success: true, message: 'Goal removed and current month transaction cleaned up' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
