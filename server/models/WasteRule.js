const mongoose = require('mongoose');

const wasteRuleSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  disposalMethod: { type: String, required: true },
  instructions: [{ type: String }],
  warning: { type: String, default: null },
  recyclable: { type: Boolean, required: true },
  locality: { type: String, default: 'General' }
}, { timestamps: true });

module.exports = mongoose.model('WasteRule', wasteRuleSchema);
