import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft } from 'lucide-react';

const PageNotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* 404 Illustration */}
            <div className="mx-auto h-32 w-32 text-secondary-400 mb-6">
              <svg
                className="h-full w-full"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.657-2.59m4.24 0l4.657 4.657c.4-.4.7-.9.86-1.46M9.173 7.828A7.962 7.962 0 014.343 12c.79-1.342 2.095-2.343 3.829-2.708M15.657 12a7.962 7.962 0 01-2.83 5.657M15.657 12a7.962 7.962 0 00-2.83-5.657M9.343 7.828A7.962 7.962 0 015.343 12"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-6xl font-bold text-secondary-900 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
              {t('common.pageNotFound')}
            </h2>
            <p className="text-secondary-600 mb-8">
              {t('pageNotFound.message', 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.')}
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/"
                className="w-full flex justify-center items-center space-x-2 space-x-reverse btn-primary"
              >
                <Home className="w-4 h-4" />
                <span>{t('common.goHome')}</span>
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="w-full flex justify-center items-center space-x-2 space-x-reverse btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('common.goBack')}</span>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="mt-8 pt-6 border-t border-secondary-200">
              <p className="text-sm text-secondary-600 mb-4">
                {t('pageNotFound.tryThese', 'Or try one of these popular pages')}
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Link
                  to="/courses"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                >
                  {t('nav.courses')}
                </Link>
                <Link
                  to="/books"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                >
                  {t('nav.books')}
                </Link>
                <Link
                  to="/dashboard"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                >
                  {t('nav.dashboard')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;