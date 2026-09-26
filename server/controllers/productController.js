const Product = require('../models/Product');
const memoryStore = require('../config/memoryStore');

const searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    let products;
    if (req.dbConnected) {
      products = await Product.find({
        $or: [
          { productName: { $regex: new RegExp(q, 'i') } },
          { aliases: { $regex: new RegExp(q, 'i') } }
        ]
      }).limit(10);
    } else {
      products = memoryStore.searchProducts(q).slice(0, 10);
    }

    res.json(products);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchProducts
};
