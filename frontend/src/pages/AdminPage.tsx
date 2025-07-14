import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { BarChart, Settings, FileText } from 'lucide-react';

const AdminPage = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen">
      <header className="header">
        <div className="container">
          <div className="logo">
            <span className="gradient-text text-2xl font-bold">🦊 BlueFox</span>
          </div>
          
          <div className="flex items-center gap-lg">
            <span className="text-sm text-gray-600">
              Welcome, {user?.name || user?.email}
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h1 className="h1 gradient-text" style={{ marginBottom: '16px', fontSize: '48px' }}>
            BlueFox Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage your surveys, integrations, and analytics in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {/* Surveys Card */}
          <Link to="/surveys" style={{ textDecoration: 'none' }}>
            <div className="glass-card hover-lift" style={{ 
              height: '100%', 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              padding: '32px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'var(--primary-gradient)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <FileText size={40} color="white" />
              </div>
              <h2 className="h2" style={{ marginBottom: '12px' }}>Surveys</h2>
              <p className="text-gray-600" style={{ marginBottom: '32px', flex: 1 }}>
                Create and manage your survey campaigns
              </p>
              <button className="btn btn-primary" style={{ width: '100%' }}>
                <span>Manage Surveys →</span>
              </button>
            </div>
          </Link>

          {/* Integrations Card */}
          <Link to="/integrations" style={{ textDecoration: 'none' }}>
            <div className="glass-card hover-lift" style={{ 
              height: '100%', 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              padding: '32px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <Settings size={40} color="white" />
              </div>
              <h2 className="h2" style={{ marginBottom: '12px' }}>Integrations</h2>
              <p className="text-gray-600" style={{ marginBottom: '32px', flex: 1 }}>
                Connect with your favorite tools
              </p>
              <button className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' }}>
                <span>Configure Integrations →</span>
              </button>
            </div>
          </Link>

          {/* Analytics Card */}
          <Link to="/analytics" style={{ textDecoration: 'none' }}>
            <div className="glass-card hover-lift" style={{ 
              height: '100%', 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              padding: '32px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <BarChart size={40} color="white" />
              </div>
              <h2 className="h2" style={{ marginBottom: '12px' }}>Analytics</h2>
              <p className="text-gray-600" style={{ marginBottom: '32px', flex: 1 }}>
                Track performance and insights
              </p>
              <button className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                <span>View Analytics →</span>
              </button>
            </div>
          </Link>
        </div>
      </main>

      <style>{`
        .hover-lift {
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default AdminPage;