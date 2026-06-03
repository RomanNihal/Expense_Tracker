const { SavingsGoal, SavingLog } = require('../models');

exports.getSavingsData = async (req, res) => {
  try {
    const goals = await SavingsGoal.findAll({ where: { userId: req.user.id } });
    const logs = await SavingLog.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    const totalSavings = logs.reduce((acc, log) => {
      if (log.type === 'DEPOSIT' || log.type === 'GOAL_COMPLETION') return acc + parseFloat(log.amount);
      if (log.type === 'WITHDRAWAL') return acc - parseFloat(log.amount);
      return acc;
    }, 0);

    res.json({ success: true, data: { goals, logs, totalSavings } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addSavingLog = async (req, res) => {
  try {
    const { amount, description, type, date } = req.body;
    const log = await SavingLog.create({
      userId: req.user.id,
      amount,
      description,
      type,
      date: date || new Date()
    });
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSavingLog = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const log = await SavingLog.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!log) return res.status(404).json({ success: false, error: 'Log not found' });

    if (amount !== undefined) log.amount = amount;
    if (description !== undefined) log.description = description;
    await log.save();

    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteSavingLog = async (req, res) => {
  try {
    const log = await SavingLog.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!log) return res.status(404).json({ success: false, error: 'Log not found' });

    await log.destroy();
    res.json({ success: true, message: 'Log deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.completeGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

    goal.isCompleted = true;
    goal.isActive = false;
    await goal.save();

    await SavingLog.create({
      userId: req.user.id,
      amount: goal.targetAmount,
      description: `Completed Goal: ${goal.name}`,
      type: 'GOAL_COMPLETION',
      date: new Date()
    });

    res.json({ success: true, message: 'Goal marked as completed and funds moved to savings' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Smart extend: logs already-saved portion to vault, updates goal with remaining amount & new months
exports.extendGoal = async (req, res) => {
  try {
    const { remainingAmount, newMonths } = req.body;
    const goal = await SavingsGoal.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

    const completedAmount = parseFloat(goal.targetAmount) - parseFloat(remainingAmount);

    // Log the portion already saved into the vault
    if (completedAmount > 0) {
      await SavingLog.create({
        userId: req.user.id,
        amount: completedAmount,
        description: `Partial Save: ${goal.name}`,
        type: 'GOAL_COMPLETION',
        date: new Date()
      });
    }

    // Reset the goal for the extension period
    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7);

    goal.targetAmount = parseFloat(remainingAmount);
    goal.targetMonths = parseInt(newMonths);
    goal.monthlySavings = parseFloat(remainingAmount) / parseInt(newMonths);
    goal.startMonth = currentMonthStr;
    goal.lastApplied = currentMonthStr; // don't apply this month immediately
    goal.isActive = true;
    goal.isCompleted = false;
    await goal.save();

    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
