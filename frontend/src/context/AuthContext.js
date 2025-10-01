import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, getStoredUser, getStoredToken } from '../services/api';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTION_TYPES.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTION_TYPES.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case AUTH_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTION_TYPES.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = getStoredUser();
      const storedToken = getStoredToken();

      if (storedUser && storedToken) {
        dispatch({
          type: AUTH_ACTION_TYPES.LOGIN_SUCCESS,
          payload: {
            user: storedUser,
            token: storedToken,
          },
        });
      } else {
        dispatch({
          type: AUTH_ACTION_TYPES.SET_LOADING,
          payload: false,
        });
      }
    };

    initializeAuth();
  }, []);

  // Actions
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTION_TYPES.CLEAR_ERROR });

      const response = await authAPI.login(credentials);
      
      dispatch({
        type: AUTH_ACTION_TYPES.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token: response.access_token,
        },
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      dispatch({
        type: AUTH_ACTION_TYPES.SET_ERROR,
        payload: errorMessage,
      });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTION_TYPES.CLEAR_ERROR });

      const response = await authAPI.register(userData);
      
      dispatch({
        type: AUTH_ACTION_TYPES.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token: response.access_token,
        },
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      dispatch({
        type: AUTH_ACTION_TYPES.SET_ERROR,
        payload: errorMessage,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTION_TYPES.LOGOUT });
    }
  };

  const updateUser = async () => {
    try {
      const user = await authAPI.getCurrentUser();
      dispatch({
        type: AUTH_ACTION_TYPES.UPDATE_USER,
        payload: user,
      });
      return user;
    } catch (error) {
      console.error('Failed to update user:', error);
      // If token is invalid, logout
      if (error.response?.status === 401) {
        dispatch({ type: AUTH_ACTION_TYPES.LOGOUT });
      }
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTION_TYPES.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;