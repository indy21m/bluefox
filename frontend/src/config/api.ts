// API configuration for both local development and Vercel deployment

const isDevelopment = import.meta.env.DEV;
const isVercel = import.meta.env.VITE_VERCEL || typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

// For Vercel deployment, use relative paths
// For local development with separate backend, use localhost:3001
// When running 'vercel dev', it will use relative paths automatically
export const API_BASE_URL = isVercel || !isDevelopment 
  ? '' // Use relative paths in production/Vercel
  : 'http://localhost:3001'; // Use backend server in development

// Helper function to build API URLs
export const apiUrl = (path: string) => {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}/api${cleanPath}`;
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: apiUrl('/auth/login'),
    verify: apiUrl('/auth/verify'),
  },
  
  // ConvertKit
  convertkit: {
    testConnection: apiUrl('/convertkit/test-connection'),
    customFields: apiUrl('/convertkit/custom-fields'),
    updateSubscriber: apiUrl('/convertkit/update-subscriber'),
  },
  
  // Surveys
  surveys: {
    list: apiUrl('/surveys'),
    get: (id: string) => apiUrl(`/surveys/${id}`),
    responses: (id: string) => apiUrl(`/surveys/${id}/responses`),
  },
  
  // Survey analytics
  survey: {
    responses: apiUrl('/survey/responses'),
    analytics: {
      overview: apiUrl('/survey/analytics/overview'),
      survey: (id: string) => apiUrl(`/survey/${id}/analytics`),
    },
    view: (id: string) => apiUrl(`/survey/${id}/view`),
  },
  
  // Health check
  health: apiUrl('/health'),
};