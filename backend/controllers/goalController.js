const { SavingsGoal } = require('../models');

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
    
    // Deactivate previous goals? The app seems to support one active goal based on logic
    await SavingsGoal.update({ isActive: false }, { where: { userId: req.user.id } });

    const goal = await SavingsGoal.create({ 
      userId: req.user.id, 
      name, 
      targetAmount, 
      targetMonths, 
      monthlySavings,
      isActive: true
    });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    await SavingsGoal.update({ isActive: false }, { where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Goal deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
