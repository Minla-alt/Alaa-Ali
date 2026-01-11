# EduLearn - Bilingual Education Platform Frontend

A React-based frontend application with complete Arabic/English bilingual support for an educational platform featuring courses, books, and AI-powered recommendations.

## 🚀 Features

### ✅ Complete Bilingual Support
- **Arabic/English translations** with seamless switching
- **RTL (Right-to-Left) layout** support for Arabic
- **Dynamic font switching** (Cairo for Arabic, Inter for English)
- **Browser language detection** with localStorage persistence

### ✅ Authentication System
- **JWT-based authentication** with automatic token management
- **Protected routes** for authenticated users
- **Login/Signup forms** with comprehensive validation
- **Session persistence** across browser refreshes

### ✅ Course & Book Management
- **Course library** with advanced filtering (subject, level, language)
- **Book collection** with search and categorization
- **Save/unsave functionality** for user preferences
- **Detailed course/book pages** with external links

### ✅ AI Recommendations
- **Personalized learning suggestions** powered by AI
- **Feedback system** to improve recommendations
- **Daily recommendation updates** with user engagement tracking

### ✅ User Dashboard
- **Personal learning statistics** and progress tracking
- **Study todos management** with CRUD operations
- **Recent activity monitoring** and saved content overview
- **Quick actions** for common tasks

### ✅ Modern UI/UX
- **Responsive design** with mobile-first approach
- **TailwindCSS styling** with custom design system
- **Loading states** and error handling throughout
- **Accessibility features** with proper ARIA labels

## 🛠 Tech Stack

- **React 18+** with modern hooks and context API
- **React Router v6** for client-side routing
- **react-i18next** for internationalization
- **TailwindCSS** for utility-first styling
- **Axios** for HTTP requests
- **Lucide React** for consistent iconography
- **Vite** for fast development and building

## 📁 Project Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation with language switcher
│   ├── Loading.jsx     # Loading spinner component
│   ├── ErrorMessage.jsx # Error display component
│   └── ProtectedRoute.jsx # Route protection wrapper
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── Courses.jsx     # Course listing with filters
│   ├── CourseDetail.jsx # Individual course page
│   ├── Books.jsx       # Book library page
│   ├── BookDetail.jsx  # Individual book page
│   ├── Login.jsx       # Authentication page
│   ├── Signup.jsx      # User registration
│   ├── Dashboard.jsx   # User dashboard
│   ├── AIRecommendations.jsx # AI suggestions
│   └── PageNotFound.jsx # 404 page
├── context/            # React Context providers
│   └── AuthContext.jsx # Authentication state management
├── hooks/             # Custom React hooks
│   ├── useAuth.js     # Auth context wrapper
│   ├── useApi.js      # Generic API call handler
│   └── usePagination.js # Pagination logic
├── api/               # API service layer
│   ├── client.js      # Axios configuration
│   ├── auth.js        # Authentication endpoints
│   ├── courses.js     # Course management
│   ├── books.js       # Book management
│   ├── dashboard.js   # Dashboard data
│   └── recommendations.js # AI recommendations
├── locales/           # Translation files
│   ├── en.json        # English translations
│   └── ar.json        # Arabic translations
├── styles/            # Global styles
│   └── globals.css     # Tailwind imports and custom styles
├── i18n.js            # i18next configuration
├── App.jsx             # Main application component
└── main.jsx           # Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Configure the following variables in `.env.local`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_DEFAULT_LANGUAGE=en
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 🌐 Language Support

### Supported Languages
- **English (en)** - Default language with Inter font
- **Arabic (ar)** - RTL layout with Cairo font

### Adding New Translations

1. **Add new language file** in `src/locales/` directory
2. **Configure i18n** in `src/i18n.js` 
3. **Update navigation** language switcher if needed

### Translation Structure

Translations are organized by feature:

```json
{
  "nav": {
    "home": "Home",
    "courses": "Courses"
  },
  "courses": {
    "title": "Courses",
    "filterBySubject": "Filter by Subject"
  },
  "common": {
    "loading": "Loading...",
    "save": "Save"
  }
}
```

## 🔒 Authentication

### Protected Routes
- `/dashboard` - User dashboard (login required)
- `/ai-assistant` - AI recommendations (login required)

### Authentication Flow
1. User submits login/signup form
2. API returns JWT token and user data
3. Token stored in localStorage
4. User state managed via AuthContext
5. Automatic token validation on app load

## 🎨 Styling

### Design System
- **Primary Colors**: Blue palette (`primary-50` to `primary-900`)
- **Secondary Colors**: Gray palette (`secondary-50` to `secondary-900`)
- **Typography**: Cairo (Arabic), Inter (English)
- **Components**: Consistent button, card, and form styles

### RTL Support
- Automatic direction switching based on selected language
- Custom CSS utilities for RTL layout adjustments
- Font-family switching for optimal readability

## 🔧 API Integration

### Backend Requirements
The frontend expects a backend API running at `VITE_API_BASE_URL` with the following endpoints:

**Authentication:**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

**Courses:**
- `GET /api/courses` - List courses with filters
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/save` - Save course
- `DELETE /api/courses/:id/save` - Unsave course

**Books:**
- `GET /api/books` - List books with filters
- `GET /api/books/:id` - Get book details
- `POST /api/books/:id/save` - Save book
- `DELETE /api/books/:id/save` - Unsave book

**Dashboard:**
- `GET /api/dashboard/stats` - User statistics
- `GET /api/dashboard/todos` - Study todos
- `POST /api/dashboard/todos` - Create todo
- `PUT /api/dashboard/todos/:id` - Update todo
- `DELETE /api/dashboard/todos/:id` - Delete todo

**Recommendations:**
- `GET /api/recommendations/daily` - Get AI recommendation
- `POST /api/recommendations/feedback` - Submit feedback

### Error Handling
- **Network errors**: Automatic retry and user notification
- **Authentication errors**: Automatic logout and redirect to login
- **API errors**: Consistent error display with retry options

## 🧪 Development

### Code Organization
- **Components**: Reusable UI elements with proper props
- **Pages**: Route-specific components with business logic
- **Hooks**: Custom hooks for common functionality
- **API**: Centralized service layer for backend communication

### Best Practices
- **TypeScript support** ready (currently using JSX)
- **ESLint configuration** for code quality
- **Responsive design** with mobile-first approach
- **Accessibility** with ARIA labels and semantic HTML

### Testing Strategy
- Component testing with React Testing Library
- API integration testing with mocked endpoints
- E2E testing with Cypress (recommended)

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
Ensure production environment variables are set:
- `VITE_API_BASE_URL` - Your production API URL
- `VITE_DEFAULT_LANGUAGE` - Default language (en/ar)

### Deployment Options
- **Vercel**: Zero-config deployment with automatic builds
- **Netlify**: Static site hosting with form handling
- **AWS S3 + CloudFront**: Scalable static hosting
- **Docker**: Containerized deployment

## 📱 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Issues**: GitHub Issues for bug reports
- **Documentation**: Check this README and inline code comments
- **API Docs**: Refer to backend API documentation

---

**Happy Learning! 🎓**