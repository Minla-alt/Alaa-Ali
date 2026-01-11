import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, User, Heart } from 'lucide-react';

const CourseCard = ({ course, onSave, onUnsave, isSaved }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) {
      onUnsave(course._id);
    } else {
      onSave(course._id);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return t('common.notSpecified');
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}${t('common.h')} ${remainingMinutes}${t('common.m')}`;
    }
    return `${remainingMinutes}${t('common.m')}`;
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Thumbnail */}
      <Link to={`/courses/${course._id}`} className="relative h-48 overflow-hidden bg-secondary-100">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
            <BookOpen className="w-12 h-12 text-white opacity-50" />
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
          aria-label={isSaved ? t('courses.unsave') : t('courses.save')}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Badges */}
        <div className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} flex flex-wrap gap-2`}>
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-secondary-700 shadow-sm">
            {course.language}
          </span>
          <span className="bg-primary-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            {t(`subjects.${course.subject.toLowerCase()}`)}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <Link to={`/courses/${course._id}`}>
            <h3 className="text-lg font-bold text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {course.title}
            </h3>
          </Link>
          <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-y-2 pt-4 border-t border-secondary-100">
          <div className="flex items-center text-xs text-secondary-500">
            <Clock className={`w-3.5 h-3.5 ${isRtl ? 'ml-1.5' : 'mr-1.5'} text-primary-500`} />
            <span>{formatDuration(course.duration)}</span>
          </div>
          <div className="flex items-center text-xs text-secondary-500">
            <User className={`w-3.5 h-3.5 ${isRtl ? 'ml-1.5' : 'mr-1.5'} text-primary-500`} />
            <span className="truncate">{course.source}</span>
          </div>
          <div className="flex items-center text-xs text-secondary-500 col-span-2">
            <BookOpen className={`w-3.5 h-3.5 ${isRtl ? 'ml-1.5' : 'mr-1.5'} text-primary-500`} />
            <span>{t(`levels.${course.educationLevel}`)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
