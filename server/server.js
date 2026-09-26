const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
// Fix for Node 18+ native fetch issues on Windows (used by Gemini SDK)
// The native `fetch` uses undici which sometimes fails with IPv6.
try {
  const { setGlobalDispatcher, Agent } = require('undici');
  setGlobalDispatcher(new Agent({ connect: { lookup: dns.lookup } }));
} catch (e) {
  console.log('undici not available, proceeding with default fetch');
}

// Load environment variables from parent directory or current directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const connectDB = require('./config/db');
const seedData = require('./config/seed');

const receiptRoutes = require('./routes/receiptRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Track whether MongoDB is connected
let dbConnected = false;

// Connect to MongoDB and seed data (non-blocking)
(async () => {
  dbConnected = await connectDB();
  if (dbConnected) {
    await seedData();
  } else {
    console.log('📋 Using in-memory data store for demo mode');
  }
})();

// Make DB status available to routes
app.use((req, res, next) => {
  req.dbConnected = dbConnected;
  next();
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173']
}));
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Static folder
app.use('/uploads', express.static(uploadsDir));

// Mount routes
app.use('/api/receipts', receiptRoutes);
app.use('/api/waste-rules', wasteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
