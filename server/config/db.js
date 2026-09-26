const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  
  // If no URI or placeholder URI, skip MongoDB connection
  if (!uri || uri.includes('<user>') || uri.includes('<pass>')) {
    console.log('⚡ No MongoDB URI configured — using in-memory data store');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  Could not connect to MongoDB: ${error.message}`);
    console.log('⚡ Falling back to in-memory demo mode');
    return false;
  }
};

module.exports = connectDB;
