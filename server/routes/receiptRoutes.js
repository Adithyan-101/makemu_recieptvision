const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeReceipt, getReceipts, getReceiptById } = require('../controllers/receiptController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/analyze', upload.single('image'), analyzeReceipt);
router.get('/', getReceipts);
router.get('/:id', getReceiptById);

module.exports = router;
