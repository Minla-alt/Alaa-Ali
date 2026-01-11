import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import { booksAPI } from '../api/books';
import { BookOpen, Calendar, User, Star, ArrowLeft, ExternalLink } from 'lucide-react';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const BookDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const { data: book, loading, error, fetchData } = useApi(
    () => booksAPI.getBookById(id),
    [id]
  );

  const handleSaveBook = async () => {
    try {
      if (isSaved) {
        await booksAPI.unsaveBook(id);
        setIsSaved(false);
      } else {
        await booksAPI.saveBook(id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  if (!book) {
    return <ErrorMessage message={t('common.notFound', 'Book not found')} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 space-x-reverse text-secondary-600 hover:text-secondary-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('common.back')}</span>
      </button>

      {/* Book Header */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row">
          {/* Book Cover */}
          <div className="md:w-64 h-96 bg-gradient-to-br from-secondary-800 to-secondary-900 flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-24 h-24 text-white opacity-50 mx-auto mb-4" />
              <div className="bg-white px-2 py-1 rounded text-xs font-medium text-secondary-700">
                {book.language?.toUpperCase() || 'N/A'}
              </div>
            </div>
          </div>

          {/* Book Content */}
          <div className="flex-1 p-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-secondary-900">
                {book.title}
              </h1>
              <button
                onClick={handleSaveBook}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isSaved
                    ? 'bg-yellow-500 text-white'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-yellow-100'
                }`}
              >
                <Star className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 space-x-reverse">
                <User className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm text-secondary-500">{t('books.author')}</p>
                  <p className="font-medium">{book.author}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <Calendar className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm text-secondary-500">{t('books.published')}</p>
                  <p className="font-medium">
                    {book.publishedDate 
                      ? new Date(book.publishedDate).toLocaleDateString() 
                      : t('common.notSpecified', 'Not specified')
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm text-secondary-500">{t('courses.subject')}</p>
                  <p className="font-medium">{t('subjects.' + (book.subject || 'other').toLowerCase())}</p>
                </div>
              </div>
            </div>

            <p className="text-secondary-600 mb-6">
              {book.description || t('books.noDescription', 'No description available.')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {book.url && (
                <a
                  href={book.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 space-x-reverse bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t('books.readBook', 'Read Book')}</span>
                </a>
              )}
              
              <button
                onClick={handleSaveBook}
                className={`flex items-center space-x-2 space-x-reverse px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  isSaved
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'bg-secondary-100 text-secondary-700 border border-secondary-300 hover:bg-secondary-200'
                }`}
              >
                <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? t('books.saved') : t('books.save')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          {t('books.additionalInfo', 'Additional Information')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-secondary-900 mb-2">{t('courses.language')}</h3>
            <p className="text-secondary-600">
              {book.language === 'en' ? t('common.english') : 
               book.language === 'ar' ? t('common.arabic') : 
               t('common.language', 'Bilingual')}
            </p>
          </div>
          
          {book.createdAt && (
            <div>
              <h3 className="font-medium text-secondary-900 mb-2">{t('books.addedOn', 'Added On')}</h3>
              <p className="text-secondary-600">
                {new Date(book.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
          
          {book.rating && (
            <div>
              <h3 className="font-medium text-secondary-900 mb-2">{t('books.rating', 'Rating')}</h3>
              <div className="flex items-center space-x-1 space-x-reverse">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`w-4 h-4 ${
                      index < Math.floor(book.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-secondary-300'
                    }`}
                  />
                ))}
                <span className="text-secondary-600 text-sm ml-2">({book.rating})</span>
              </div>
            </div>
          )}
          
          {book.isbn && (
            <div>
              <h3 className="font-medium text-secondary-900 mb-2">ISBN</h3>
              <p className="text-secondary-600">{book.isbn}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;