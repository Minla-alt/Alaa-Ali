import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

const ProgressItem = ({ 
  id,
  title, 
  type,
  percentage, 
  lastAccessed,
  subject,
  onContinue 
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      const path = type === 'course' ? `/courses/${id}` : `/books/${id}`;
      navigate(path);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.notSpecified');
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressBgColor = () => {
    if (percentage >= 100) return 'bg-green-100';
    if (percentage >= 75) return 'bg-blue-100';
    if (percentage >= 50) return 'bg-yellow-100';
    if (percentage >= 25) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 space-x-reverse flex-1">
          <div className={`p-2 rounded-lg ${type === 'course' ? 'bg-blue-100' : 'bg-green-100'} flex-shrink-0`}>
            {type === 'course' ? (
              <GraduationCap className={`w-5 h-5 ${type === 'course' ? 'text-blue-600' : 'text-green-600'}`} />
            ) : (
              <BookOpen className={`w-5 h-5 text-green-600`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-secondary-900 mb-1 line-clamp-2">
              {title}
            </h4>
            {subject && (
              <span className="inline-block text-xs text-secondary-600 bg-secondary-100 px-2 py-1 rounded">
                {t(`subjects.${subject}`, subject)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleContinue}
          className="btn-primary text-sm px-4 py-2 flex items-center space-x-2 space-x-reverse flex-shrink-0 ml-4"
        >
          <span>{t('dashboard.continue')}</span>
          <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary-600">{t('dashboard.progressLabel')}</span>
          <span className="font-semibold text-secondary-900">{percentage}%</span>
        </div>
        <div className={`w-full h-2 rounded-full ${getProgressBgColor()}`}>
          <div
            className={`h-full rounded-full ${getProgressColor()} transition-all duration-500`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {lastAccessed && (
          <p className="text-xs text-secondary-500">
            {t('dashboard.lastAccessed')}: {formatDate(lastAccessed)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgressItem;
