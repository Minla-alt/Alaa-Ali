#!/bin/bash

# =====================================================
# 🧪 Quick Test Script for MongoDB Atlas Setup
# =====================================================
# اختبار سريع للتأكد من إعداد MongoDB Atlas
# =====================================================

set -e

# الألوان
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 اختبار سريع لـ MongoDB Atlas${NC}"
echo "========================================"

# التحقق من Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js غير مثبت${NC}"
    exit 1
fi

# التحقق من npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm غير مثبت${NC}"
    exit 1
fi

# التحقق من .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ ملف .env غير موجود${NC}"
    echo -e "${YELLOW}💡 انسخ من .env.example: cp .env.example .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ تم العثور على ملف .env${NC}"

# اختبار الاتصال بقاعدة البيانات
echo ""
echo -e "${BLUE}🔗 اختبار الاتصال بقاعدة البيانات...${NC}"

if npm run test:db; then
    echo ""
    echo -e "${GREEN}🎉 ممتاز! قاعدة البيانات تعمل بشكل طبيعي${NC}"
    echo ""
    echo "الخطوات التالية:"
    echo "  • npm run dev    # تشغيل الخادم"
    echo "  • npm run seed   # إضافة بيانات تجريبية"
    echo "  • curl http://localhost:3001/api/health"
    echo ""
else
    echo ""
    echo -e "${RED}❌ فشل الاتصال بقاعدة البيانات${NC}"
    echo ""
    echo "تحقق من:"
    echo "  • MONGODB_URI في ملف .env"
    echo "  • Network Access في MongoDB Atlas"
    echo "  • إنشاء Database User"
    echo ""
    echo "راجع: MONGODB_SETUP.md"
fi