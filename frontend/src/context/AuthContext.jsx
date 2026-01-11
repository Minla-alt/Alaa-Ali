import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
          
          // Verify token is still valid
          try {
            const response = await authAPI.getMe();
            setUser(response.user);
          } catch (error) {
            // Token is invalid, clear auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);
      
      const { token, user: userData } = response;
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.signup(userData);
      
      const { token, user: newUser } = response;
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Signup failed' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Call logout API if user is authenticated
      if (isAuthenticated) {
        try {
          await authAPI.logout();
        } catch (error) {
          // Even if API call fails, we should clear local auth data
          console.warn('Logout API call failed:', error);
        }
      }
    } finally {
      // Always clear local auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updateUser = useCallback((updatedUserData) => {
    setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUserData }));
  }, [user]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};