import apiClient from './client';

export const dashboardAPI = {
  // Get user dashboard statistics
  getStats: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user learning progress
  getProgress: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/progress');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get saved content (courses and books)
  getSavedContent: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/saved-content');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get study todos
  getTodos: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/todos');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new todo
  createTodo: async (todoData) => {
    try {
      const response = await apiClient.post('/api/dashboard/todos', todoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a todo
  updateTodo: async (id, todoData) => {
    try {
      const response = await apiClient.put(`/api/dashboard/todos/${id}`, todoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a todo
  deleteTodo: async (id) => {
    try {
      const response = await apiClient.delete(`/api/dashboard/todos/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Toggle todo completion
  toggleTodo: async (id) => {
    try {
      const response = await apiClient.patch(`/api/dashboard/todos/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get learning goals
  getGoals: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/goals');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a learning goal
  createGoal: async (goalData) => {
    try {
      const response = await apiClient.post('/api/dashboard/goals', goalData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a learning goal
  updateGoal: async (id, goalData) => {
    try {
      const response = await apiClient.put(`/api/dashboard/goals/${id}`, goalData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a learning goal
  deleteGoal: async (id) => {
    try {
      const response = await apiClient.delete(`/api/dashboard/goals/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recent activity
  getRecentActivity: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/activity');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};