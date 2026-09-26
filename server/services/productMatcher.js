const Product = require('../models/Product');

const matchProducts = async (productNames) => {
  const matchedProducts = [];

  for (const name of productNames) {
    const lowercaseName = name.toLowerCase();
    
    // Try exact match on productName
    let product = await Product.findOne({ productName: { $regex: new RegExp(`^${name}$`, 'i') } });
    
    if (!product) {
      // Try match on aliases
      product = await Product.findOne({ aliases: { $regex: new RegExp(`^${name}$`, 'i') } });
    }

    if (!product) {
      // Try substring match on productName or aliases
      product = await Product.findOne({
        $or: [
          { productName: { $regex: new RegExp(name, 'i') } },
          { aliases: { $regex: new RegExp(name, 'i') } }
        ]
      });
    }

    if (product) {
      matchedProducts.push({
        name,
        packaging: product.packaging,
        wasteCategory: product.wasteCategory,
        confidence: product.confidence
      });
    } else {
      matchedProducts.push({
        name,
        packaging: 'Unknown',
        wasteCategory: 'Other',
        confidence: 0.3
      });
    }
  }

  return matchedProducts;
};

module.exports = { matchProducts };
