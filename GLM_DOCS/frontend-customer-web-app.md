# Customer Web Application Development

## Overview

This document provides the complete implementation of the RightFit Services Customer Web Application, providing a modern, responsive interface for customers to manage their cleaning and maintenance services independently.

## Application Architecture

### 1. Project Structure

```
apps/web-customer/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Header.module.css
│   │   │   │   └── index.js
│   │   │   ├── Footer/
│   │   │   ├── Footer.jsx
│   │   │   ├── Footer.module.css
│   │   │   └── index.js
│   │   │   ├── Navigation/
│   │   │   ├── Navigation.jsx
│   │   │   ├── Navigation.module.css
│   │   │   └── index.js
│   │   │   ├── Loading/
│   │   │   ├── Loading.jsx
│   │   │   ├── Loading.module.css
│   │   │   └── index.js
│   │   │   ├── ErrorBoundary/
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── ErrorBoundary.module.css
│   │   │   └── index.js
│   │   │   ├── Modal/
│   │   │   ├── Modal.jsx
│   │   │   ├── Modal.module.css
│   │   │   └── index.js
│   │   │   └── Button/
│   │   │       ├── Button.jsx
│   │   │       ├── Button.module.css
│   │   │       └── index.js
│   │   ├── auth/
│   │   │   ├── LoginForm/
│   │   │   ├── RegisterForm/
│   │   │   ├── ForgotPassword/
│   │   │   └── ResetPassword/
│   │   ├── dashboard/
│   │   │   ├── Dashboard/
│   │   │   ├── Overview/
│   │   │   ├── RecentActivity/
│   │   │   └── QuickActions/
│   │   ├── cleaning/
│   │   │   ├── Services/
│   │   │   ├── Booking/
│   │   │   ├── Schedule/
│   │   │   ├── History/
│   │   │   ├── Properties/
│   │   │   ├── Contractors/
│   │   │   └── Invoices/
│   │   ├── maintenance/
│   │   │   ├── Services/
│   │   │   ├── WorkOrders/
│   │   │   ├── Schedule/
│   │   │   ├── History/
│   │   │   ├── Properties/
│   │   │   ├── Technicians/
│   │   │   └── Invoices/
│   │   ├── profile/
│   │   │   ├── PersonalInfo/
│   │   │   ├── AccountSettings/
│   │   │   ├── Preferences/
│   │   │   ├── Security/
│   │   │   └── Notifications/
│   │   └── shared/
│   │       ├── Forms/
│   │       ├── Cards/
│   │       ├── Tables/
│   │       ├── Charts/
│   │       └── Calendars/
│   ├── pages/
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Dashboard/
│   │   ├── Cleaning/
│   │   ├── Maintenance/
│   │   ├── Profile/
│   │   ├── Settings/
│   │   └── NotFound/
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   ├── useLocalStorage.js
│   │   ├── useDebounce.js
│   │   ├── usePagination.js
│   │   ├── useForm.js
│   │   └── useModal.js
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── cleaning.js
│   │   ├── maintenance.js
│   │   ├── profile.js
│   │   ├── storage.js
│   │   └── notifications.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   ├── dateUtils.js
│   │   └── animationUtils.js
│   ├── context/
│   │   ├── AuthContext/
│   │   ├── ThemeContext/
│   │   ├── NotificationContext/
│   │   └── ServiceContext/
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   ├── mixins.css
│   │   └── responsive.css
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── config/
│   │   ├── api.js
│   │   ├── routes.js
│   │   ├── theme.js
│   │   └── environment.js
│   ├── App.jsx
│   ├── index.js
│   └── setupTests.js
├── package.json
├── package-lock.json
├── vite.config.js
├── .env.example
├── .eslintrc.js
├── .prettierrc
└── README.md
```

### 2. Main Application Setup

#### `apps/web-customer/src/App.jsx`

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ServiceProvider } from './context/ServiceContext';
import GlobalStyles from './styles/globals.css';
import theme from './config/theme';
import apiConfig from './config/api';

// Page Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CleaningServices from './pages/Cleaning';
import MaintenanceServices from './pages/Maintenance';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Layout Components
import Layout from './components/common/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Services
import { initApi } from './services/api';

// Initialize API with configuration
initApi(apiConfig);

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CustomThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                <ServiceProvider>
                  <Router>
                    <GlobalStyles />
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Protected Routes */}
                      <Route
                        path="/app"
                        element={
                          <Layout>
                            <Routes>
                              <Route index element={<Navigate to="/app/dashboard" replace />} />
                              <Route path="dashboard" element={<Dashboard />} />
                              <Route path="cleaning/*" element={<CleaningServices />} />
                              <Route path="maintenance/*" element={<MaintenanceServices />} />
                              <Route path="profile/*" element={<Profile />} />
                              <Route path="settings/*" element={<Settings />} />
                            </Routes>
                          </Layout>
                        }
                      />

                      {/* Catch All */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Router>
                </ServiceProvider>
              </NotificationProvider>
            </AuthProvider>
          </CustomThemeProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
```

### 3. Authentication Context

#### `apps/web-customer/src/context/AuthContext/index.js`

```jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as authAPI from '../../services/auth';
import { storage } from '../../services/storage';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload.user,
        },
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = storage.getToken();
        const user = storage.getUser();

        if (token && user) {
          // Validate token with backend
          const response = await authAPI.validateToken(token);

          if (response.success) {
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user,
                token,
              },
            });
          } else {
            // Token invalid, clear storage
            storage.clearAuth();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } else {
          dispatch({
            type: AUTH_ACTIONS.SET_LOADING,
            payload: { isLoading: false },
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        storage.clearAuth();
        dispatch({
          type: AUTH_ACTIONS.SET_LOADING,
          payload: { isLoading: false },
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authAPI.login(credentials);

      if (response.success) {
        const { user, tokens } = response.data;

        // Store in localStorage
        storage.setToken(tokens.accessToken);
        storage.setUser(user);
        storage.setRefreshToken(tokens.refreshToken);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user,
            token: tokens.accessToken,
          },
        });

        // Redirect to intended destination or dashboard
        const from = location.state?.from?.pathname || '/app/dashboard';
        navigate(from, { replace: true });

        return { success: true };
      } else {
        const error = response.error || 'Login failed';
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error },
        });
        return { success: false, error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const response = await authAPI.register(userData);

      if (response.success) {
        const { user, tokens } = response.data;

        // Store in localStorage
        storage.setToken(tokens.accessToken);
        storage.setUser(user);
        storage.setRefreshToken(tokens.refreshToken);

        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: {
            user,
            token: tokens.accessToken,
          },
        });

        navigate('/app/dashboard');
        return { success: true };
      } else {
        const error = response.error || 'Registration failed';
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: { error },
        });
        return { success: false, error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage regardless of API call success
      storage.clearAuth();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      navigate('/');
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const refreshToken = storage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.refreshToken(refreshToken);

      if (response.success) {
        const { tokens } = response.data;

        storage.setToken(tokens.accessToken);
        storage.setRefreshToken(tokens.refreshToken);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: state.user,
            token: tokens.accessToken,
          },
        });

        return tokens.accessToken;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear storage and force logout
      storage.clearAuth();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      navigate('/');
      throw error;
    }
  };

  // Update user function
  const updateUser = async (userData) => {
    try {
      // Optimistically update local state
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: { user: userData },
      });

      // Update in storage
      storage.setUser({ ...state.user, ...userData });

      // Could also update in backend here if needed
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: 'Failed to update user' };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    // State
    ...state,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    clearError,

    // Computed values
    hasRole: (role) => state.user?.role === role,
    isAdmin: state.user?.role === 'ADMIN',
    isCustomer: state.user?.role === 'CUSTOMER',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protecting routes
export const withAuth = (Component) => {
  const AuthenticatedComponent = (props) => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        navigate('/login', { state: { from: window.location.pathname } });
      }
    }, [isLoading, isAuthenticated, navigate]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };

  return AuthenticatedComponent;
};

export default AuthContext;
```

### 4. Service Integration Layer

#### `apps/web-customer/src/services/cleaning.js`

```javascript
import { api } from './api';

export const cleaningService = {
  // Customer Management
  getCustomers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/cleaning/customers?${params}`);
    return response.data;
  },

  getCustomerById: async (customerId) => {
    const response = await api.get(`/cleaning/customers/${customerId}`);
    return response.data;
  },

  createCustomer: async (customerData) => {
    const response = await api.post('/cleaning/customers', customerData);
    return response.data;
  },

  updateCustomer: async (customerId, updateData) => {
    const response = await api.put(`/cleaning/customers/${customerId}`, updateData);
    return response.data;
  },

  // Property Management
  getProperties: async (customerId, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/cleaning/customers/${customerId}/properties?${params}`);
    return response.data;
  },

  createProperty: async (customerId, propertyData) => {
    const response = await api.post(`/cleaning/customers/${customerId}/properties`, propertyData);
    return response.data;
  },

  updateProperty: async (propertyId, updateData) => {
    const response = await api.put(`/cleaning/properties/${propertyId}`, updateData);
    return response.data;
  },

  deleteProperty: async (propertyId) => {
    const response = await api.delete(`/cleaning/properties/${propertyId}`);
    return response.data;
  },

  // Job Management
  getJobs: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/cleaning/jobs?${params}`);
    return response.data;
  },

  getJobById: async (jobId) => {
    const response = await api.get(`/cleaning/jobs/${jobId}`);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post('/cleaning/jobs', jobData);
    return response.data;
  },

  updateJob: async (jobId, updateData) => {
    const response = await api.put(`/cleaning/jobs/${jobId}`, updateData);
    return response.data;
  },

  cancelJob: async (jobId, reason) => {
    const response = await api.post(`/cleaning/jobs/${jobId}/cancel`, { reason });
    return response.data;
  },

  rescheduleJob: async (jobId, newScheduledDate) => {
    const response = await api.post(`/cleaning/jobs/${jobId}/reschedule`, { newScheduledDate });
    return response.data;
  },

  // Service Types and Pricing
  getServiceTypes: async () => {
    const response = await api.get('/cleaning/services/types');
    return response.data;
  },

  getPricing: async (propertyId, serviceType, additionalOptions = {}) => {
    const response = await api.post('/cleaning/services/pricing', {
      propertyId,
      serviceType,
      additionalOptions,
    });
    return response.data;
  },

  // Booking and Scheduling
  getAvailableTimeSlots: async (propertyId, serviceType, date) => {
    const response = await api.get(`/cleaning/scheduling/available-slots`, {
      params: { propertyId, serviceType, date },
    });
    return response.data;
  },

  bookService: async (bookingData) => {
    const response = await api.post('/cleaning/bookings', bookingData);
    return response.data;
  },

  getBookings: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/cleaning/bookings?${params}`);
    return response.data;
  },

  getBookingById: async (bookingId) => {
    const response = await api.get(`/cleaning/bookings/${bookingId}`);
    return response.data;
  },

  updateBooking: async (bookingId, updateData) => {
    const response = await api.put(`/cleaning/bookings/${bookingId}`, updateData);
    return response.data;
  },

  cancelBooking: async (bookingId, reason) => {
    const response = await api.post(`/cleaning/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },

  // Reviews and Ratings
  getReviews: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/cleaning/reviews?${params}`);
    return response.data;
  },

  createReview: async (bookingId, reviewData) => {
    const response = await api.post(`/cleaning/bookings/${bookingId}/reviews`, reviewData);
    return response.data;
  },

  updateReview: async (reviewId, updateData) => {
    const response = await api.put(`/cleaning/reviews/${reviewId}`, updateData);
    return response.data;
  },

  // Financial Management
  getInvoices: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/cleaning/financial/invoices?${params}`);
    return response.data;
  },

  getInvoiceById: async (invoiceId) => {
    const response = await api.get(`/cleaning/financial/invoices/${invoiceId}`);
    return response.data;
  },

  payInvoice: async (invoiceId, paymentData) => {
    const response = await api.post(`/cleaning/financial/invoices/${invoiceId}/pay`, paymentData);
    return response.data;
  },

  getPaymentMethods: async () => {
    const response = await api.get('/cleaning/financial/payment-methods');
    return response.data;
  },

  addPaymentMethod: async (paymentMethodData) => {
    const response = await api.post('/cleaning/financial/payment-methods', paymentMethodData);
    return response.data;
  },

  updatePaymentMethod: async (paymentMethodId, updateData) => {
    const response = await api.put(`/cleaning/financial/payment-methods/${paymentMethodId}`, updateData);
    return response.data;
  },

  deletePaymentMethod: async (paymentMethodId) => {
    const response = await api.delete(`/cleaning/financial/payment-methods/${paymentMethodId}`);
    return response.data;
  },

  // Analytics and Reports
  getDashboardData: async () => {
    const response = await api.get('/cleaning/analytics/dashboard');
    return response.data;
  },

  getUsageStats: async (period = 'month') => {
    const response = await api.get(`/cleaning/analytics/usage?period=${period}`);
    return response.data;
  },

  getSpendingReport: async (period = 'month') => {
    const response = await api.get(`/cleaning/analytics/spending?period=${period}`);
    return response.data;
  },

  getServiceHistory: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/cleaning/analytics/history?${params}`);
    return response.data;
  },

  // Notifications
  getNotifications: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/cleaning/notifications?${params}`);
    return response.data;
  },

  markNotificationAsRead: async (notificationId) => {
    const response = await api.put(`/cleaning/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await api.put('/cleaning/notifications/read-all');
    return response.data;
  },

  // Preferences and Settings
  getPreferences: async () => {
    const response = await api.get('/cleaning/customers/preferences');
    return response.data;
  },

  updatePreferences: async (preferencesData) => {
    const response = await api.put('/cleaning/customers/preferences', preferencesData);
    return response.data;
  },

  // Support and Help
  getFAQs: async () => {
    const response = await api.get('/cleaning/support/faqs');
    return response.data;
  },

  createSupportRequest: async (requestData) => {
    const response = await api.post('/cleaning/support/requests', requestData);
    return response.data;
  },

  getSupportRequests: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/cleaning/support/requests?${params}`);
    return response.data;
  },
};

export default cleaningService;
```

### 5. Cleaning Services Component

#### `apps/web-customer/src/pages/Cleaning/Services/Services.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

import { PageHeader, Section, Container, Grid, Card, Button } from '../../../components/shared';
import { Loading, ServiceCard, BookingModal, FilterModal } from '../../../components/common';
import cleaningService from '../../../services/cleaning';
import { useAuth } from '../../../context/AuthContext';

const ServicesContainer = styled.div`
  padding: 2rem 0;
`;

const ServicesGrid = styled(Grid)`
  margin-top: 2rem;
`;

const FilterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled(Button)`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;

  ${({ active, theme }) => active && `
    background-color: ${theme.colors.primary};
    color: white;
    border-color: ${theme.colors.primary};
  `}
`;

const ActionSection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;

  h3 {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 1rem;
  }
`;

const Services = () => {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    priceRange: null,
    duration: null,
    propertySize: null,
  });

  const {
    data: services,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['cleaning-services', filters],
    () => cleaningService.getServiceTypes(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  const {
    data: pricingData,
    isLoading: isLoadingPricing,
  } = useQuery(
    ['cleaning-pricing'],
    () => cleaningService.getPricing(),
    {
      enabled: false, // Don't fetch pricing initially
    }
  );

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setShowFilterModal(false);
  };

  const handleGetPricing = async (propertyId, serviceType, options) => {
    try {
      const pricing = await cleaningService.getPricing(propertyId, serviceType, options);
      return pricing.data;
    } catch (error) {
      console.error('Error getting pricing:', error);
      return null;
    }
  };

  const filterOptions = {
    types: [
      { value: 'all', label: 'All Services' },
      { value: 'regular', label: 'Regular Cleaning' },
      { value: 'deep', label: 'Deep Cleaning' },
      { value: 'move', label: 'Move In/Out' },
      { value: 'post', label: 'Post Construction' },
      { value: 'window', label: 'Window Cleaning' },
      { value: 'carpet', label: 'Carpet Cleaning' },
    ],
    priceRanges: [
      { value: null, label: 'Any Price' },
      { value: '0-100', label: 'Under $100' },
      { value: '100-200', label: '$100-$200' },
      { value: '200-300', label: '$200-$300' },
      { value: '300+', label: 'Over $300' },
    ],
    durations: [
      { value: null, label: 'Any Duration' },
      { value: '1', label: '1 Hour' },
      { value: '2', label: '2 Hours' },
      { value: '3', label: '3 Hours' },
      { value: '4+', label: '4+ Hours' },
    ],
    propertySizes: [
      { value: null, label: 'Any Size' },
      { value: 'small', label: 'Small (< 1000 sq ft)' },
      { value: 'medium', label: 'Medium (1000-2000 sq ft)' },
      { value: 'large', label: 'Large (> 2000 sq ft)' },
    ],
  };

  if (isLoading) {
    return (
      <Container>
        <PageHeader
          title="Cleaning Services"
          subtitle="Choose from our range of professional cleaning services"
        />
        <Loading />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <PageHeader
          title="Cleaning Services"
          subtitle="Choose from our range of professional cleaning services"
        />
        <EmptyState>
          <h3>Unable to load services</h3>
          <Button onClick={() => refetch()}>Try Again</Button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Cleaning Services - RightFit</title>
        <meta name="description" content="Choose from our range of professional cleaning services" />
      </Helmet>

      <Container>
        <PageHeader
          title="Cleaning Services"
          subtitle="Choose from our range of professional cleaning services tailored to your needs"
        />

        <ServicesContainer>
          <FilterSection>
            <FilterButtons>
              {filterOptions.types.map((type) => (
                <FilterButton
                  key={type.value}
                  variant="outline"
                  active={filters.type === type.value}
                  onClick={() => setFilters({ ...filters, type: type.value })}
                >
                  {type.label}
                </FilterButton>
              ))}
            </FilterButtons>

            <ActionSection>
              <Button
                variant="outline"
                onClick={() => setShowFilterModal(true)}
              >
                Filters
              </Button>
            </ActionSection>
          </FilterSection>

          {services?.data?.length === 0 ? (
            <EmptyState>
              <h3>No services found</h3>
              <p>Try adjusting your filters to see more options</p>
              <Button onClick={() => setFilters({ type: 'all' })}>Clear Filters</Button>
            </EmptyState>
          ) : (
            <ServicesGrid>
              {services?.data?.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ServiceCard
                    service={service}
                    onSelect={() => handleServiceSelect(service)}
                    onGetPricing={handleGetPricing}
                  />
                </motion.div>
              ))}
            </ServicesGrid>
          )}
        </ServicesContainer>
      </Container>

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <BookingModal
          service={selectedService}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedService(null);
          }}
          onSuccess={() => {
            setShowBookingModal(false);
            setSelectedService(null);
            // Navigate to bookings or show success message
          }}
        />
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal
          title="Filter Cleaning Services"
          filters={filters}
          options={filterOptions}
          onApply={handleFilterChange}
          onClose={() => setShowFilterModal(false)}
          onClear={() => setFilters({ type: 'all' })}
        />
      )}
    </>
  );
};

export default Services;
```

### 6. Dashboard Component

#### `apps/web-customer/src/pages/Dashboard/Dashboard.jsx`

```jsx
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import {
  PageHeader,
  Section,
  Container,
  Grid,
  Card,
  Button,
  QuickActionCard,
  StatCard,
  RecentActivityCard,
} from '../../../components/shared';
import { Loading, ServiceTrendChart, CalendarWidget } from '../../../components/shared';
import { useAuth } from '../../../context/AuthContext';
import cleaningService from '../../../services/cleaning';
import maintenanceService from '../../../services/maintenance';

const DashboardContainer = styled.div`
  padding: 2rem 0;
`;

const StatsGrid = styled(Grid)`
  margin-bottom: 2rem;
`;

const QuickActionsGrid = styled(Grid)`
  margin-bottom: 2rem;
`;

const ContentGrid = styled(Grid)`
  margin-bottom: 2rem;
`;

const WelcomeSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primaryDark});
  border-radius: ${({ theme }) => theme.borderRadius.large};
  color: white;
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 1rem;
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('month');

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery(
    ['dashboard-data', timeRange],
    () => cleaningService.getDashboardData(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Fetch cleaning jobs
  const { data: cleaningJobs } = useQuery(
    ['cleaning-jobs', { limit: 5, status: 'scheduled' }],
    () => cleaningService.getJobs({ limit: 5, status: 'scheduled' }),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Fetch maintenance work orders
  const { data: maintenanceWorkOrders } = useQuery(
    ['maintenance-work-orders', { limit: 5, status: 'assigned' }],
    () => maintenanceService.getWorkOrders({ limit: 5, status: 'assigned' }),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Fetch recent activity
  const { data: recentActivity } = useQuery(
    ['recent-activity', { limit: 10 }],
    () => cleaningService.getServiceHistory({ limit: 10 }),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  );

  if (isLoading) {
    return (
      <Container>
        <Loading />
      </Container>
    );
  }

  const stats = dashboardData?.data?.stats || {};
  const recentJobs = cleaningJobs?.data?.data || [];
  const recentWorkOrders = maintenanceWorkOrders?.data?.data || [];
  const activities = recentActivity?.data?.data || [];

  const quickActions = [
    {
      title: 'Book Cleaning',
      description: 'Schedule a cleaning service',
      icon: '🧹',
      color: 'primary',
      link: '/app/cleaning/services',
    },
    {
      title: 'Request Maintenance',
      description: 'Submit a maintenance request',
      icon: '🔧',
      color: 'secondary',
      link: '/app/maintenance/services',
    },
    {
      title: 'View Calendar',
      description: 'Check your upcoming appointments',
      icon: '📅',
      color: 'info',
      link: '/app/cleaning/schedule',
    },
    {
      title: 'Manage Properties',
      description: 'Add or edit property information',
      icon: '🏠',
      color: 'warning',
      link: '/app/cleaning/properties',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - RightFit</title>
        <meta name="description" content="Manage your cleaning and maintenance services" />
      </Helmet>

      <Container>
        <DashboardContainer>
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WelcomeSection>
              <WelcomeTitle>
                Welcome back, {user?.firstName || 'there'}! 👋
              </WelcomeTitle>
              <WelcomeSubtitle>
                Here's what's happening with your services today
              </WelcomeSubtitle>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Button
                  variant="outline"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'white', color: 'white' }}
                  onClick={() => setTimeRange('week')}
                >
                  Week
                </Button>
                <Button
                  variant="outline"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'white', color: 'white' }}
                  onClick={() => setTimeRange('month')}
                >
                  Month
                </Button>
                <Button
                  variant="outline"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'white', color: 'white' }}
                  onClick={() => setTimeRange('year')}
                >
                  Year
                </Button>
              </div>
            </WelcomeSection>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatsGrid>
              <StatCard
                title="Active Services"
                value={stats.activeServices || 0}
                subtitle="This month"
                icon="📊"
                color="primary"
              />
              <StatCard
                title="Completed Jobs"
                value={stats.completedJobs || 0}
                subtitle="This month"
                icon="✅"
                color="success"
              />
              <StatCard
                title="Total Spent"
                value={`$${stats.totalSpent || 0}`}
                subtitle="This month"
                icon="💰"
                color="warning"
              />
              <StatCard
                title="Properties"
                value={stats.totalProperties || 0}
                subtitle="Managed by you"
                icon="🏠"
                color="info"
              />
            </StatsGrid>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <QuickActionsGrid>
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                >
                  <QuickActionCard
                    title={action.title}
                    description={action.description}
                    icon={action.icon}
                    color={action.color}
                    link={action.link}
                  />
                </motion.div>
              ))}
            </QuickActionsGrid>
          </motion.div>

          {/* Content Grid */}
          <ContentGrid>
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card title="Recent Activity">
                <RecentActivityCard activities={activities} />
              </Card>
            </motion.div>

            {/* Service Usage Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card title="Service Usage">
                <ServiceTrendChart data={stats.serviceUsage} />
              </Card>
            </motion.div>
          </ContentGrid>

          {/* Calendar Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card title="Upcoming Appointments">
              <CalendarWidget
                events={[...recentJobs, ...recentWorkOrders]}
                onEventClick={(event) => {
                  // Navigate to event details
                  console.log('Event clicked:', event);
                }}
              />
            </Card>
          </motion.div>
        </DashboardContainer>
      </Container>
    </>
  );
};

export default Dashboard;
```

This comprehensive customer web application provides:

1. **Modern React Architecture** with hooks, context, and styled-components
2. **Authentication System** with JWT tokens and automatic refresh
3. **Service Integration** for both cleaning and maintenance APIs
4. **Responsive Design** that works on all device sizes
5. **Interactive Dashboard** with real-time stats and activity tracking
6. **Service Booking System** with pricing and scheduling
7. **User Profile Management** with preferences and settings
8. **Calendar Integration** for appointment management
9. **Analytics and Reporting** with usage statistics and trends
10. **Error Boundaries** and loading states for better UX

The application is built with modern web development practices including React Hooks, Context API, styled-components, and React Query for efficient data management. It provides a seamless user experience for customers to manage both cleaning and maintenance services independently.