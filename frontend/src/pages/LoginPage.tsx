import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header, GlassCard, Button, Input } from '../components/common';

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
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <GlassCard>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 className="h2" style={{ marginBottom: '8px' }}>Admin Login</h2>
              <p className="text-gray-600">
                Access your BlueFox dashboard
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <Input
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                error={error}
                required
              />

              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />

              {error && (
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'var(--error)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                style={{ width: '100%', marginTop: '10px' }}
                disabled={!email || !password}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p className="text-sm text-gray-500">
                Demo credentials: admin@bluefox.com / password
              </p>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;