const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5000'],
  credentials: true,
}));
app.use(express.json());

// Mock data
const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    language: 'en',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

const mockCourses = [
  {
    _id: '1',
    title: 'Introduction to Mathematics',
    titleAr: 'مقدمة في الرياضيات',
    description: 'Learn basic mathematical concepts and problem-solving techniques.',
    descriptionAr: 'تعلم المفاهيم الرياضية الأساسية وتقنيات حل المشكلات.',
    subject: 'Mathematics',
    subjectAr: 'الرياضيات',
    level: 'Beginner',
    duration: '4 hours',
    language: 'English',
    thumbnail: 'https://via.placeholder.com/300x200?text=Mathematics',
    source: 'Khan Academy',
    sourceUrl: 'https://www.khanacademy.org',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '2',
    title: 'Physics Fundamentals',
    titleAr: 'أساسيات الفيزياء',
    description: 'Explore the fundamental principles of physics.',
    descriptionAr: 'استكشف المبادئ الأساسية للفيزياء.',
    subject: 'Physics',
    subjectAr: 'الفيزياء',
    level: 'Intermediate',
    duration: '6 hours',
    language: 'English',
    thumbnail: 'https://via.placeholder.com/300x200?text=Physics',
    source: 'MIT OpenCourseWare',
    sourceUrl: 'https://ocw.mit.edu',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '3',
    title: 'Chemistry Basics',
    titleAr: 'أساسيات الكيمياء',
    description: 'Understanding the basics of chemical reactions and compounds.',
    descriptionAr: 'فهم أساسيات التفاعلات الكيميائية والمركبات.',
    subject: 'Chemistry',
    subjectAr: 'الكيمياء',
    level: 'Beginner',
    duration: '3 hours',
    language: 'English',
    thumbnail: 'https://via.placeholder.com/300x200?text=Chemistry',
    source: 'Coursera',
    sourceUrl: 'https://www.coursera.org',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

const mockBooks = [
  {
    _id: '4',
    title: 'The Art of Computer Programming',
    titleAr: 'فن برمجة الحاسوب',
    description: 'A comprehensive guide to computer programming algorithms and techniques.',
    descriptionAr: 'دليل شامل لخوارزميات وتقنيات برمجة الحاسوب.',
    subject: 'Computer Science',
    subjectAr: 'علوم الحاسوب',
    level: 'Advanced',
    pages: 3168,
    author: 'Donald Knuth',
    language: 'English',
    thumbnail: 'https://via.placeholder.com/300x200?text=Programming',
    source: 'Amazon',
    sourceUrl: 'https://amazon.com',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: '5',
    title: 'Biology for Beginners',
    titleAr: 'الأحياء للمبتدئين',
    description: 'An introduction to the fundamentals of biology and life sciences.',
    descriptionAr: 'مقدمة في أساسيات علم الأحياء والعلوم الحياتية.',
    subject: 'Biology',
    subjectAr: 'الأحياء',
    level: 'Beginner',
    pages: 450,
    author: 'Jane Smith',
    language: 'English',
    thumbnail: 'https://via.placeholder.com/300x200?text=Biology',
    source: 'Google Books',
    sourceUrl: 'https://books.google.com',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

let mockSavedContent = [];
let mockTodos = [];
let mockProgress = [];
let mockRecommendationFeedback = [];

// Auth routes
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name, language } = req.body;
  
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const newUser = {
    id: Date.now().toString(),
    email,
    name,
    language: language || 'en',
    createdAt: new Date().toISOString()
  };
  
  mockUsers.push(newUser);
  
  // Generate mock token
  const token = `mock-jwt-token-${newUser.id}`;
  
  res.status(201).json({
    token,
    user: newUser
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = mockUsers.find(u => u.email === email);
  if (!user || password !== 'password123') { // Mock validation
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = `mock-jwt-token-${user.id}`;
  
  res.json({
    token,
    user
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // Mock token validation
  const userId = token.replace('mock-jwt-token-', '');
  const user = mockUsers.find(u => u.id === userId);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  res.json(user);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Mock API is running',
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

// Courses routes
app.get('/api/courses', (req, res) => {
  const { page = 1, limit = 10, search, subject, level } = req.query;
  
  let filtered = [...mockCourses];
  
  if (search) {
    filtered = filtered.filter(course => 
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (subject) {
    filtered = filtered.filter(course => course.subject === subject);
  }
  
  if (level) {
    filtered = filtered.filter(course => course.level === level);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedCourses = filtered.slice(startIndex, endIndex);
  
  res.json({
    courses: paginatedCourses,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filtered.length / limit),
      total: filtered.length
    }
  });
});

app.get('/api/courses/:id', (req, res) => {
  const course = mockCourses.find(c => c._id === req.params.id);
  
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  res.json(course);
});

app.post('/api/courses/:id/save', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const courseId = req.params.id;
  const userId = token.replace('mock-jwt-token-', '');
  
  const existing = mockSavedContent.find(item => 
    item.userId === userId && item.contentId === courseId && item.contentType === 'course'
  );
  
  if (existing) {
    return res.status(400).json({ error: 'Course already saved' });
  }
  
  const savedItem = {
    _id: Date.now().toString(),
    userId,
    contentId: courseId,
    contentType: 'course',
    savedAt: new Date().toISOString()
  };
  
  mockSavedContent.push(savedItem);
  
  res.status(201).json(savedItem);
});

app.delete('/api/courses/:id/save', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const userId = token.replace('mock-jwt-token-', '');
  const courseId = req.params.id;
  
  const index = mockSavedContent.findIndex(item => 
    item.userId === userId && item.contentId === courseId && item.contentType === 'course'
  );
  
  if (index === -1) {
    return res.status(404).json({ error: 'Saved course not found' });
  }
  
  mockSavedContent.splice(index, 1);
  
  res.json({ message: 'Course unsaved successfully' });
});

app.get('/api/courses/user/saved', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const userId = token.replace('mock-jwt-token-', '');
  
  const savedCourses = mockSavedContent
    .filter(item => item.userId === userId && item.contentType === 'course')
    .map(item => {
      const course = mockCourses.find(c => c._id === item.contentId);
      return course ? { ...course, savedAt: item.savedAt } : null;
    })
    .filter(Boolean);
  
  res.json(savedCourses);
});

// Books routes (similar to courses)
app.get('/api/books', (req, res) => {
  const { page = 1, limit = 10, search, subject, level } = req.query;
  
  let filtered = [...mockBooks];
  
  if (search) {
    filtered = filtered.filter(book => 
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (subject) {
    filtered = filtered.filter(book => book.subject === subject);
  }
  
  if (level) {
    filtered = filtered.filter(book => book.level === level);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedBooks = filtered.slice(startIndex, endIndex);
  
  res.json({
    books: paginatedBooks,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filtered.length / limit),
      total: filtered.length
    }
  });
});

app.get('/api/books/:id', (req, res) => {
  const book = mockBooks.find(b => b._id === req.params.id);
  
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  
  res.json(book);
});

app.post('/api/books/:id/save', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const bookId = req.params.id;
  const userId = token.replace('mock-jwt-token-', '');
  
  const existing = mockSavedContent.find(item => 
    item.userId === userId && item.contentId === bookId && item.contentType === 'book'
  );
  
  if (existing) {
    return res.status(400).json({ error: 'Book already saved' });
  }
  
  const savedItem = {
    _id: Date.now().toString(),
    userId,
    contentId: bookId,
    contentType: 'book',
    savedAt: new Date().toISOString()
  };
  
  mockSavedContent.push(savedItem);
  
  res.status(201).json(savedItem);
});

app.delete('/api/books/:id/save', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const userId = token.replace('mock-jwt-token-', '');
  const bookId = req.params.id;
  
  const index = mockSavedContent.findIndex(item => 
    item.userId === userId && item.contentId === bookId && item.contentType === 'book'
  );
  
  if (index === -1) {
    return res.status(404).json({ error: 'Saved book not found' });
  }
  
  mockSavedContent.splice(index, 1);
  
  res.json({ message: 'Book unsaved successfully' });
});

app.get('/api/books/user/saved', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const userId = token.replace('mock-jwt-token-', '');
  
  const savedBooks = mockSavedContent
    .filter(item => item.userId === userId && item.contentType === 'book')
    .map(item => {
      const book = mockBooks.find(b => b._id === item.contentId);
      return book ? { ...book, savedAt: item.savedAt } : null;
    })
    .filter(Boolean);
  
  res.json(savedBooks);
});

// Dashboard routes
app.get('/api/dashboard/stats', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const userId = token.replace('mock-jwt-token-', '');
  
  const userSavedContent = mockSavedContent.filter(item => item.userId === userId);
  const userTodos = mockTodos.filter(todo => todo.userId === userId);
  const completedTodos = userTodos.filter(todo => todo.completed);
  
  res.json({
    totalSavedItems: userSavedContent.length,
    completedTodos: completedTodos.length,
    totalTodos: userTodos.length,
    learningStreak: 5, // Mock data
    averageProgress: 45, // Mock percentage
    totalLearningHours: 12.5 // Mock hours
  });
});

app.get('/api/dashboard/saved-content', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const userId = token.replace('mock-jwt-token-', '');
  
  const savedContent = mockSavedContent
    .filter(item => item.userId === userId)
    .map(item => {
      let content;
      if (item.contentType === 'course') {
        content = mockCourses.find(c => c._id === item.contentId);
      } else {
        content = mockBooks.find(b => b._id === item.contentId);
      }
      return content ? { ...content, contentType: item.contentType, savedAt: item.savedAt } : null;
    })
    .filter(Boolean);
  
  res.json(savedContent);
});

app.get('/api/dashboard/todos', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const userId = token.replace('mock-jwt-token-', '');
  
  const userTodos = mockTodos.filter(todo => todo.userId === userId);
  
  res.json(userTodos);
});

app.post('/api/dashboard/todos', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const userId = token.replace('mock-jwt-token-', '');
  const { title, description, priority, dueDate, relatedCourseId } = req.body;
  
  const newTodo = {
    _id: Date.now().toString(),
    userId,
    title,
    description,
    priority,
    dueDate,
    relatedCourseId,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockTodos.push(newTodo);
  
  res.status(201).json(newTodo);
});

app.patch('/api/dashboard/todos/:todoId', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const userId = token.replace('mock-jwt-token-', '');
  const todoId = req.params.todoId;
  
  const todoIndex = mockTodos.findIndex(todo => todo._id === todoId && todo.userId === userId);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  mockTodos[todoIndex] = {
    ...mockTodos[todoIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(mockTodos[todoIndex]);
});

app.delete('/api/dashboard/todos/:todoId', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const userId = token.replace('mock-jwt-token-', '');
  const todoId = req.params.todoId;
  
  const todoIndex = mockTodos.findIndex(todo => todo._id === todoId && todo.userId === userId);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  mockTodos.splice(todoIndex, 1);
  
  res.json({ message: 'Todo deleted successfully' });
});

// Recommendations routes
app.get('/api/recommendations/daily', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // Mock recommendation based on time available
  const timeAvailable = req.query.timeAvailable || '30min';
  const subject = req.query.subject;
  const contentType = req.query.contentType || 'course';
  
  let recommendation;
  
  if (subject) {
    const subjectCourse = mockCourses.find(c => c.subject === subject);
    recommendation = subjectCourse || mockCourses[0];
  } else {
    recommendation = mockCourses[Math.floor(Math.random() * mockCourses.length)];
  }
  
  res.json({
    id: Date.now().toString(),
    title: recommendation.title,
    description: recommendation.description,
    type: contentType,
    subject: recommendation.subject,
    level: recommendation.level,
    estimatedTime: recommendation.duration,
    source: recommendation.source,
    sourceUrl: recommendation.sourceUrl,
    thumbnail: recommendation.thumbnail,
    reasoning: `Based on your learning history and preferences, this ${contentType} is perfect for your ${timeAvailable} session.`,
    language: recommendation.language,
    createdAt: new Date().toISOString()
  });
});

app.post('/api/recommendations/feedback', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const userId = token.replace('mock-jwt-token-', '');
  const { recommendationId, helpful, comments } = req.body;
  
  const feedback = {
    _id: Date.now().toString(),
    userId,
    recommendationId,
    helpful,
    comments,
    createdAt: new Date().toISOString()
  };
  
  mockRecommendationFeedback.push(feedback);
  
  res.status(201).json({ message: 'Feedback recorded successfully' });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Mock Bilingual Educational Platform API',
    version: '1.0.0',
    status: 'running'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on port ${PORT}`);
  console.log(`📝 Environment: development`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 API Info: http://localhost:${PORT}/api`);
});

module.exports = app;