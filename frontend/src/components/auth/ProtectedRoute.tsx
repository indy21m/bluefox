import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../common';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 15px' }}></div>
            <p>Loading...</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    // Redirect to login with return url
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // Already authenticated, redirect away from login
    const from = location.state?.from?.pathname || '/admin';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;