const { MonthlyIncome, FixedIncome, Transaction } = require('../models');
const { Op } = require('sequelize');

// Fixed Income Settings
exports.getFixedIncomes = async (req, res) => {
  try {
    const incomes = await FixedIncome.findAll({ where: { userId: req.user.id } });
    res.json({ success: true, data: incomes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addFixedIncome = async (req, res) => {
  try {
    const { source, amount } = req.body;
    const income = await FixedIncome.create({ userId: req.user.id, source, amount });
    res.status(201).json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateFixedIncome = async (req, res) => {
  try {
    const { source, amount } = req.body;
    const [updated] = await FixedIncome.update(
      { source, amount },
      { where: { id: req.params.id, userId: req.user.id } }
    );
    if (updated === 0) {
      return res.status(404).json({ success: false, error: 'Fixed income not found or unauthorized' });
    }
    res.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteFixedIncome = async (req, res) => {
  try {
    await FixedIncome.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Actual Income Transactions
exports.getIncome = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    const now = new Date();
    const qMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const income = await Transaction.findAll({
      where: { 
        userId: req.user.id, 
        expenseDate: { [Op.like]: `${qMonth}%` },
        type: 'INCOME'
      },
      order: [['expenseDate', 'DESC']]
    });
    res.json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addIncome = async (req, res) => {
  try {
    const { amount, description, date } = req.body;
    const income = await Transaction.create({
      userId: req.user.id,
      amount,
      name: description || 'Additional Income',
      expenseDate: date || new Date().toISOString().split('T')[0],
      type: 'INCOME'
    });
    res.json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.deleteIncome = async (req, res) => {
  try {
    await Transaction.destroy({ where: { id: req.params.id, userId: req.user.id, type: 'INCOME' } });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

