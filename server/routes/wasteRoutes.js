const express = require('express');
const router = express.Router();
const { getAllRules, getRuleByCategory } = require('../controllers/wasteController');

router.get('/', getAllRules);
router.get('/:category', getRuleByCategory);

module.exports = router;
