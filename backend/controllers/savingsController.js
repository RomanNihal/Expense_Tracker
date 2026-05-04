const { SavingsGoal, SavingLog, Transaction } = require('../models');

exports.getSavingsData = async (req, res) => {
  try {
    const goals = await SavingsGoal.findAll({ where: { userId: req.user.id } });
    const logs = await SavingLog.findAll({ 
      where: { userId: req.user.id },
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    // Calculate total savings balance
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

exports.completeGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

    // Mark as completed
    goal.isCompleted = true;
    goal.isActive = false;
    await goal.save();

    // Log the completion as a deposit into general savings
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

exports.updateGoalTime = async (req, res) => {
  try {
    const { targetMonths } = req.body;
    const goal = await SavingsGoal.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

    goal.targetMonths = targetMonths;
    // Recalculate monthly savings needed?
    // User said: "remaining money needed to fullfill that target will be substracted from the next months money"
    // This implies we need to know how much is already saved.
    
    await goal.save();
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
