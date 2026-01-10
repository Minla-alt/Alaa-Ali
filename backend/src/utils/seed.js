require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./db');

// Register models (for future seeding logic)
require('../models/User');
require('../models/Course');
require('../models/Book');
require('../models/Progress');
require('../models/StudyTodo');
require('../models/SavedContent');

const seed = async () => {
  await connectDB();

  console.log('🌱 Seed script is set up and ready.');
  console.log('ℹ️  No seed data is inserted yet (will be implemented in Task 3).');

  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
};

seed().catch((error) => {
  console.error('❌ Seed script failed:', error);
  process.exit(1);
});
