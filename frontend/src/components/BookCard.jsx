import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Book, User, Calendar, Heart, Globe } from 'lucide-react';

const BookCard = ({ book, onSave, onUnsave, isSaved }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) {
      onUnsave(book._id);
    } else {
      onSave(book._id);
    }
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Cover */}
      <Link to={`/books/${book._id}`} className="relative h-64 overflow-hidden bg-secondary-100">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary-700 to-secondary-900">
            <Book className="w-16 h-16 text-white opacity-30" />
          </div>
        )}
        
        {/* Save Button */}
        <button
          onClick={handleSaveClick}
          className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} p-2 rounded-full shadow-md transition-all duration-200 ${
            isSaved 
              ? 'bg-red-50 text-red-500' 
              : 'bg-white/80 text-secondary-600 hover:bg-white hover:text-red-500'
          }`}
          aria-label={isSaved ? t('books.unsave') : t('books.save')}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Badges */}
        <div className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} flex flex-wrap gap-2`}>
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-secondary-700 shadow-sm">
            {book.language?.toUpperCase()}
          </span>
          <span className="bg-secondary-800 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            {t(`subjects.${book.subject.toLowerCase()}`)}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <Link to={`/books/${book._id}`}>
            <h3 className="text-lg font-bold text-secondary-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
              {book.title}
            </h3>
          </Link>
          <div className="flex items-center text-sm text-secondary-500 mb-3">
            <User className={`w-3.5 h-3.5 ${isRtl ? 'ml-1' : 'mr-1'}`} />
            <span className="truncate">{book.author}</span>
          </div>
          <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
            {book.description}
          </p>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-y-2 pt-4 border-t border-secondary-100">
          <div className="flex items-center text-xs text-secondary-500">
            <Calendar className={`w-3.5 h-3.5 ${isRtl ? 'ml-1.5' : 'mr-1.5'} text-secondary-400`} />
            <span>{book.publishedDate ? new Date(book.publishedDate).getFullYear() : t('common.notSpecified')}</span>
          </div>
          <div className="flex items-center text-xs text-secondary-500">
            <Globe className={`w-3.5 h-3.5 ${isRtl ? 'ml-1.5' : 'mr-1.5'} text-secondary-400`} />
            <span>{book.source}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
