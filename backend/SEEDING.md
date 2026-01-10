# Database Seeding Guide

This guide explains how to populate the MongoDB database with initial curated content for the educational platform.

## Seed Script

The seeding script is located at `src/scripts/seed.js`. It populates the database with initial courses and books across various subjects including Math, Science, Languages, and Programming.

### How to Run

1.  **Environment Setup**: Ensure your `.env` file in the `backend` directory has a valid `MONGODB_URI`.
2.  **Run Seeding**: Execute the following command from the `backend` directory:

    ```bash
    npm run seed
    ```

### Configuration

You can control whether existing data is cleared before seeding by setting the `SEED_CLEAR_DATA` environment variable in your `.env` file:

- `SEED_CLEAR_DATA=true`: Clears all existing courses and books before inserting new data.
- `SEED_CLEAR_DATA=false` (Default): Appends new data to the existing collections.

### Seeded Data Details

The script currently seeds:
- **Courses**: 8+ courses covering Math, Science, Languages, and Programming from sources like Khan Academy, MIT OCW, and YouTube.
- **Books**: 6+ books covering Science, Classics, and Programming from sources like Open Library, Project Gutenberg, and Internet Archive.

## How to Modify/Add Content

To add more content, you can edit the `courses` or `books` arrays in `backend/src/scripts/seed.js`.

### Adding a New Course Example

```javascript
{
  title: "New Course Title",
  description: "Description of the course.",
  subject: "Programming", // Math, Science, Languages, Programming, Other
  educationLevel: "SelfPaced", // HighSchool, University, SelfPaced
  language: "en", // ar, en, bilingual
  source: "Source Name",
  sourceUrl: "https://example.com/course",
  duration: 120, // in minutes
  difficulty: "beginner", // beginner, intermediate, advanced
  tags: ["tag1", "tag2"]
}
```

### Adding a New Book Example

```javascript
{
  title: "New Book Title",
  author: "Author Name",
  subject: "Science", // Math, Science, Languages, Programming, Other
  educationLevel: "University", // HighSchool, University, SelfPaced
  language: "en", // ar, en, bilingual
  source: "Source Name",
  sourceUrl: "https://example.com/book",
  publicationYear: 2023,
  difficulty: "intermediate", // beginner, intermediate, advanced
  tags: ["tag1", "tag2"]
}
```

After modifying the script, run `npm run seed` again to apply the changes.
