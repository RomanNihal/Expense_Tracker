const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');

router.get('/', auth, expenseController.getFixedExpenses);
router.post('/', auth, expenseController.addFixedExpense);
router.put('/:id', auth, expenseController.updateFixedExpense);
router.delete('/:id', auth, expenseController.deleteFixedExpense);

module.exports = router;

