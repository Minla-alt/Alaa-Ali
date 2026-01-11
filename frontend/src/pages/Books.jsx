import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { booksAPI } from '../api/books';
import { Search, BookOpen, Calendar, Star, User, Save, Undo2 } from 'lucide-react';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Books = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    language: ''
  });
  const [savedBooks, setSavedBooks] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const { data: booksData, loading, error, fetchData } = useApi(
    () => booksAPI.getBooks({
      ...filters,
      page: currentPage,
      limit: 12
    }),
    [filters, currentPage]
  );

  const subjects = [
    { value: '', label: t('courses.allSubjects') },
    { value: 'Math', label: t('subjects.math') },
    { value: 'Science', label: t('subjects.science') },
    { value: 'Languages', label: t('subjects.languages') },
    { value: 'Programming', label: t('subjects.programming') },
    { value: 'Literature', label: t('subjects.literature') },
    { value: 'History', label: t('subjects.history') },
    { value: 'Other', label: t('subjects.other') }
  ];

  const languages = [
    { value: '', label: t('courses.allLanguages') },
    { value: 'en', label: t('common.english') },
    { value: 'ar', label: t('common.arabic') },
    { value: 'bilingual', label: t('common.language', 'Bilingual') }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSaveBook = async (bookId) => {
    try {
      if (savedBooks.has(bookId)) {
        await booksAPI.unsaveBook(bookId);
        setSavedBooks(prev => {
          const newSet = new Set(prev);
          newSet.delete(bookId);
          return newSet;
        });
      } else {
        await booksAPI.saveBook(bookId);
        setSavedBooks(prev => new Set([...prev, bookId]));
      }
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  if (loading && !booksData) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const books = booksData?.books || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          {t('books.title')}
        </h1>
        <p className="text-secondary-600">
          {t('books.subtitle', 'Discover educational books and resources')}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('books.search')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Subject Filter */}
          <select
            value={filters.subject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {subjects.map(subject => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>

          {/* Language Filter */}
          <select
            value={filters.language}
            onChange={(e) => handleFilterChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {languages.map(language => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Clear Filters */}
          <button
            onClick={() => setFilters({ search: '', subject: '', language: '' })}
            className="flex items-center space-x-1 space-x-reverse px-3 py-2 text-secondary-600 hover:text-secondary-800 border border-secondary-300 rounded-lg hover:bg-secondary-50"
          >
            <Undo2 className="w-4 h-4" />
            <span>{t('common.clear')}</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-secondary-600">
          {t('books.results', '{{count}} books found', { count: books.length })}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 animate-pulse">
              <div className="bg-secondary-200 h-48 rounded-lg mb-4"></div>
              <div className="bg-secondary-200 h-4 rounded mb-2"></div>
              <div className="bg-secondary-200 h-3 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Books Grid */}
      {!loading && books.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <div key={book._id} className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              {/* Book Cover */}
              <div className="h-64 bg-gradient-to-br from-secondary-800 to-secondary-900 relative">
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleSaveBook(book._id)}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      savedBooks.has(book._id)
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white text-secondary-600 hover:bg-yellow-100'
                    }`}
                  >
                    {savedBooks.has(book._id) ? (
                      <Star className="w-4 h-4 fill-current" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="bg-white px-2 py-1 rounded text-xs font-medium text-secondary-700">
                    {book.language?.toUpperCase() || 'N/A'}
                  </span>
                </div>
                {/* Book Icon */}
                <div className="flex items-center justify-center h-full">
                  <BookOpen className="w-16 h-16 text-white opacity-50" />
                </div>
              </div>

              {/* Book Content */}
              <div className="p-4">
                <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2">
                  {book.title}
                </h3>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-sm text-secondary-600">
                    <User className="w-3 h-3 mr-1" />
                    <span>{book.author}</span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-600">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{book.publishedDate ? new Date(book.publishedDate).getFullYear() : t('common.notSpecified', 'Not specified')}</span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-600">
                    <BookOpen className="w-3 h-3 mr-1" />
                    <span>{t('subjects.' + (book.subject || 'other').toLowerCase())}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 space-x-reverse">
                  <Link
                    to={`/books/${book._id}`}
                    className="flex-1 bg-primary-600 text-white text-center py-2 px-3 rounded text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
                  >
                    {t('books.viewDetails')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && books.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            {t('books.noBooks')}
          </h3>
          <p className="text-secondary-600 mb-4">
            {t('books.tryDifferentFilters', 'Try adjusting your filters to see more results')}
          </p>
          <button
            onClick={() => setFilters({ search: '', subject: '', language: '' })}
            className="btn-primary"
          >
            {t('books.clearAllFilters', 'Clear all filters')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Books;