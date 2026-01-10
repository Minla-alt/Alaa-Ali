const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../utils/db');
const Course = require('../models/Course');
const Book = require('../models/Book');

const courses = [
  // Math Courses
  {
    title: "Algebra Basics - الجبر الأساسي",
    description: "Learn the fundamentals of algebra, including variables, equations, and graphing. Ideal for high school students.",
    subject: "Math",
    educationLevel: "HighSchool",
    language: "bilingual",
    source: "Khan Academy",
    sourceUrl: "https://www.khanacademy.org/math/algebra",
    duration: 480,
    thumbnail: "https://cdn.kastatic.org/googleusercontent/v1/u5S_6ZpQ6Q_5R6S8j8N9_w120-h120-c",
    difficulty: "beginner",
    tags: ["algebra", "basics", "math"]
  },
  {
    title: "Single Variable Calculus",
    description: "This introductory calculus course covers differentiation and integration of functions of one variable, with applications.",
    subject: "Math",
    educationLevel: "University",
    language: "en",
    source: "MIT OpenCourseWare",
    sourceUrl: "https://ocw.mit.edu/courses/mathematics/18-01-single-variable-calculus-fall-2006/",
    duration: 1200,
    thumbnail: "https://ocw.mit.edu/courses/mathematics/18-01-single-variable-calculus-fall-2006/18-01f06.jpg",
    difficulty: "advanced",
    tags: ["calculus", "mit", "university-math"]
  },
  // Science Courses
  {
    title: "Physics for Beginners - الفيزياء للمبتدئين",
    description: "Explore the laws of physics that govern our universe, from motion to energy.",
    subject: "Science",
    educationLevel: "SelfPaced",
    language: "bilingual",
    source: "YouTube Educational",
    sourceUrl: "https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
    duration: 600,
    difficulty: "beginner",
    tags: ["physics", "science", "fundamentals"]
  },
  {
    title: "Biology I - علم الأحياء",
    description: "An introduction to the study of life, covering cell biology, genetics, and evolution.",
    subject: "Science",
    educationLevel: "HighSchool",
    language: "bilingual",
    source: "Khan Academy",
    duration: 720,
    difficulty: "intermediate",
    tags: ["biology", "science", "life"]
  },
  // Languages Courses
  {
    title: "English Language Learning - تعلم اللغة الإنجليزية",
    description: "Comprehensive lessons to improve your English speaking, listening, reading, and writing skills.",
    subject: "Languages",
    educationLevel: "HighSchool",
    language: "bilingual",
    source: "YouTube Educational",
    duration: 400,
    difficulty: "beginner",
    tags: ["english", "language", "learning"]
  },
  {
    title: "Arabic Grammar Essentials - أساسيات قواعد اللغة العربية",
    description: "Master the essential rules of Arabic grammar in this self-paced course.",
    subject: "Languages",
    educationLevel: "SelfPaced",
    language: "bilingual",
    source: "YouTube Educational",
    duration: 500,
    difficulty: "intermediate",
    tags: ["arabic", "grammar", "language"]
  },
  // Programming Courses
  {
    title: "Introduction to Computer Science and Programming",
    description: "Introduction to Computer Science and Programming in Python is intended for students with little or no programming experience.",
    subject: "Programming",
    educationLevel: "University",
    language: "en",
    source: "MIT OpenCourseWare",
    sourceUrl: "https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/",
    duration: 1440,
    difficulty: "beginner",
    tags: ["computer-science", "python", "programming"]
  },
  {
    title: "Web Development for Beginners - تطوير الويب للمبتدئين",
    description: "Learn the basics of web development, including HTML, CSS, and JavaScript.",
    subject: "Programming",
    educationLevel: "SelfPaced",
    language: "bilingual",
    source: "YouTube Educational",
    duration: 800,
    difficulty: "beginner",
    tags: ["web-development", "html", "css", "javascript"]
  }
];

const books = [
  // Science Books
  {
    title: "Physics for Beginners",
    author: "Chris McMullen",
    subject: "Science",
    educationLevel: "HighSchool",
    language: "en",
    source: "Open Library",
    sourceUrl: "https://openlibrary.org/",
    publicationYear: 2015,
    difficulty: "beginner",
    tags: ["physics", "science"]
  },
  {
    title: "Science Basics - أساسيات العلوم",
    author: "Various Authors",
    subject: "Science",
    educationLevel: "HighSchool",
    language: "bilingual",
    source: "Open Library",
    publicationYear: 2010,
    difficulty: "beginner",
    tags: ["science", "basics"]
  },
  // Classics & Literature
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    subject: "Languages",
    educationLevel: "SelfPaced",
    language: "en",
    source: "Project Gutenberg",
    sourceUrl: "https://www.gutenberg.org/ebooks/1342",
    publicationYear: 1813,
    difficulty: "intermediate",
    tags: ["classic", "literature", "fiction"]
  },
  {
    title: "Wuthering Heights",
    author: "Emily Brontë",
    subject: "Languages",
    educationLevel: "SelfPaced",
    language: "en",
    source: "Internet Archive",
    publicationYear: 1847,
    difficulty: "advanced",
    tags: ["classic", "literature", "fiction"]
  },
  // Educational References
  {
    title: "Introduction to Algorithms",
    author: "Cormen, Leiserson, Rivest, Stein",
    subject: "Programming",
    educationLevel: "University",
    language: "en",
    source: "Open Library",
    publicationYear: 2009,
    difficulty: "advanced",
    tags: ["algorithms", "programming", "computer-science"]
  },
  {
    title: "The Art of Mathematics",
    author: "Béla Bollobás",
    subject: "Math",
    educationLevel: "University",
    language: "en",
    source: "Open Library",
    publicationYear: 2006,
    difficulty: "advanced",
    tags: ["math", "mathematics"]
  }
];

const seedData = async () => {
  try {
    console.log('🚀 Starting database seeding...');
    await connectDB();

    const clearData = process.env.SEED_CLEAR_DATA === 'true';

    if (clearData) {
      console.log('🗑️  Clearing existing data...');
      await Course.deleteMany({});
      await Book.deleteMany({});
      console.log('✅ Existing data cleared');
    } else {
      console.log('ℹ️  Skipping data clearing (SEED_CLEAR_DATA is not true)');
    }

    console.log('🌱 Seeding courses...');
    await Course.insertMany(courses);
    console.log(`✅ Seeded ${courses.length} courses`);

    console.log('🌱 Seeding books...');
    await Book.insertMany(books);
    console.log(`✅ Seeded ${books.length} books`);

    console.log('✨ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
