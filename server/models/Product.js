const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  category: { type: String, required: true },
  packaging: { type: String, required: true },
  wasteCategory: { type: String, required: true },
  confidence: { type: Number, required: true },
  aliases: [{ type: String }]
}, { timestamps: true });

productSchema.index({ productName: 'text', aliases: 'text' });

module.exports = mongoose.model('Product', productSchema);
