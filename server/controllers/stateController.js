const memoryStore = require('../config/memoryStore');
const UserWasteProfile = require('../models/UserWasteProfile');

exports.getStates = async (req, res, next) => {
  try {
    const userId = 'demo-user';
    if (req.dbConnected) {
      let profile = await UserWasteProfile.findOne({ userId });
      if (!profile) {
        profile = await UserWasteProfile.create({ userId });
      }
      const statesObj = profile.itemStates ? Object.fromEntries(profile.itemStates) : {};
      res.json(statesObj);
    } else {
      res.json(memoryStore.getWasteStates());
    }
  } catch (error) {
    next(error);
  }
};

exports.updateState = async (req, res, next) => {
  try {
    const userId = 'demo-user';
    const { key, state } = req.body;
    
    if (req.dbConnected) {
      let profile = await UserWasteProfile.findOne({ userId });
      if (!profile) {
        profile = await UserWasteProfile.create({ userId });
      }
      if (!profile.itemStates) profile.itemStates = new Map();
      profile.itemStates.set(key, state);
      await profile.save();
    } else {
      memoryStore.setWasteState(key, state);
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
