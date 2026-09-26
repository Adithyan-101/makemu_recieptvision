const express = require('express');
const router = express.Router();
const { getDashboard, resetAccount } = require('../controllers/dashboardController');

router.get('/', getDashboard);
router.delete('/reset', resetAccount);

module.exports = router;
