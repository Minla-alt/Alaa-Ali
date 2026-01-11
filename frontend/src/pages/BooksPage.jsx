import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, Book as BookIcon } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { booksAPI } from '../api/books';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const BooksPage = () => {
  const { t, i18n } = useTranslation();
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    language: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [savedBooks, setSavedBooks] = useState(new Set());

  const itemsPerPage = 10;

  const { data: booksData, loading, error, fetchData } = useApi(
    () => booksAPI.getBooks({
      ...filters,
      page: currentPage,
      limit: itemsPerPage
    }),
    [filters, currentPage]
  );

  const subjects = [
    { value: '', label: t('courses.allSubjects') },
    { value: 'Math', label: t('subjects.math') },
    { value: 'Science', label: t('subjects.science') },
    { value: 'Languages', label: t('subjects.languages') },
    { value: 'Programming', label: t('subjects.programming') },
    { value: 'Other', label: t('subjects.other') }
  ];

  const languages = [
    { value: '', label: t('courses.allLanguages') },
    { value: 'ar', label: t('common.arabic') },
    { value: 'en', label: t('common.english') },
    { value: 'bilingual', label: t('common.bilingual') }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      subject: '',
      language: ''
    });
    setCurrentPage(1);
  };

  const handleSaveBook = async (bookId) => {
    try {
      await booksAPI.saveBook(bookId);
      setSavedBooks(prev => new Set([...prev, bookId]));
    } catch (err) {
      console.error('Failed to save book', err);
    }
  };

  const handleUnsaveBook = async (bookId) => {
    try {
      await booksAPI.unsaveBook(bookId);
      setSavedBooks(prev => {
        const next = new Set(prev);
        next.delete(bookId);
        return next;
      });
    } catch (err) {
      console.error('Failed to unsave book', err);
    }
  };

  const books = booksData?.books || [];
  const totalBooks = booksData?.total || 0;
  const totalPages = Math.ceil(totalBooks / itemsPerPage);

  return (
    <div className="min-h-screen bg-secondary-50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-secondary-200 pt-8 pb-6 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">
                {t('books.title')}
              </h1>
              <p className="mt-2 text-lg text-secondary-600">
                {t('books.subtitle')}
              </p>
            </div>
            <div className="w-full md:w-96">
              <SearchBar 
                onSearch={(val) => handleFilterChange('search', val)} 
                initialValue={filters.search}
                placeholder={t('books.searchPlaceholder')}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            subjects={subjects}
            languages={languages}
            isOpen={isFilterDrawerOpen}
            onClose={() => setIsFilterDrawerOpen(false)}
          />

          <div className="flex-1">
            {/* Mobile Filter Trigger & Results Info */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="lg:hidden flex items-center space-x-2 space-x-reverse px-4 py-2 bg-white border border-secondary-300 rounded-lg text-secondary-700 font-medium"
              >
                <Filter className="w-4 h-4" />
                <span>{t('common.filters')}</span>
              </button>
              
              <div className="text-sm text-secondary-600 font-medium">
                {t('common.showingResults', { 
                  start: totalBooks === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
                  end: Math.min(currentPage * itemsPerPage, totalBooks),
                  total: totalBooks
                })}
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-white rounded-xl p-8 border border-secondary-200 shadow-sm text-center">
                <ErrorMessage message={error} />
                <button onClick={fetchData} className="mt-4 btn-primary">
                  {t('common.retry')}
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && !books.length && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-96 animate-pulse border border-secondary-100" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && books.length === 0 && (
              <div className="bg-white rounded-xl p-12 border border-secondary-200 shadow-sm text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-100 text-secondary-400 mb-4">
                  <BookIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">{t('books.noResultsTitle')}</h3>
                <p className="text-secondary-600 mb-6 max-w-md mx-auto">{t('books.noResultsText')}</p>
                <button onClick={handleClearFilters} className="btn-primary">
                  {t('common.clearFilters')}
                </button>
              </div>
            )}

            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {books.map(book => (
                <BookCard
                  key={book._id}
                  book={book}
                  onSave={handleSaveBook}
                  onUnsave={handleUnsaveBook}
                  isSaved={savedBooks.has(book._id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BooksPage;
