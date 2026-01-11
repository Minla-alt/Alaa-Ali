import apiClient from './client';

export const recommendationsAPI = {
  // Get daily AI recommendation
  getDailyRecommendation: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await apiClient.get(`/api/recommendations/daily${params ? `?${params}` : ''}`);
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
  getRecommendationHistory: async (limit = 10) => {
    try {
      const response = await apiClient.get(`/api/recommendations/history?limit=${limit}`);
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
  },

  // Get user learning stats
  getUserStats: async () => {
    try {
      const response = await apiClient.get('/api/recommendations/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Save recommended content
  saveContent: async (contentId, contentType) => {
    try {
      const response = await apiClient.post('/api/recommendations/save', {
        contentId,
        contentType
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Unsave recommended content
  unsaveContent: async (contentId, contentType) => {
    try {
      const response = await apiClient.delete('/api/recommendations/save', {
        data: { contentId, contentType }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check if content is saved
  isContentSaved: async (contentId, contentType) => {
    try {
      const response = await apiClient.get(`/api/recommendations/saved/${contentId}/${contentType}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};