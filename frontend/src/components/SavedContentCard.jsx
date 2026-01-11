import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, GraduationCap, ExternalLink, Trash2, PlayCircle } from 'lucide-react';

const SavedContentCard = ({ 
  item, 
  type,
  onRemove 
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const isRTL = i18n.language === 'ar';

  const handleViewDetails = () => {
    const path = type === 'course' ? `/courses/${item._id}` : `/books/${item._id}`;
    navigate(path);
  };

  const handleRemove = () => {
    if (showRemoveConfirm) {
      onRemove(item._id, type);
      setShowRemoveConfirm(false);
    } else {
      setShowRemoveConfirm(true);
      setTimeout(() => setShowRemoveConfirm(false), 3000);
    }
  };

  const Icon = type === 'course' ? GraduationCap : BookOpen;
  const bgColor = type === 'course' ? 'bg-blue-50' : 'bg-green-50';
  const iconColor = type === 'course' ? 'text-blue-600' : 'text-green-600';
  const borderColor = type === 'course' ? 'border-blue-200' : 'border-green-200';

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden hover:shadow-md transition-all duration-200 group`}>
      <div className={`${bgColor} ${borderColor} border-b p-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <span className={`text-sm font-medium ${iconColor}`}>
            {type === 'course' ? t('courses.title') : t('books.title')}
          </span>
        </div>
        <button
          onClick={handleRemove}
          className={`p-1.5 rounded transition-all ${
            showRemoveConfirm
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'text-secondary-400 hover:text-red-600 hover:bg-white'
          }`}
          title={showRemoveConfirm ? t('common.confirm') : t('dashboard.removeFromSaved')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {item.title}
        </h3>

        <div className="space-y-2 mb-3">
          {type === 'course' && item.source && (
            <p className="text-sm text-secondary-600">
              <span className="font-medium">{t('courses.source')}:</span> {item.source}
            </p>
          )}
          {type === 'book' && item.author && (
            <p className="text-sm text-secondary-600">
              <span className="font-medium">{t('books.author')}:</span> {item.author}
            </p>
          )}
          {item.subject && (
            <span className="inline-block text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded">
              {t(`subjects.${item.subject}`, item.subject)}
            </span>
          )}
          {item.educationLevel && (
            <span className="inline-block text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded ml-2">
              {t(`levels.${item.educationLevel}`, item.educationLevel)}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-sm text-secondary-600 mb-4 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={handleViewDetails}
            className="btn-primary flex-1 text-sm py-2 flex items-center justify-center space-x-2 space-x-reverse"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{t('dashboard.continueLearning')}</span>
          </button>
          <button
            onClick={handleViewDetails}
            className="btn-secondary p-2"
            title={t('common.view')}
          >
            <ExternalLink className={`w-4 h-4 ${isRTL ? 'scale-x-[-1]' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedContentCard;
