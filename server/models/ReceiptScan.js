const mongoose = require('mongoose');

const productItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  packaging: { type: String, required: true },
  wasteCategory: { type: String, required: true },
  confidence: { type: Number, required: true }
});

const receiptScanSchema = new mongoose.Schema({
  userId: { type: String, default: 'demo-user' },
  extractedText: { type: String },
  products: [productItemSchema],
  predictedWaste: [{
    category: { type: String, required: true },
    count: { type: Number, required: true }
  }],
  imageUrl: { type: String },
  totalItems: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ReceiptScan', receiptScanSchema);
