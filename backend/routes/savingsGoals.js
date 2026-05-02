const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const auth = require('../middleware/auth');

router.get('/', auth, goalController.getGoals);
router.post('/', auth, goalController.addGoal);
router.delete('/:id', auth, goalController.deleteGoal);

module.exports = router;
