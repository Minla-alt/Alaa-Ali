require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const connectDB = require('./utils/db');

// Import models to ensure they are registered with Mongoose
require('./models/User');
require('./models/Course');
require('./models/Book');
require('./models/Progress');
require('./models/StudyTodo');
require('./models/SavedContent');
require('./models/Recommendation');
require('./models/RecommendationFeedback');

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * Security Middleware
 */
app.use(helmet());

/**
 * Rate Limiting
 */
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 500 : 100), 
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks in production
  skip: (req) => process.env.NODE_ENV === 'production' && req.path === '/api/health'
});

app.use('/api/', limiter);

/**
 * CORS Configuration
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [])
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-info']
};

app.use(cors(corsOptions));

/**
 * Body Parsing Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request Logging Middleware
 */
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  }
  next();
});

/**
 * Health Check Endpoint
 */
app.get('/api/health', (req, res) => {
  const dbStates = {
    0: 'منقطع',
    1: 'متصل',
    2: 'جاري الاتصال',
    3: 'جاري قطع الاتصال'
  };
  
  const healthData = {
    status: 'OK',
    message: 'منصة تعليمية ثنائية اللغة - API يعمل بشكل طبيعي',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    server: {
      port: PORT,
      nodeVersion: process.version,
      platform: process.platform
    },
    database: {
      status: dbStates[mongoose.connection.readyState] || 'غير معروف',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || 'غير محدد',
      name: mongoose.connection.name || 'غير محدد'
    },
    endpoints: {
      apiInfo: `/api`,
      courses: `/api/courses`,
      books: `/api/books`,
      auth: `/api/auth`
    },
    help: {
      documentation: 'MONGODB_SETUP.md',
      community: 'https://community.mongodb.com/',
      atlas: 'https://cloud.mongodb.com'
    }
  };
  
  res.status(200).json(healthData);
});

/**
 * API Routes
 */
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const booksRoutes = require('./routes/books');
const dashboardRoutes = require('./routes/dashboard');
const recommendationsRoutes = require('./routes/recommendations');

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Mount courses routes
app.use('/api/courses', coursesRoutes);

// Mount books routes
app.use('/api/books', booksRoutes);

// Mount dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// Mount recommendations routes
app.use('/api/recommendations', recommendationsRoutes);

// Basic API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Bilingual Educational Platform API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: '/api/health',
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me'
      },
      courses: {
        list: 'GET /api/courses',
        get: 'GET /api/courses/:id',
        save: 'POST /api/courses/:id/save',
        unsave: 'DELETE /api/courses/:id/save',
        saved: 'GET /api/courses/user/saved'
      },
      books: {
        list: 'GET /api/books',
        get: 'GET /api/books/:id',
        save: 'POST /api/books/:id/save',
        unsave: 'DELETE /api/books/:id/save',
        saved: 'GET /api/books/user/saved'
      },
      dashboard: {
        stats: 'GET /api/dashboard/stats',
        progress: 'GET /api/dashboard/progress',
        savedContent: 'GET /api/dashboard/saved-content',
        todos: {
          list: 'GET /api/dashboard/todos',
          create: 'POST /api/dashboard/todos',
          update: 'PATCH /api/dashboard/todos/:todoId',
          delete: 'DELETE /api/dashboard/todos/:todoId'
        },
        updateProgress: 'PATCH /api/dashboard/progress/:contentId'
      },
      recommendations: {
        daily: 'GET /api/recommendations/daily',
        feedback: 'POST /api/recommendations/feedback'
      }
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
    availableEndpoints: [
      'GET /api',
      'GET /health',
      'GET /api/auth/me',
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET /api/courses',
      'GET /api/courses/:id',
      'POST /api/courses/:id/save',
      'DELETE /api/courses/:id/save',
      'GET /api/courses/user/saved',
      'GET /api/books',
      'GET /api/books/:id',
      'POST /api/books/:id/save',
      'DELETE /api/books/:id/save',
      'GET /api/books/user/saved',
      'GET /api/dashboard/stats',
      'GET /api/dashboard/progress',
      'GET /api/dashboard/saved-content',
      'GET /api/dashboard/todos',
      'POST /api/dashboard/todos',
      'PATCH /api/dashboard/todos/:todoId',
      'DELETE /api/dashboard/todos/:todoId',
      'PATCH /api/dashboard/progress/:contentId',
      'GET /api/recommendations/daily',
      'POST /api/recommendations/feedback'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  // Skip logging in test environment
  if (process.env.NODE_ENV !== 'test') {
    console.error('Global error handler:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : 'Stack trace hidden in production',
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    });
  }
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    return res.status(400).json({
      error: 'Validation Error',
      details: errors
    });
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({
      error: 'Duplicate Error',
      message: `${field} already exists`
    });
  }
  
  // MongoDB connection error
  if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
    return res.status(503).json({
      error: 'Database Connection Error',
      message: 'Unable to connect to MongoDB database'
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Token expired'
    });
  }
  
  // CORS errors
  if (error.message && error.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Cross-origin requests are not allowed'
    });
  }
  
  // Default error
  const status = error.status || error.statusCode || 500;
  res.status(status).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

/**
 * Start Server Function
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    console.log('💡 Tip: Make sure your MONGODB_URI is set in .env file');
    
    await connectDB();
    console.log('✅ Database connected successfully');
    console.log('🎉 Ready to serve requests!');
    
    // Start Express server
    const server = app.listen(PORT, () => {
      const isProduction = process.env.NODE_ENV === 'production';
      const baseUrl = isProduction && process.env.RAILWAY_PUBLIC_DOMAIN 
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : `http://localhost:${PORT}`;
      
      console.log('\n🚀 ' + '='.repeat(50));
      console.log(`   الخادم يعمل على المنفذ ${PORT}`);
      console.log(`   البيئة: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   🌐 API Base URL: ${baseUrl}`);
      console.log(`   🏥 فحص الحالة: ${baseUrl}/api/health`);
      console.log(`   📊 معلومات API: ${baseUrl}/api`);
      console.log(`   🚀 قائمة الدورات: ${baseUrl}/api/courses`);
      console.log(`   📚 قائمة الكتب: ${baseUrl}/api/books`);
      console.log('🚀 ' + '='.repeat(50));
      
      if (isProduction) {
        console.log('\n🌟 التطبيق منشور في بيئة الإنتاج');
        console.log(`   • تم النشر على: ${baseUrl}`);
        console.log('   • راقب الأداء في Railway Dashboard');
      } else {
        console.log('\n📚 للاستخدام في التطوير:');
        console.log('   • قم بإعداد MongoDB Atlas أولاً (راجع MONGODB_SETUP.md)');
        console.log('   • تأكد من ملف .env يحتوي على MONGODB_URI صحيح');
        console.log('   • لزرع البيانات: npm run seed');
        console.log(`   • لفحص قاعدة البيانات: ${baseUrl}/api/health`);
      }
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n📴 تم استلام إشارة الإغلاق الآمن للخادم...');
      server.close(() => {
        console.log('💫 تم إنهاء العملية بنجاح');
      });
    });
    
  } catch (error) {
    console.error('\n❌ فشل في بدء تشغيل الخادم:', error.message);
    console.error('\n🔧 حلول مقترحة:');
    
    if (error.message.includes('Authentication failed') || error.message.includes('invalid')) {
      console.error('   • تحقق من اسم المستخدم وكلمة المرور في MONGODB_URI');
      console.error('   • تأكد من صحة Connection String');
      console.error('   • راجع MongoDB Atlas > Database Access');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      console.error('   • تأكد من وجود اتصال إنترنت');
      console.error('   • تحقق من Network Access في MongoDB Atlas (يجب أن يسمح بـ 0.0.0.0/0)');
      console.error('   • تأكد من أن Cluster يعمل وليس متوقف');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('   • تحقق من صحة اسم الـ cluster في MONGODB_URI');
      console.error('   • تأكد من صيغة Connection String صحيحة');
    } else {
      console.error('   • راجع ملف .env للتأكد من MONGODB_URI صحيح');
      console.error('   • راجع MONGODB_SETUP.md للتفاصيل');
      console.error('   • تحقق من MongoDB Atlas dashboard');
    }
    
    console.error('\n📖 للمزيد من المساعدة، راجع:');
    console.error('   • MONGODB_SETUP.md - الدليل الشامل');
    console.error('   • MongoDB Atlas: https://cloud.mongodb.com');
    console.error('   • MongoDB Docs: https://docs.mongodb.com/');
    
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n❌ خطأ غير محصور (Uncaught Exception):', error.message);
  console.error('\n🔍 تفاصيل الخطأ:');
  console.error('   • Message:', error.message);
  console.error('   • Stack:', error.stack);
  console.error('\n💡 حلول مقترحة:');
  console.error('   • تحقق من ملف .env و MONGODB_URI');
  console.error('   • تأكد من الاتصال بقاعدة البيانات');
  console.error('   • راجع MongoDB Atlas dashboard');
  console.error('\n📖 للمساعدة: MONGODB_SETUP.md');
  
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ رفض غير معالج (Unhandled Rejection):');
  console.error('   • Promise:', promise);
  console.error('   • Reason:', reason);
  console.error('\n💡 هذا قد يكون خطأ في الاتصال بقاعدة البيانات');
  console.error('   • تحقق من MONGODB_URI في ملف .env');
  console.error('   • تأكد من Network Access في MongoDB Atlas');
  console.error('\n📖 للمساعدة: MONGODB_SETUP.md');
  
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;