const UserWasteProfile = require('../models/UserWasteProfile');
const ReceiptScan = require('../models/ReceiptScan');
const memoryStore = require('../config/memoryStore');

const getDashboard = async (req, res, next) => {
  try {
    const userId = 'demo-user';
    let profile, recentScans;

    if (req.dbConnected) {
      profile = await UserWasteProfile.findOne({ userId });
      
      if (!profile) {
        profile = {
          userId,
          ecoScore: 0,
          totalScans: 0,
          wasteCounts: {
            Plastic: 0,
            'Paper/Cardboard': 0,
            Glass: 0,
            Metal: 0,
            Organic: 0,
            'Battery/Special Waste': 0,
            'E-waste': 0,
            Other: 0
          }
        };
      }

      recentScans = await ReceiptScan.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5);
    } else {
      profile = memoryStore.getProfile();
      recentScans = memoryStore.getScans().slice(0, 5);
    }

    const counts = profile.wasteCounts;
    const totalRecyclable = (counts.Plastic || 0) + (counts['Paper/Cardboard'] || 0) + (counts.Glass || 0) + (counts.Metal || 0);
    const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);

    res.json({
      ecoScore: profile.ecoScore,
      totalScans: profile.totalScans || 0,
      counts,
      recentScans,
      totalRecyclable,
      totalItems
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard
};
