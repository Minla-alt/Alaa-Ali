import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { recommendationsAPI } from '../api/recommendations';
import { coursesAPI } from '../api/courses';
import { booksAPI } from '../api/books';
import RecommendationCard from '../components/RecommendationCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { 
  Brain, 
  RefreshCw, 
  Clock,
  TrendingUp,
  BookOpen,
  Flame,
  Filter,
  X,
  Star,
  Calendar,
  Target,
  Award,
  BarChart3,
  ChevronRight,
  Heart
} from 'lucide-react';

const AIRecommendationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [recommendation, setRecommendation] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [timeAvailable, setTimeAvailable] = useState(60);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [contentType, setContentType] = useState('both'); // 'courses', 'books', 'both'
  const [isSaved, setIsSaved] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    recommendation: false,
    feedback: false,
    save: false,
    newRecommendation: false
  });
  const [toast, setToast] = useState(null);
  const [cooldownTimer, setCooldownTimer] = useState(0);

  // API hooks
  const { 
    data: userStats, 
    loading: statsLoading,
    fetchData: fetchUserStats 
  } = useApi(recommendationsAPI.getUserStats, []);

  const { 
    data: preferences, 
    loading: preferencesLoading,
    fetchData: fetchPreferences 
  } = useApi(recommendationsAPI.getPreferences, []);

  const { 
    data: history, 
    loading: historyLoading,
    fetchData: fetchHistory 
  } = useApi(() => recommendationsAPI.getRecommendationHistory(5), []);

  // Load initial data
  useEffect(() => {
    loadRecommendation();
    fetchUserStats();
    fetchPreferences();
    fetchHistory();
  }, []);

  // Cooldown timer for new recommendations
  useEffect(() => {
    let interval;
    if (cooldownTimer > 0) {
      interval = setInterval(() => {
        setCooldownTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTimer]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadRecommendation = async (filters = {}) => {
    try {
      setLoadingStates(prev => ({ ...prev, recommendation: true }));
      const filtersWithUserPrefs = {
        timeAvailable,
        subject: selectedSubject,
        contentType,
        ...filters
      };
      
      const data = await recommendationsAPI.getDailyRecommendation(filtersWithUserPrefs);
      setRecommendation(data);
      setFeedbackSubmitted(false);
      setIsSaved(false);
      
      // Check if content is saved
      if (data?.item?._id) {
        try {
          const savedStatus = await recommendationsAPI.isContentSaved(data.item._id, data.type);
          setIsSaved(savedStatus.isSaved);
        } catch (error) {
          console.log('Could not check saved status:', error);
        }
      }
    } catch (error) {
      console.error('Error loading recommendation:', error);
      showToast(t('recommendations.error.serverError'), 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, recommendation: false }));
    }
  };

  const handleGetNewRecommendation = () => {
    if (cooldownTimer > 0) return;
    
    setLoadingStates(prev => ({ ...prev, newRecommendation: true }));
    loadRecommendation();
    setCooldownTimer(30); // 30 second cooldown
    showToast(t('recommendations.getRecommendation'), 'info');
    
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, newRecommendation: false }));
    }, 1000);
  };

  const handleFeedback = async (feedback) => {
    if (!recommendation) return;

    try {
      setLoadingStates(prev => ({ ...prev, feedback: true }));
      await recommendationsAPI.submitFeedback(recommendation._id, feedback);
      setFeedbackSubmitted(true);
      showToast(t('recommendations.success.feedbackSubmitted'));
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast(t('recommendations.error.feedbackFailed'), 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, feedback: false }));
    }
  };

  const handleSave = async (contentId, contentType) => {
    try {
      setLoadingStates(prev => ({ ...prev, save: true }));
      
      if (isSaved) {
        await recommendationsAPI.unsaveContent(contentId, contentType);
        setIsSaved(false);
        showToast(t('recommendations.success.itemUnsaved'));
      } else {
        await recommendationsAPI.saveContent(contentId, contentType);
        setIsSaved(true);
        showToast(t('recommendations.success.itemSaved'));
      }
    } catch (error) {
      console.error('Error saving content:', error);
      showToast(t('recommendations.error.saveFailed'), 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, save: false }));
    }
  };

  const handleStartLearning = (contentId, type) => {
    if (type === 'course') {
      navigate(`/courses/${contentId}`);
    } else {
      navigate(`/books/${contentId}`);
    }
  };

  const handlePreferenceUpdate = async () => {
    try {
      const prefs = { timeAvailable, subject: selectedSubject, contentType };
      await recommendationsAPI.updatePreferences(prefs);
      showToast('Preferences updated!', 'success');
      setShowPreferences(false);
      loadRecommendation(); // Reload with new preferences
    } catch (error) {
      console.error('Error updating preferences:', error);
      showToast('Failed to update preferences', 'error');
    }
  };

  const getTimeDisplay = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatStreak = (days) => {
    return days === 1 ? '1 day' : `${days} days`;
  };

  // Subject options
  const subjectOptions = [
    { value: null, label: t('recommendations.preferences.subjectAll') },
    { value: 'math', label: t('subjects.math') },
    { value: 'science', label: t('subjects.science') },
    { value: 'programming', label: t('subjects.programming') },
    { value: 'languages', label: t('subjects.languages') },
    { value: 'literature', label: t('subjects.literature') },
    { value: 'history', label: t('subjects.history') },
    { value: 'other', label: t('subjects.other') }
  ];

  // Time options
  const timeOptions = [
    { value: 15, label: t('recommendations.preferences.timeOptions.15') },
    { value: 30, label: t('recommendations.preferences.timeOptions.30') },
    { value: 60, label: t('recommendations.preferences.timeOptions.60') },
    { value: 120, label: t('recommendations.preferences.timeOptions.120') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' :
          toast.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center space-x-2 space-x-reverse">
            {toast.type === 'success' && <Star className="w-4 h-4" />}
            {toast.type === 'error' && <X className="w-4 h-4" />}
            {toast.type === 'info' && <Brain className="w-4 h-4" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 space-x-reverse mb-4">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-3 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-secondary-900">
              {t('recommendations.title')}
            </h1>
          </div>
          <p className="text-secondary-600 max-w-2xl mx-auto text-lg">
            {t('recommendations.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Preferences Filter */}
            <div className="bg-white rounded-xl shadow-lg border border-secondary-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900 flex items-center space-x-2 space-x-reverse">
                  <Filter className="w-5 h-5" />
                  <span>{t('recommendations.preferences.title')}</span>
                </h3>
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {showPreferences ? t('common.cancel') : t('common.edit')}
                </button>
              </div>

              {showPreferences ? (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                  {/* Time Available */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      {t('recommendations.preferences.timeAvailable')}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {timeOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => setTimeAvailable(option.value)}
                          className={`p-3 rounded-lg text-sm font-medium transition-all ${
                            timeAvailable === option.value
                              ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                              : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 border-2 border-transparent'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      {t('recommendations.preferences.subject')}
                    </label>
                    <select
                      value={selectedSubject || ''}
                      onChange={(e) => setSelectedSubject(e.target.value || null)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {subjectOptions.map(option => (
                        <option key={option.value || 'all'} value={option.value || ''}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Content Type */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      {t('recommendations.preferences.contentType')}
                    </label>
                    <div className="flex space-x-2 space-x-reverse">
                      {[
                        { value: 'both', label: t('recommendations.preferences.preferBoth') },
                        { value: 'courses', label: t('recommendations.preferences.preferCourses') },
                        { value: 'books', label: t('recommendations.preferences.preferBooks') }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => setContentType(option.value)}
                          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            contentType === option.value
                              ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                              : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 border-2 border-transparent'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handlePreferenceUpdate}
                    className="btn-primary w-full"
                  >
                    {t('common.save')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4 space-x-reverse text-sm text-secondary-600">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Clock className="w-4 h-4" />
                    <span>{getTimeDisplay(timeAvailable)}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Target className="w-4 h-4" />
                    <span>{selectedSubject ? t('subjects.' + selectedSubject) : t('recommendations.preferences.subjectAll')}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <BookOpen className="w-4 h-4" />
                    <span>
                      {contentType === 'both' ? t('recommendations.preferences.preferBoth') :
                       contentType === 'courses' ? t('recommendations.preferences.preferCourses') :
                       t('recommendations.preferences.preferBooks')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Main Recommendation */}
            <div className="relative">
              {loadingStates.recommendation ? (
                <div className="bg-white rounded-xl shadow-lg border border-secondary-200 p-12">
                  <Loading message={t('recommendations.loading')} />
                </div>
              ) : recommendation ? (
                <RecommendationCard
                  recommendation={recommendation}
                  onFeedback={handleFeedback}
                  onSave={handleSave}
                  onUnsaved={handleSave}
                  onStartLearning={handleStartLearning}
                  isSaved={isSaved}
                  loadingStates={loadingStates}
                  feedbackSubmitted={feedbackSubmitted}
                />
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-secondary-200 p-12 text-center">
                  <Brain className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {t('recommendations.noRecommendation')}
                  </h3>
                  <button
                    onClick={() => loadRecommendation()}
                    className="btn-primary"
                  >
                    {t('recommendations.tryAgain')}
                  </button>
                </div>
              )}

              {/* New Recommendation Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={handleGetNewRecommendation}
                  disabled={loadingStates.newRecommendation || cooldownTimer > 0}
                  className="inline-flex items-center space-x-2 space-x-reverse bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingStates.newRecommendation ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>
                    {cooldownTimer > 0 
                      ? `${t('recommendations.getRecommendation')} (${cooldownTimer}s)` 
                      : t('recommendations.getRecommendation')
                    }
                  </span>
                </button>
              </div>
            </div>

            {/* Recent Recommendations History */}
            {history && history.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-secondary-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-secondary-900">
                    {t('recommendations.history')}
                  </h3>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1 space-x-reverse">
                    <span>{t('recommendations.viewAll')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {history.map((rec, index) => (
                    <div key={rec._id || index} className="flex items-center space-x-3 space-x-reverse p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors cursor-pointer">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        rec.type === 'course' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {rec.type === 'course' ? <BookOpen className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-secondary-900">
                          {rec.item?.title || 'Unknown Item'}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {new Date(rec.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {rec.feedback && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            rec.feedback.helpful 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {rec.feedback.helpful ? t('recommendations.helpful') : t('recommendations.notHelpful')}
                          </span>
                        )}
                        <Clock className="w-4 h-4 text-secondary-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2 space-x-reverse">
                <Heart className="w-5 h-5" />
                <span>{t('recommendations.tipsTitle')}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-blue-800 text-sm flex items-start space-x-2 space-x-reverse">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{t('recommendations.tip1')}</span>
                  </p>
                  <p className="text-blue-800 text-sm flex items-start space-x-2 space-x-reverse">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{t('recommendations.tip2')}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-blue-800 text-sm flex items-start space-x-2 space-x-reverse">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{t('recommendations.tip3')}</span>
                  </p>
                  <p className="text-blue-800 text-sm flex items-start space-x-2 space-x-reverse">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{t('recommendations.tip4')}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* User Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-secondary-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center space-x-2 space-x-reverse">
                <BarChart3 className="w-5 h-5" />
                <span>{t('recommendations.stats.title')}</span>
              </h3>
              
              {statsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-secondary-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : userStats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-800">{t('recommendations.stats.savedItems')}</span>
                    </div>
                    <span className="font-semibold text-blue-900">{userStats.savedItems || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800">{t('recommendations.stats.averageProgress')}</span>
                    </div>
                    <span className="font-semibold text-green-900">{userStats.averageProgress || 0}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Flame className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-800">{t('recommendations.stats.learningStreak')}</span>
                    </div>
                    <span className="font-semibold text-orange-900">
                      {userStats.learningStreak ? formatStreak(userStats.learningStreak) : '0 days'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-secondary-500 text-sm">No stats available</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/courses')}
                  className="w-full text-left p-3 rounded-lg hover:bg-secondary-50 transition-colors flex items-center space-x-3 space-x-reverse"
                >
                  <BookOpen className="w-4 h-4 text-secondary-500" />
                  <span className="text-secondary-700">Browse Courses</span>
                  <ChevronRight className="w-4 h-4 text-secondary-400 ml-auto" />
                </button>
                <button
                  onClick={() => navigate('/books')}
                  className="w-full text-left p-3 rounded-lg hover:bg-secondary-50 transition-colors flex items-center space-x-3 space-x-reverse"
                >
                  <BookOpen className="w-4 h-4 text-secondary-500" />
                  <span className="text-secondary-700">Browse Books</span>
                  <ChevronRight className="w-4 h-4 text-secondary-400 ml-auto" />
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full text-left p-3 rounded-lg hover:bg-secondary-50 transition-colors flex items-center space-x-3 space-x-reverse"
                >
                  <BarChart3 className="w-4 h-4 text-secondary-500" />
                  <span className="text-secondary-700">View Dashboard</span>
                  <ChevronRight className="w-4 h-4 text-secondary-400 ml-auto" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendationsPage;