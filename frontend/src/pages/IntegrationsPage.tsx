import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConvertKit } from '../contexts/ConvertKitContext';
import { Mail, Zap, Database, Globe, ChevronRight, Check, X } from 'lucide-react';

const IntegrationsPage = () => {
  const { user, logout } = useAuth();
  const { connectionStatus } = useConvertKit();
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
  };

  const integrations = [
    {
      id: 'convertkit',
      name: 'ConvertKit',
      description: 'Email marketing and automation platform',
      icon: Mail,
      color: '#FB7185',
      status: connectionStatus === 'connected' ? 'connected' : 'disconnected',
      configurable: true,
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect to 5,000+ apps and automate workflows',
      icon: Zap,
      color: '#FF6B35',
      status: 'coming-soon',
      configurable: false,
    },
    {
      id: 'webhook',
      name: 'Webhooks',
      description: 'Send survey responses to any URL',
      icon: Globe,
      color: '#8B5CF6',
      status: 'coming-soon',
      configurable: false,
    },
    {
      id: 'database',
      name: 'Database Export',
      description: 'Export responses to CSV or JSON',
      icon: Database,
      color: '#10B981',
      status: 'coming-soon',
      configurable: false,
    },
  ];

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
      
      <main className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={{ marginBottom: '40px' }}>
          <Link to="/">
            <button className="btn btn-secondary">
              <span>← Back to Dashboard</span>
            </button>
          </Link>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h1 className="h1">Integrations</h1>
          <p className="text-lg text-gray-600">
            Connect BlueFox with your favorite tools to automate your workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {integrations.map((integration) => {
            const Icon = integration.icon;
            const isActive = activeIntegration === integration.id;
            
            return (
              <div 
                key={integration.id}
                className="glass-card integration-card"
                style={{ 
                  position: 'relative',
                  cursor: integration.configurable ? 'pointer' : 'default',
                  opacity: integration.status === 'coming-soon' ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                }}
                onClick={() => integration.configurable && setActiveIntegration(isActive ? null : integration.id)}
              >
                {integration.status === 'coming-soon' && (
                  <span className="level-badge" style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'var(--gray-200)',
                    color: 'var(--gray-600)',
                  }}>
                    Coming Soon
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: `${integration.color}20`,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={32} color={integration.color} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 className="h3" style={{ margin: 0 }}>{integration.name}</h3>
                      {integration.status === 'connected' && (
                        <div className="flex items-center gap-sm">
                          <span className="status-indicator connected"></span>
                          <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>Connected</span>
                        </div>
                      )}
                      {integration.status === 'disconnected' && integration.configurable && (
                        <div className="flex items-center gap-sm">
                          <span className="status-indicator disconnected"></span>
                          <span className="text-sm font-medium text-gray-500">Not Connected</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600" style={{ marginBottom: '16px' }}>
                      {integration.description}
                    </p>

                    {integration.configurable && (
                      <button 
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIntegration(isActive ? null : integration.id);
                        }}
                      >
                        <span>{integration.status === 'connected' ? 'Configure' : 'Connect'}</span>
                        <ChevronRight size={16} style={{
                          transform: isActive ? 'rotate(90deg)' : 'rotate(0)',
                          transition: 'transform 0.2s ease',
                        }} />
                      </button>
                    )}
                  </div>
                </div>

                {/* ConvertKit Configuration Panel */}
                {isActive && integration.id === 'convertkit' && (
                  <div style={{
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: '1px solid var(--gray-200)',
                  }}>
                    <h4 className="h4" style={{ marginBottom: '16px' }}>ConvertKit Configuration</h4>
                    <p className="text-gray-600" style={{ marginBottom: '20px' }}>
                      Connect your ConvertKit account to automatically sync survey responses with your email lists.
                    </p>
                    <div className="flex gap-md">
                      <Link to="/integrations/convertkit">
                        <button className="btn btn-primary">
                          <span>{integration.status === 'connected' ? 'Manage Connection' : 'Setup ConvertKit'}</span>
                        </button>
                      </Link>
                      {integration.status === 'connected' && (
                        <button className="btn btn-secondary" onClick={(e) => {
                          e.stopPropagation();
                          // Handle disconnect
                        }}>
                          <span>Disconnect</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="glass-card" style={{ marginTop: '60px', textAlign: 'center', maxWidth: '600px', margin: '60px auto 0' }}>
          <h2 className="h3" style={{ marginBottom: '16px' }}>Need a different integration?</h2>
          <p className="text-gray-600" style={{ marginBottom: '24px' }}>
            We're constantly adding new integrations. Let us know what you need!
          </p>
          <button className="btn btn-secondary">
            <span>Request Integration</span>
          </button>
        </div>
      </main>

      <style>{`
        .integration-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default IntegrationsPage;