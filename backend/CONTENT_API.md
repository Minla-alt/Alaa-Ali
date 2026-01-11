# Content API Documentation

## Overview

The Content API provides endpoints for managing courses and books in the bilingual educational platform. All endpoints support filtering, searching, and pagination, with save functionality for authenticated users.

**Base URL:** `http://localhost:3001/api`

## Authentication

Some endpoints require authentication. Use JWT Bearer tokens in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Courses API

### Base URL: `/api/courses`

#### 1. Get All Courses

**Endpoint:** `GET /api/courses`

**Description:** Retrieve all courses with optional filtering, searching, and pagination.

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `subject` | string | No | Filter by subject | `Math`, `Science`, `Languages`, `Programming`, `Other` |
| `educationLevel` | string | No | Filter by education level | `HighSchool`, `University`, `SelfPaced` |
| `language` | string | No | Filter by language | `ar`, `en`, `bilingual` |
| `search` | string | No | Search in title, description, source | `algebra`, `programming` |
| `page` | number | No | Page number (default: 1) | `1`, `2`, `3` |
| `limit` | number | No | Items per page (default: 10) | `5`, `10`, `20` |

**Success Response (200 OK):**
```json
{
  "success": true,
  "courses": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Introduction to Algebra",
      "description": "Learn the fundamentals of algebra",
      "subject": "Math",
      "educationLevel": "HighSchool",
      "language": "en",
      "source": "Khan Academy",
      "duration": 120,
      "thumbnail": "https://example.com/thumb.jpg",
      "difficulty": "beginner",
      "tags": ["algebra", "mathematics"],
      "isActive": true,
      "isSaved": false,
      "createdAt": "2023-01-15T10:30:00.000Z",
      "updatedAt": "2023-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Example Requests:**

```bash
# Get all courses
curl -X GET "http://localhost:3001/api/courses"

# Filter by subject and education level
curl -X GET "http://localhost:3001/api/courses?subject=Math&educationLevel=HighSchool"

# Search courses
curl -X GET "http://localhost:3001/api/courses?search=algebra"

# Pagination
curl -X GET "http://localhost:3001/api/courses?page=2&limit=5"

# Combined filtering and search
curl -X GET "http://localhost:3001/api/courses?subject=Science&language=en&search=biology&page=1&limit=10"
```

**Error Responses:**

*400 Bad Request:* Invalid query parameters
```json
{
  "success": false,
  "message": "Invalid subject. Must be one of: Math, Science, Languages, Programming, Other"
}
```

*500 Internal Server Error:* Database or server error
```json
{
  "success": false,
  "message": "Server error while fetching courses",
  "error": "Detailed error message in development"
}
```

#### 2. Get Single Course

**Endpoint:** `GET /api/courses/:id`

**Description:** Retrieve a specific course by its ID.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the course |

**Success Response (200 OK):**
```json
{
  "success": true,
  "course": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Advanced Calculus",
    "description": "Deep dive into calculus concepts",
    "subject": "Math",
    "educationLevel": "University",
    "language": "en",
    "source": "MIT OpenCourseWare",
    "duration": 480,
    "thumbnail": "https://example.com/calculus.jpg",
    "difficulty": "advanced",
    "tags": ["calculus", "mathematics", "derivatives"],
    "instructor": {
      "name": "Dr. Smith",
      "bio": "Professor of Mathematics"
    },
    "isActive": true,
    "isSaved": false,
    "savedAt": null,
    "createdAt": "2023-01-15T10:30:00.000Z",
    "updatedAt": "2023-01-15T10:30:00.000Z"
  }
}
```

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/courses/507f1f77bcf86cd799439011"
```

**Error Responses:**

*400 Bad Request:* Invalid course ID format
```json
{
  "success": false,
  "message": "Invalid course ID format"
}
```

*404 Not Found:* Course not found
```json
{
  "success": false,
  "message": "Course not found"
}
```

#### 3. Save Course

**Endpoint:** `POST /api/courses/:id/save`

**Description:** Save a course to the authenticated user's saved content.

**Authentication:** Required (JWT Bearer token)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the course |

**Request Body (optional):**
```json
{
  "notes": "Personal notes about this course"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Course saved successfully",
  "savedContentId": "507f1f77bcf86cd799439011"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/courses/507f1f77bcf86cd799439011/save" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Important course for exam prep"}'
```

**Error Responses:**

*400 Bad Request:* Invalid course ID
```json
{
  "success": false,
  "message": "Invalid course ID format"
}
```

*401 Unauthorized:* No valid token provided
```json
{
  "success": false,
  "message": "No token provided. Authorization header required."
}
```

*404 Not Found:* Course not found
```json
{
  "success": false,
  "message": "Course not found"
}
```

*409 Conflict:* Course already saved
```json
{
  "success": false,
  "message": "Course is already saved",
  "savedContentId": "507f1f77bcf86cd799439011"
}
```

#### 4. Unsave Course

**Endpoint:** `DELETE /api/courses/:id/save`

**Description:** Remove a course from the authenticated user's saved content.

**Authentication:** Required (JWT Bearer token)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the course |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Course unsaved successfully"
}
```

**Example Request:**
```bash
curl -X DELETE "http://localhost:3001/api/courses/507f1f77bcf86cd799439011/save" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Error Responses:**

*400 Bad Request:* Invalid course ID
```json
{
  "success": false,
  "message": "Invalid course ID format"
}
```

*401 Unauthorized:* No valid token provided
```json
{
  "success": false,
  "message": "No token provided. Authorization header required."
}
```

*404 Not Found:* Course not found in saved content
```json
{
  "success": false,
  "message": "Saved course not found"
}
```

#### 5. Get User's Saved Courses

**Endpoint:** `GET /api/courses/user/saved`

**Description:** Retrieve all courses saved by the authenticated user.

**Authentication:** Required (JWT Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `page` | number | No | Page number (default: 1) | `1`, `2` |
| `limit` | number | No | Items per page (default: 10) | `5`, `10` |

**Success Response (200 OK):**
```json
{
  "success": true,
  "courses": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Data Structures",
      "description": "Learn fundamental data structures",
      "subject": "Programming",
      "educationLevel": "University",
      "language": "en",
      "source": "Coursera",
      "duration": 360,
      "thumbnail": "https://example.com/data-structures.jpg",
      "difficulty": "intermediate",
      "tags": ["algorithms", "programming"],
      "isActive": true,
      "isSaved": true,
      "savedAt": "2023-01-20T14:30:00.000Z",
      "notes": "Review before technical interview",
      "savedContentId": "507f1f77bcf86cd799439012",
      "createdAt": "2023-01-15T10:30:00.000Z",
      "updatedAt": "2023-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "pages": 1,
    "limit": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Example Requests:**

```bash
# Get all saved courses
curl -X GET "http://localhost:3001/api/courses/user/saved" \
  -H "Authorization: Bearer <your-jwt-token>"

# Get saved courses with pagination
curl -X GET "http://localhost:3001/api/courses/user/saved?page=1&limit=5" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Error Responses:**

*401 Unauthorized:* No valid token provided
```json
{
  "success": false,
  "message": "No token provided. Authorization header required."
}
```

## Books API

### Base URL: `/api/books`

#### 1. Get All Books

**Endpoint:** `GET /api/books`

**Description:** Retrieve all books with optional filtering, searching, and pagination.

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `subject` | string | No | Filter by subject | `Math`, `Science`, `Languages`, `Programming`, `Other` |
| `educationLevel` | string | No | Filter by education level | `HighSchool`, `University`, `SelfPaced` |
| `language` | string | No | Filter by language | `ar`, `en`, `bilingual` |
| `search` | string | No | Search in title, description, author, publisher, source | `programming`, `smith` |
| `page` | number | No | Page number (default: 1) | `1`, `2`, `3` |
| `limit` | number | No | Items per page (default: 10) | `5`, `10`, `20` |

**Success Response (200 OK):**
```json
{
  "success": true,
  "books": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "description": "A handbook of agile software craftsmanship",
      "subject": "Programming",
      "educationLevel": "University",
      "language": "en",
      "source": "Prentice Hall",
      "isbn": "978-0132350884",
      "pages": 464,
      "publicationYear": 2008,
      "publisher": "Prentice Hall",
      "cover": "https://example.com/clean-code.jpg",
      "difficulty": "intermediate",
      "tags": ["programming", "best-practices", "clean-code"],
      "isActive": true,
      "isSaved": false,
      "createdAt": "2023-01-15T10:30:00.000Z",
      "updatedAt": "2023-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 18,
    "page": 1,
    "pages": 2,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Example Requests:**

```bash
# Get all books
curl -X GET "http://localhost:3001/api/books"

# Filter by subject
curl -X GET "http://localhost:3001/api/books?subject=Programming"

# Search books
curl -X GET "http://localhost:3001/api/books?search=clean code"

# Filter by language and pagination
curl -X GET "http://localhost:3001/api/books?language=en&page=1&limit=5"
```

#### 2. Get Single Book

**Endpoint:** `GET /api/books/:id`

**Description:** Retrieve a specific book by its ID.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the book |

**Success Response (200 OK):**
```json
{
  "success": true,
  "book": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen",
    "description": "Comprehensive textbook on algorithms",
    "subject": "Programming",
    "educationLevel": "University",
    "language": "en",
    "source": "MIT Press",
    "isbn": "978-0262033848",
    "pages": 1312,
    "publicationYear": 2009,
    "publisher": "MIT Press",
    "cover": "https://example.com/algorithms.jpg",
    "difficulty": "advanced",
    "tags": ["algorithms", "data-structures", "computer-science"],
    "isActive": true,
    "isSaved": true,
    "savedAt": "2023-01-18T09:15:00.000Z",
    "createdAt": "2023-01-15T10:30:00.000Z",
    "updatedAt": "2023-01-15T10:30:00.000Z"
  }
}
```

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/books/507f1f77bcf86cd799439013"
```

#### 3. Save Book

**Endpoint:** `POST /api/books/:id/save`

**Description:** Save a book to the authenticated user's saved content.

**Authentication:** Required (JWT Bearer token)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the book |

**Request Body (optional):**
```json
{
  "notes": "Read this book for interview preparation"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Book saved successfully",
  "savedContentId": "507f1f77bcf86cd799439014"
}
```

#### 4. Unsave Book

**Endpoint:** `DELETE /api/books/:id/save`

**Description:** Remove a book from the authenticated user's saved content.

**Authentication:** Required (JWT Bearer token)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Book unsaved successfully"
}
```

#### 5. Get User's Saved Books

**Endpoint:** `GET /api/books/user/saved`

**Description:** Retrieve all books saved by the authenticated user.

**Authentication:** Required (JWT Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `page` | number | No | Page number (default: 1) | `1`, `2` |
| `limit` | number | No | Items per page (default: 10) | `5`, `10` |

**Success Response (200 OK):**
```json
{
  "success": true,
  "books": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Design Patterns",
      "author": "Erich Gamma",
      "description": "Elements of reusable object-oriented software",
      "subject": "Programming",
      "educationLevel": "University",
      "language": "en",
      "source": "Addison-Wesley",
      "isbn": "978-0201633612",
      "pages": 395,
      "publicationYear": 1994,
      "publisher": "Addison-Wesley",
      "cover": "https://example.com/design-patterns.jpg",
      "difficulty": "advanced",
      "tags": ["design-patterns", "oop", "software-engineering"],
      "isActive": true,
      "isSaved": true,
      "savedAt": "2023-01-22T16:45:00.000Z",
      "notes": "Essential for senior developer role",
      "savedContentId": "507f1f77bcf86cd799439015",
      "createdAt": "2023-01-15T10:30:00.000Z",
      "updatedAt": "2023-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "pages": 2,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Authentication Examples

### Getting a JWT Token

First, authenticate using the Auth API:

```bash
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Using the Token

Save the token and use it in protected endpoints:

```bash
# Save a course
curl -X POST "http://localhost:3001/api/courses/507f1f77bcf86cd799439011/save" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"notes": "Important course for exam"}'

# Get saved courses
curl -X GET "http://localhost:3001/api/courses/user/saved" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Filter Values

### Subject
- `Math` - Mathematics courses/books
- `Science` - Science courses/books  
- `Languages` - Language learning content
- `Programming` - Programming and computer science
- `Other` - Other subjects

### Education Level
- `HighSchool` - High school level content
- `University` - University/college level content
- `SelfPaced` - Self-paced learning content

### Language
- `ar` - Arabic content
- `en` - English content
- `bilingual` - Content available in multiple languages

## Search Functionality

Search is case-insensitive and matches partial text in:
- **Courses:** title, description, source, tags
- **Books:** title, description, author, publisher, source, tags

Search examples:
- `algebra` - matches "Introduction to Algebra"
- `programming` - matches "Programming Fundamentals"
- `smith` - matches books by "John Smith"
- `khan` - matches content from "Khan Academy"

## Pagination

All list endpoints support pagination:

- `page`: Page number (starts at 1)
- `limit`: Items per page (default: 10)

Response includes pagination metadata:
- `total`: Total number of items
- `page`: Current page
- `pages`: Total number of pages
- `limit`: Items per page
- `hasNextPage`: Whether there's a next page
- `hasPrevPage`: Whether there's a previous page

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Detailed error (development only)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited:
- 100 requests per 15 minutes per IP address
- Rate limit headers are included in responses

## Response Enhancement for Authenticated Users

When users are authenticated, course/book responses include additional fields:

- `isSaved`: Boolean indicating if the user has saved this content
- `savedAt`: Timestamp when the content was saved (if applicable)

This allows the frontend to show appropriate save/unsave buttons and user-specific information.

## Testing with Postman

Import these endpoints into Postman for easy testing:

```
GET {{baseUrl}}/api/courses
GET {{baseUrl}}/api/courses/{{courseId}}
POST {{baseUrl}}/api/courses/{{courseId}}/save
DELETE {{baseUrl}}/api/courses/{{courseId}}/save
GET {{baseUrl}}/api/courses/user/saved

GET {{baseUrl}}/api/books
GET {{baseUrl}}/api/books/{{bookId}}
POST {{baseUrl}}/api/books/{{bookId}}/save
DELETE {{baseUrl}}/api/books/{{bookId}}/save
GET {{baseUrl}}/api/books/user/saved
```

Set up environment variables:
- `baseUrl`: `http://localhost:3001`
- `courseId`: Valid course ObjectId
- `bookId`: Valid book ObjectId
- `token`: JWT token from login

## Development Notes

### Database Queries

The API uses optimized MongoDB queries with:
- Compound indexes for filtering performance
- Text search using MongoDB regex
- Pagination with skip/limit
- Population of saved status for authenticated users

### Security Features

- JWT authentication for protected endpoints
- Input validation for all parameters
- Rate limiting to prevent abuse
- MongoDB injection prevention
- CORS configuration for frontend integration

### Performance Optimizations

- Database indexes on frequently queried fields
- Pagination to limit response sizes
- Lean queries to reduce memory usage
- Optional authentication that doesn't block public access
- Efficient saved status checking for authenticated users