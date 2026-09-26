const Product = require('../models/Product');

const searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const products = await Product.find({
      $or: [
        { productName: { $regex: new RegExp(q, 'i') } },
        { aliases: { $regex: new RegExp(q, 'i') } }
      ]
    }).limit(10);

    res.json(products);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchProducts
};
