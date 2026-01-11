import apiClient from './client';

export const recommendationsAPI = {
  // Get daily AI recommendation
  getDailyRecommendation: async () => {
    try {
      const response = await apiClient.get('/api/recommendations/daily');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit feedback on a recommendation
  submitFeedback: async (recommendationId, feedback) => {
    try {
      const response = await apiClient.post('/api/recommendations/feedback', {
        recommendationId,
        ...feedback
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recommendation history
  getRecommendationHistory: async () => {
    try {
      const response = await apiClient.get('/api/recommendations/history');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's recommendation preferences
  getPreferences: async () => {
    try {
      const response = await apiClient.get('/api/recommendations/preferences');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update recommendation preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await apiClient.put('/api/recommendations/preferences', preferences);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};