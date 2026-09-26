const mongoose = require('mongoose');
const Product = require('../models/Product');
const WasteRule = require('../models/WasteRule');

const products = [
  { productName: 'Milk', category: 'Dairy', packaging: 'Plastic pouch', wasteCategory: 'Plastic', confidence: 0.92, aliases: ['amul milk', 'toned milk', 'full cream milk', 'doodh'] },
  { productName: 'Bottled Water', category: 'Beverages', packaging: 'PET bottle', wasteCategory: 'Plastic', confidence: 0.95, aliases: ['mineral water', 'aquafina', 'bisleri', 'kinley'] },
  { productName: 'Cereal', category: 'Breakfast', packaging: 'Cardboard box', wasteCategory: 'Paper/Cardboard', confidence: 0.90, aliases: ['corn flakes', 'chocos', 'oats', 'muesli', 'kelloggs'] },
  { productName: 'Bread', category: 'Bakery', packaging: 'Flexible plastic', wasteCategory: 'Plastic', confidence: 0.75, aliases: ['white bread', 'brown bread', 'multigrain bread', 'pav', 'bun'] },
  { productName: 'Jam', category: 'Condiments', packaging: 'Glass jar', wasteCategory: 'Glass', confidence: 0.93, aliases: ['mixed fruit jam', 'kissan jam', 'fruit spread', 'marmalade'] },
  { productName: 'Rice', category: 'Grains', packaging: 'Plastic bag', wasteCategory: 'Plastic', confidence: 0.85, aliases: ['basmati rice', 'sona masoori', 'brown rice', 'chawal'] },
  { productName: 'Cooking Oil', category: 'Cooking', packaging: 'Plastic bottle', wasteCategory: 'Plastic', confidence: 0.90, aliases: ['sunflower oil', 'mustard oil', 'olive oil', 'fortune', 'saffola'] },
  { productName: 'Biscuits / Cookies', category: 'Snacks', packaging: 'Plastic wrapper', wasteCategory: 'Plastic', confidence: 0.88, aliases: ['parle-g', 'parle g', 'marie gold', 'oreo', 'bourbon', 'good day', 'hide & seek'] },
  { productName: 'Chips', category: 'Snacks', packaging: 'Foil-lined plastic', wasteCategory: 'Plastic', confidence: 0.85, aliases: ['lays', 'kurkure', 'bingo', 'doritos', 'potato chips', 'wafers'] },
  { productName: 'Shampoo', category: 'Personal Care', packaging: 'Plastic bottle', wasteCategory: 'Plastic', confidence: 0.92, aliases: ['head & shoulders', 'clinic plus', 'dove shampoo', 'pantene', 'sunsilk', 'loreal'] },
  { productName: 'Soap', category: 'Personal Care', packaging: 'Paper box', wasteCategory: 'Paper/Cardboard', confidence: 0.80, aliases: ['lux', 'lifebuoy', 'dettol', 'pears', 'santoor', 'bathing bar'] },
  { productName: 'Eggs', category: 'Dairy', packaging: 'Cardboard/Plastic tray', wasteCategory: 'Paper/Cardboard', confidence: 0.82, aliases: ['chicken eggs', 'brown eggs', 'white eggs', 'anda'] },
  { productName: 'Juice', category: 'Beverages', packaging: 'Tetra Pak', wasteCategory: 'Paper/Cardboard', confidence: 0.88, aliases: ['real juice', 'tropicana', 'paperboat', 'b natural', 'mixed fruit juice', 'apple juice'] },
  { productName: 'Soda / Cola', category: 'Beverages', packaging: 'Aluminum can', wasteCategory: 'Metal', confidence: 0.94, aliases: ['coca cola', 'coke', 'pepsi', 'sprite', 'thums up', 'mirinda', 'fanta'] },
  { productName: 'Yogurt', category: 'Dairy', packaging: 'Plastic cup', wasteCategory: 'Plastic', confidence: 0.90, aliases: ['curd', 'dahi', 'epigamia', 'nestle dahi', 'mother dairy curd'] },
  { productName: 'Pasta', category: 'Grains', packaging: 'Cardboard box', wasteCategory: 'Paper/Cardboard', confidence: 0.87, aliases: ['macaroni', 'penne', 'spaghetti', 'fusilli', 'bambino'] },
  { productName: 'Tomato Sauce / Ketchup', category: 'Condiments', packaging: 'Plastic squeeze bottle', wasteCategory: 'Plastic', confidence: 0.85, aliases: ['maggi ketchup', 'kissan tomato ketchup', 'tomato sauce'] },
  { productName: 'Coffee', category: 'Beverages', packaging: 'Foil-lined bag', wasteCategory: 'Plastic', confidence: 0.78, aliases: ['nescafe', 'bru', 'filter coffee', 'instant coffee', 'coffee powder'] },
  { productName: 'Tea', category: 'Beverages', packaging: 'Paper box with foil sachets', wasteCategory: 'Paper/Cardboard', confidence: 0.80, aliases: ['tata tea', 'red label', 'taj mahal', 'green tea', 'lipton', 'chai'] },
  { productName: 'Detergent', category: 'Household', packaging: 'Plastic container', wasteCategory: 'Plastic', confidence: 0.91, aliases: ['surf excel', 'tide', 'ariel', 'rin', 'wheel', 'washing powder'] },
  { productName: 'Battery', category: 'Electronics', packaging: 'Battery casing', wasteCategory: 'Battery/Special Waste', confidence: 0.98, aliases: ['aa battery', 'aaa battery', 'duracell', 'eveready', 'nippo', 'button cell'] },
  { productName: 'Light Bulb', category: 'Household', packaging: 'Glass/Plastic', wasteCategory: 'E-waste', confidence: 0.85, aliases: ['led bulb', 'cfl', 'philips led', 'syska', 'tube light', 'incandescent bulb'] },
  { productName: 'Vegetables', category: 'Fresh Produce', packaging: 'Thin plastic bag', wasteCategory: 'Organic', confidence: 0.70, aliases: ['onion', 'potato', 'tomato', 'carrot', 'cabbage', 'cauliflower', 'spinach', 'bhindi', 'sabzi'] },
  { productName: 'Fruits', category: 'Fresh Produce', packaging: 'Thin plastic bag/none', wasteCategory: 'Organic', confidence: 0.65, aliases: ['apple', 'banana', 'orange', 'mango', 'grapes', 'papaya', 'watermelon', 'fal'] },
  { productName: 'Canned Food', category: 'Canned Goods', packaging: 'Metal can', wasteCategory: 'Metal', confidence: 0.93, aliases: ['baked beans', 'canned corn', 'canned tuna', 'canned tomatoes', 'tin food'] }
];

const wasteRules = [
  { category: 'Plastic', disposalMethod: 'Recycling', instructions: ['Rinse containers before disposal', 'Remove caps and labels where possible', 'Flatten bottles to save space', 'Separate from organic waste'], warning: null, recyclable: true, locality: 'General' },
  { category: 'Paper/Cardboard', disposalMethod: 'Recycling', instructions: ['Keep dry and clean', 'Flatten cardboard boxes', 'Remove tape and staples', 'Bundle newspapers and magazines'], warning: 'Do not recycle soiled or food-contaminated paper', recyclable: true, locality: 'General' },
  { category: 'Glass', disposalMethod: 'Recycling', instructions: ['Rinse containers', 'Remove lids and caps', 'Do not break intentionally', 'Separate by color if required locally'], warning: 'Handle broken glass with care', recyclable: true, locality: 'General' },
  { category: 'Metal', disposalMethod: 'Recycling', instructions: ['Rinse food cans', 'Remove labels if possible', 'Flatten cans to save space'], warning: null, recyclable: true, locality: 'General' },
  { category: 'Organic', disposalMethod: 'Composting', instructions: ['Separate from non-biodegradable waste', 'Use composting if available', 'Keep in covered bins to prevent odor'], warning: null, recyclable: false, locality: 'General' },
  { category: 'Battery/Special Waste', disposalMethod: 'Special Collection', instructions: ['Never place in regular household waste', 'Store in a dry, cool place until disposal', 'Take to a designated battery collection point'], warning: 'Batteries contain hazardous materials. Improper disposal can contaminate soil and water.', recyclable: false, locality: 'General' },
  { category: 'E-waste', disposalMethod: 'Special Collection', instructions: ['Do not place in regular household waste', 'Take to a certified e-waste collection facility', 'Remove batteries before disposal if possible'], warning: 'E-waste contains hazardous materials. Handle with care.', recyclable: false, locality: 'General' },
  { category: 'Other', disposalMethod: 'General Waste', instructions: ['Place in general waste bin', 'Check local guidelines for specific items'], warning: null, recyclable: false, locality: 'General' }
];

const seedData = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(products);
      console.log('Seeded Products successfully');
    }

    const ruleCount = await WasteRule.countDocuments();
    if (ruleCount === 0) {
      await WasteRule.insertMany(wasteRules);
      console.log('Seeded Waste Rules successfully');
    }
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
  }
};

module.exports = seedData;
