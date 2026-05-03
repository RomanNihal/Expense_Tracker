const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const auth = require('../middleware/auth');

router.get('/', auth, incomeController.getIncome);
router.post('/', auth, incomeController.addIncome);
router.delete('/:id', auth, incomeController.deleteIncome);

// Fixed Income Settings
router.get('/fixed', auth, incomeController.getFixedIncomes);
router.post('/fixed', auth, incomeController.addFixedIncome);
router.put('/fixed/:id', auth, incomeController.updateFixedIncome);
router.delete('/fixed/:id', auth, incomeController.deleteFixedIncome);

module.exports = router;

