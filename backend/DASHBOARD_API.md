# Dashboard API Documentation

## Overview
The Dashboard API provides endpoints for user statistics, progress tracking, and learning insights. All endpoints require JWT authentication.

**Base URL:** `/api/dashboard`

**Authentication:** All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Table of Contents
- [Get User Statistics](#get-user-statistics)
- [Get User Progress](#get-user-progress)
- [Get Saved Content](#get-saved-content)
- [Get Study Todos](#get-study-todos)
- [Create Study Todo](#create-study-todo)
- [Update Study Todo](#update-study-todo)
- [Delete Study Todo](#delete-study-todo)
- [Update Progress](#update-progress)

---

## Get User Statistics

Get comprehensive learning statistics and overview for the authenticated user.

### Endpoint
```
GET /api/dashboard/stats
```

### Request Headers
```
Authorization: Bearer <token>
```

### Response (200 OK)
```json
{
  "success": true,
  "stats": {
    "totalSavedCourses": 5,
    "totalSavedBooks": 3,
    "totalCoursesCompleted": 2,
    "totalBooksCompleted": 1,
    "averageProgress": 65,
    "totalLearningHours": 12.5,
    "joinDate": "2024-01-01T00:00:00.000Z",
    "lastActivityDate": "2024-01-15T10:30:00.000Z"
  }
}
```

### Statistics Calculation Details

- **totalSavedCourses**: Count of saved courses in user's saved content
- **totalSavedBooks**: Count of saved books in user's saved content
- **totalCoursesCompleted**: Count of courses with progress >= 100% and completed date set
- **totalBooksCompleted**: Count of books with progress >= 100% and completed date set
- **averageProgress**: Average of all completion percentages across all progress records (0-100)
- **totalLearningHours**: Sum of durations (in hours) of completed courses
- **joinDate**: User account creation date
- **lastActivityDate**: Most recent lastAccessedAt from any progress record

### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "message": "No token provided. Authorization header required.",
  "statusCode": 401
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Server error fetching statistics",
  "statusCode": 500
}
```

---

## Get User Progress

Get progress tracking data for all courses and books the user has interacted with.

### Endpoint
```
GET /api/dashboard/progress
```

### Request Headers
```
Authorization: Bearer <token>
```

### Response (200 OK)
```json
{
  "success": true,
  "progress": [
    {
      "contentId": "507f1f77bcf86cd799439011",
      "contentType": "course",
      "title": "Introduction to Python",
      "thumbnail": "https://example.com/thumb.jpg",
      "completionPercentage": 75,
      "lastAccessedAt": "2024-01-15T10:30:00.000Z",
      "completedAt": null,
      "notes": "Great intro to basics"
    },
    {
      "contentId": "507f1f77bcf86cd799439012",
      "contentType": "book",
      "title": "Advanced Mathematics",
      "thumbnail": "https://example.com/cover.jpg",
      "completionPercentage": 100,
      "lastAccessedAt": "2024-01-14T15:20:00.000Z",
      "completedAt": "2024-01-14T15:20:00.000Z",
      "notes": "Finished all chapters"
    }
  ]
}
```

### Response Fields
- **contentId**: ID of the course or book
- **contentType**: Either "course" or "book"
- **title**: Content title
- **thumbnail**: Thumbnail or cover image URL
- **completionPercentage**: Progress percentage (0-100)
- **lastAccessedAt**: Last access timestamp
- **completedAt**: Completion timestamp (null if not completed)
- **notes**: User notes about the progress

### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Invalid token",
  "statusCode": 401
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Server error fetching progress",
  "statusCode": 500
}
```

---

## Get Saved Content

Get summary of saved courses and books with filtering options.

### Endpoint
```
GET /api/dashboard/saved-content
```

### Request Headers
```
Authorization: Bearer <token>
```

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| type | string | No | all | Filter by type: "courses", "books", or "all" |
| limit | number | No | 10 | Number of items to return (1-100) |

### Example Requests
```
GET /api/dashboard/saved-content
GET /api/dashboard/saved-content?type=courses
GET /api/dashboard/saved-content?type=books&limit=20
```

### Response (200 OK)
```json
{
  "success": true,
  "courses": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Introduction to Python",
      "description": "Learn Python from scratch",
      "subject": "Programming",
      "educationLevel": "University",
      "language": "en",
      "source": "Coursera",
      "thumbnail": "https://example.com/thumb.jpg",
      "duration": 120,
      "savedAt": "2024-01-10T10:00:00.000Z"
    }
  ],
  "books": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Advanced Mathematics",
      "author": "John Doe",
      "subject": "Math",
      "educationLevel": "University",
      "language": "en",
      "source": "MIT Press",
      "cover": "https://example.com/cover.jpg",
      "pages": 450,
      "savedAt": "2024-01-09T15:30:00.000Z"
    }
  ],
  "total": 2
}
```

### Error Responses

**400 Bad Request** - Invalid limit
```json
{
  "success": false,
  "message": "Limit must be between 1 and 100",
  "statusCode": 400
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Token expired",
  "statusCode": 401
}
```

---

## Get Study Todos

Get user's study tasks and to-do items with filtering options.

### Endpoint
```
GET /api/dashboard/todos
```

### Request Headers
```
Authorization: Bearer <token>
```

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| status | string | No | pending | Filter by status: "pending", "in_progress", "completed", or "all" |
| limit | number | No | 10 | Number of items to return (1-100) |

### Example Requests
```
GET /api/dashboard/todos
GET /api/dashboard/todos?status=in_progress
GET /api/dashboard/todos?status=completed&limit=20
```

### Response (200 OK)
```json
{
  "success": true,
  "todos": [
    {
      "id": "507f1f77bcf86cd799439013",
      "title": "Complete Python basics chapter",
      "description": "Finish modules 1-5",
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2024-01-20T00:00:00.000Z",
      "completedAt": null,
      "relatedCourse": {
        "id": "507f1f77bcf86cd799439011",
        "title": "Introduction to Python"
      },
      "relatedBook": null,
      "createdAt": "2024-01-10T10:00:00.000Z"
    },
    {
      "id": "507f1f77bcf86cd799439014",
      "title": "Read Mathematics Chapter 3",
      "description": "Focus on calculus section",
      "status": "pending",
      "priority": "medium",
      "dueDate": "2024-01-18T00:00:00.000Z",
      "completedAt": null,
      "relatedCourse": null,
      "relatedBook": {
        "id": "507f1f77bcf86cd799439012",
        "title": "Advanced Mathematics"
      },
      "createdAt": "2024-01-09T15:30:00.000Z"
    }
  ],
  "total": 2,
  "byStatus": {
    "pending": 1,
    "in_progress": 1,
    "completed": 0
  }
}
```

### Response Fields
- **id**: Todo unique identifier
- **title**: Todo title
- **description**: Detailed description (optional)
- **status**: "pending", "in_progress", or "completed"
- **priority**: "low", "medium", or "high"
- **dueDate**: Due date timestamp (optional)
- **completedAt**: Completion timestamp (null if not completed)
- **relatedCourse**: Associated course info (optional)
- **relatedBook**: Associated book info (optional)
- **createdAt**: Creation timestamp
- **total**: Total todos matching filter
- **byStatus**: Count of todos by status

### Error Responses

**400 Bad Request** - Invalid parameters
```json
{
  "success": false,
  "message": "Status must be one of: pending, in_progress, completed",
  "statusCode": 400
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "No token provided. Authorization header required.",
  "statusCode": 401
}
```

---

## Create Study Todo

Create a new study task or to-do item.

### Endpoint
```
POST /api/dashboard/todos
```

### Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body
```json
{
  "title": "Complete Python basics chapter",
  "description": "Finish modules 1-5",
  "priority": "high",
  "dueDate": "2024-01-20T00:00:00.000Z",
  "courseId": "507f1f77bcf86cd799439011"
}
```

### Request Body Fields
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| title | string | Yes | - | Todo title (max 200 chars) |
| description | string | No | null | Todo description (max 1000 chars) |
| priority | string | No | "medium" | "low", "medium", or "high" |
| dueDate | string | No | null | Due date (ISO 8601 timestamp, must be future) |
| courseId | string | No | null | Related course ID |
| bookId | string | No | null | Related book ID |

**Note:** Either courseId or bookId can be provided, but not both. Create standalone todos by omitting both.

### Response (201 Created)
```json
{
  "success": true,
  "message": "Todo created",
  "todoId": "507f1f77bcf86cd799439013"
}
```

### Error Responses

**400 Bad Request** - Missing required field
```json
{
  "success": false,
  "message": "Title is required",
  "statusCode": 400
}
```

**400 Bad Request** - Invalid priority
```json
{
  "success": false,
  "message": "Priority must be one of: low, medium, high",
  "statusCode": 400
}
```

**400 Bad Request** - Invalid due date
```json
{
  "success": false,
  "message": "Due date must be in the future",
  "statusCode": 400
}
```

**404 Not Found** - Invalid courseId/bookId
```json
{
  "success": false,
  "message": "Course not found",
  "statusCode": 404
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Invalid token",
  "statusCode": 401
}
```

---

## Update Study Todo

Update an existing study task or to-do item.

### Endpoint
```
PATCH /api/dashboard/todos/:todoId
```

### Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| todoId | string | Yes | Todo ID to update |

### Request Body
```json
{
  "title": "Complete Python basics chapter (updated)",
  "status": "completed",
  "priority": "high",
  "dueDate": "2024-01-25T00:00:00.000Z"
}
```

### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | Updated title |
| description | string | No | Updated description |
| status | string | No | "pending", "in_progress", or "completed" |
| priority | string | No | "low", "medium", or "high" |
| dueDate | string | No | Updated due date (must be future) |

**Note:** Only include fields you want to update. All fields are optional.

### Response (200 OK)
```json
{
  "success": true,
  "message": "Todo updated"
}
```

### Error Responses

**400 Bad Request** - Invalid status
```json
{
  "success": false,
  "message": "Status must be one of: pending, in_progress, completed",
  "statusCode": 400
}
```

**403 Forbidden** - Not owner
```json
{
  "success": false,
  "message": "Not authorized to update this todo",
  "statusCode": 403
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Todo not found",
  "statusCode": 404
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Token expired",
  "statusCode": 401
}
```

---

## Delete Study Todo

Delete a study task or to-do item permanently.

### Endpoint
```
DELETE /api/dashboard/todos/:todoId
```

### Request Headers
```
Authorization: Bearer <token>
```

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| todoId | string | Yes | Todo ID to delete |

### Response (200 OK)
```json
{
  "success": true,
  "message": "Todo deleted"
}
```

### Error Responses

**403 Forbidden** - Not owner
```json
{
  "success": false,
  "message": "Not authorized to delete this todo",
  "statusCode": 403
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Todo not found",
  "statusCode": 404
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Invalid token",
  "statusCode": 401
}
```

---

## Update Progress

Update progress tracking for a course or book.

### Endpoint
```
PATCH /api/dashboard/progress/:contentId
```

### Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| contentId | string | Yes | Course or Book ID |

### Request Body
```json
{
  "completionPercentage": 75,
  "notes": "Making good progress"
}
```

### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| completionPercentage | number | No | Progress percentage (0-100) |
| notes | string | No | User notes (max 2000 chars) |
| courseId | string | No | Specify if contentId refers to a course |
| bookId | string | No | Specify if contentId refers to a book |

**Note:**
- Either `completionPercentage` or `notes` must be provided
- If `completionPercentage` is 100, `completedAt` timestamp is automatically set
- If `completionPercentage` is below 100, `completedAt` is cleared

### Response (200 OK)
```json
{
  "success": true,
  "message": "Progress updated",
  "completionPercentage": 75
}
```

### Behavior Notes

1. **New Progress Record**: If no progress exists for the user-content pair, a new record is created
2. **Existing Progress Record**: If progress exists, it's updated
3. **Completion at 100%**: When progress reaches 100%, `completedAt` timestamp is set
4. **Partial Progress**: When progress drops below 100%, `completedAt` is cleared
5. **Last Access**: `lastAccessedAt` is always updated to current timestamp

### Error Responses

**400 Bad Request** - Invalid completion percentage
```json
{
  "success": false,
  "message": "Completion percentage must be between 0 and 100",
  "statusCode": 400
}
```

**404 Not Found** - Content not found
```json
{
  "success": false,
  "message": "Course not found",
  "statusCode": 404
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "No token provided. Authorization header required.",
  "statusCode": 401
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Server error updating progress",
  "statusCode": 500
}
```

---

## Testing Scenarios

### Scenario 1: Get Statistics
```bash
# Request
curl -X GET http://localhost:3001/api/dashboard/stats \
  -H "Authorization: Bearer <token>"

# Expected: User statistics with counts, averages, and timestamps
```

### Scenario 2: Get Progress
```bash
# Request
curl -X GET http://localhost:3001/api/dashboard/progress \
  -H "Authorization: Bearer <token>"

# Expected: Array of progress records for all content
```

### Scenario 3: Get Saved Content
```bash
# Request
curl -X GET "http://localhost:3001/api/dashboard/saved-content?type=courses&limit=5" \
  -H "Authorization: Bearer <token>"

# Expected: Saved courses with limit applied
```

### Scenario 4: Create Todo
```bash
# Request
curl -X POST http://localhost:3001/api/dashboard/todos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete assignment",
    "description": "Finish all exercises",
    "priority": "high",
    "dueDate": "2024-01-25T00:00:00.000Z",
    "courseId": "507f1f77bcf86cd799439011"
  }'

# Expected: Created todo with todoId
```

### Scenario 5: Update Todo Status
```bash
# Request
curl -X PATCH http://localhost:3001/api/dashboard/todos/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'

# Expected: Todo marked as completed
```

### Scenario 6: Delete Todo
```bash
# Request
curl -X DELETE http://localhost:3001/api/dashboard/todos/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer <token>"

# Expected: Todo deleted successfully
```

### Scenario 7: Update Progress to 50%
```bash
# Request
curl -X PATCH http://localhost:3001/api/dashboard/progress/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "completionPercentage": 50,
    "notes": "Halfway through"
  }'

# Expected: Progress updated to 50%
```

### Scenario 8: Mark Content as Complete
```bash
# Request
curl -X PATCH http://localhost:3001/api/dashboard/progress/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "completionPercentage": 100
  }'

# Expected: Progress updated to 100%, completedAt timestamp set
```

### Scenario 9: Access Without Token
```bash
# Request
curl -X GET http://localhost:3001/api/dashboard/stats

# Expected: 401 Unauthorized
```

### Scenario 10: Filter Todos by Status
```bash
# Request
curl -X GET "http://localhost:3001/api/dashboard/todos?status=pending&limit=5" \
  -H "Authorization: Bearer <token>"

# Expected: Pending todos only
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": <HTTP_STATUS_CODE>
}
```

### Common HTTP Status Codes
- **200 OK**: Successful GET, PATCH, DELETE
- **201 Created**: Successful POST
- **400 Bad Request**: Invalid request body or parameters
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Not authorized to access resource
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Notes

1. **Authentication**: All endpoints require a valid JWT token
2. **Timestamps**: All dates are ISO 8601 formatted strings
3. **Pagination**: Use `limit` parameter to control response size
4. **Ownership**: Users can only update/delete their own todos
5. **Progress Auto-management**: `completedAt` is automatically managed based on completion percentage
6. **Due Dates**: Must be in the future (same day is allowed)
7. **Content References**: Todos can be linked to courses or books for better organization
