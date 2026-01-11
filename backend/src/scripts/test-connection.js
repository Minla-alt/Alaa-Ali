const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Test Database Connection Script
 * هذا السكريبت يختبر الاتصال بقاعدة البيانات MongoDB Atlas
 */

const testConnection = async () => {
  try {
    console.log('🔍 بدء اختبار الاتصال بقاعدة البيانات...\n');

    // التحقق من وجود MONGODB_URI
    if (!process.env.MONGODB_URI) {
      console.error('❌ خطأ: MONGODB_URI غير محدد في ملف .env');
      console.log('\n💡 الحلول:');
      console.log('   • تأكد من وجود ملف .env في مجلد backend');
      console.log('   • تأكد من وجود MONGODB_URI في الملف');
      console.log('   • راجع MONGODB_SETUP.md للتفاصيل');
      process.exit(1);
    }

    // إخفاء كلمة المرور لأغراض العرض
    const safeUri = process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':***@');
    console.log('🔗 الاتصال بـ:', safeUri);
    console.log('⏳ جاري الاتصال بقاعدة البيانات...\n');

    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ نجح الاتصال بقاعدة البيانات!');
    console.log('📊 معلومات قاعدة البيانات:');
    console.log('   • Host:', mongoose.connection.host);
    console.log('   • Port:', mongoose.connection.port);
    console.log('   • Database Name:', mongoose.connection.name);
    console.log('   • Ready State:', mongoose.connection.readyState, 
                '(${mongoose.connection.readyState === 1 ? "متصل" : "غير متصل"})');
    
    // اختبار بسيط - إنشاء اتصال ثم قطعه
    console.log('\n🧪 اختبار العملية الأساسية...');
    const adminCollection = mongoose.connection.db.admin();
    const result = await adminCollection.ping();
    
    if (result.ok === 1) {
      console.log('✅ اختبار Ping نجح - قاعدة البيانات تستجيب بشكل طبيعي');
    } else {
      console.log('⚠️  تحذير: اختبار Ping لم يُرجع النتيجة المتوقعة');
    }

    // عرض معلومات إضافية
    console.log('\n📋 معلومات إضافية:');
    const stats = await mongoose.connection.db.stats();
    console.log('   • Database Size:', (stats.dataSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('   • Collections:', stats.collections);
    console.log('   • Objects:', stats.objects);
    console.log('   • Average Object Size:', Math.round(stats.avgObjSize), 'bytes');

    console.log('\n🎉 تم اختبار الاتصال بنجاح!');
    console.log('\nالخطوات التالية:');
    console.log('   1. قم بتشغيل الخادم: npm run dev');
    console.log('   2. زرع البيانات التجريبية: npm run seed');
    console.log('   3. اختبر API: http://localhost:3001/api/health');

  } catch (error) {
    console.error('\n❌ فشل اختبار الاتصال:\n', error.message);
    
    // تحليل نوع الخطأ وتقديم حلول
    console.log('\n🔍 تشخيص الخطأ:');
    
    if (error.message.includes('Authentication failed') || error.message.includes('auth')) {
      console.log('   🔐 خطأ في المصادقة:');
      console.log('   • تحقق من اسم المستخدم وكلمة المرور في MONGODB_URI');
      console.log('   • تأكد من صحة Connection String');
      console.log('   • راجع MongoDB Atlas > Database Access');
      console.log('   • تأكد من أن المستخدم له صلاحيات القراءة والكتابة');
      
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      console.log('   🌐 خطأ في الاتصال:');
      console.log('   • تأكد من وجود اتصال إنترنت');
      console.log('   • تحقق من Network Access في MongoDB Atlas');
      console.log('   • تأكد من أن Cluster يعمل وليس متوقف');
      console.log('   • جرب إضافة 0.0.0.0/0 في Network Access للتطوير');
      
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('   🏷️  خطأ في اسم النطاق:');
      console.log('   • تحقق من صحة اسم الـ cluster في MONGODB_URI');
      console.log('   • تأكد من صيغة Connection String صحيحة');
      console.log('   • تأكد من أن_cluster موجود في MongoDB Atlas');
      
    } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      console.log('   ⏱️  خطأ في المهلة الزمنية:');
      console.log('   • تحقق من Network Access في MongoDB Atlas');
      console.log('   • تأكد من أن Cluster يعمل');
      console.log('   • جرب الاتصال مرة أخرى بعد دقيقة');
      
    } else {
      console.log('   ❓ خطأ غير معروف:');
      console.log('   • راجع MongoDB Atlas dashboard');
      console.log('   • تأكد من صحة MONGODB_URI');
      console.log('   • راجع .env file للتأكد من عدم وجود أخطاء إملائية');
    }
    
    console.log('\n📖 للمزيد من المساعدة:');
    console.log('   • MONGODB_SETUP.md - الدليل الشامل');
    console.log('   • MongoDB Atlas: https://cloud.mongodb.com');
    console.log('   • MongoDB Docs: https://docs.mongodb.com/');
    
  } finally {
    // إغلاق الاتصال
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 تم قطع الاتصال بأمان');
    }
    process.exit(0);
  }
};

// تشغيل الاختبار
testConnection();