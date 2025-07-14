import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login({ email, password });
    
    if (success) {
      // Redirect to the page they were trying to access, or admin dashboard
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen">
      <header className="header">
        <div className="container">
          <div className="logo">
            <span className="gradient-text text-2xl font-bold">🦊 BlueFox</span>
          </div>
        </div>
      </header>
      
      <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div className="glass-card">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 className="h2" style={{ marginBottom: '8px' }}>Admin Login</h2>
              <p className="text-gray-600">
                Access your BlueFox dashboard
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'var(--error)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                style={{ width: '100%', marginTop: '10px' }}
                disabled={!email || !password || isLoading}
              >
                {isLoading && <div className="loading-spinner"></div>}
                <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p className="text-sm text-gray-500">
                Demo credentials: admin@bluefox.com / password
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;