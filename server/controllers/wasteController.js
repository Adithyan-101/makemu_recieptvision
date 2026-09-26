const WasteRule = require('../models/WasteRule');

const getAllRules = async (req, res, next) => {
  try {
    const rules = await WasteRule.find({});
    res.json(rules);
  } catch (error) {
    next(error);
  }
};

const getRuleByCategory = async (req, res, next) => {
  try {
    const rule = await WasteRule.findOne({ category: req.params.category });
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
