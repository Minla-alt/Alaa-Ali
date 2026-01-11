import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Globe, Menu, X, LogOut, User, Settings } from 'lucide-react';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = React.useState(false);

  const isRTL = i18n.language === 'ar';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
    
    // Update document direction and lang attribute
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const navLinks = [
    { key: 'home', path: '/', requiresAuth: false },
    { key: 'courses', path: '/courses', requiresAuth: false },
    { key: 'books', path: '/books', requiresAuth: false },
    { key: 'dashboard', path: '/dashboard', requiresAuth: true },
    { key: 'ai-assistant', path: '/ai-assistant', requiresAuth: true },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-secondary-900">
                {isRTL ? 'منصة التعلم' : 'EduLearn'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4 space-x-reverse">
              {navLinks.map((link) => {
                if (link.requiresAuth && !isAuthenticated) return null;
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side - Language & User Menu */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-1 space-x-reverse text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <Globe className="w-4 h-4" />
                <span>{i18n.language === 'ar' ? 'العربية' : 'English'}</span>
              </button>
              
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        i18n.changeLanguage('en');
                        localStorage.setItem('i18nextLng', 'en');
                        document.documentElement.dir = 'ltr';
                        document.documentElement.lang = 'en';
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`block w-full text-right px-4 py-2 text-sm transition-colors duration-200 ${
                        i18n.language === 'en' 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'text-secondary-700 hover:bg-secondary-50'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        i18n.changeLanguage('ar');
                        localStorage.setItem('i18nextLng', 'ar');
                        document.documentElement.dir = 'rtl';
                        document.documentElement.lang = 'ar';
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`block w-full text-right px-4 py-2 text-sm transition-colors duration-200 ${
                        i18n.language === 'ar' 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'text-secondary-700 hover:bg-secondary-50'
                      }`}
                    >
                      العربية
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 space-x-reverse text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  <User className="w-4 h-4" />
                  <span>{user?.name || user?.email}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      <User className="w-4 h-4" />
                      <span>{t('nav.dashboard')}</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      <Settings className="w-4 h-4" />
                      <span>{isRTL ? 'الإعدادات' : 'Settings'}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 space-x-reverse w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('auth.logout')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Link
                  to="/login"
                  className="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {t('auth.login')}
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary text-sm"
                >
                  {t('auth.signup')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-secondary-200">
            {navLinks.map((link) => {
              if (link.requiresAuth && !isAuthenticated) return null;
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-secondary-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(`nav.${link.key}`)}
                </Link>
              );
            })}
            
            {/* Mobile Language Switcher */}
            <div className="border-t border-secondary-200 pt-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 space-x-reverse w-full text-right px-3 py-2 text-secondary-700 hover:text-primary-600 rounded-md text-base font-medium transition-colors duration-200"
              >
                <Globe className="w-4 h-4" />
                <span>{isRTL ? 'English' : 'العربية'}</span>
              </button>
            </div>

            {/* Mobile User Actions */}
            <div className="border-t border-secondary-200 pt-4">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-secondary-700">
                    {t('auth.welcome', { name: user?.name || user?.email })}
                  </div>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-secondary-700 hover:text-primary-600 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-right px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-base font-medium transition-colors duration-200"
                  >
                    {t('auth.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-secondary-700 hover:text-primary-600 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('auth.login')}
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 text-primary-600 hover:text-primary-700 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('auth.signup')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;