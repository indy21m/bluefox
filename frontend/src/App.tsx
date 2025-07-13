import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConvertKitProvider } from './contexts/ConvertKitContext';
import { ProtectedRoute } from './components/auth';
import { HomePage, SurveyPage, AdminPage, LoginPage } from './pages';
import SurveyBuilderPage from './pages/SurveyBuilderPage';
import ConvertKitSetupPage from './pages/ConvertKitSetupPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SurveyEditorPage from './pages/SurveyEditorPage';
import SurveyAnalyticsPage from './pages/SurveyAnalyticsPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConvertKitProvider>
          <Router>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/survey/:surveyId" element={<SurveyPage />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/surveys" 
            element={
              <ProtectedRoute>
                <SurveyBuilderPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/convertkit" 
            element={
              <ProtectedRoute>
                <ConvertKitSetupPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/surveys/edit/:surveyId" 
            element={
              <ProtectedRoute>
                <SurveyEditorPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/surveys/:surveyId/analytics" 
            element={
              <ProtectedRoute>
                <SurveyAnalyticsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Router>
        </ConvertKitProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
