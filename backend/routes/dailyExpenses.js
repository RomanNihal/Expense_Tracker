const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');

router.get('/', auth, expenseController.getDailyExpenses);
router.post('/', auth, expenseController.addDailyExpense);
router.delete('/:id', auth, expenseController.deleteDailyExpense);

module.exports = router;
