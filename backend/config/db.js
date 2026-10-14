const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/servicedesk_pro';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ [Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ [Database Error] ${error.message}`);
    console.error('   Make sure MongoDB is running: mongod --dbpath <your-data-path>');
    process.exit(1);
  }
};

module.exports = connectDB;
