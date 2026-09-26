const WasteRule = require('../models/WasteRule');
const memoryStore = require('../config/memoryStore');

const getAllRules = async (req, res, next) => {
  try {
    let rules;
    if (req.dbConnected) {
      rules = await WasteRule.find({});
    } else {
      rules = memoryStore.getWasteRules();
    }
    res.json(rules);
  } catch (error) {
    next(error);
  }
};

const getRuleByCategory = async (req, res, next) => {
  try {
    let rule;
    if (req.dbConnected) {
      rule = await WasteRule.findOne({ category: req.params.category });
    } else {
      rule = memoryStore.getWasteRuleByCategory(req.params.category);
    }
    if (!rule) {
      return res.status(404).json({ message: 'Waste rule not found' });
    }
    res.json(rule);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRules,
  getRuleByCategory
};
