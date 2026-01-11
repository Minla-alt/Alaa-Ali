import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { recommendationsAPI } from '../api/recommendations';
import { 
  Brain, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown, 
  Star,
  Clock,
  BookOpen,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const AIRecommendations = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const { 
    data: recommendation, 
    loading, 
    error, 
    fetchData 
  } = useApi(recommendationsAPI.getDailyRecommendation);

  const { 
    data: history, 
    loading: historyLoading 
  } = useApi(recommendationsAPI.getRecommendationHistory);

  const handleGetNewRecommendation = () => {
    fetchData();
    setFeedback(null);
    setShowFeedbackForm(false);
    setFeedbackText('');
  };

  const handleFeedback = async (type) => {
    if (!recommendation) return;

    try {
      await recommendationsAPI.submitFeedback(recommendation._id, {
        helpful: type === 'helpful',
        feedback: feedbackText
      });
      
      setFeedback(type);
      setShowFeedbackForm(false);
      setFeedbackText('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const renderRecommendationCard = () => {
    if (!recommendation) return null;

    const isCourse = recommendation.type === 'course';
    const item = recommendation.item;

    return (
      <div className="bg-white rounded-lg shadow-lg border border-secondary-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Brain className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">
                {t('recommendations.dailyRecommendation')}
              </h2>
              <p className="text-primary-100">
                {t('recommendations.personalizedForYou', 'Personalized for you')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Item Details */}
          <div className="mb-6">
            <div className="flex items-start space-x-4 space-x-reverse">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                {isCourse ? (
                  <GraduationCap className="w-8 h-8 text-white" />
                ) : (
                  <BookOpen className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-secondary-600 mb-3">
                  {item.description}
                </p>
                <div className="flex items-center space-x-4 space-x-reverse text-sm text-secondary-500">
                  <span className="bg-secondary-100 px-2 py-1 rounded">
                    {isCourse ? t('courses.title') : t('books.title')}
                  </span>
                  {item.subject && (
                    <span>
                      {t('subjects.' + item.subject.toLowerCase())}
                    </span>
                  )}
                  {item.language && (
                    <span>
                      {item.language === 'en' ? t('common.english') : 
                       item.language === 'ar' ? t('common.arabic') : 
                       t('common.language', 'Bilingual')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-primary-900 mb-2">
              {t('recommendations.whyRecommended', 'Why I recommend this')}
            </h4>
            <p className="text-primary-800">
              {recommendation.reasoning}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <a
              href={isCourse ? `/courses/${item._id}` : `/books/${item._id}`}
              className="btn-primary flex items-center space-x-2 space-x-reverse"
            >
              <BookOpen className="w-4 h-4" />
              <span>
                {isCourse ? t('courses.viewDetails') : t('books.viewDetails')}
              </span>
            </a>
            
            <button
              onClick={handleGetNewRecommendation}
              className="btn-secondary flex items-center space-x-2 space-x-reverse"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('recommendations.getRecommendation')}</span>
            </button>
          </div>

          {/* Feedback Section */}
          <div className="border-t border-secondary-200 pt-6">
            <h4 className="font-semibold text-secondary-900 mb-3">
              {t('recommendations.feedback')}
            </h4>
            
            {!feedback ? (
              <div className="space-y-4">
                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={() => handleFeedback('helpful')}
                    className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{t('recommendations.helpful')}</span>
                  </button>
                  <button
                    onClick={() => handleFeedback('not-helpful')}
                    className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>{t('recommendations.notHelpful')}</span>
                  </button>
                </div>
                
                {showFeedbackForm && (
                  <div className="space-y-3">
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder={t('recommendations.feedbackPlaceholder', 'Tell us more about your experience...')}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows="3"
                    />
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleFeedback(feedback ? 'helpful' : 'not-helpful')}
                        className="btn-primary text-sm"
                      >
                        {t('recommendations.submitFeedback')}
                      </button>
                      <button
                        onClick={() => setShowFeedbackForm(false)}
                        className="btn-secondary text-sm"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse text-green-600">
                <Star className="w-4 h-4" />
                <span>{t('recommendations.thankYou')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          {t('recommendations.title')}
        </h1>
        <p className="text-secondary-600 max-w-2xl mx-auto">
          {t('recommendations.subtitle', 'Get personalized learning recommendations powered by AI')}
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Current Recommendation */}
        <div>
          {loading ? (
            <Loading message={t('recommendations.loading')} />
          ) : error ? (
            <ErrorMessage 
              message={error} 
              onRetry={handleGetNewRecommendation}
              title={t('common.somethingWentWrong')}
            />
          ) : (
            renderRecommendationCard()
          )}
        </div>

        {/* Recommendation History */}
        {history && history.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              {t('recommendations.history', 'Recent Recommendations')}
            </h3>
            <div className="space-y-3">
              {history.slice(0, 5).map((rec, index) => (
                <div key={rec._id || index} className="flex items-center space-x-3 space-x-reverse p-3 bg-secondary-50 rounded-lg">
                  <Clock className="w-4 h-4 text-secondary-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary-900">
                      {rec.item?.title || 'Unknown Item'}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    rec.feedback?.helpful ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {rec.feedback?.helpful ? t('recommendations.helpful') : t('recommendations.notHelpful')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            {t('recommendations.tipsTitle', 'Tips for Better Recommendations')}
          </h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• {t('recommendations.tip1', 'Take courses or save books you find interesting')}</li>
            <li>• {t('recommendations.tip2', 'Complete your learning profile with subjects you enjoy')}</li>
            <li>• {t('recommendations.tip3', 'Provide feedback on recommendations to improve suggestions')}</li>
            <li>• {t('recommendations.tip4', 'Use the app regularly to help AI learn your preferences')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;