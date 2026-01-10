# Bilingual Educational Platform - Monorepo

A monorepo structure for a bilingual (Arabic & English) educational platform with React frontend and Node.js/Express backend.

## Project Structure

```
/
├── frontend/                  # React application (Vite)
│   ├── src/                   # Source code
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── locales/           # Internationalization files
│   │   ├── assets/            # Static assets
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Main App component
│   │   ├── main.jsx           # Entry point
│   │   └── ...
│   ├── public/                # Public assets
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite configuration
│   └── ...
├── backend/                   # Node.js/Express server
│   ├── src/                   # Source code
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # Express routes
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── utils/             # Utility functions
│   │   └── server.js          # Server entry point
│   ├── package.json           # Backend dependencies
│   └── ...
├── shared/                    # Shared code between frontend and backend
│   ├── constants.js           # Shared constants
│   ├── types.js               # Shared TypeScript types
│   ├── package.json           # Shared dependencies
│   └── ...
├── package.json               # Root workspace configuration
├── .gitignore                 # Git ignore rules
├── .prettierrc                # Code formatting rules
└── README.md                  # Project documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- Yarn (for workspace management)
- MongoDB (for database)

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd bilingual-educational-platform

# Install all dependencies
yarn install

# Create environment files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env.local

# Edit the environment files with your configuration
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bilingual-educational-platform
```

2. Install dependencies:
```bash
yarn install
```

### Development

#### Frontend
```bash
cd frontend
yarn dev
```

#### Backend
```bash
cd backend
yarn dev
```

#### Both (in separate terminals)
```bash
# Terminal 1: Frontend
yarn dev:frontend

# Terminal 2: Backend
yarn dev:backend
```

## Environment Variables

Create `.env` files in both frontend and backend directories based on the `.env.example` files provided.

### Frontend Environment Variables
- `VITE_API_BASE_URL`: Backend API base URL (e.g., http://localhost:5000)

### Backend Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT secret key for authentication
- `OPENAI_API_KEY`: OpenAI API key
- `PORT`: Server port (default: 5000)
- `CORS_ORIGIN`: Allowed CORS origin (e.g., http://localhost:3000)

## Available Scripts

- `yarn dev:frontend`: Start frontend development server
- `yarn dev:backend`: Start backend development server
- `yarn build:frontend`: Build frontend for production
- `yarn build:backend`: Build backend for production
- `yarn lint`: Run linting
- `yarn format`: Format code

## Tech Stack

### Frontend
- React (Vite)
- React Router for navigation
- react-i18next for internationalization
- Tailwind CSS for styling
- Axios for API requests

### Backend
- Node.js
- Express.js
- Mongoose for MongoDB
- bcryptjs for password hashing
- jsonwebtoken for authentication
- OpenAI SDK for AI features
- cors for CORS management

## Project Status

✅ **Phase 1 Complete** - Monorepo structure successfully implemented

### Completed Tasks:

- ✅ Monorepo folder structure with frontend, backend, and shared directories
- ✅ Root package.json with workspace management
- ✅ Frontend setup with Vite, React, React Router, i18n, and Tailwind CSS
- ✅ Backend setup with Express, Mongoose, JWT auth, and OpenAI integration
- ✅ Shared folder for common constants and types
- ✅ Environment configuration with .env.example files
- ✅ Basic folder structure for both frontend and backend
- ✅ Sample components demonstrating the architecture
- ✅ Internationalization setup with English and Arabic support
- ✅ API client setup with axios
- ✅ Error handling utilities
- ✅ Code formatting with Prettier and ESLint
- ✅ Git ignore configuration
- ✅ Comprehensive documentation

### Ready for Phase 2:

The monorepo is now ready for Phase 2 development where you can:
- Implement actual educational content features
- Add user authentication flows
- Develop AI-powered educational tools
- Expand the bilingual content library
- Add more sophisticated routing and state management

## Development Notes

- The frontend uses Vite for fast development and hot module replacement
- The backend uses Express with modern ES modules
- Both frontend and backend can be run independently
- Shared code is properly organized for reuse between projects
- Internationalization is set up for easy language switching
- API integration is ready with proper error handling