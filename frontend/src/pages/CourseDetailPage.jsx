import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Clock, 
  BookOpen, 
  User, 
  Heart, 
  ExternalLink, 
  ArrowRight, 
  ChevronRight,
  Star,
  Globe,
  Award,
  BookMarked
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { coursesAPI } from '../api/courses';
import CourseCard from '../components/CourseCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isRtl = i18n.language === 'ar';
  
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: course, loading, error, fetchData } = useApi(
    () => coursesAPI.getCourseById(id),
    [id]
  );

  const { data: relatedData, loading: loadingRelated } = useApi(
    () => course ? coursesAPI.getCourses({ subject: course.subject, limit: 3 }) : Promise.resolve({ courses: [] }),
    [course]
  );

  useEffect(() => {
    if (course && user) {
      // Check if course is saved by user
      // This depends on how the API returns saved status, 
      // for now we'll assume we might need to check a separate list or it's in the course object
      setIsSaved(course.isSaved || false);
    }
  }, [course, user]);

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        await coursesAPI.unsaveCourse(id);
        setIsSaved(false);
      } else {
        await coursesAPI.saveCourse(id);
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
  if (!course) return <div className="text-center py-20">{t('courses.notFound')}</div>;

  const relatedCourses = relatedData?.courses?.filter(c => c._id !== id) || [];

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
    <div className="min-h-screen bg-secondary-50 pb-20">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-sm font-medium text-secondary-500">
            <Link to="/courses" className="hover:text-primary-600 transition-colors">
              {t('courses.title')}
            </Link>
            <ChevronRight className={`w-4 h-4 mx-2 ${isRtl ? 'rotate-180' : ''}`} />
            <span className="text-secondary-900 truncate">{course.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white border-b border-secondary-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Course Info */}
            <div className="order-2 lg:order-1">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider">
                  {t(`subjects.${course.subject.toLowerCase()}`)}
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary-100 text-secondary-700 text-xs font-bold uppercase tracking-wider">
                  {t(`levels.${course.educationLevel}`)}
                </span>
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold uppercase tracking-wider flex items-center">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  {course.difficulty || 'Beginner'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold text-secondary-900 leading-tight mb-6">
                {course.title}
              </h1>
              
              <p className="text-xl text-secondary-600 mb-8 leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href={course.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 group"
                >
                  <span>{t('courses.startLearning')}</span>
                  <ExternalLink className={`w-5 h-5 ${isRtl ? 'mr-3' : 'ml-3'} group-hover:scale-110 transition-transform`} />
                </a>
                
                <button
                  onClick={handleToggleSave}
                  disabled={saving}
                  className={`inline-flex items-center px-8 py-4 font-bold rounded-xl transition-all border-2 ${
                    isSaved
                      ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                      : 'bg-white border-secondary-200 text-secondary-700 hover:border-red-400 hover:text-red-500 shadow-sm'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'} ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? t('courses.saved') : t('courses.saveForLater')}</span>
                </button>
              </div>
            </div>

            {/* Course Thumbnail */}
            <div className="order-1 lg:order-2">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video bg-secondary-200">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
                    <BookOpen className="w-32 h-32 text-white opacity-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Details Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* About Course */}
            <section>
              <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center">
                <BookMarked className={`w-6 h-6 ${isRtl ? 'ml-3' : 'mr-3'} text-primary-600`} />
                {t('courses.aboutThisCourse')}
              </h2>
              <div className="prose prose-lg prose-secondary max-w-none">
                <p className="text-secondary-700 leading-relaxed whitespace-pre-line">
                  {course.description}
                </p>
              </div>
            </section>

            {/* Instructor / Source */}
            {course.source && (
              <section className="bg-white rounded-2xl p-8 border border-secondary-200 shadow-sm">
                <h2 className="text-xl font-bold text-secondary-900 mb-6">{t('courses.offeredBy')}</h2>
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-xl bg-secondary-100 flex items-center justify-center text-secondary-400 font-bold text-2xl">
                    {course.source.charAt(0)}
                  </div>
                  <div className={`${isRtl ? 'mr-4' : 'ml-4'}`}>
                    <h3 className="text-lg font-bold text-secondary-900">{course.source}</h3>
                    <p className="text-secondary-500">{t('courses.contentProvider')}</p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-secondary-200 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-secondary-900 mb-6">{t('courses.courseFeatures')}</h3>
              
              <ul className="space-y-4">
                <li className="flex items-center justify-between py-3 border-b border-secondary-50">
                  <div className="flex items-center text-secondary-600">
                    <Clock className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'} text-primary-500`} />
                    <span>{t('courses.duration')}</span>
                  </div>
                  <span className="font-semibold text-secondary-900">{formatDuration(course.duration)}</span>
                </li>
                <li className="flex items-center justify-between py-3 border-b border-secondary-50">
                  <div className="flex items-center text-secondary-600">
                    <Globe className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'} text-primary-500`} />
                    <span>{t('courses.language')}</span>
                  </div>
                  <span className="font-semibold text-secondary-900 uppercase">{course.language}</span>
                </li>
                <li className="flex items-center justify-between py-3 border-b border-secondary-50">
                  <div className="flex items-center text-secondary-600">
                    <Award className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'} text-primary-500`} />
                    <span>{t('courses.level')}</span>
                  </div>
                  <span className="font-semibold text-secondary-900">{t(`levels.${course.educationLevel}`)}</span>
                </li>
                <li className="flex items-center justify-between py-3">
                  <div className="flex items-center text-secondary-600">
                    <User className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'} text-primary-500`} />
                    <span>{t('courses.source')}</span>
                  </div>
                  <span className="font-semibold text-secondary-900 truncate max-w-[120px]">{course.source}</span>
                </li>
              </ul>

              <div className="mt-8 pt-8 border-t border-secondary-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-secondary-500">{t('courses.shareCourse')}</span>
                </div>
                {/* Share buttons would go here */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <div className="bg-secondary-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-secondary-900">{t('courses.relatedCourses')}</h2>
              <Link to="/courses" className="text-primary-600 font-bold flex items-center hover:text-primary-700">
                <span>{t('common.viewAll')}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'mr-2 rotate-180' : 'ml-2'}`} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedCourses.map(course => (
                <CourseCard 
                  key={course._id} 
                  course={course}
                  isSaved={false} // Would need proper state
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

export default CourseDetailPage;
