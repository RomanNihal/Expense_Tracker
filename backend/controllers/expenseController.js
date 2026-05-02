const { FixedExpense, DailyExpense } = require('../models');
const { Op } = require('sequelize');

// Fixed Expenses
exports.getFixedExpenses = async (req, res) => {
  try {
    const expenses = await FixedExpense.findAll({ where: { userId: req.user.id } });
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addFixedExpense = async (req, res) => {
  try {
    const { name, amount, description } = req.body;
    const expense = await FixedExpense.create({ userId: req.user.id, name, amount, description });
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteFixedExpense = async (req, res) => {
  try {
    await FixedExpense.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Daily Expenses
exports.getDailyExpenses = async (req, res) => {
  try {
    const { date, month } = req.query;
    const where = { userId: req.user.id };
    
    if (date) {
      where.expenseDate = date;
    } else if (month) {
      where.expenseDate = { [Op.like]: `${month}%` };
    }

    const expenses = await DailyExpense.findAll({ where, order: [['expenseDate', 'DESC'], ['createdAt', 'DESC']] });
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addDailyExpense = async (req, res) => {
  try {
    const { name, amount, expenseDate } = req.body;
    const expense = await DailyExpense.create({ 
      userId: req.user.id, 
      name, 
      amount, 
      expenseDate: expenseDate || new Date().toISOString().split('T')[0] 
    });
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteDailyExpense = async (req, res) => {
  try {
    await DailyExpense.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
