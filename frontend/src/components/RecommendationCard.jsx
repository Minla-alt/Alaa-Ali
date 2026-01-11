import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Brain, 
  ThumbsUp, 
  ThumbsDown, 
  Star,
  Clock,
  BookOpen,
  GraduationCap,
  MessageSquare,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Play,
  User,
  Globe,
  Target,
  Zap
} from 'lucide-react';

const RecommendationCard = ({ 
  recommendation, 
  onFeedback, 
  onSave, 
  onUnsaved,
  onStartLearning,
  isSaved,
  loadingStates = {},
  feedbackSubmitted
}) => {
  const { t } = useTranslation();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  if (!recommendation) return null;

  const isCourse = recommendation.type === 'course';
  const item = recommendation.item;

  // Subject color mapping for gradients
  const getSubjectColor = (subject) => {
    const colors = {
      math: 'from-blue-500 to-blue-700',
      science: 'from-green-500 to-green-700',
      programming: 'from-purple-500 to-purple-700',
      languages: 'from-orange-500 to-orange-700',
      literature: 'from-pink-500 to-pink-700',
      history: 'from-amber-500 to-amber-700',
      other: 'from-gray-500 to-gray-700'
    };
    return colors[subject?.toLowerCase()] || colors.other;
  };

  // Level color mapping
  const getLevelColor = (level) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[level?.toLowerCase()] || colors.beginner;
  };

  // Language display
  const getLanguageDisplay = (lang) => {
    if (lang === 'en') return { text: t('common.english'), flag: '🇺🇸' };
    if (lang === 'ar') return { text: t('common.arabic'), flag: '🇸🇦' };
    return { text: t('common.bilingual'), flag: '🌍' };
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return t('recommendations.timeEstimates.minutes', { count: minutes });
    } else {
      const hours = Math.floor(minutes / 60);
      if (minutes % 60 === 0) {
        return hours === 1 ? t('recommendations.timeEstimates.hour') : 
               t('recommendations.timeEstimates.hours', { count: hours });
      }
      return `${hours}h ${minutes % 60}m`;
    }
  };

  const handleSaveToggle = () => {
    if (isSaved) {
      onUnsaved?.(item._id, recommendation.type);
    } else {
      onSave?.(item._id, recommendation.type);
    }
  };

  const handleFeedback = (type) => {
    if (type === 'not-helpful' && !showFeedbackForm) {
      setShowFeedbackForm(true);
      return;
    }
    
    onFeedback?.({
      helpful: type === 'helpful',
      feedback: feedbackText
    });
    
    if (showFeedbackForm) {
      setShowFeedbackForm(false);
      setFeedbackText('');
    }
  };

  const languageInfo = getLanguageDisplay(item.language);

  return (
    <div className="bg-white rounded-xl shadow-xl border border-secondary-200 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${getSubjectColor(item.subject)} p-6 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {t('recommendations.dailyRecommendation')}
                </h2>
                <p className="text-white text-opacity-90">
                  {t('recommendations.personalizedForYou')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white text-opacity-80">
                {new Date().toLocaleDateString()}
              </div>
              <div className="text-xs text-white text-opacity-70">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Main Item Display */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              <div className={`w-full lg:w-48 h-48 bg-gradient-to-br ${getSubjectColor(item.subject)} rounded-lg flex items-center justify-center shadow-lg`}>
                {item.thumbnail ? (
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="hidden w-full h-full items-center justify-center">
                  {isCourse ? (
                    <GraduationCap className="w-16 h-16 text-white" />
                  ) : (
                    <BookOpen className="w-16 h-16 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isCourse ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {isCourse ? t('courses.title') : t('books.title')}
                  </span>
                  <div className="flex items-center space-x-1 space-x-reverse text-sm text-secondary-500">
                    <Globe className="w-4 h-4" />
                    <span>{languageInfo.flag} {languageInfo.text}</span>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-secondary-900 mb-3 leading-tight">
                {item.title}
              </h3>
              
              <p className="text-secondary-600 mb-4 line-clamp-3">
                {item.description}
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {item.subject && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                    <Target className="w-3 h-3 mr-1" />
                    {t('subjects.' + item.subject.toLowerCase())}
                  </span>
                )}
                
                {item.level && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(item.level)}`}>
                    <User className="w-3 h-3 mr-1" />
                    {t('recommendations.levels.' + item.level.toLowerCase())}
                  </span>
                )}

                {item.duration && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDuration(item.duration)}
                  </span>
                )}

                {item.source && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {t('recommendations.sources.' + item.source.toLowerCase()) || item.source}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">
                {t('recommendations.whyRecommended')}
              </h4>
              <p className="text-blue-800 leading-relaxed">
                {recommendation.reasoning}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => onStartLearning?.(item._id, recommendation.type)}
            disabled={loadingStates.startLearning}
            className="flex-1 lg:flex-none bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingStates.startLearning ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{t('recommendations.startLearning')}</span>
          </button>
          
          <button
            onClick={handleSaveToggle}
            disabled={loadingStates.save}
            className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-lg font-medium transition-all duration-200 flex-1 lg:flex-none ${
              isSaved 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loadingStates.save ? (
              <div className="w-4 h-4 border-2 border-secondary-500 border-t-transparent rounded-full animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            <span>
              {isSaved ? t('recommendations.saved') : t('recommendations.saveForLater')}
            </span>
          </button>
        </div>

        {/* Feedback Section */}
        <div className="border-t border-secondary-200 pt-6">
          <h4 className="font-semibold text-secondary-900 mb-3 flex items-center space-x-2 space-x-reverse">
            <MessageSquare className="w-4 h-4" />
            <span>{t('recommendations.feedback')}</span>
          </h4>
          
          {!feedbackSubmitted ? (
            <div className="space-y-4">
              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={() => handleFeedback('helpful')}
                  disabled={loadingStates.feedback}
                  className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{t('recommendations.helpful')}</span>
                </button>
                <button
                  onClick={() => handleFeedback('not-helpful')}
                  disabled={loadingStates.feedback}
                  className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>{t('recommendations.notHelpful')}</span>
                </button>
              </div>
              
              {showFeedbackForm && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={t('recommendations.feedbackPlaceholder')}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows="3"
                    aria-label={t('recommendations.feedbackPlaceholder')}
                  />
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleFeedback('not-helpful')}
                      disabled={loadingStates.feedback || !feedbackText.trim()}
                      className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('recommendations.submitFeedback')}
                    </button>
                    <button
                      onClick={() => {
                        setShowFeedbackForm(false);
                        setFeedbackText('');
                      }}
                      className="btn-secondary text-sm"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 space-x-reverse text-green-600 bg-green-50 p-3 rounded-lg">
              <Star className="w-4 h-4" />
              <span>{t('recommendations.thankYou')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;