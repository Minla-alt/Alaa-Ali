# Recommendations API Documentation

## Overview

The Recommendations API provides AI-powered learning suggestions using OpenAI's GPT models to recommend personalized daily learning resources based on user profiles, learning history, and preferences.

## Features

- **AI-Powered Recommendations**: Uses OpenAI GPT models to generate intelligent learning suggestions
- **Personalized Content**: Considers user's learning history, progress, language preference, and subject interests
- **Rate Limiting**: Prevents excessive API calls with 1-hour rate limiting per user
- **Fallback System**: Provides alternative recommendations when AI service is unavailable
- **Feedback Collection**: Allows users to rate recommendations to improve future suggestions
- **Bilingual Support**: Supports both Arabic (ar) and English (en) languages

## Authentication

All endpoints require JWT authentication via Bearer token in the Authorization header.

```bash
Authorization: Bearer <your-jwt-token>
```

## Base URL

```
http://localhost:3001/api/recommendations
```

---

## Endpoints

### 1. Get Daily Recommendation

Get an AI-generated daily learning recommendation based on your profile and preferences.

**Endpoint**: `GET /daily`

**Query Parameters**:

| Parameter | Type | Required | Description | Valid Values |
|-----------|------|----------|-------------|--------------|
| `subject` | string | No | Filter by subject area | `Math`, `Science`, `Languages`, `Programming` |
| `timeAvailable` | number | No | Available time in minutes | 5-480 minutes |
| `forceRefresh` | boolean | No | Bypass cache to get new recommendation | `true`, `false` |

**Success Response (200 OK)**:

```json
{
  "success": true,
  "recommendation": {
    "id": "rec_1640995200000_60f7b9f8b8b8b8b8b8b8b8b",
    "type": "course",
    "title": "Introduction to JavaScript Fundamentals",
    "reason": "Based on your progress in programming and your available 60 minutes, this course will help you build solid JavaScript foundations. Your learning streak of 3 days shows great consistency!",
    "estimatedTime": 45,
    "difficulty": "beginner",
    "contentId": "60f7b9f8b8b8b8b8b8b8b8b",
    "sourceUrl": "https://example.com/course/javascript-fundamentals",
    "language": "en"
  },
  "generatedAt": "2024-01-01T12:00:00.000Z",
  "userProfile": {
    "preferredLanguage": "en",
    "totalSavedItems": 12,
    "averageProgress": 67,
    "learningStreak": 3
  },
  "cached": false
}
```

**Caching Behavior**:
- Recommendations are cached for 1 hour
- Same-day requests return cached recommendations unless `forceRefresh=true`
- Response includes `cached: true` when returning cached data

**Error Responses**:

**400 Bad Request** - Invalid parameters:
```json
{
  "success": false,
  "message": "Time available must be between 5 and 480 minutes"
}
```

**401 Unauthorized** - Missing/invalid token:
```json
{
  "success": false,
  "message": "Access token required"
}
```

**500 Server Error** - AI service unavailable:
```json
{
  "success": true,
  "recommendation": {
    "id": "fallback",
    "type": "course",
    "title": "Learning Fundamentals",
    "reason": "This course was selected as it matches your learning level",
    "estimatedTime": 30,
    "difficulty": "beginner",
    "contentId": null,
    "sourceUrl": null,
    "language": "en"
  },
  "generatedAt": "2024-01-01T12:00:00.000Z",
  "userProfile": {
    "preferredLanguage": "en",
    "totalSavedItems": 0,
    "averageProgress": 0,
    "learningStreak": 0
  },
  "fallback": true,
  "error": "AI service temporarily unavailable"
}
```

---

### 2. Submit Feedback

Submit feedback on a recommendation to help improve future suggestions.

**Endpoint**: `POST /feedback`

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recommendationId` | string | Yes | ID from the recommendation response |
| `helpful` | boolean | Yes | Whether the recommendation was helpful |
| `feedback` | string | No | Optional detailed feedback (max 500 chars) |

**Example Request**:

```json
{
  "recommendationId": "rec_1640995200000_60f7b9f8b8b8b8b8b8b8b8b",
  "helpful": true,
  "feedback": "Great recommendation! This course matched my skill level perfectly."
}
```

**Success Response (200 OK)**:

```json
{
  "success": true,
  "message": "Thank you for your feedback"
}
```

**Error Responses**:

**400 Bad Request** - Invalid input:
```json
{
  "success": false,
  "message": "recommendationId and helpful (boolean) are required"
}
```

**400 Bad Request** - Duplicate feedback:
```json
{
  "success": false,
  "message": "Feedback already submitted for this recommendation"
}
```

**404 Not Found** - Recommendation not found:
```json
{
  "success": false,
  "message": "Recommendation not found"
}
```

**401 Unauthorized** - Missing/invalid token:
```json
{
  "success": false,
  "message": "Access token required"
}
```

---

## How It Works

### AI Recommendation Process

1. **User Profile Analysis**: The system analyzes your learning history, saved content, progress, and preferences
2. **Content Filtering**: Filters available courses and books based on your language preference and optional subject filter
3. **OpenAI Integration**: Sends your profile and available resources to OpenAI GPT model
4. **Intelligent Matching**: AI selects the most suitable content based on your:
   - Current learning level and progress
   - Available time
   - Subject interests
   - Learning streak and consistency
   - Language preference
5. **Recommendation Generation**: AI provides personalized reasoning for the choice

### Rate Limiting

- **Limit**: 1 recommendation request per user per hour
- **Behavior**: Subsequent requests within the hour return cached recommendations
- **Bypass**: Use `forceRefresh=true` parameter to get new recommendations (still rate limited)

### Fallback System

When OpenAI API is unavailable:
1. System provides alternative recommendations based on:
   - Most popular courses/books in your language
   - Content matching your preferred subject (if specified)
   - Suitable difficulty level based on your progress
2. Response includes `fallback: true` flag
3. No recommendation is left without a suggestion

---

## Data Models

### Recommendation Schema

```javascript
{
  recommendationId: String,        // Unique recommendation ID
  userId: ObjectId,                // Reference to User
  contentId: ObjectId,             // Reference to Course or Book
  contentType: String,             // 'course' or 'book'
  title: String,                   // Content title
  reason: String,                  // AI-generated explanation
  estimatedTime: Number,           // Time in minutes
  difficulty: String,              // beginner/intermediate/advanced
  sourceUrl: String,               // External URL (optional)
  language: String,                // 'ar' or 'en'
  generatedAt: Date,               // When generated
  viewedAt: Date,                 // When viewed (optional)
  actionTaken: String,            // saved/ignored/opened/completed
  isActive: Boolean               // Whether recommendation is active
}
```

### Recommendation Feedback Schema

```javascript
{
  recommendationId: String,        // Reference to recommendation
  userId: ObjectId,                // Reference to User
  helpful: Boolean,                // User's rating
  feedback: String,                // Optional detailed feedback
  createdAt: Date                  // When feedback was submitted
}
```

---

## Environment Variables

Required environment variables for the recommendations system:

```env
# OpenAI Configuration (Required)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo

# Rate Limiting Configuration
RECOMMENDATION_RATE_LIMIT_MS=3600000  # 1 hour in milliseconds

# Standard Database Configuration
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
```

---

## Testing Scenarios

### 1. Basic Recommendation Request

```bash
curl -X GET "http://localhost:3001/api/recommendations/daily" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 2. Recommendation with Subject Filter

```bash
curl -X GET "http://localhost:3001/api/recommendations/daily?subject=Programming&timeAvailable=90" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 3. Force Refresh Cached Recommendation

```bash
curl -X GET "http://localhost:3001/api/recommendations/daily?forceRefresh=true" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 4. Submit Positive Feedback

```bash
curl -X POST "http://localhost:3001/api/recommendations/feedback" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recommendationId": "rec_1640995200000_60f7b9f8b8b8b8b8b8b8b8b",
    "helpful": true,
    "feedback": "Perfect recommendation for my skill level!"
  }'
```

### 5. Submit Negative Feedback

```bash
curl -X POST "http://localhost:3001/api/recommendations/feedback" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recommendationId": "rec_1640995200000_60f7b9f8b8b8b8b8b8b8b8b",
    "helpful": false,
    "feedback": "This was too advanced for my current level"
  }'
```

---

## Error Handling

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| 400 | Bad Request | Check parameter values and formats |
| 401 | Unauthorized | Ensure valid JWT token is provided |
| 404 | Not Found | Verify recommendation ID exists |
| 500 | Server Error | Check OpenAI API key and service status |

### Rate Limiting Response

When rate limit is exceeded:
```json
{
  "success": true,
  "recommendation": { /* cached recommendation */ },
  "generatedAt": "2024-01-01T12:00:00.000Z",
  "userProfile": { /* user profile */ },
  "cached": true
}
```

---

## Best Practices

1. **Cache Management**: Use cached recommendations when available to reduce API costs
2. **Feedback Submission**: Always provide feedback to improve recommendation quality
3. **Parameter Usage**: Use `timeAvailable` to get appropriately sized content
4. **Subject Filtering**: Narrow down recommendations by specifying interests
5. **Error Handling**: Implement fallback logic for when AI service is unavailable

---

## Performance Considerations

- **Caching**: Recommendations are cached for 1 hour to reduce OpenAI API calls
- **Database Indexing**: Optimized indexes on recommendation queries
- **Rate Limiting**: Prevents abuse and controls API costs
- **Fallback System**: Ensures service availability even when external AI is down

---

## Support

For issues or questions about the recommendations system:
1. Check the OpenAI API status
2. Verify environment variables are properly configured
3. Review the application logs for detailed error messages
4. Ensure database connection is stable