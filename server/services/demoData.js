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

const calculateDates = (shelfLifeDays) => {
  const today = new Date();
  const expiryDate = new Date(today);
  expiryDate.setDate(today.getDate() + shelfLifeDays);
  return {
    shelfLifeDays,
    expiryDate,
    isEstimatedExpiry: true,
    daysRemaining: shelfLifeDays
  };
};

const demoProducts = [
  { name: 'AMUL MILK 1L', quantity: 1, packaging: 'Plastic pouch', wasteCategory: 'Plastic', confidence: 0.95, storageCondition: 'Refrigerated', wasteStreams: [{type: 'Plastic pouch', wasteCategory: 'Plastic', timing: 'immediate'}], ...calculateDates(5) },
  { name: 'PARLE-G BISCUITS', quantity: 1, packaging: 'Plastic wrapper', wasteCategory: 'Plastic', confidence: 0.92, storageCondition: 'Room Temperature', wasteStreams: [{type: 'Plastic wrapper', wasteCategory: 'Plastic', timing: 'immediate'}], ...calculateDates(180) },
  { name: 'BOTTLED WATER 500ML', quantity: 1, packaging: 'PET bottle', wasteCategory: 'Plastic', confidence: 0.98, storageCondition: 'Room Temperature', wasteStreams: [{type: 'PET bottle', wasteCategory: 'Plastic', timing: 'immediate'}], ...calculateDates(365) },
  { name: 'SHAMPOO 200ML', quantity: 1, packaging: 'Plastic bottle', wasteCategory: 'Plastic', confidence: 0.90, storageCondition: 'Room Temperature', wasteStreams: [{type: 'Plastic bottle', wasteCategory: 'Plastic', timing: 'immediate'}], ...calculateDates(730) },
  { name: 'CEREAL 500G', quantity: 1, packaging: 'Cardboard box', wasteCategory: 'Paper/Cardboard', confidence: 0.88, storageCondition: 'Cool & Dry', wasteStreams: [{type: 'Cardboard box', wasteCategory: 'Paper/Cardboard', timing: 'immediate'}, {type: 'Inner plastic bag', wasteCategory: 'Plastic', timing: 'on_consumption'}], ...calculateDates(120) },
  { name: 'VEGETABLES 1KG', quantity: 1, packaging: 'Thin plastic bag', wasteCategory: 'Organic', confidence: 0.75, storageCondition: 'Refrigerated', wasteStreams: [{type: 'Thin plastic bag', wasteCategory: 'Plastic', timing: 'immediate'}, {type: 'Vegetable scraps/peels', wasteCategory: 'Organic', timing: 'on_consumption'}], ...calculateDates(5) },
  { name: 'BATTERY AA x2', quantity: 1, packaging: 'Battery casing', wasteCategory: 'Battery/Special Waste', confidence: 0.99, storageCondition: 'Room Temperature', wasteStreams: [{type: 'Battery casing', wasteCategory: 'Battery/Special Waste', timing: 'on_expiry'}], ...calculateDates(3650) }
];

const demoWasteSummary = {
  categories: [
    { category: 'Plastic', count: 4 },
    { category: 'Paper/Cardboard', count: 1 },
    { category: 'Organic', count: 1 },
    { category: 'Battery/Special Waste', count: 1 }
  ],
  streams: [
    { productName: 'AMUL MILK 1L', type: 'Plastic pouch', wasteCategory: 'Plastic', timing: 'immediate' },
    { productName: 'PARLE-G BISCUITS', type: 'Plastic wrapper', wasteCategory: 'Plastic', timing: 'immediate' },
    { productName: 'BOTTLED WATER 500ML', type: 'PET bottle', wasteCategory: 'Plastic', timing: 'immediate' },
    { productName: 'SHAMPOO 200ML', type: 'Plastic bottle', wasteCategory: 'Plastic', timing: 'immediate' },
    { productName: 'CEREAL 500G', type: 'Cardboard box', wasteCategory: 'Paper/Cardboard', timing: 'immediate' },
    { productName: 'CEREAL 500G', type: 'Inner plastic bag', wasteCategory: 'Plastic', timing: 'on_consumption' },
    { productName: 'VEGETABLES 1KG', type: 'Thin plastic bag', wasteCategory: 'Plastic', timing: 'immediate' },
    { productName: 'VEGETABLES 1KG', type: 'Vegetable scraps/peels', wasteCategory: 'Organic', timing: 'on_consumption' },
    { productName: 'BATTERY AA x2', type: 'Battery casing', wasteCategory: 'Battery/Special Waste', timing: 'on_expiry' }
  ]
};

const demoFacilities = [
  { name: 'GreenCity Recycling Center', address: '45 Eco Way, Greenfield', type: 'General Recycling' },
  { name: 'Safe E-Waste Handlers', address: '12 Tech Park Blvd, Greenfield', type: 'E-Waste & Battery' },
  { name: 'Community Composting Hub', address: 'City Park South, Greenfield', type: 'Organic Waste' }
];

module.exports = {
  demoReceiptText,
  demoProducts,
  demoWasteSummary,
  demoFacilities,
  calculateDates
};
