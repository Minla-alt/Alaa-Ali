#!/bin/bash

# E2E Integration Testing Script
# Tests all API endpoints with real backend

BASE_URL="http://localhost:5000"
TOKEN=""
USER_ID=""

echo "=========================================="
echo "E2E Integration Test - Bilingual Educational Platform"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    
    echo -n "Testing: $name... "
    
    if [ "$method" == "GET" ]; then
        if [ -z "$TOKEN" ]; then
            response=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}${endpoint}")
        else
            response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" -X GET "${BASE_URL}${endpoint}")
        fi
    elif [ "$method" == "POST" ]; then
        if [ -z "$TOKEN" ]; then
            response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "${BASE_URL}${endpoint}")
        else
            response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$data" "${BASE_URL}${endpoint}")
        fi
    elif [ "$method" == "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" -X DELETE "${BASE_URL}${endpoint}")
    elif [ "$method" == "PATCH" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$data" -X PATCH "${BASE_URL}${endpoint}")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $status_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    echo ""
}

# 1. Test Health Check
echo "=========================================="
echo "1. Testing Health Check"
echo "=========================================="
test_endpoint "Health Check" "GET" "/api/health" "" "200"

# 2. Test Authentication
echo "=========================================="
echo "2. Testing Authentication"
echo "=========================================="

# Signup
SIGNUP_DATA='{
  "email": "testuser@example.com",
  "password": "password123",
  "name": "Test User",
  "preferredLanguage": "en"
}'
echo "Testing signup..."
response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$SIGNUP_DATA" "${BASE_URL}/api/auth/signup")
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status_code" == "201" ] || [ "$status_code" == "409" ]; then
    echo -e "${GREEN}✓ Signup successful or user exists${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ Signup failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Login
LOGIN_DATA='{
  "email": "testuser@example.com",
  "password": "password123"
}'
echo "Testing login..."
response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$LOGIN_DATA" "${BASE_URL}/api/auth/login")
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status_code" == "200" ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    TOKEN=$(echo "$body" | jq -r '.token')
    USER_ID=$(echo "$body" | jq -r '.user._id')
    echo "Token obtained: ${TOKEN:0:20}..."
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ Login failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Get current user
test_endpoint "Get Current User (GET /api/auth/me)" "GET" "/api/auth/me" "" "200"

# 3. Test Courses API
echo "=========================================="
echo "3. Testing Courses API"
echo "=========================================="
test_endpoint "List Courses" "GET" "/api/courses" "" "200"
test_endpoint "List Courses with filters" "GET" "/api/courses?subject=Math&limit=5" "" "200"

# Get first course ID
echo "Getting first course..."
response=$(curl -s -H "Authorization: Bearer $TOKEN" "${BASE_URL}/api/courses?limit=1")
COURSE_ID=$(echo "$response" | jq -r '.courses[0]._id')
echo "Course ID: $COURSE_ID"
echo ""

SAVED_COURSE_ID=""
if [ ! -z "$COURSE_ID" ] && [ "$COURSE_ID" != "null" ]; then
    test_endpoint "Get Course Details" "GET" "/api/courses/$COURSE_ID" "" "200"
    
    # Save course for later progress tracking
    echo "Saving course for progress tracking..."
    response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" -X POST "${BASE_URL}/api/courses/$COURSE_ID/save")
    status_code=$(echo "$response" | tail -n1)
    if [ "$status_code" == "200" ]; then
        echo -e "${GREEN}✓ Save Course PASSED${NC}"
        SAVED_COURSE_ID=$COURSE_ID
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ Save Course FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
    
    test_endpoint "Get User Saved Courses" "GET" "/api/courses/user/saved" "" "200"
    test_endpoint "Unsave Course" "DELETE" "/api/courses/$COURSE_ID/save" "" "200"
fi

# 4. Test Books API
echo "=========================================="
echo "4. Testing Books API"
echo "=========================================="
test_endpoint "List Books" "GET" "/api/books" "" "200"

# Get first book ID
echo "Getting first book..."
response=$(curl -s -H "Authorization: Bearer $TOKEN" "${BASE_URL}/api/books?limit=1")
BOOK_ID=$(echo "$response" | jq -r '.books[0]._id')
echo "Book ID: $BOOK_ID"
echo ""

if [ ! -z "$BOOK_ID" ] && [ "$BOOK_ID" != "null" ]; then
    test_endpoint "Get Book Details" "GET" "/api/books/$BOOK_ID" "" "200"
    test_endpoint "Save Book" "POST" "/api/books/$BOOK_ID/save" "" "200"
    test_endpoint "Get User Saved Books" "GET" "/api/books/user/saved" "" "200"
fi

# 5. Test Dashboard API
echo "=========================================="
echo "5. Testing Dashboard API"
echo "=========================================="
test_endpoint "Get Dashboard Stats" "GET" "/api/dashboard/stats" "" "200"
test_endpoint "Get Saved Content" "GET" "/api/dashboard/saved-content" "" "200"
test_endpoint "Get Progress" "GET" "/api/dashboard/progress" "" "200"

# Create Todo
TODO_DATA='{
  "title": "Complete Math Course",
  "description": "Finish all algebra exercises",
  "priority": "high",
  "dueDate": "2026-01-15T00:00:00.000Z"
}'
echo "Creating todo..."
response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$TODO_DATA" -X POST "${BASE_URL}/api/dashboard/todos")
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status_code" == "201" ]; then
    echo -e "${GREEN}✓ Todo created${NC}"
    TODO_ID=$(echo "$body" | jq -r '.todoId')
    echo "Todo ID: $TODO_ID"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ Todo creation failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

test_endpoint "Get Todos" "GET" "/api/dashboard/todos" "" "200"

if [ ! -z "$TODO_ID" ] && [ "$TODO_ID" != "null" ]; then
    UPDATE_TODO='{"completed": true}'
    test_endpoint "Update Todo" "PATCH" "/api/dashboard/todos/$TODO_ID" "$UPDATE_TODO" "200"
    test_endpoint "Delete Todo" "DELETE" "/api/dashboard/todos/$TODO_ID" "" "200"
fi

# Update progress - Re-save course first
if [ ! -z "$COURSE_ID" ] && [ "$COURSE_ID" != "null" ]; then
    echo "Re-saving course for progress update..."
    curl -s -H "Authorization: Bearer $TOKEN" -X POST "${BASE_URL}/api/courses/$COURSE_ID/save" > /dev/null
    
    PROGRESS_DATA="{\"courseId\": \"$COURSE_ID\", \"completionPercentage\": 50}"
    test_endpoint "Update Progress" "PATCH" "/api/dashboard/progress/$COURSE_ID" "$PROGRESS_DATA" "200"
fi

# 6. Test Recommendations API
echo "=========================================="
echo "6. Testing AI Recommendations API"
echo "=========================================="
echo "Getting daily recommendation..."
response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "${BASE_URL}/api/recommendations/daily")
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status_code" == "200" ]; then
    echo -e "${GREEN}✓ Get Daily Recommendation PASSED${NC}"
    RECOMMENDATION_ID=$(echo "$body" | jq -r '.recommendation.contentId')
    echo "Recommendation ID: $RECOMMENDATION_ID"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ Get Daily Recommendation FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

if [ ! -z "$RECOMMENDATION_ID" ] && [ "$RECOMMENDATION_ID" != "null" ]; then
    FEEDBACK_DATA="{
      \"recommendationId\": \"$RECOMMENDATION_ID\",
      \"helpful\": true,
      \"comment\": \"Great recommendation!\"
    }"
    test_endpoint "Submit Recommendation Feedback" "POST" "/api/recommendations/feedback" "$FEEDBACK_DATA" "201"
else
    echo "Skipping feedback test - no recommendation ID"
fi

# 7. Test Logout
echo "=========================================="
echo "7. Testing Logout"
echo "=========================================="
test_endpoint "Logout" "POST" "/api/auth/logout" "" "200"

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed${NC}"
    exit 1
fi
