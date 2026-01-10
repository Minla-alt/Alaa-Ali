const mongoose = require('mongoose');

/**
 * MongoDB Database Connection Utility
 * Handles connection to MongoDB Atlas with proper error handling
 */

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // These options are deprecated in Mongoose 6+ but included for compatibility
      // maxPoolSize: 10,
      // serverSelectionTimeoutMS: 5000,
      // socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📴 MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Please check your MongoDB Atlas connection string in .env file');
    console.error('💡 Make sure your IP address is whitelisted in MongoDB Atlas');
    process.exit(1);
  }
};

module.exports = connectDB;