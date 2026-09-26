const mongoose = require('mongoose');

const userWasteProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  ecoScore: { type: Number, default: 50 },
  totalScans: { type: Number, default: 0 },
  wasteCounts: {
    Plastic: { type: Number, default: 0 },
    'Paper/Cardboard': { type: Number, default: 0 },
    Glass: { type: Number, default: 0 },
    Metal: { type: Number, default: 0 },
    Organic: { type: Number, default: 0 },
    'Battery/Special Waste': { type: Number, default: 0 },
    'E-waste': { type: Number, default: 0 },
    Other: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('UserWasteProfile', userWasteProfileSchema);
