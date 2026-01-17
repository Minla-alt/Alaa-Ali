# Railway Deployment Guide - Alaa-Ali Educational Platform

## نظرة عامة
هذا الدليل يوضح كيفية نشر منصة تعليمية ثنائية اللغة (عربي/إنجليزي) على Railway بشكل شامل.

## هيكل المشروع
```
/
├── backend/           # Node.js/Express Backend
├── frontend/          # React/Vite Frontend
└── railway.json       # Root Railway configuration
```

## المرحلة 1: التحضير النهائي

### 1.1 التحقق من الملفات الأساسية
- ✅ Backend package.json مع scripts مناسبة
- ✅ Backend server.js مع health check endpoint (/api/health)
- ✅ Backend Dockerfile و railway.json
- ✅ Frontend package.json مع build script
- ✅ Frontend vite.config.js محدث
- ✅ Frontend Dockerfile و railway.json
- ✅ Root railway.json للتكوين العام

### 1.2 متغيرات البيئة المطلوبة

#### Backend Environment Variables (Railway)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/educational_platform?retryWrites=true&w=majority
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-32-characters-minimum
OPENAI_API_KEY=sk-your-openai-api-key
CORS_ORIGIN=https://your-frontend-app.railway.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500
RECOMMENDATION_RATE_LIMIT_MS=3600000
SEED_CLEAR_DATA=false
PORT=3001 (سيتم تعيينه تلقائياً من Railway)
```

#### Frontend Environment Variables (Railway)
```
VITE_API_BASE_URL=https://your-backend-app.railway.app
NODE_ENV=production
```

## المرحلة 2: نشر Backend على Railway

### 2.1 إنشاء مشروع Railway جديد
1. اذهب إلى [railway.app](https://railway.app)
2. قم بتسجيل الدخول بحساب GitHub
3. انقر على "New Project"
4. اختر "Deploy from GitHub repo"

### 2.2 ربط المستودع
1. اختر مستودع GitHub الخاص بك
2. اختر الفرع: `release-railway-alaa-ali-full-deploy`

### 2.3 إضافة Backend Service
1. في Railway Dashboard، انقر على "New Service"
2. اختر "Backend" (Node.js)
3. Railway سيكتشف الـ package.json تلقائياً
4. تأكد من أن Root Directory فارغ أو `/` إذا كان في نفس المستودع

### 2.4 إعداد متغيرات البيئة للـ Backend
في Railway Dashboard → Backend Service → Variables:

```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/educational_platform?retryWrites=true&w=majority
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
OPENAI_API_KEY=sk-your-openai-api-key-here
CORS_ORIGIN=https://your-frontend-app.railway.app (سيتم تحديثه لاحقاً)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500
RECOMMENDATION_RATE_LIMIT_MS=3600000
SEED_CLEAR_DATA=false
```

### 2.5 بدء النشر
1. انقر على "Deploy"
2. انتظر حتى يكتمل النشر (5-10 دقائق)
3. احصل على Backend URL (مثل: `alaa-ali-backend.railway.app`)

### 2.6 اختبار Backend
```bash
curl https://your-backend-app.railway.app/api/health
curl https://your-backend-app.railway.app/api
```

## المرحلة 3: نشر Frontend على Railway

### 3.1 إضافة Frontend Service
1. في نفس مشروع Railway، انقر على "New Service"
2. اختر "Frontend" (React/Vite)
3. Railway سيكتشف React app تلقائياً

### 3.2 إعداد متغيرات البيئة للـ Frontend
```
VITE_API_BASE_URL=https://your-backend-app.railway.app (من الخطوة 2.5)
NODE_ENV=production
```

### 3.3 بدء نشر Frontend
1. انقر على "Deploy"
2. انتظر حتى يكتمل النشر
3. احصل على Frontend URL (مثل: `alaa-ali.railway.app`)

## المرحلة 4: ربط Backend و Frontend

### 4.1 تحديث CORS_ORIGIN في Backend
في Railway Dashboard → Backend Service → Variables:
```
CORS_ORIGIN=https://your-frontend-app.railway.app (من الخطوة 3.3)
```

### 4.2 إعادة تشغيل Backend
1. انقر على "Restart" في Backend service
2. انتظر حتى يكتمل إعادة التشغيل

## المرحلة 5: الاختبار الشامل

### 5.1 اختبار Backend Endpoints
```bash
# Health Check
curl https://your-backend-app.railway.app/api/health

# API Info
curl https://your-backend-app.railway.app/api

# Courses
curl https://your-backend-app.railway.app/api/courses

# Books
curl https://your-backend-app.railway.app/api/books

# Recommendations
curl https://your-backend-app.railway.app/api/recommendations/daily
```

### 5.2 اختبار Frontend
افتح الرابط: `https://your-frontend-app.railway.app`

اختبر:
- ✅ تحميل الصفحة الرئيسية
- ✅ التنقل بين الصفحات
- ✅ تبديل اللغة (عربي/إنجليزي)
- ✅ عرض الدورات والكتب
- ✅ Dashboard
- ✅ AI Recommendations
- ✅ حفظ المحتوى المفضل

## المرحلة 6: إعداد Auto-Deploy

### 6.1 تفعيل GitHub Integration
1. في Railway Dashboard، اذهب إلى Settings
2. فعّل "Deploy on Push" للفرع `release-railway-alaa-ali-full-deploy`
3. كل تحديث في هذا الفرع سيؤدي إلى نشر تلقائي

## استكشاف الأخطاء

### مشاكل شائعة وحلولها:

#### Backend لا يبدأ
- تحقق من متغيرات البيئة المطلوبة
- تحقق من MongoDB Atlas connection string
- راجع Logs في Railway Dashboard

#### Frontend لا يحمل البيانات
- تحقق من VITE_API_BASE_URL
- تحقق من CORS_ORIGIN في Backend
- تحقق من Console في المتصفح للأخطاء

#### مشاكل CORS
- تأكد من أن CORS_ORIGIN يحتوي على Frontend URL الصحيح
- تأكد من وجود `https://` في بداية الرابط

#### مشاكل OpenAI API
- تحقق من OPENAI_API_KEY
- تحقق من حدود الاستخدام في OpenAI Dashboard

## مراقبة التطبيق

### Railway Dashboard
- Metrics: CPU, Memory, Network usage
- Logs: Real-time application logs
- Deployments: تاريخ النشرات

### Database Monitoring
- راقب MongoDB Atlas dashboard
- تحقق من الاتصال والأداء
- راجع Database Metrics

## الأمان في الإنتاج

### متغيرات البيئة الحساسة
- لا تكشف MONGODB_URI أو JWT_SECRET
- استخدم Railway Environment Variables دائماً
- فعّل HTTPS دائماً (Railway يوفره تلقائياً)

### Rate Limiting
- Backend محدد بـ 500 طلب لكل 15 دقيقة
- Recommendations محدد بـ 1 طلب كل ساعة

## النسخ الاحتياطي والاستعادة

### Database Backup
- MongoDB Atlas يوفر نسخ احتياطية تلقائية
- يمكن تفعيل نسخ احتياطية يدوية إضافية

### Application Recovery
- Railway يدعم Rollback للنشرات السابقة
- استخدم Git tags للنسخ المستقرة

## الصيانة الدورية

### أسبوعياً
- راجع Railway Dashboard metrics
- تحقق من MongoDB Atlas usage
- راجع application logs للأخطاء

### شهرياً
- تحديث dependencies إذا لزم الأمر
- مراجعة أداء التطبيق
- تحسين الاستعلامات إذا لزم الأمر

## النتائج المتوقعة

بعد إكمال جميع المراحل:
- ✅ Backend منشور على: `https://your-backend-app.railway.app`
- ✅ Frontend منشور على: `https://your-frontend-app.railway.app`
- ✅ كلاهما متصل ويعمل بشكل صحيح
- ✅ جميع الميزات تعمل (i18n, AI, Dashboard, etc.)
- ✅ Auto-deploy مفعل للتحديثات المستقبلية
- ✅ Monitoring وlogging مفعل

---

**ملاحظة مهمة**: احفظ روابط النشر النهائية في مكان آمن لاستخدامها في المستقبل.