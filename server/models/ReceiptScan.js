const mongoose = require('mongoose');

const productItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  packaging: { type: String, required: true },
  wasteCategory: { type: String, required: true },
  confidence: { type: Number, required: true },
  shelfLifeDays: { type: Number },
  storageCondition: { type: String },
  expiryDate: { type: Date },
  isEstimatedExpiry: { type: Boolean, default: true },
  daysRemaining: { type: Number },
  wasteStreams: [{
    type: { type: String },
    wasteCategory: { type: String },
    timing: { type: String, enum: ['immediate', 'on_consumption', 'on_expiry'] }
  }]
});

const receiptScanSchema = new mongoose.Schema({
  userId: { type: String, default: 'demo-user' },
  purchaseDate: { type: Date, default: Date.now },
  extractedText: { type: String },
  products: [productItemSchema],
  predictedWaste: {
    categories: [{
      category: { type: String, required: true },
      count: { type: Number, required: true }
    }],
    streams: [{
      productName: { type: String },
      type: { type: String },
      wasteCategory: { type: String },
      timing: { type: String, enum: ['immediate', 'on_consumption', 'on_expiry'] }
    }]
  },
  imageUrl: { type: String },
  totalItems: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ReceiptScan', receiptScanSchema);
