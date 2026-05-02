const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const auth = require('../middleware/auth');

router.get('/', auth, incomeController.getIncome);
router.post('/', auth, incomeController.addIncome);
router.delete('/:id', auth, incomeController.deleteIncome);

module.exports = router;
