import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { coursesAPI } from '../api/courses';
import { Search, Filter, BookOpen, Clock, User, Star, Save, Undo2 } from 'lucide-react';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Courses = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    educationLevel: '',
    language: ''
  });
  const [savedCourses, setSavedCourses] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const { data: coursesData, loading, error, fetchData } = useApi(
    () => coursesAPI.getCourses({
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

  const levels = [
    { value: '', label: t('courses.allLevels') },
    { value: 'Elementary', label: t('levels.elementary') },
    { value: 'MiddleSchool', label: t('levels.middleSchool') },
    { value: 'HighSchool', label: t('levels.highSchool') },
    { value: 'University', label: t('levels.university') },
    { value: 'Professional', label: t('levels.professional') },
    { value: 'SelfPaced', label: t('levels.selfPaced') }
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

  const handleSaveCourse = async (courseId) => {
    try {
      if (savedCourses.has(courseId)) {
        await coursesAPI.unsaveCourse(courseId);
        setSavedCourses(prev => {
          const newSet = new Set(prev);
          newSet.delete(courseId);
          return newSet;
        });
      } else {
        await coursesAPI.saveCourse(courseId);
        setSavedCourses(prev => new Set([...prev, courseId]));
      }
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  if (loading && !coursesData) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const courses = coursesData?.courses || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          {t('courses.title')}
        </h1>
        <p className="text-secondary-600">
          {t('courses.subtitle', 'Discover and learn from our curated collection of courses')}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('courses.search')}
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

          {/* Level Filter */}
          <select
            value={filters.educationLevel}
            onChange={(e) => handleFilterChange('educationLevel', e.target.value)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {levels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Language Filter */}
          <select
            value={filters.language}
            onChange={(e) => handleFilterChange('language', e.target.value)}
            className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {languages.map(language => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => setFilters({ search: '', subject: '', educationLevel: '', language: '' })}
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
          {t('courses.results', '{{count}} courses found', { count: courses.length })}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 animate-pulse">
              <div className="bg-secondary-200 h-40 rounded-lg mb-4"></div>
              <div className="bg-secondary-200 h-4 rounded mb-2"></div>
              <div className="bg-secondary-200 h-3 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Courses Grid */}
      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              {/* Course Image */}
              <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600 relative">
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleSaveCourse(course._id)}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      savedCourses.has(course._id)
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white text-secondary-600 hover:bg-yellow-100'
                    }`}
                  >
                    {savedCourses.has(course._id) ? (
                      <Star className="w-4 h-4 fill-current" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="bg-white px-2 py-1 rounded text-xs font-medium text-secondary-700">
                    {course.language?.toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-4">
                <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-secondary-600 text-sm mb-3 line-clamp-2">
                  {course.description}
                </p>

                {/* Course Meta */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-secondary-500">
                    <BookOpen className="w-3 h-3 mr-1" />
                    <span>{t('subjects.' + (course.subject || 'other').toLowerCase())}</span>
                  </div>
                  <div className="flex items-center text-xs text-secondary-500">
                    <User className="w-3 h-3 mr-1" />
                    <span>{course.source}</span>
                  </div>
                  <div className="flex items-center text-xs text-secondary-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{course.duration || t('common.notSpecified', 'Not specified')}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 space-x-reverse">
                  <Link
                    to={`/courses/${course._id}`}
                    className="flex-1 bg-primary-600 text-white text-center py-2 px-3 rounded text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
                  >
                    {t('courses.viewDetails')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            {t('courses.noCourses')}
          </h3>
          <p className="text-secondary-600 mb-4">
            {t('courses.tryDifferentFilters', 'Try adjusting your filters to see more results')}
          </p>
          <button
            onClick={() => setFilters({ search: '', subject: '', educationLevel: '', language: '' })}
            className="btn-primary"
          >
            {t('courses.clearAllFilters', 'Clear all filters')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Courses;