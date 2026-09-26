/**
 * In-memory data store for demo mode (no MongoDB required).
 * Mimics Mongoose document structure so controllers can use the same interface.
 */

const { demoProducts, demoWasteSummary, demoReceiptText } = require('../services/demoData');

// In-memory storage
const store = {
  scans: [],
  profile: {
    userId: 'demo-user',
    ecoScore: 0,
    totalScans: 0,
    itemStates: {},
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
  },
  wasteRules: [
    { category: 'Plastic', disposalMethod: 'Recycling', instructions: ['Rinse containers before disposal', 'Remove caps and labels where possible', 'Flatten bottles to save space', 'Separate from organic waste'], warning: null, recyclable: true, locality: 'General' },
    { category: 'Paper/Cardboard', disposalMethod: 'Recycling', instructions: ['Keep dry and clean', 'Flatten cardboard boxes', 'Remove tape and staples', 'Bundle newspapers and magazines'], warning: 'Do not recycle soiled or food-contaminated paper', recyclable: true, locality: 'General' },
    { category: 'Glass', disposalMethod: 'Recycling', instructions: ['Rinse containers', 'Remove lids and caps', 'Do not break intentionally', 'Separate by color if required locally'], warning: 'Handle broken glass with care', recyclable: true, locality: 'General' },
    { category: 'Metal', disposalMethod: 'Recycling', instructions: ['Rinse food cans', 'Remove labels if possible', 'Flatten cans to save space'], warning: null, recyclable: true, locality: 'General' },
    { category: 'Organic', disposalMethod: 'Composting', instructions: ['Separate from non-biodegradable waste', 'Use composting if available', 'Keep in covered bins to prevent odor'], warning: null, recyclable: false, locality: 'General' },
    { category: 'Battery/Special Waste', disposalMethod: 'Special Collection', instructions: ['Never place in regular household waste', 'Store in a dry, cool place until disposal', 'Take to a designated battery collection point'], warning: 'Batteries contain hazardous materials. Improper disposal can contaminate soil and water.', recyclable: false, locality: 'General' },
    { category: 'E-waste', disposalMethod: 'Special Collection', instructions: ['Do not place in regular household waste', 'Take to a certified e-waste collection facility', 'Remove batteries before disposal if possible'], warning: 'E-waste contains hazardous materials. Handle with care.', recyclable: false, locality: 'General' },
    { category: 'Other', disposalMethod: 'General Waste', instructions: ['Place in general waste bin', 'Check local guidelines for specific items'], warning: null, recyclable: false, locality: 'General' }
  ],
  products: [
    { productName: 'Milk', category: 'Dairy', packaging: 'Plastic pouch', wasteCategory: 'Plastic', confidence: 0.92, aliases: ['amul milk', 'toned milk', 'full cream milk', 'doodh'] },
    { productName: 'Bottled Water', category: 'Beverages', packaging: 'PET bottle', wasteCategory: 'Plastic', confidence: 0.95, aliases: ['mineral water', 'aquafina', 'bisleri', 'kinley'] },
    { productName: 'Cereal', category: 'Breakfast', packaging: 'Cardboard box', wasteCategory: 'Paper/Cardboard', confidence: 0.90, aliases: ['corn flakes', 'chocos', 'oats', 'muesli', 'kelloggs'] },
    { productName: 'Bread', category: 'Bakery', packaging: 'Flexible plastic', wasteCategory: 'Plastic', confidence: 0.75, aliases: ['white bread', 'brown bread', 'multigrain bread', 'pav', 'bun'] },
    { productName: 'Vegetables', category: 'Fresh Produce', packaging: 'Thin plastic bag', wasteCategory: 'Organic', confidence: 0.70, aliases: ['onion', 'potato', 'tomato', 'carrot', 'cabbage', 'cauliflower', 'spinach', 'bhindi', 'sabzi'] },
    { productName: 'Battery', category: 'Electronics', packaging: 'Battery casing', wasteCategory: 'Battery/Special Waste', confidence: 0.98, aliases: ['aa battery', 'aaa battery', 'duracell', 'eveready', 'nippo', 'button cell'] },
    { productName: 'Biscuits / Cookies', category: 'Snacks', packaging: 'Plastic wrapper', wasteCategory: 'Plastic', confidence: 0.88, aliases: ['parle-g', 'parle g', 'marie gold', 'oreo', 'bourbon', 'good day', 'hide & seek'] },
    { productName: 'Shampoo', category: 'Personal Care', packaging: 'Plastic bottle', wasteCategory: 'Plastic', confidence: 0.92, aliases: ['head & shoulders', 'clinic plus', 'dove shampoo', 'pantene'] }
  ]
};

// Helper to generate simple IDs
let idCounter = Date.now();
const generateId = () => (++idCounter).toString(36);

// Add a scan to in-memory store
const addScan = (scanData) => {
  const scan = {
    _id: generateId(),
    ...scanData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  store.scans.unshift(scan); // newest first
  return scan;
};

// Get all scans
const getScans = () => store.scans;

// Get scan by ID
const getScanById = (id) => store.scans.find(s => s._id === id);

// Get/update profile
const getProfile = () => store.profile;

const updateProfile = (updates) => {
  Object.assign(store.profile, updates);
  return store.profile;
};

// Get waste rules
const getWasteRules = () => store.wasteRules;

const getWasteRuleByCategory = (category) => 
  store.wasteRules.find(r => r.category.toLowerCase() === category.toLowerCase());

// Get products (for search)
const searchProducts = (query) => {
  if (!query) return store.products;
  const q = query.toLowerCase();
  return store.products.filter(p => 
    p.productName.toLowerCase().includes(q) ||
    p.aliases.some(a => a.includes(q))
  );
};

// Match product name to database
const matchProductName = (name) => {
  const lower = name.toLowerCase();
  return store.products.find(p => 
    p.productName.toLowerCase() === lower ||
    p.aliases.some(a => a === lower) ||
    p.productName.toLowerCase().includes(lower) ||
    p.aliases.some(a => a.includes(lower)) ||
    lower.includes(p.productName.toLowerCase()) ||
    p.aliases.some(a => lower.includes(a))
  );
};

module.exports = {
  store,
  addScan,
  getScans,
  getScanById,
  getProfile,
  updateProfile,
  getWasteRules,
  getWasteRuleByCategory,
  searchProducts,
  matchProductName,
  getWasteStates: () => store.profile.itemStates,
  setWasteState: (key, state) => { store.profile.itemStates[key] = state; }
};
