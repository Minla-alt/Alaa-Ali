# دليل نشر Frontend على Railway 🚀

هذا الدليل يشرح كيفية نشر واجهة المستخدم (Frontend) الخاصة بالمنصة التعليمية على منصة Railway.

## المتطلبات الأساسية
1. حساب على [Railway](https://railway.app/).
2. حساب على GitHub.
3. الـ Backend الخاص بالمشروع منشور بالفعل (للحصول على رابط الـ API).

## الخطوات

### 1. تحضير المشروع
تأكد من أن الكود يحتوي على الملفات التالية في مجلد `frontend`:
- `Dockerfile`: لإنشاء حاوية الـ Frontend.
- `nginx.conf`: لتكوين خادم Nginx ومعالجة routing الخاص بـ React.
- `package.json`: يحتوي على جميع التبعيات و script الـ build.

### 2. الربط مع GitHub
1. ارفع الكود إلى مستودع (Repository) على GitHub.
2. في Railway، اختر **"New Project"**.
3. اختر **"Deploy from GitHub repo"**.
4. اختر المستودع الخاص بك.

### 3. إعدادات الخدمة (Service Settings)
بما أن المشروع يحتوي على `backend` و `frontend` في نفس المستودع، ستحتاج إلى تحديد المسار الصحيح للـ Frontend:
1. اذهب إلى إعدادات الخدمة في Railway.
2. في قسم **"Build"**:
   - **Root Directory**: اضبطه على `/frontend`.
3. سيتعرف Railway تلقائياً على `Dockerfile` الموجود داخل المجلد.

### 4. متغيرات البيئة (Environment Variables)
هذه الخطوة هامة جداً لربط Frontend بالـ Backend:
1. اذهب إلى تبويب **"Variables"** في خدمة الـ Frontend.
2. أضف المتغير التالي:
   - `VITE_API_BASE_URL`: ضع هنا رابط الـ Backend الخاص بك (مثلاً: `https://your-backend.railway.app`).
   - `NODE_ENV`: `production`.

> **ملاحظة**: يجب أن يبدأ الرابط بـ `https://` ولا ينتهي بـ `/`.

### 5. النشر (Deployment)
1. بمجرد حفظ المتغيرات، سيقوم Railway بإعادة بناء (Rebuild) المشروع تلقائياً.
2. يمكنك متابعة الـ Build Logs للتأكد من نجاح العملية.
3. بمجرد الانتهاء، سيعطيك Railway رابطاً (Domain) مثل `project-name.up.railway.app`.

---

## استكشاف الأخطاء وإصلاحها (Troubleshooting)

### 1. فشل الـ Build بسبب Node version
تأكد من أن `package.json` لا يحدد نسخة Node غير مدعومة، أو استخدم `Dockerfile` كما هو موفر في المشروع لأنه يستخدم نسخة مستقرة.

### 2. خطأ 404 عند تحديث الصفحة (Refresh)
هذا الخطأ يحدث عادة في تطبيقات Single Page Applications (SPA). تم حل هذه المشكلة في هذا المشروع باستخدام ملف `nginx.conf` الذي يعيد توجيه جميع الطلبات إلى `index.html`.

### 3. مشكلة في الاتصال بالـ API (CORS)
تأكد من أن الـ Backend يسمح بطلبات من الـ Domain الخاص بالـ Frontend. في `backend/src/server.js` تأكد من إعداد CORS بشكل صحيح.

### 4. الصور أو الملفات لا تظهر
تأكد من استخدام مسارات صحيحة في الكود (Relative paths) وأن ملفات الـ Assets موجودة داخل مجلد `src/assets` أو `public`.

---

## تحديث الكود (Auto-Deploy)
أي تغيير تقوم بدفعه (Push) إلى فرع `main` في مستودع GitHub سيقوم Railway بنشره تلقائياً.

## مراقبة الأداء
يمكنك استخدام تبويب **"Metrics"** في Railway لمراقبة استهلاك الذاكرة والمعالج للـ Frontend.
