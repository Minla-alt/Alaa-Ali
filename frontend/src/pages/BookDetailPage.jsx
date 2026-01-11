import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Book as BookIcon, 
  User, 
  Heart, 
  ExternalLink, 
  ArrowRight, 
  ChevronRight,
  Globe,
  Calendar,
  Hash,
  BookOpen,
  Library
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { booksAPI } from '../api/books';
import BookCard from '../components/BookCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';

const BookDetailPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isRtl = i18n.language === 'ar';
  
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: book, loading, error, fetchData } = useApi(
    () => booksAPI.getBookById(id),
    [id]
  );

  const { data: relatedData, loading: loadingRelated } = useApi(
    () => book ? booksAPI.getBooks({ subject: book.subject, limit: 3 }) : Promise.resolve({ books: [] }),
    [book]
  );

  useEffect(() => {
    if (book && user) {
      setIsSaved(book.isSaved || false);
    }
  }, [book, user]);

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        await booksAPI.unsaveBook(id);
        setIsSaved(false);
      } else {
        await booksAPI.saveBook(id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!book) return <div className="text-center py-20">{t('books.notFound')}</div>;

  const relatedBooks = relatedData?.books?.filter(b => b._id !== id) || [];

  return (
    <div className="min-h-screen bg-secondary-50 pb-20">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-sm font-medium text-secondary-500">
            <Link to="/books" className="hover:text-primary-600 transition-colors">
              {t('books.title')}
            </Link>
            <ChevronRight className={`w-4 h-4 mx-2 ${isRtl ? 'rotate-180' : ''}`} />
            <span className="text-secondary-900 truncate">{book.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Book Cover */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl bg-secondary-200 border border-secondary-100">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary-700 to-secondary-900">
                    <BookIcon className="w-32 h-32 text-white opacity-20" />
                  </div>
                )}
              </div>
              
              <div className="mt-8 space-y-4">
                <a
                  href={book.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center px-6 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 group"
                >
                  <BookOpen className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'}`} />
                  <span>{t('books.readOnline')}</span>
                  <ExternalLink className={`w-4 h-4 ${isRtl ? 'mr-2' : 'ml-2'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </a>
                
                <button
                  onClick={handleToggleSave}
                  disabled={saving}
                  className={`w-full flex items-center justify-center px-6 py-4 font-bold rounded-xl transition-all border-2 ${
                    isSaved
                      ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                      : 'bg-white border-secondary-200 text-secondary-700 hover:border-red-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'} ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? t('books.saved') : t('books.saveForLater')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Book Details */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-secondary-200">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-secondary-100 text-secondary-700 text-xs font-bold uppercase tracking-wider">
                  {t(`subjects.${book.subject.toLowerCase()}`)}
                </span>
                <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider">
                  {book.language?.toUpperCase()}
                </span>
                {book.educationLevel && (
                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                    {t(`levels.${book.educationLevel}`)}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-secondary-900 mb-4">
                {book.title}
              </h1>
              
              <div className="flex items-center text-xl text-secondary-600 mb-8 font-medium">
                <User className={`w-6 h-6 ${isRtl ? 'ml-2' : 'mr-2'} text-primary-500`} />
                <span>{book.author}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-8 border-y border-secondary-100 mb-8">
                <div className="text-center sm:text-right">
                  <p className="text-sm text-secondary-500 mb-1">{t('books.published')}</p>
                  <p className="font-bold text-secondary-900 flex items-center justify-center sm:justify-start">
                    <Calendar className="w-4 h-4 mx-1 text-secondary-400" />
                    {book.publishedDate ? new Date(book.publishedDate).getFullYear() : 'N/A'}
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-sm text-secondary-500 mb-1">{t('books.pages')}</p>
                  <p className="font-bold text-secondary-900 flex items-center justify-center sm:justify-start">
                    <BookIcon className="w-4 h-4 mx-1 text-secondary-400" />
                    {book.pageCount || 'N/A'}
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-sm text-secondary-500 mb-1">{t('books.source')}</p>
                  <p className="font-bold text-secondary-900 flex items-center justify-center sm:justify-start">
                    <Globe className="w-4 h-4 mx-1 text-secondary-400" />
                    <span className="truncate">{book.source}</span>
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-sm text-secondary-500 mb-1">ISBN</p>
                  <p className="font-bold text-secondary-900 flex items-center justify-center sm:justify-start text-xs">
                    <Hash className="w-3 h-3 mx-1 text-secondary-400" />
                    {book.isbn || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="prose prose-lg prose-secondary max-w-none">
                <h3 className="text-xl font-bold text-secondary-900 mb-4">{t('books.description')}</h3>
                <p className="text-secondary-700 leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>

              <div className="mt-12 pt-8 border-t border-secondary-100">
                <div className="flex items-center text-sm text-secondary-500">
                  <Library className={`w-5 h-5 ${isRtl ? 'ml-2' : 'mr-2'} text-secondary-400`} />
                  <span>{t('books.publisher')}: {book.publisher || t('common.notSpecified')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <div className="bg-white py-20 border-t border-secondary-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-secondary-900">{t('books.relatedBooks')}</h2>
              <Link to="/books" className="text-primary-600 font-bold flex items-center hover:text-primary-700">
                <span>{t('common.viewAll')}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'mr-2 rotate-180' : 'ml-2'}`} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedBooks.map(book => (
                <BookCard 
                  key={book._id} 
                  book={book} 
                  isSaved={false}
                  onSave={() => {}} 
                  onUnsave={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetailPage;
