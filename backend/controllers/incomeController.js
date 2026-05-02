const { MonthlyIncome } = require('../models');
const { Op } = require('sequelize');

exports.getIncome = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    const now = new Date();
    const qMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const income = await MonthlyIncome.findAll({
      where: { 
        userId: req.user.id, 
        date: { [Op.like]: `${qMonth}%` } 
      },
      order: [['date', 'DESC']]
    });
    res.json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addIncome = async (req, res) => {
  try {
    const { amount, description, date } = req.body;
    const income = await MonthlyIncome.create({
      userId: req.user.id,
      amount,
      description: description || 'Additional Income',
      date: date || new Date().toISOString().split('T')[0]
    });
    res.json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    await MonthlyIncome.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
