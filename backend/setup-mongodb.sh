#!/bin/bash

# =====================================================
# 🚀 MongoDB Atlas Setup and Test Script
# =====================================================
# هذا السكريبت يقوم بإعداد MongoDB Atlas واختبار الاتصال
# وإضافة البيانات التجريبية للتأكد من أن كل شيء يعمل
# =====================================================

set -e

# الألوان للعرض
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# وظائف المساعدة
print_header() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${CYAN}========================================${NC}\n"
}

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}💡 $1${NC}"
}

# =====================================================
# إعداد المشروع
# =====================================================
setup_project() {
    print_header "🚀 إعداد مشروع MongoDB Atlas"
    
    print_step "فحص وجود ملف .env..."
    
    if [ ! -f ".env" ]; then
        print_warning "ملف .env غير موجود، يتم إنشاؤه من .env.example..."
        cp .env.example .env
        print_success "تم إنشاء ملف .env من .env.example"
        print_info "⚠️  يرجى تحديث MONGODB_URI في ملف .env"
        print_info "راجع MONGODB_SETUP.md للتفاصيل"
        echo ""
        read -p "اضغط Enter بعد تحديث ملف .env للمتابعة..."
    else
        print_success "ملف .env موجود"
    fi
    
    print_step "فحص وجود ملف package.json..."
    if [ ! -f "package.json" ]; then
        print_error "ملف package.json غير موجود. تأكد من وجودك في مجلد backend"
        exit 1
    fi
    print_success "ملف package.json موجود"
}

# =====================================================
# تثبيت المكتبات
# =====================================================
install_dependencies() {
    print_header "📦 تثبيت المكتبات"
    
    print_step "تثبيت npm dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "تم تثبيت المكتبات بنجاح"
    else
        print_error "فشل في تثبيت المكتبات"
        exit 1
    fi
}

# =====================================================
# اختبار الاتصال بقاعدة البيانات
# =====================================================
test_database() {
    print_header "🧪 اختبار الاتصال بقاعدة البيانات"
    
    print_step "تشغيل اختبار الاتصال بقاعدة البيانات..."
    echo ""
    
    npm run test:db
    
    if [ $? -eq 0 ]; then
        print_success "✅ اختبار الاتصال نجح - قاعدة البيانات تعمل بشكل طبيعي"
    else
        print_error "❌ فشل اختبار الاتصال بقاعدة البيانات"
        print_info "تأكد من:"
        print_info "• تحديث MONGODB_URI في ملف .env"
        print_info "• إعداد Network Access في MongoDB Atlas"
        print_info "• إنشاء Database User صحيح"
        print_info ""
        print_info "راجع MONGODB_SETUP.md للمساعدة"
        exit 1
    fi
}

# =====================================================
# زرع البيانات التجريبية
# =====================================================
seed_data() {
    print_header "🌱 زرع البيانات التجريبية"
    
    print_step "إضافة دورات وكتب تجريبية..."
    echo ""
    
    npm run seed
    
    if [ $? -eq 0 ]; then
        print_success "✅ تم زرع البيانات التجريبية بنجاح"
    else
        print_warning "⚠️  فشل في زرع البيانات التجريبية"
        print_info "قد تكون البيانات موجودة بالفعل أو خطأ في الاتصال"
    fi
}

# =====================================================
# اختبار الخادم
# =====================================================
test_server() {
    print_header "🚀 اختبار الخادم"
    
    print_step "بدء تشغيل الخادم للاختبار..."
    print_info "سيتم تشغيل الخادم لمدة 10 ثوانٍ لاختبار الاتصال..."
    
    # تشغيل الخادم في الخلفية
    timeout 10s npm run dev > /tmp/server_test.log 2>&1 &
    SERVER_PID=$!
    
    # انتظار 5 ثوانٍ حتى يبدأ الخادم
    sleep 5
    
    # اختبار Health Check
    print_step "اختبار Health Check..."
    response=$(curl -s http://localhost:3001/api/health)
    
    if echo "$response" | grep -q "OK"; then
        print_success "✅ الخادم يعمل بشكل طبيعي"
        print_success "✅ Health Check نجح"
        echo ""
        print_info "استجابة الخادم:"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        print_error "❌ فشل في الوصول للخادم"
        print_info "تحقق من logs:"
        tail -n 20 /tmp/server_test.log
    fi
    
    # إيقاف الخادم
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
}

# =====================================================
# عرض ملخص النتائج
# =====================================================
show_summary() {
    print_header "🎉 ملخص الإعداد"
    
    print_success "تم إعداد MongoDB Atlas بنجاح!"
    echo ""
    print_info "الخطوات التالية:"
    echo "• تشغيل الخادم: npm run dev"
    echo "• اختبار API: http://localhost:3001/api/health"
    echo "• زرع بيانات إضافية: npm run seed"
    echo ""
    print_info "الروابط المفيدة:"
    echo "• MongoDB Atlas: https://cloud.mongodb.com"
    echo "• دليل الإعداد: MONGODB_SETUP.md"
    echo "• API Documentation: http://localhost:3001/api"
    echo ""
    
    print_step "اختبار سريع للـ API..."
    echo "curl http://localhost:3001/api/health"
    echo ""
    print_step "تشغيل الخادم:"
    echo "npm run dev"
    echo ""
    
    print_success "🎊 مرحباً بك في مشروع منصة Alaa-Ali التعليمية!"
}

# =====================================================
# الوظيفة الرئيسية
# =====================================================
main() {
    echo -e "${PURPLE}"
    echo "=============================================="
    echo "  🎓 منصة Alaa-Ali التعليمية"
    echo "  📊 إعداد MongoDB Atlas التلقائي"
    echo "=============================================="
    echo -e "${NC}"
    
    # التحقق من وجود Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js غير مثبت. يرجى تثبيت Node.js أولاً"
        exit 1
    fi
    
    # التحقق من وجود npm
    if ! command -v npm &> /dev/null; then
        print_error "npm غير مثبت. يرجى تثبيت npm أولاً"
        exit 1
    fi
    
    # التحقق من وجود jq (اختياري)
    if ! command -v jq &> /dev/null; then
        print_warning "jq غير مثبت. سيتم عرض JSON بدون تنسيق"
    fi
    
    # التحقق من وجود curl (اختياري)
    if ! command -v curl &> /dev/null; then
        print_warning "curl غير مثبت. سيتم تخطي اختبار API"
    fi
    
    print_info "مرحباً! سيتم إعداد MongoDB Atlas تلقائياً..."
    echo ""
    
    # تنفيذ الخطوات
    setup_project
    install_dependencies
    test_database
    seed_data
    test_server
    show_summary
    
    print_success "✨ تم الإعداد بنجاح!"
}

# =====================================================
# تشغيل السكريبت
# =====================================================
main "$@"