import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ConvertKitProvider } from './contexts/ConvertKitContext';
import { ThemeProvider, ToastProvider } from './design-system';
import { ProtectedRoute } from './components/auth';
import { SurveyPage, AdminPage, LoginPage } from './pages';
import SurveyBuilderPage from './pages/SurveyBuilderPage';
import IntegrationsPage from './pages/IntegrationsPage';
import ConvertKitSetupPage from './pages/ConvertKitSetupPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SurveyEditorPage from './pages/SurveyEditorPage';
import SurveyAnalyticsPage from './pages/SurveyAnalyticsPage';
import ThemesPage from './pages/ThemesPage';
import ClickDebug from './components/debug/ClickDebug';

function App() {
  console.log('App component rendering');
  
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ConvertKitProvider>
            <Router>
          <ClickDebug />
          <Routes>
          {/* Redirect root to admin dashboard */}
          <Route path="/" element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } />
          
          {/* Public survey route */}
          <Route path="/survey/:surveyId" element={<SurveyPage />} />
          
          {/* Admin routes */}
          <Route 
            path="/surveys" 
            element={
              <ProtectedRoute>
                <SurveyBuilderPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/integrations" 
            element={
              <ProtectedRoute>
                <IntegrationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/integrations/convertkit" 
            element={
              <ProtectedRoute>
                <ConvertKitSetupPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/surveys/edit/:surveyId" 
            element={
              <ProtectedRoute>
                <SurveyEditorPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/surveys/:surveyId/analytics" 
            element={
              <ProtectedRoute>
                <SurveyAnalyticsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/themes" 
            element={
              <ProtectedRoute>
                <ThemesPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Auth route */}
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
            </Router>
          </ConvertKitProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
