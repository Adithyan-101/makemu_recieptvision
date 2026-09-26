const ReceiptScan = require('../models/ReceiptScan');
const UserWasteProfile = require('../models/UserWasteProfile');
const aiService = require('../services/aiService');
const { demoReceiptText, demoProducts, demoWasteSummary } = require('../services/demoData');

const analyzeReceipt = async (req, res, next) => {
  try {
    const userId = 'demo-user';
    const isDemo = req.query.demo === 'true' || process.env.DEMO_MODE === 'true';
    let analysisResult;

    if (isDemo || !req.file) {
      // Demo mode — use predefined data
      analysisResult = {
        extractedText: demoReceiptText,
        products: demoProducts,
        predictedWaste: demoWasteSummary
      };
    } else {
      // AI mode — use uploaded image
      analysisResult = await aiService.extractAndAnalyze(req.file.buffer, req.file.mimetype);
    }

    const receiptScan = new ReceiptScan({
      userId,
      extractedText: analysisResult.extractedText,
      products: analysisResult.products,
      predictedWaste: analysisResult.predictedWaste,
      totalItems: analysisResult.products.length
    });

    await receiptScan.save();

    // Update user waste profile
    let profile = await UserWasteProfile.findOne({ userId });
    if (!profile) {
      profile = new UserWasteProfile({ userId, ecoScore: 50 });
    }

    // Increment waste counts
    analysisResult.predictedWaste.forEach(waste => {
      const key = waste.category;
      if (profile.wasteCounts[key] !== undefined) {
        profile.wasteCounts[key] += waste.count;
      } else {
        profile.wasteCounts.Other = (profile.wasteCounts.Other || 0) + waste.count;
      }
    });

    // Increment total scans
    profile.totalScans = (profile.totalScans || 0) + 1;

    // Recalculate eco score (simple transparent formula)
    const recyclable = (profile.wasteCounts.Plastic || 0) +
      (profile.wasteCounts['Paper/Cardboard'] || 0) +
      (profile.wasteCounts.Glass || 0) +
      (profile.wasteCounts.Metal || 0);
    const total = Object.values(profile.wasteCounts).reduce((a, b) => a + b, 0);
    const specialHandled = (profile.wasteCounts['Battery/Special Waste'] || 0) +
      (profile.wasteCounts['E-waste'] || 0);

    // Score: base 50, +1 per recyclable item (max +30), +3 per special waste properly tracked (max +20)
    const recyclableBonus = Math.min(30, recyclable);
    const specialBonus = Math.min(20, specialHandled * 3);
    profile.ecoScore = Math.min(100, 50 + recyclableBonus + specialBonus);

    profile.markModified('wasteCounts');
    await profile.save();

    res.status(201).json({ scan: receiptScan });
  } catch (error) {
    next(error);
  }
};

const getReceipts = async (req, res, next) => {
  try {
    const userId = 'demo-user';
    const receipts = await ReceiptScan.find({ userId }).sort({ createdAt: -1 });
    res.json(receipts);
  } catch (error) {
    next(error);
  }
};

const getReceiptById = async (req, res, next) => {
  try {
    const receipt = await ReceiptScan.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    res.json(receipt);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeReceipt,
  getReceipts,
  getReceiptById
};
