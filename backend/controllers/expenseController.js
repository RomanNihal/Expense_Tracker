const { FixedExpense, Transaction } = require('../models');
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

exports.updateFixedExpense = async (req, res) => {
  try {
    const { name, amount, description } = req.body;
    const [updated] = await FixedExpense.update(
      { name, amount, description },
      { where: { id: req.params.id, userId: req.user.id } }
    );
    if (updated === 0) {
      return res.status(404).json({ success: false, error: 'Fixed expense not found or unauthorized' });
    }
    res.json({ success: true, message: 'Updated successfully' });

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

// Transactions (Previously Daily Expenses)
exports.getDailyExpenses = async (req, res) => {
  try {
    const { date, month, type } = req.query; // date in query can stay 'date' as a param name
    const where = { userId: req.user.id };
    
    if (date) {
      where.expenseDate = date;
    } else if (month) {
      where.expenseDate = { [Op.like]: `${month}%` };
    }

    if (type) {
      where.type = type;
    }

    const transactions = await Transaction.findAll({ 
      where, 
      order: [['expenseDate', 'DESC'], ['createdAt', 'DESC']] 
    });
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addDailyExpense = async (req, res) => {
  try {
    const { name, amount, expenseDate, type } = req.body;
    const transaction = await Transaction.create({ 
      userId: req.user.id, 
      name, 
      amount, 
      expenseDate: expenseDate || new Date().toISOString().split('T')[0],
      type: type || 'EXPENSE'
    });
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.deleteDailyExpense = async (req, res) => {
  try {
    await Transaction.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateDailyExpense = async (req, res) => {
  try {
    const { name, amount, expenseDate, type } = req.body;
    console.log(`Updating Transaction ID: ${req.params.id} for User: ${req.user.id}`);
    
    const [updated] = await Transaction.update(
      { name, amount, expenseDate, type },
      { where: { id: parseInt(req.params.id), userId: req.user.id } }
    );

    if (updated === 0) {
      console.log('No rows updated. Check if ID exists and belongs to user.');
      return res.status(404).json({ success: false, error: 'Transaction not found or unauthorized' });
    }
    
    res.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    console.error('Update Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};



