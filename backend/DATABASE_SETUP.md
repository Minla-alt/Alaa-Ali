# Database Setup Guide

## MongoDB Atlas Setup Instructions

This guide will walk you through setting up a free MongoDB Atlas cluster for the Bilingual Educational Platform.

### Prerequisites
- A valid email address
- Credit card information (required by MongoDB Atlas, but no charges for free tier)

---

## Step 1: Create MongoDB Atlas Account

1. **Visit MongoDB Atlas**: Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)

2. **Sign Up**: Click "Start Free" or "Sign Up"
   - Enter your email address
   - Create a strong password
   - Choose your preferred authentication method
   - Accept the Terms of Service

3. **Email Verification**: Check your email and verify your account

4. **Profile Setup**: Complete your profile information
   - Organization name (e.g., "My Educational Platform")
   - Project name (e.g., "Bilingual Educational Platform")

---

## Step 2: Create a Free Cluster

1. **Select Plan**: Choose the **FREE** plan (M0)
   - 512 MB storage
   - Shared RAM
   - Good for development and testing

2. **Cloud Provider**: Choose your preferred cloud provider
   - **AWS** (recommended for beginners)
   - **Google Cloud**
   - **Azure**

3. **Region Selection**: Choose a region closest to your location
   - For development, any region works
   - Consider latency for your target users

4. **Cluster Name**: Keep the default name or customize
   - Example: `Cluster0` or `EducationalPlatform`

5. **Create Cluster**: Click "Create Cluster"
   - ⚠️ **Note**: Cluster creation takes 1-3 minutes

---

## Step 3: Configure IP Whitelist

For development purposes, we'll allow access from any IP address.

1. **Navigate to Network Access**:
   - Click "Network Access" in the left sidebar
   - Or go to "Security" → "Network Access"

2. **Add IP Address**:
   - Click "Add IP Address"
   - Select "Allow access from anywhere" (0.0.0.0/0)
   - This is safe for development but **NOT recommended for production**

3. **Confirm**:
   - Add a comment: "Development environment access"
   - Click "Confirm"

⚠️ **Security Note**: For production, replace 0.0.0.0/0 with specific IP addresses.

---

## Step 4: Create Database User

1. **Navigate to Database Access**:
   - Click "Database Access" in the left sidebar
   - Or go to "Security" → "Database Access"

2. **Add New Database User**:
   - Click "Add New Database User"

3. **User Authentication**:
   - **Authentication Method**: Password
   - **User Name**: Choose a username (e.g., `edu_platform_user`)
   - **Password**: Generate a strong password or create your own
   - ⚠️ **Important**: Save this password - you won't see it again!

4. **Database User Privileges**:
   - **Role**: Atlas admin (for full access during development)
   - For production, use "Read and Write" for specific databases

5. **Create User**: Click "Add User"

---

## Step 5: Get Connection String

1. **Navigate to Clusters**:
   - Click "Clusters" in the left sidebar

2. **Connect to Cluster**:
   - Click "Connect" button on your cluster
   - Select "Connect your application"

3. **Get Connection String**:
   - **Driver**: Node.js
   - **Version**: 4.1 or later
   - Copy the connection string
   - It looks like:
     ```
     mongodb+srv://username:password@cluster0.xxxxxx.mongodb.net/educational_platform?retryWrites=true&w=majority
     ```

4. **Replace Placeholders**:
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Replace `test` with `educational_platform` (or your preferred database name)

---

## Step 6: Configure Environment Variables

1. **Create Environment File**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Update .env File**:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxxx.mongodb.net/educational_platform?retryWrites=true&w=majority
   PORT=3001
   NODE_ENV=development
   ```

3. **Secure Your .env File**:
   - Never commit `.env` files to version control
   - Add `.env` to your `.gitignore` file

---

## Step 7: Test Connection

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Test Database Connection**:
   ```bash
   npm run dev
   ```

3. **Expected Output**:
   ```
   🔄 Connecting to MongoDB...
   ✅ MongoDB Connected: cluster0-shard-00-00.xxxxxx.mongodb.net
   🚀 Server running on port 3001
   ```

4. **Health Check**:
   - Visit: http://localhost:3001/health
   - Should return: `"database": "Connected"`

---

## Schema Documentation

### Overview
The platform uses 6 main collections with the following structure:

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  language: String ('ar' | 'en', default: 'en'),
  avatar: String (optional),
  role: String ('user' | 'admin' | 'moderator', default: 'user'),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Courses Collection
```javascript
{
  _id: ObjectId,
  title: String (required, max: 200 chars),
  description: String (max: 1000 chars),
  subject: String ('Math' | 'Science' | 'Languages' | 'Programming' | 'Other'),
  educationLevel: String ('HighSchool' | 'University' | 'SelfPaced'),
  language: String ('ar' | 'en' | 'bilingual'),
  source: String (required, max: 100 chars),
  sourceUrl: String (URL validation),
  thumbnail: String (URL validation),
  duration: Number (minutes, 1-10000),
  difficulty: String ('beginner' | 'intermediate' | 'advanced', default: 'beginner'),
  tags: [String],
  instructor: {
    name: String,
    bio: String,
    avatar: String
  },
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Books Collection
```javascript
{
  _id: ObjectId,
  title: String (required, max: 200 chars),
  author: String (max: 100 chars),
  description: String (max: 1000 chars),
  subject: String ('Math' | 'Science' | 'Languages' | 'Programming' | 'Other'),
  educationLevel: String ('HighSchool' | 'University' | 'SelfPaced'),
  language: String ('ar' | 'en' | 'bilingual'),
  source: String (required, max: 100 chars),
  sourceUrl: String (URL validation),
  cover: String (URL validation),
  publicationYear: Number (1800-current year + 5),
  isbn: String (ISBN validation),
  pages: Number (1-50000),
  publisher: String (max: 100 chars),
  difficulty: String ('beginner' | 'intermediate' | 'advanced', default: 'beginner'),
  tags: [String],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Progress Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  courseId: ObjectId (ref: Course, optional),
  bookId: ObjectId (ref: Book, optional),
  completionPercentage: Number (0-100, default: 0),
  lastAccessedAt: Date (default: Date.now),
  completedAt: Date (optional),
  notes: String (max: 2000 chars),
  timeSpent: Number (minutes, default: 0),
  currentChapter: String (max: 200 chars),
  lastCheckpoint: String (max: 100 chars),
  rating: Number (1-5),
  difficulty: String ('too_easy' | 'just_right' | 'too_hard', default: 'just_right'),
  createdAt: Date,
  updatedAt: Date
}
```

### 5. StudyTodos Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  courseId: ObjectId (ref: Course, optional),
  bookId: ObjectId (ref: Book, optional),
  title: String (required, max: 200 chars),
  description: String (max: 1000 chars),
  status: String ('pending' | 'in_progress' | 'completed', default: 'pending'),
  dueDate: Date (must be in future),
  priority: String ('low' | 'medium' | 'high', default: 'medium'),
  estimatedTime: Number (minutes, 1-10080),
  actualTime: Number (minutes, default: 0),
  category: String (max: 50 chars, default: 'general'),
  tags: [String],
  completedAt: Date (optional),
  reminder: {
    enabled: Boolean (default: false),
    remindAt: Date,
    type: String ('email' | 'notification', default: 'notification')
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 6. SavedContent Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  courseId: ObjectId (ref: Course, optional),
  bookId: ObjectId (ref: Book, optional),
  savedAt: Date (default: Date.now),
  notes: String (max: 1000 chars),
  category: String (max: 50 chars, default: 'general'),
  tags: [String],
  priority: String ('low' | 'medium' | 'high', default: 'medium'),
  isRead: Boolean (default: false),
  isCompleted: Boolean (default: false),
  reminder: {
    enabled: Boolean (default: false),
    remindAt: Date,
    message: String (max: 200 chars)
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## Example Documents

### Sample User
```javascript
{
  email: "student@example.com",
  password: "$2a$12$hashedpassword...", // Never store plain text passwords
  name: "Ahmed Ali",
  language: "ar",
  role: "user",
  isActive: true,
  createdAt: ISODate("2024-01-10T10:00:00Z"),
  updatedAt: ISODate("2024-01-10T10:00:00Z")
}
```

### Sample Course
```javascript
{
  title: "Introduction to Algebra",
  description: "Learn basic algebraic concepts and problem-solving techniques",
  subject: "Math",
  educationLevel: "HighSchool",
  language: "bilingual",
  source: "Khan Academy",
  sourceUrl: "https://www.khanacademy.org/math/algebra",
  thumbnail: "https://example.com/algebra-course.jpg",
  duration: 120,
  difficulty: "beginner",
  tags: ["math", "algebra", "highschool"],
  instructor: {
    name: "Dr. Sarah Johnson",
    bio: "Mathematics professor with 10+ years experience",
    avatar: "https://example.com/sarah.jpg"
  },
  isActive: true,
  createdAt: ISODate("2024-01-10T10:00:00Z"),
  updatedAt: ISODate("2024-01-10T10:00:00Z")
}
```

### Sample Book
```javascript
{
  title: "Clean Code: A Handbook of Agile Software Craftsmanship",
  author: "Robert C. Martin",
  description: "A book about writing clean, readable code",
  subject: "Programming",
  educationLevel: "University",
  language: "en",
  source: "Open Library",
  sourceUrl: "https://openlibrary.org/books/OL8573508M/Clean_code",
  cover: "https://example.com/clean-code-cover.jpg",
  publicationYear: 2008,
  isbn: "9780132350884",
  pages: 464,
  publisher: "Prentice Hall",
  difficulty: "intermediate",
  tags: ["programming", "clean code", "best practices"],
  isActive: true,
  createdAt: ISODate("2024-01-10T10:00:00Z"),
  updatedAt: ISODate("2024-01-10T10:00:00Z")
}
```

### Sample Progress
```javascript
{
  userId: ObjectId("507f1f77bcf86cd799439011"),
  courseId: ObjectId("507f1f77bcf86cd799439012"),
  completionPercentage: 65,
  lastAccessedAt: ISODate("2024-01-10T10:00:00Z"),
  notes: "Struggling with quadratic equations, need more practice",
  timeSpent: 180,
  currentChapter: "Chapter 5: Quadratic Functions",
  lastCheckpoint: "Exercise 5.2",
  rating: 4,
  difficulty: "just_right",
  createdAt: ISODate("2024-01-10T10:00:00Z"),
  updatedAt: ISODate("2024-01-10T10:00:00Z")
}
```

### Sample StudyTodo
```javascript
{
  userId: ObjectId("507f1f77bcf86cd799439011"),
  courseId: ObjectId("507f1f77bcf86cd799439012"),
  title: "Complete Chapter 5 exercises",
  description: "Finish all practice problems for quadratic equations",
  status: "pending",
  dueDate: ISODate("2024-01-12T18:00:00Z"),
  priority: "high",
  estimatedTime: 120,
  category: "homework",
  tags: ["algebra", "practice", "chapter5"],
  reminder: {
    enabled: true,
    remindAt: ISODate("2024-01-12T17:00:00Z"),
    type: "notification"
  },
  createdAt: ISODate("2024-01-10T10:00:00Z"),
  updatedAt: ISODate("2024-01-10T10:00:00Z")
}
```

### Sample SavedContent
```javascript
{
  userId: ObjectId("507f1f77bcf86cd799439011"),
  bookId: ObjectId("507f1f77bcf86cd799439013"),
  savedAt: ISODate("2024-01-10T10:00:00Z"),
  notes: "Great book for learning programming fundamentals",
  category: "reference",
  tags: ["programming", "fundamentals", "clean code"],
  priority: "high",
  isRead: false,
  isCompleted: false,
  reminder: {
    enabled: true,
    remindAt: ISODate("2024-01-15T09:00:00Z"),
    message: "Don't forget to read this important book!"
  },
  createdAt: ISODate("2024-01-10T10:00:00Z"),
  updatedAt: ISODate("2024-01-10T10:00:00Z")
}
```

---

## Next Steps

After completing this setup:

1. **Install Dependencies**: Run `npm install` in the backend directory
2. **Test Connection**: Run `npm run dev` to verify database connectivity
3. **Prepare for Seeding**: The database is ready for content seeding (see Task 3)

---

## Troubleshooting

### Common Issues

1. **Connection Timeout**:
   - Check IP whitelist configuration
   - Verify network connectivity
   - Ensure cluster is not paused (free tier clusters pause after inactivity)

2. **Authentication Failed**:
   - Verify username and password
   - Check database user privileges
   - Ensure connection string format is correct

3. **Database Does Not Exist**:
   - MongoDB Atlas will create the database automatically on first connection
   - Or create it manually through MongoDB Atlas interface

4. **Permission Denied**:
   - Ensure database user has appropriate privileges
   - For development, use "Atlas admin" role

### Support Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Community Forums](https://community.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

---

## Security Best Practices

⚠️ **Important**: This setup is for development only. For production:

1. **Restrict IP Access**: Replace 0.0.0.0/0 with specific IP addresses
2. **Use Strong Passwords**: Generate complex passwords (32+ characters)
3. **Limit User Privileges**: Use "Read and Write" instead of "Atlas admin"
4. **Enable SSL**: Ensure SSL is enabled for all connections
5. **Backup Strategy**: Set up automated backups
6. **Monitor Usage**: Track connection and storage usage

---

**🎉 Congratulations!** Your MongoDB Atlas setup is complete and ready for development.