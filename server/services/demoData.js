const demoReceiptText = `
SUPERMART INC
123 Market Street
Date: 26/09/2026
-------------------------
AMUL MILK 1L
PARLE-G BISCUITS
BOTTLED WATER 500ML
SHAMPOO 200ML
CEREAL 500G
VEGETABLES 1KG
BATTERY AA x2
-------------------------
TOTAL $24.50
THANK YOU
`;

const demoProducts = [
  { name: 'AMUL MILK 1L', quantity: 1, packaging: 'Plastic pouch', wasteCategory: 'Plastic', confidence: 0.95 },
  { name: 'PARLE-G BISCUITS', quantity: 1, packaging: 'Plastic wrapper', wasteCategory: 'Plastic', confidence: 0.92 },
  { name: 'BOTTLED WATER 500ML', quantity: 1, packaging: 'PET bottle', wasteCategory: 'Plastic', confidence: 0.98 },
  { name: 'SHAMPOO 200ML', quantity: 1, packaging: 'Plastic bottle', wasteCategory: 'Plastic', confidence: 0.90 },
  { name: 'CEREAL 500G', quantity: 1, packaging: 'Cardboard box', wasteCategory: 'Paper/Cardboard', confidence: 0.88 },
  { name: 'VEGETABLES 1KG', quantity: 1, packaging: 'Thin plastic bag', wasteCategory: 'Organic', confidence: 0.75 },
  { name: 'BATTERY AA x2', quantity: 1, packaging: 'Battery casing', wasteCategory: 'Battery/Special Waste', confidence: 0.99 }
];

const demoWasteSummary = [
  { category: 'Plastic', count: 4 },
  { category: 'Paper/Cardboard', count: 1 },
  { category: 'Organic', count: 1 },
  { category: 'Battery/Special Waste', count: 1 }
];

const demoFacilities = [
  { name: 'GreenCity Recycling Center', address: '45 Eco Way, Greenfield', type: 'General Recycling' },
  { name: 'Safe E-Waste Handlers', address: '12 Tech Park Blvd, Greenfield', type: 'E-Waste & Battery' },
  { name: 'Community Composting Hub', address: 'City Park South, Greenfield', type: 'Organic Waste' }
];

module.exports = {
  demoReceiptText,
  demoProducts,
  demoWasteSummary,
  demoFacilities
};
