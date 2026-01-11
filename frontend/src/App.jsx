import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';

// Import components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import Home from './pages/Home';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AIRecommendations from './pages/AIRecommendations';
import PageNotFound from './pages/PageNotFound';

// Import styles
import './styles/globals.css';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set initial language and direction
    const savedLanguage = localStorage.getItem('i18nextLng') || 'en';
    i18n.changeLanguage(savedLanguage);
    
    // Set document attributes based on language
    const isRTL = savedLanguage === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLanguage;
  }, [i18n]);

  return (
    <AuthProvider>
      <Router>
        <div className={`min-h-screen bg-gray-50 ${i18n.language === 'ar' ? 'font-arabic' : 'font-english'}`}>
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/books/:id" element={<BookDetailPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/ai-assistant" element={
                <ProtectedRoute>
                  <AIRecommendations />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;