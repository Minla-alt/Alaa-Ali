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

    console.log(`✅ MongoDB متصل بنجاح: ${conn.connection.host}`);
    console.log(`📊 قاعدة البيانات: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ خطأ في اتصال MongoDB:', err.message);
      console.error('💡 تحقق من اتصال الإنترنت أو Network Access في MongoDB Atlas');
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  تم قطع الاتصال مع MongoDB');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 تم إعادة الاتصال مع MongoDB بنجاح');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📴 تم إغلاق اتصال MongoDB بشكل آمن');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('\n❌ فشل الاتصال بقاعدة البيانات:', error.message);
    console.error('\n🔍 تشخيص الخطأ:');
    
    if (error.message.includes('MONGODB_URI is not defined')) {
      console.error('   • تأكد من وجود MONGODB_URI في ملف .env');
      console.error('   • انسخ من .env.example إلى .env');
      
    } else if (error.message.includes('Authentication failed') || error.message.includes('auth')) {
      console.error('   • خطأ في المصادقة - تحقق من اسم المستخدم وكلمة المرور');
      console.error('   • تأكد من صحة Connection String');
      console.error('   • راجع MongoDB Atlas > Database Access');
      
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      console.error('   • خطأ في الاتصال - تحقق من Network Access');
      console.error('   • تأكد من إضافة 0.0.0.0/0 في Network Access (للتطوير)');
      console.error('   • تأكد من أن Cluster يعمل وليس متوقف');
      
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('   • خطأ في اسم النطاق - تحقق من صحة اسم الـ cluster');
      console.error('   • تأكد من صيغة Connection String صحيحة');
      
    } else {
      console.error('   • راجع ملف .env للتأكد من MONGODB_URI صحيح');
      console.error('   • تحقق من MongoDB Atlas dashboard');
    }
    
    console.error('\n📖 للمساعدة:');
    console.error('   • MONGODB_SETUP.md - الدليل الشامل');
    console.error('   • MongoDB Atlas: https://cloud.mongodb.com');
    console.error('   • اختبار سريع: npm run test:db');
    
    process.exit(1);
  }
};

module.exports = connectDB;