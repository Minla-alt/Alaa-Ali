import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import { coursesAPI } from '../api/courses';
import { BookOpen, Clock, User, Star, ArrowLeft, ExternalLink } from 'lucide-react';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const CourseDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const { data: course, loading, error, fetchData } = useApi(
    () => coursesAPI.getCourseById(id),
    [id]
  );

  const handleSaveCourse = async () => {
    try {
      if (isSaved) {
        await coursesAPI.unsaveCourse(id);
        setIsSaved(false);
      } else {
        await coursesAPI.saveCourse(id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  if (!course) {
    return <ErrorMessage message={t('common.notFound', 'Course not found')} />;
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

      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden mb-8">
        {/* Course Image/Banner */}
        <div className="h-64 bg-gradient-to-r from-primary-400 to-primary-600 relative">
          <div className="absolute top-4 right-4">
            <button
              onClick={handleSaveCourse}
              className={`p-3 rounded-full transition-colors duration-200 ${
                isSaved
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white text-secondary-600 hover:bg-yellow-100'
              }`}
            >
              <Star className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
          <div className="absolute bottom-4 left-4">
            <span className="bg-white px-3 py-1 rounded text-sm font-medium text-secondary-700">
              {course.language?.toUpperCase() || 'N/A'}
            </span>
          </div>
        </div>

        {/* Course Content */}
        <div className="p-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">
            {course.title}
          </h1>
          
          <p className="text-xl text-secondary-600 mb-6">
            {course.description}
          </p>

          {/* Course Meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center space-x-3 space-x-reverse">
              <BookOpen className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm text-secondary-500">{t('courses.subject')}</p>
                <p className="font-medium">{t('subjects.' + (course.subject || 'other').toLowerCase())}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <Clock className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm text-secondary-500">{t('courses.duration')}</p>
                <p className="font-medium">{course.duration || t('common.notSpecified', 'Not specified')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <User className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm text-secondary-500">{t('courses.source')}</p>
                <p className="font-medium">{course.source}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {course.url && (
              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 space-x-reverse bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t('courses.startCourse', 'Start Course')}</span>
              </a>
            )}
            
            <button
              onClick={handleSaveCourse}
              className={`flex items-center space-x-2 space-x-reverse px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                isSaved
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'bg-secondary-100 text-secondary-700 border border-secondary-300 hover:bg-secondary-200'
              }`}
            >
              <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? t('courses.saved') : t('courses.save')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          {t('courses.additionalInfo', 'Additional Information')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-secondary-900 mb-2">{t('courses.educationLevel')}</h3>
            <p className="text-secondary-600">{t('levels.' + (course.educationLevel || 'selfPaced').toLowerCase())}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-secondary-900 mb-2">{t('courses.language')}</h3>
            <p className="text-secondary-600">
              {course.language === 'en' ? t('common.english') : 
               course.language === 'ar' ? t('common.arabic') : 
               t('common.language', 'Bilingual')}
            </p>
          </div>
          
          {course.createdAt && (
            <div>
              <h3 className="font-medium text-secondary-900 mb-2">{t('courses.addedOn', 'Added On')}</h3>
              <p className="text-secondary-600">
                {new Date(course.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
          
          {course.rating && (
            <div>
              <h3 className="font-medium text-secondary-900 mb-2">{t('courses.rating', 'Rating')}</h3>
              <div className="flex items-center space-x-1 space-x-reverse">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`w-4 h-4 ${
                      index < Math.floor(course.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-secondary-300'
                    }`}
                  />
                ))}
                <span className="text-secondary-600 text-sm ml-2">({course.rating})</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;