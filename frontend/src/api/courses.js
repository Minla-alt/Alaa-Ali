import apiClient from './client';

export const coursesAPI = {
  // Get all courses with optional filters
  getCourses: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/courses', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get course by ID
  getCourseById: async (id) => {
    try {
      const response = await apiClient.get(`/api/courses/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Save a course
  saveCourse: async (id) => {
    try {
      const response = await apiClient.post(`/api/courses/${id}/save`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Unsave a course
  unsaveCourse: async (id) => {
    try {
      const response = await apiClient.delete(`/api/courses/${id}/save`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's saved courses
  getSavedCourses: async () => {
    try {
      const response = await apiClient.get('/api/courses/saved');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search courses
  searchCourses: async (query, params = {}) => {
    try {
      const response = await apiClient.get('/api/courses/search', {
        params: { query, ...params }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get popular courses
  getPopularCourses: async () => {
    try {
      const response = await apiClient.get('/api/courses/popular');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recommended courses
  getRecommendedCourses: async () => {
    try {
      const response = await apiClient.get('/api/courses/recommended');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};