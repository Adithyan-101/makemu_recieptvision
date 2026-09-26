const ReceiptScan = require('../models/ReceiptScan');
const UserWasteProfile = require('../models/UserWasteProfile');
const aiService = require('../services/aiService');
const { demoReceiptText, demoProducts, demoWasteSummary, calculateDates } = require('../services/demoData');
const memoryStore = require('../config/memoryStore');

const analyzeReceipt = async (req, res, next) => {
  try {
    const userId = 'demo-user';
    // Only use demo data when explicitly requested via ?demo=true (the "Try Demo Receipt" button)
    // Real file uploads should always attempt AI analysis
    const isExplicitDemo = req.query.demo === 'true';
    let analysisResult;

    if (isExplicitDemo || !req.file) {
      // Demo button clicked or no file uploaded — use predefined data
      const freshDemoProducts = demoProducts.map(p => ({
        ...p,
        ...calculateDates(p.shelfLifeDays || 0)
      }));

      analysisResult = {
        extractedText: demoReceiptText,
        products: freshDemoProducts,
        predictedWaste: demoWasteSummary
      };
    } else {
      // Real image uploaded — use AI analysis (no silent demo fallback)
      analysisResult = await aiService.extractAndAnalyze(req.file.buffer, req.file.mimetype);
    }

    let savedScan;
    const purchaseDate = new Date();

    if (req.dbConnected) {
      // Use MongoDB
      const receiptScan = new ReceiptScan({
        userId,
        purchaseDate,
        extractedText: analysisResult.extractedText,
        products: analysisResult.products,
        predictedWaste: analysisResult.predictedWaste,
        totalItems: analysisResult.products.length
      });
      await receiptScan.save();
      savedScan = receiptScan;

      // Update user waste profile in DB
      let profile = await UserWasteProfile.findOne({ userId });
      if (!profile) {
        profile = new UserWasteProfile({ userId, ecoScore: 50 });
      }

      analysisResult.predictedWaste.categories.forEach(waste => {
        const key = waste.category;
        if (profile.wasteCounts[key] !== undefined) {
          profile.wasteCounts[key] += waste.count;
        } else {
          profile.wasteCounts.Other = (profile.wasteCounts.Other || 0) + waste.count;
        }
      });

      profile.totalScans = (profile.totalScans || 0) + 1;

      const recyclable = (profile.wasteCounts.Plastic || 0) +
        (profile.wasteCounts['Paper/Cardboard'] || 0) +
        (profile.wasteCounts.Glass || 0) +
        (profile.wasteCounts.Metal || 0);
      const specialHandled = (profile.wasteCounts['Battery/Special Waste'] || 0) +
        (profile.wasteCounts['E-waste'] || 0);

      const recyclableBonus = Math.min(30, recyclable);
      const specialBonus = Math.min(20, specialHandled * 3);
      profile.ecoScore = Math.min(100, 50 + recyclableBonus + specialBonus);

      profile.markModified('wasteCounts');
      await profile.save();
    } else {
      // Use in-memory store
      savedScan = memoryStore.addScan({
        userId,
        purchaseDate,
        extractedText: analysisResult.extractedText,
        products: analysisResult.products,
        predictedWaste: analysisResult.predictedWaste,
        totalItems: analysisResult.products.length
      });

      // Update in-memory profile
      const profile = memoryStore.getProfile();
      analysisResult.predictedWaste.categories.forEach(waste => {
        const key = waste.category;
        if (profile.wasteCounts[key] !== undefined) {
          profile.wasteCounts[key] += waste.count;
        } else {
          profile.wasteCounts.Other = (profile.wasteCounts.Other || 0) + waste.count;
        }
      });
      profile.totalScans = (profile.totalScans || 0) + 1;

      const recyclable = (profile.wasteCounts.Plastic || 0) +
        (profile.wasteCounts['Paper/Cardboard'] || 0) +
        (profile.wasteCounts.Glass || 0) +
        (profile.wasteCounts.Metal || 0);
      const specialHandled = (profile.wasteCounts['Battery/Special Waste'] || 0) +
        (profile.wasteCounts['E-waste'] || 0);

      const recyclableBonus = Math.min(30, recyclable);
      const specialBonus = Math.min(20, specialHandled * 3);
      profile.ecoScore = Math.min(100, 50 + recyclableBonus + specialBonus);

      memoryStore.updateProfile(profile);
    }

    res.status(201).json({ scan: savedScan });
  } catch (error) {
    next(error);
  }
};

const getReceipts = async (req, res, next) => {
  try {
    const userId = 'demo-user';
    let receipts;

    if (req.dbConnected) {
      receipts = await ReceiptScan.find({ userId }).sort({ createdAt: -1 });
    } else {
      receipts = memoryStore.getScans();
    }

    res.json(receipts);
  } catch (error) {
    next(error);
  }
};

const getReceiptById = async (req, res, next) => {
  try {
    let receipt;

    if (req.dbConnected) {
      receipt = await ReceiptScan.findById(req.params.id);
    } else {
      receipt = memoryStore.getScanById(req.params.id);
    }

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
