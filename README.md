# 🎓 منصة Alaa-Ali التعليمية ثنائية اللغة

منصة تعليمية متكاملة تدعم اللغة العربية والإنجليزية مع ميزات التعلم الذكي والتوصيات المخصصة.

## ✨ الميزات الرئيسية

- **🌐 ثنائي اللغة**: دعم كامل للعربية والإنجليزية مع تخطيط RTL/LTR
- **📚 إدارة المحتوى**: تصفح وحفظ الكورسات والكتب التعليمية
- **🎯 التوصيات الذكية**: نظام توصيات مخصص باستخدام OpenAI
- **📊 لوحة التحكم**: تتبع التقدم والمهام والإحصائيات
- **🔐 نظام المصادقة**: تسجيل آمن مع JWT tokens
- **📱 تصميم متجاوب**: يعمل على جميع الأجهزة

## 🛠️ التقنيات المستخدمة

### Backend
- **Node.js** + **Express.js** - API Server
- **MongoDB** + **Mongoose** - قاعدة البيانات
- **JWT** - المصادقة والتفويض
- **OpenAI API** - التوصيات الذكية
- **Helmet** + **CORS** - الأمان

### Frontend
- **React 18** + **Vite** - واجهة المستخدم
- **React Router** - التنقل
- **i18next** - الترجمة والدولية
- **Axios** - طلبات API
- **Tailwind CSS** - التصميم

## 🚀 البدء السريع

### متطلبات النظام
- Node.js 16+ 
- MongoDB 7.0+
- npm أو yarn

### تثبيت وإعداد المشروع

```bash
# استنساخ المشروع
git clone <repository-url>
cd alaa-ali-educational-platform

# تثبيت Backend dependencies
cd backend
npm install

# تثبيت Frontend dependencies  
cd ../frontend
npm install
```

### إعداد متغيرات البيئة

#### Backend (.env)
```bash
# انسخ الملف الأساسي
cd backend
cp .env.example .env

# تحديث المتغيرات - راجع MONGODB_SETUP.md للحصول على MONGODB_URI
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/educational_platform?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-must-be-32-characters-minimum-change-in-production
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```bash
# إنشاء ملف البيئة
cd frontend
echo "VITE_API_BASE_URL=http://localhost:3001" > .env.local
```

### تشغيل المشروع

#### الخطوة 1: إعداد MongoDB Atlas
أولاً، قم بإعداد MongoDB Atlas اتباعاً للدليل الشامل:
📖 **[MONGODB_SETUP.md](MONGODB_SETUP.md)** - دليل إعداد MongoDB Atlas خطوة بخطوة

```bash
# أو استخدم الأداة المساعدة للاختبار السريع
cd backend
npm run test:db  # اختبار الاتصال بقاعدة البيانات
```

#### الخطوة 2: زرع البيانات التجريبية (اختياري)
```bash
cd backend
npm run seed  # إضافة دورات وكتب تجريبية
```

#### الخطوة 3: تشغيل Backend
```bash
cd backend
npm run dev
# أو للإنتاج:
npm start
```

#### الخطوة 4: تشغيل Frontend
```bash
cd frontend
npm run dev
```

### الوصول للمنصة
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **API Documentation**: http://localhost:3001/api

### إعداد سريع مع نص واحد (Quick Setup)
```bash
cd backend
npm run setup  # تثبيت + اختبار + زرع البيانات
npm run dev    # تشغيل الخادم
```

## 📋 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل دخول
- `POST /api/auth/logout` - تسجيل خروج
- `GET /api/auth/me` - معلومات المستخدم الحالي

### Content Endpoints
- `GET /api/courses` - قائمة الكورسات (مع فلترة وبحث)
- `GET /api/courses/:id` - تفاصيل كورس محدد
- `POST /api/courses/:id/save` - حفظ كورس
- `DELETE /api/courses/:id/save` - إلغاء حفظ كورس

### Books Endpoints
- `GET /api/books` - قائمة الكتب
- `GET /api/books/:id` - تفاصيل كتاب محدد
- `POST /api/books/:id/save` - حفظ كتاب
- `DELETE /api/books/:id/save` - إلغاء حفظ كتاب

### Dashboard Endpoints
- `GET /api/dashboard/stats` - إحصائيات المستخدم
- `GET /api/dashboard/progress` - تقدم التعلم
- `GET /api/dashboard/saved-content` - المحتوى المحفوظ
- `GET /api/dashboard/todos` - قائمة المهام

### Recommendations Endpoints
- `GET /api/recommendations/daily` - التوصيات اليومية
- `POST /api/recommendations/feedback` - تقييم التوصيات

## 🧪 Testing

### تشغيل الاختبارات التلقائية
```bash
# اختبار شامل للتكامل
./test-e2e-integration.sh

# اختبار Backend فقط
cd backend
npm test

# اختبار Frontend فقط
cd frontend
npm test
```

### اختبار API يدوياً
```bash
# Health Check
curl http://localhost:3001/api/health

# تسجيل مستخدم
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## 🗄️ قاعدة البيانات

### Collections
- `users` - بيانات المستخدمين
- `courses` - الكورسات التعليمية
- `books` - الكتب التعليمية
- `savedcontents` - المحتوى المحفوظ
- `progresses` - تقدم التعلم
- `studytodos` - المهام الدراسية
- `recommendationfeedbacks` - تقييمات التوصيات

### تشغيل Seed Data
```bash
cd backend
npm run seed
```

## 🌐 النشر على Railway

راجع [DEPLOYMENT.md](./DEPLOYMENT.md) للحصول على دليل شامل للنشر على Railway.
راجع [FRONTEND_DEPLOYMENT.md](./FRONTEND_DEPLOYMENT.md) للحصول على تفاصيل محددة لنشر واجهة المستخدم.

### خطوات سريعة:
1. إعداد MongoDB Atlas
2. نشر Backend على Railway
3. نشر Frontend على Railway (استخدم `frontend/Dockerfile`)
4. تكوين متغيرات البيئة (`VITE_API_BASE_URL`)
5. اختبار شامل

## 📚 الوثائق الإضافية

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - دليل النشر الشامل
- **[TESTING.md](./TESTING.md)** - دليل الاختبار المتقدم
- **[backend/DATABASE_SETUP.md](./backend/DATABASE_SETUP.md)** - إعداد قاعدة البيانات
- **[backend/AUTH_API.md](./backend/AUTH_API.md)** - وثائق API المصادقة
- **[backend/CONTENT_API.md](./backend/CONTENT_API.md)** - وثائق API المحتوى
- **[backend/DASHBOARD_API.md](./backend/DASHBOARD_API.md)** - وثائق API لوحة التحكم
- **[backend/RECOMMENDATIONS_API.md](./backend/RECOMMENDATIONS_API.md)** - وثائق API التوصيات

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء feature branch (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للـ branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 👨‍💻 المطور

**Alaa-Ali**  
- تطوير Full-Stack  
- التخصص في تطبيقات التعليم الرقمي  
- دعم ثنائي اللغة (العربية/الإنجليزية)

---

## 🎯 خطة التطوير

### المرحلة الحالية ✅
- [x] نظام المصادقة والتسجيل
- [x] إدارة الكورسات والكتب
- [x] نظام التوصيات الذكي
- [x] لوحة التحكم والإحصائيات
- [x] دعم ثنائي اللغة
- [x] تصميم متجاوب

### التطوير المستقبلي 🚧
- [ ] تطبيق الهاتف المحمول
- [ ] نظام الدفع للكورسات المدفوعة
- [ ] دردشة مباشرة مع المعلمين
- [ ] نظام الاختبارات والتقييم
- [ ] تحليلات متقدمة للتعلم
- [ ] تكامل مع LMS systems

---

<div align="center">

**🎓 منصة تعليمية متطورة للأجيال القادمة 🎓**

*نحو تعليم أفضل للجميع*

[الموقع الإلكتروني](https://your-domain.com) • [التوثيق](https://docs.your-domain.com) • [الدعم](mailto:support@your-domain.com)
npm start
</div>
