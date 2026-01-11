import apiClient from './client';

export const booksAPI = {
  // Get all books with optional filters
  getBooks: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/books', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get book by ID
  getBookById: async (id) => {
    try {
      const response = await apiClient.get(`/api/books/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Save a book
  saveBook: async (id) => {
    try {
      const response = await apiClient.post(`/api/books/${id}/save`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Unsave a book
  unsaveBook: async (id) => {
    try {
      const response = await apiClient.delete(`/api/books/${id}/save`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's saved books
  getSavedBooks: async () => {
    try {
      const response = await apiClient.get('/api/books/saved');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search books
  searchBooks: async (query, params = {}) => {
    try {
      const response = await apiClient.get('/api/books/search', {
        params: { query, ...params }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get popular books
  getPopularBooks: async () => {
    try {
      const response = await apiClient.get('/api/books/popular');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};