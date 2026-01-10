# Authentication API Documentation

## Overview

The Authentication API provides secure user authentication using JSON Web Tokens (JWT). All endpoints follow REST conventions and return JSON responses.

## Base URL

```
http://localhost:3001/api/auth
```

## Authentication

Most endpoints are public, but protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Sign Up (Register New User)

Register a new user account with email and password.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "language": "en"
}
```

**Request Parameters:**

| Field   | Type   | Required | Description                                  |
|---------|--------|----------|----------------------------------------------|
| email   | string | Yes      | Valid email address (unique)                 |
| password| string | Yes      | Minimum 6 characters                          |
| name    | string | Yes      | User's full name                             |
| language| string | No       | Language preference: 'ar' or 'en' (default: 'en') |

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "507f1f77bcf86cd799439011",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

**400 Bad Request** - Email already exists:
```json
{
  "success": false,
  "message": "Email already registered",
  "statusCode": 400
}
```

**400 Bad Request** - Validation error:
```json
{
  "success": false,
  "message": "Please provide a valid email address",
  "statusCode": 400
}
```

**400 Bad Request** - Password too short:
```json
{
  "success": false,
  "message": "Password must be at least 6 characters long",
  "statusCode": 400
}
```

---

### 2. Login

Authenticate with email and password to receive a JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Request Parameters:**

| Field   | Type   | Required | Description        |
|---------|--------|----------|--------------------|
| email   | string | Yes      | User's email       |
| password| string | Yes      | User's password    |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "language": "en",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

**401 Unauthorized** - Invalid credentials:
```json
{
  "success": false,
  "message": "Invalid email or password",
  "statusCode": 401
}
```

**401 Unauthorized** - Account deactivated:
```json
{
  "success": false,
  "message": "Account has been deactivated",
  "statusCode": 401
}
```

---

### 3. Logout

Log out the current user. Since we use stateless JWT tokens, logout is handled client-side by removing the token from storage.

**Endpoint:** `POST /api/auth/logout`

**Request Headers:** None required (token optional)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Note:** Client should remove the JWT token from localStorage or sessionStorage after logout.

---

### 4. Get Current User

Get information about the currently authenticated user.

**Endpoint:** `GET /api/auth/me`

**Request Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "language": "en",
    "avatar": null,
    "role": "user",
    "createdAt": "2024-01-10T12:00:00.000Z"
  }
}
```

**Error Responses:**

**401 Unauthorized** - No token provided:
```json
{
  "success": false,
  "message": "No token provided. Authorization header required.",
  "statusCode": 401
}
```

**401 Unauthorized** - Invalid token:
```json
{
  "success": false,
  "message": "Invalid token",
  "statusCode": 401
}
```

**401 Unauthorized** - Token expired:
```json
{
  "success": false,
  "message": "Token expired",
  "statusCode": 401
}
```

**404 Not Found** - User not found:
```json
{
  "success": false,
  "message": "User not found",
  "statusCode": 404
}
```

---

## JWT Token Details

### Token Structure

The JWT token contains the following payload:

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "iat": 1704883200,
  "exp": 1705488000
}
```

### Token Expiry

- **Expiry Time:** 7 days from issue
- **Algorithm:** HS256
- **Secret:** Retrieved from `JWT_SECRET` environment variable

### Token Usage

1. After signup or login, store the token in localStorage or a secure cookie
2. Include the token in the `Authorization` header for protected endpoints:
   ```
   Authorization: Bearer <token>
   ```
3. When token expires, user must login again to get a new token

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### HTTP Status Codes

| Code | Description                     |
|------|---------------------------------|
| 200  | Success                         |
| 201  | Created (signup success)        |
| 400  | Bad Request (validation error)  |
| 401  | Unauthorized (auth required)    |
| 404  | Not Found                       |
| 500  | Internal Server Error           |

---

## Testing Examples

### Using cURL

**Sign Up:**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "language": "en"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Logout:**
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Using Postman

1. **Sign Up:**
   - Method: POST
   - URL: `http://localhost:3001/api/auth/signup`
   - Headers: `Content-Type: application/json`
   - Body: JSON with email, password, name, language

2. **Login:**
   - Method: POST
   - URL: `http://localhost:3001/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body: JSON with email, password
   - Save the token from response

3. **Get Me:**
   - Method: GET
   - URL: `http://localhost:3001/api/auth/me`
   - Headers: `Authorization: Bearer <token>`

---

## Security Features

1. **Password Hashing:** All passwords are hashed using bcryptjs with 12 salt rounds
2. **JWT Tokens:** Secure token-based authentication with 7-day expiry
3. **Rate Limiting:** API endpoints protected against brute force attacks
4. **CORS:** Configured to prevent cross-origin attacks
5. **Helmet:** Security headers for Express.js
6. **Input Validation:** All inputs are validated before processing

---

## Client-Side Implementation Guide

### Storing the Token

```javascript
// After successful login/signup
const login = async (email, password) => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    return data;
  }
  
  throw new Error(data.message);
};
```

### Making Authenticated Requests

```javascript
const fetchProtectedData = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3001/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    // Handle unauthorized (token expired or invalid)
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Request failed');
  }
  
  return await response.json();
};
```

### Logout Implementation

```javascript
const logout = async () => {
  try {
    await fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always remove token from client-side storage
    localStorage.removeItem('token');
    // Redirect to login page
    window.location.href = '/login';
  }
};
```

---

## Token Refresh

Currently, tokens expire after 7 days. When a token expires, the user must login again to get a new token. In a future enhancement, you could implement refresh tokens for a better user experience.

---

## Environment Variables

Ensure these are set in your `.env` file:

```
# JWT Secret for token generation
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxxx.mongodb.net/educational_platform?retryWrites=true&w=majority
```

**Important:** Use a strong, random JWT_SECRET in production!

---

## Common Issues and Solutions

### Issue: "Invalid token" error
- **Cause:** Token is malformed or has been tampered with
- **Solution:** Login again to get a fresh token

### Issue: "Token expired" error
- **Cause:** Token has exceeded 7-day expiry
- **Solution:** Login again to get a fresh token

### Issue: "Email already registered"
- **Cause:** Trying to signup with an existing email
- **Solution:** Use a different email or login with existing account

### Issue: CORS errors
- **Cause:** Frontend URL not in CORS whitelist
- **Solution:** Update CORS origin in `server.js` or set `NODE_ENV=development`

---

## Next Steps

After implementing authentication, you can:

1. Create protected routes for courses, books, progress tracking
2. Implement role-based access control (admin, moderator)
3. Add refresh tokens for better UX
4. Implement email verification
5. Add password reset functionality
6. Create social authentication (Google, Facebook, etc.)
