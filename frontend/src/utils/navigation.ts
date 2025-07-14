// Navigation utilities to ensure consistent routing

export const routes = {
  home: '/',
  login: '/login',
  surveys: '/surveys',
  surveyEdit: (id: string) => `/surveys/edit/${id}`,
  surveyAnalytics: (id: string) => `/surveys/${id}/analytics`,
  surveyPreview: (id: string) => `/survey/${id}`,
  analytics: '/analytics',
  integrations: '/integrations',
  convertkit: '/integrations/convertkit',
  themes: '/themes',
};

// Ensure navigation works correctly in both development and production
export const navigateTo = (path: string) => {
  window.location.href = path;
};