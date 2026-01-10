# Content API Documentation (Courses & Books)

## Overview

This document describes the REST API endpoints for listing and retrieving courses and books, including filtering, searching, pagination, and save/unsave functionality.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Most endpoints are public, but **save/unsave** and **user saved lists** require a valid JWT token.

Provide the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Optional authentication (isSaved / savedAt)

The list and detail endpoints are public, but if you include a valid JWT token, the API will enrich course/book responses with:

- `isSaved`: boolean
- `savedAt`: ISO timestamp or `null`

If you do not include a token (or the token is invalid), those fields are omitted.

---

## Common Query Parameters

### Filters

| Parameter        | Type   | Allowed values                                  |
|-----------------|--------|--------------------------------------------------|
| subject         | string | `Math`, `Science`, `Languages`, `Programming`    |
| educationLevel  | string | `HighSchool`, `University`, `SelfPaced`          |
| language        | string | `ar`, `en`, `bilingual`                          |

### Search

| Parameter | Type   | Description |
|----------|--------|-------------|
| search   | string | Case-insensitive substring search on `title` and `description` (MongoDB regex). |

### Pagination

| Parameter | Type   | Default | Notes |
|----------|--------|---------|------|
| page     | number | 1       | Must be a positive integer |
| limit    | number | 10      | Must be a positive integer, max 100 |

---

# Courses

## 1) List Courses

**Endpoint:** `GET /courses`

**Query Parameters (optional):** `subject`, `educationLevel`, `language`, `search`, `page`, `limit`

**Success Response (200 OK):**
```json
{
  "success": true,
  "courses": [],
  "total": 0,
  "page": 1,
  "pages": 0
}
```

**Example (filter + search + pagination):**
```bash
curl "http://localhost:3001/api/courses?subject=Math&educationLevel=HighSchool&search=algebra&page=1&limit=10"
```

**Example (include isSaved if authenticated):**
```bash
curl "http://localhost:3001/api/courses?search=python" \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 2) Get Course By ID

**Endpoint:** `GET /courses/:id`

**Success Response (200 OK):**
```json
{
  "success": true,
  "course": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Intro to Algebra",
    "description": "..."
  }
}
```

**Errors:**
- `404 Not Found` if the course does not exist

**Example:**
```bash
curl "http://localhost:3001/api/courses/507f1f77bcf86cd799439011"
```

---

## 3) Save a Course (Protected)

**Endpoint:** `POST /courses/:id/save`

**Request Body (optional):**
```json
{
  "notes": "optional notes"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Course saved",
  "savedContentId": "507f1f77bcf86cd799439012"
}
```

**Errors:**
- `401 Unauthorized` if not authenticated
- `404 Not Found` if the course does not exist

**Example:**
```bash
curl -X POST "http://localhost:3001/api/courses/507f1f77bcf86cd799439011/save" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"notes":"Watch again later"}'
```

---

## 4) Unsave a Course (Protected)

**Endpoint:** `DELETE /courses/:id/save`

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Course unsaved"
}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3001/api/courses/507f1f77bcf86cd799439011/save" \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 5) Get User Saved Courses (Protected)

**Endpoint:** `GET /courses/user/saved`

**Query Parameters (optional):** `page`, `limit`

**Success Response (200 OK):**
```json
{
  "success": true,
  "courses": [],
  "total": 0,
  "page": 1,
  "pages": 0
}
```

**Example:**
```bash
curl "http://localhost:3001/api/courses/user/saved?page=1&limit=10" \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

# Books

## 1) List Books

**Endpoint:** `GET /books`

**Query Parameters (optional):** `subject`, `educationLevel`, `language`, `search`, `page`, `limit`

**Success Response (200 OK):**
```json
{
  "success": true,
  "books": [],
  "total": 0,
  "page": 1,
  "pages": 0
}
```

**Example:**
```bash
curl "http://localhost:3001/api/books?language=en&search=data%20structures&page=2&limit=5"
```

---

## 2) Get Book By ID

**Endpoint:** `GET /books/:id`

**Success Response (200 OK):**
```json
{
  "success": true,
  "book": {
    "_id": "507f1f77bcf86cd799439021",
    "title": "Discrete Mathematics",
    "description": "..."
  }
}
```

**Errors:**
- `404 Not Found` if the book does not exist

**Example:**
```bash
curl "http://localhost:3001/api/books/507f1f77bcf86cd799439021"
```

---

## 3) Save a Book (Protected)

**Endpoint:** `POST /books/:id/save`

**Request Body (optional):**
```json
{
  "notes": "optional notes"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Book saved",
  "savedContentId": "507f1f77bcf86cd799439022"
}
```

**Errors:**
- `401 Unauthorized` if not authenticated
- `404 Not Found` if the book does not exist

**Example:**
```bash
curl -X POST "http://localhost:3001/api/books/507f1f77bcf86cd799439021/save" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"notes":"Read chapters 1-3"}'
```

---

## 4) Unsave a Book (Protected)

**Endpoint:** `DELETE /books/:id/save`

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Book unsaved"
}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3001/api/books/507f1f77bcf86cd799439021/save" \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 5) Get User Saved Books (Protected)

**Endpoint:** `GET /books/user/saved`

**Query Parameters (optional):** `page`, `limit`

**Success Response (200 OK):**
```json
{
  "success": true,
  "books": [],
  "total": 0,
  "page": 1,
  "pages": 0
}
```

**Example:**
```bash
curl "http://localhost:3001/api/books/user/saved?page=1&limit=10" \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## Error Response Format

Errors from these endpoints follow this structure:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 400  | Bad Request (invalid filters, invalid id, invalid pagination params) |
| 401  | Unauthorized (missing/invalid token for protected endpoints) |
| 404  | Not Found (course/book not found) |
| 500  | Server Error |
