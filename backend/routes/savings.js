const express = require('express');
const router = express.Router();
const savingsController = require('../controllers/savingsController');
const auth = require('../middleware/auth');

router.get('/', auth, savingsController.getSavingsData);
router.post('/log', auth, savingsController.addSavingLog);
router.put('/log/:id', auth, savingsController.updateSavingLog);
router.delete('/log/:id', auth, savingsController.deleteSavingLog);
router.put('/goal/:id/complete', auth, savingsController.completeGoal);
router.put('/goal/:id/extend', auth, savingsController.extendGoal);

module.exports = router;
