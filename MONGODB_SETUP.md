# دليل إعداد MongoDB Atlas للمشروع التعليمي ثنائي اللغة

## نظرة عامة

هذا الدليل الشامل سيساعدك في إعداد MongoDB Atlas لمشروعك التعليمي من البداية حتى النشر. ستجد هنا جميع الخطوات المطلوبة مع لقطات الشاشة والصور التوضيحية.

---

## المرحلة 1: إعداد MongoDB Atlas

### الخطوة 1: إنشاء حساب MongoDB Atlas

1. **زيارة الموقع الرسمي**
   - اذهب إلى: [https://cloud.mongodb.com](https://cloud.mongodb.com)
   - اضغط على "Start Free" أو "اشترك مجاناً"

2. **إنشاء حساب جديد**
   - أدخل بريدك الإلكتروني
   - أنشئ كلمة مرور قوية
   - اختر طريقة التحقق المفضلة
   - اقرأ ووافق على شروط الخدمة

3. **التحقق من البريد الإلكتروني**
   - تحقق من بريدك الإلكتروني
   - اضغط على رابط التحقق

4. **إكمال الملف الشخصي**
   - **اسم المؤسسة**: "منصة تعليمية ثنائية اللغة" أو اسمك الشخصي
   - **اسم المشروع**: "Bilingual Educational Platform"

### الخطوة 2: إنشاء Cluster مجاني

1. **اختيار الخطة المجانية**
   - اختر خطة **M0** (مجانية)
   - الميزات:
     - 512 ميجابايت تخزين
     - ذاكرة مشتركة
     - مناسب للتطوير والاختبار

2. **اختيار مزود الخدمة السحابية**
   - **AWS** (موصى به للمبتدئين)
   - **Google Cloud Platform**
   - **Microsoft Azure**

3. **اختيار المنطقة**
   - اختر أقرب منطقة لموقعك الجغرافي
   - للتنمية، أي منطقة تعمل بشكل جيد

4. **تسمية Cluster**
   - اترك الاسم الافتراضي أو اختر:
   - `Cluster0`
   - `EducationalPlatform`
   - `LearningPlatform`

5. **إنشاء Cluster**
   - اضغط على "Create Cluster"
   - ⚠️ **ملاحظة**: سيستغرق الإنشاء 1-3 دقائق

### الخطوة 3: تكوين Network Access (IP Whitelist)

**الهدف**: السماح للـ IP الخاص بك بالوصول إلى قاعدة البيانات

1. **الانتقال إلى Network Access**
   - اضغط على "Network Access" في الشريط الجانبي الأيسر
   - أو اذهب إلى "Security" → "Network Access"

2. **إضافة IP Address**
   - اضغط على "Add IP Address"
   - اختر "Allow access from anywhere" (0.0.0.0/0)
   - أو أدخل IP محدد إذا كنت تعرفه

3. **التأكيد**
   - أضف تعليق: "بيئة التطوير - Development Environment"
   - اضغط "Confirm"

⚠️ **تنبيه أمني**: 
- يُسمح 0.0.0.0/0 للتطوير فقط
- للإنتاج، استخدم IP addresses محددة

### الخطوة 4: إنشاء Database User

1. **الانتقال إلى Database Access**
   - اضغط على "Database Access" في الشريط الجانبي
   - أو اذهب إلى "Security" → "Database Access"

2. **إضافة مستخدم قاعدة بيانات جديد**
   - اضغط "Add New Database User"

3. **معلومات المستخدم**
   - **Authentication Method**: اختر "Password"
   - **User Name**: اختر اسم مستخدم مثل:
     - `edu_platform_user`
     - `learning_user`
     - `myapp_user`
   - **Password**: أنشئ كلمة مرور قوية جداً:
     - 12 حرف على الأقل
     - مزيج من الأحرف والأرقام والرموز
     - مثال: `MyStrongPass123!@#`

⚠️ **مهم جداً**: احفظ كلمة المرور - لن تراها مرة أخرى!

4. **صلاحيات المستخدم**
   - **Role**: اختر "Atlas admin" (للوصول الكامل أثناء التطوير)
   - للإنتاج: استخدم "Read and Write" لقواعد بيانات محددة

5. **إنشاء المستخدم**
   - اضغط "Add User"

### الخطوة 5: الحصول على Connection String

1. **الانتقال إلى Clusters**
   - اضغط "Clusters" في الشريط الجانبي

2. **الوصول إلى Cluster**
   - اضغط زر "Connect" بجانب الـ cluster الخاص بك
   - اختر "Connect your application"

3. **الحصول على Connection String**
   - **Driver**: اختر "Node.js"
   - **Version**: اختر "4.1 or later"
   - انسخ الـ connection string
   - سيكون شكله مشابه لـ:
     ```
     mongodb+srv://username:password@cluster0.xxxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

4. **تعديل الـ Connection String**
   - استبدل `test` بـ `educational_platform`
   - استبدل `username` باسم المستخدم
   - استبدل `password` بكلمة المرور
   - النتيجة النهائية:
     ```
     mongodb+srv://username:password@cluster0.xxxxxx.mongodb.net/educational_platform?retryWrites=true&w=majority
     ```

---

## المرحلة 2: ربط MongoDB بـ Backend

### الخطوة 1: إعداد ملف البيئة

1. **الانتقال إلى مجلد Backend**
   ```bash
   cd backend
   ```

2. **نسخ ملف المثال**
   ```bash
   cp .env.example .env
   ```

3. **تحديث ملف .env**
   افتح ملف `.env` وأضف:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxxx.mongodb.net/educational_platform?retryWrites=true&w=majority
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-must-be-32-characters-minimum-change-in-production
   ```

4. **تأمين ملف .env**
   - تأكد من أن `.env` موجود في `.gitignore`
   - لا تنشر ملفات `.env` على GitHub

### الخطوة 2: تحسين Error Handling

الـ server.js يحتوي على error handling جيد، لكن سنضيف بعض التحسينات:
- رسائل خطأ واضحة باللغة العربية
- معالجة حالات فشل الاتصال بشكل أفضل
- رسائل توجيهية للمستخدم

---

## المرحلة 3: إعداد Seeding (البيانات التجريبية)

### التحقق من الـ Seed Script

الـ seed script موجود في `backend/src/scripts/seed.js` ويحتوي على:
- 8+ دورات تعليمية
- 6+ كتب في مختلف المواضيع

### تشغيل الـ Seeding

1. **تأكد من الاتصال بقاعدة البيانات**
   ```bash
   cd backend
   npm install
   ```

2. **تشغيل الـ seed script**
   ```bash
   npm run seed
   ```

3. **النتيجة المتوقعة**
   ```
   🚀 Starting database seeding...
   🔄 Connecting to MongoDB...
   ✅ Database connected successfully
   🌱 Seeding courses...
   ✅ Seeded 8 courses
   🌱 Seeding books...
   ✅ Seeded 6 books
   ✨ Database seeding completed successfully!
   ```

### تخصيص البيانات التجريبية

لإضافة محتوى جديد، عدّل ملف `seed.js`:

**إضافة دورة جديدة:**
```javascript
{
  title: "عنوان الدورة",
  description: "وصف الدورة التعليمية",
  subject: "Programming", // Math, Science, Languages, Programming, Other
  educationLevel: "University", // HighSchool, University, SelfPaced
  language: "ar", // ar, en, bilingual
  source: "اسم المصدر",
  sourceUrl: "https://example.com/course",
  duration: 120, // بالدقائق
  difficulty: "beginner", // beginner, intermediate, advanced
  tags: ["tag1", "tag2"]
}
```

**إضافة كتاب جديد:**
```javascript
{
  title: "عنوان الكتاب",
  author: "اسم المؤلف",
  subject: "Science", // Math, Science, Languages, Programming, Other
  educationLevel: "University", // HighSchool, University, SelfPaced
  language: "ar", // ar, en, bilingual
  source: "اسم المصدر",
  sourceUrl: "https://example.com/book",
  publicationYear: 2023,
  difficulty: "intermediate", // beginner, intermediate, advanced
  tags: ["tag1", "tag2"]
}
```

---

## المرحلة 4: اختبار الاتصال محلياً

### الخطوة 1: التحقق من المتطلبات

```bash
# تأكد من وجود Node.js
node --version  # يجب أن يكون 14+

# تأكد من وجود npm
npm --version
```

### الخطوة 2: تثبيت المكتبات

```bash
cd backend
npm install
```

### الخطوة 3: تشغيل الخادم

```bash
# للتطوير
npm run dev

# أو للإنتاج
npm start
```

### الخطوة 4: التحقق من الرسائل

**النتيجة المتوقعة:**
```
🔄 Connecting to MongoDB...
✅ Database connected successfully
🚀 Server running on port 3001
📝 Environment: development
🌐 API Base URL: http://localhost:3001
🏥 Health Check: http://localhost:3001/api/health
📊 API Info: http://localhost:3001/api
```

### الخطوة 5: اختبار الـ Endpoints الأساسية

#### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

**النتيجة المتوقعة:**
```json
{
  "status": "OK",
  "message": "Bilingual Educational Platform API is running",
  "database": {
    "status": "Connected",
    "host": "cluster0.xxxxxx.mongodb.net",
    "name": "educational_platform"
  }
}
```

#### 2. API Info
```bash
curl http://localhost:3001/api
```

#### 3. Courses List
```bash
curl http://localhost:3001/api/courses
```

#### 4. Books List
```bash
curl http://localhost:3001/api/books
```

#### 5. Register (اختياري)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User",
    "language": "ar"
  }'
```

---

## المرحلة 5: استكشاف الأخطاء الشائعة

### خطأ 1: Connection Timeout

**المشكلة**: `MongoNetworkError: connect ETIMEDOUT`

**الحلول**:
1. تحقق من Network Access في MongoDB Atlas
2. تأكد من أن Cluster يعمل وليس متوقف
3. تحقق من Connection String
4. جرب مع Network Access: 0.0.0.0/0

### خطأ 2: Authentication Failed

**المشكلة**: `MongoAuthenticationError: Authentication failed`

**الحلول**:
1. تحقق من اسم المستخدم وكلمة المرور
2. تأكد من أن المستخدم له صلاحيات
3. تحقق من Connection String format
4. أعد إنشاء المستخدم إذا لزم الأمر

### خطأ 3: Database Does Not Exist

**المشكلة**: `MongoError: Database 'educational_platform' not found`

**الحلول**:
1. MongoDB Atlas ينشئ قاعدة البيانات تلقائياً
2. تأكد من Connection String صحيح
3. تحقق من اسم قاعدة البيانات في Connection String

### خطأ 4: Permission Denied

**المشكلة**: `MongoError: not authorized on educational_platform to execute command`

**الحلول**:
1. تأكد من صلاحيات المستخدم
2. استخدم "Atlas admin" للتطوير
3. تحقق من Network Access

### خطأ 5: Cluster Paused

**المشكلة**: Free tier clusters تتوقف بعد فترة من عدم النشاط

**الحلول**:
1. ادخل إلى MongoDB Atlas dashboard
2. اضغط "Resume" على الـ cluster
3. أعد تشغيل التطبيق

---

## إعداد النسخ الاحتياطي (Backups)

### التلقائي
- MongoDB Atlas يوفر نسخ احتياطية تلقائية للـ Free tier
- النقاط الكاملة متاحة كل 6 ساعات

### اليدوي
```bash
# استخدام mongodump (إذا كان مثبت محلياً)
mongodump --uri="your-connection-string" --out=./backup-folder
```

---

## نصائح الأمان

### للتطوير
- استخدم Network Access: 0.0.0.0/0
- كلمة مرور قوية للـ Database User
- لا تنشر .env files

### للإنتاج
- استخدم IP addresses محددة
- كلمة مرور قوية جداً
- استخدم متغيرات البيئة فقط
- فعّل SSL/TLS

---

## روابط مفيدة

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)
- [MongoDB Community Forums](https://community.mongodb.com/)
- [Atlas Support](https://support.mongodb.com/)

---

## الخطوات التالية

بعد إكمال هذا الدليل:

1. ✅ MongoDB Atlas cluster جاهز
2. ✅ Connection string صحيح ومختبر
3. ✅ Backend يتصل بـ MongoDB بنجاح
4. ✅ بيانات تجريبية مُدرجة
5. ✅ جميع الـ endpoints تعمل محلياً

**الخطوات التالية**:
- نشر على Railway
- اختبار شامل للتطبيق
- إعداد Frontend
- اختبار End-to-End

---

## الدعم والمساعدة

إذا واجهت أي مشاكل:

1. راجع هذا الدليل مرة أخرى
2. تحقق من MongoDB Atlas logs
3. راجع console output للتطبيق
4. ابحث في MongoDB Community Forums
5. تحقق من [MongoDB Documentation](https://docs.mongodb.com/)

**تذكر**: التوثيق هو صديقك! 📚