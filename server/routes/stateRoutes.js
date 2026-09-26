const express = require('express');
const router = express.Router();
const { getStates, updateState } = require('../controllers/stateController');

router.get('/', getStates);
router.post('/', updateState);

module.exports = router;
