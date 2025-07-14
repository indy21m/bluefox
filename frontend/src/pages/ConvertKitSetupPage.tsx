import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToastCompat';
import { useConvertKit } from '../contexts/ConvertKitContext';
import { API_ENDPOINTS } from '../config/api';

const ConvertKitSetupPage = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { 
    apiKey: savedApiKey, 
    setApiKey: setSavedApiKey, 
    connectionStatus: savedConnectionStatus, 
    setConnectionStatus: setSavedConnectionStatus,
    customFields: savedCustomFields,
    setCustomFields: setSavedCustomFields,
    isLoading
  } = useConvertKit();
  
  const [apiKey, setApiKey] = useState(savedApiKey);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(savedConnectionStatus);
  const [customFields, setCustomFields] = useState(savedCustomFields);
  
  // Update local state when context changes
  useEffect(() => {
    setApiKey(savedApiKey);
    setConnectionStatus(savedConnectionStatus);
    setCustomFields(savedCustomFields);
  }, [savedApiKey, savedConnectionStatus, savedCustomFields]);

  const handleLogout = () => {
    logout();
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      showToast('Please enter your ConvertKit API key', 'error');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Call our backend to test the connection
      const response = await fetch(API_ENDPOINTS.convertkit.testConnection, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey })
      });

      if (response.ok) {
        setConnectionStatus('connected');
        setSavedConnectionStatus('connected');
        setSavedApiKey(apiKey);
        
        // Fetch custom fields
        const fieldsResponse = await fetch(API_ENDPOINTS.convertkit.customFields, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey })
        });

        if (fieldsResponse.ok) {
          const fieldsData = await fieldsResponse.json();
          const fields = fieldsData.custom_fields || [];
          setCustomFields(fields);
          setSavedCustomFields(fields);
        }
        
        showToast('Successfully connected to ConvertKit!', 'success');
      } else {
        const errorData = await response.json();
        setConnectionStatus('error');
        setSavedConnectionStatus('error');
        
        let errorMessage = 'Invalid API key';
        if (errorData.message) {
          if (errorData.message.includes('401')) {
            errorMessage = 'Invalid API key. Please check your ConvertKit API key.';
          } else {
            errorMessage = errorData.message;
          }
        }
        
        showToast(`Connection failed: ${errorMessage}`, 'error');
      }
    } catch (error) {
      setConnectionStatus('error');
      setSavedConnectionStatus('error');
      showToast('Connection failed: Unable to reach ConvertKit API', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSaveSettings = () => {
    // Save to context (which persists to localStorage)
    setSavedApiKey(apiKey);
    showToast('ConvertKit settings saved!', 'success');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

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
          <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
            <h1 className="h1">ConvertKit Integration</h1>
            <Link to="/integrations">
              <button className="btn btn-secondary">
                <span>← Back to Integrations</span>
              </button>
            </Link>
          </div>
          <p className="text-lg text-gray-600">
            Configure your ConvertKit API connection and field mappings
          </p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="glass-card">
            <h3 className="h3" style={{ marginBottom: '16px' }}>ConvertKit Configuration</h3>
            
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="apiKey">ConvertKit API Key</label>
              <input
                id="apiKey"
                type="password"
                className="form-input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your ConvertKit API key..."
              />
              <p className="text-sm text-gray-600" style={{ marginTop: '8px' }}>
                Find your API key in ConvertKit → Account Settings → Advanced → API
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div className="flex items-center gap-sm" style={{ marginBottom: '15px' }}>
                <span 
                  className={`status-indicator ${
                    connectionStatus === 'connected' ? 'connected' : 
                    connectionStatus === 'error' ? 'disconnected' : 'checking'
                  }`}
                ></span>
                <span className="text-sm">
                  {connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus === 'error' ? 'Connection Failed' : 'Not Connected'}
                </span>
              </div>
            </div>

            <div className="flex gap-md" style={{ flexWrap: 'wrap', marginBottom: '30px' }}>
              <button 
                className={`btn btn-primary ${isConnecting ? 'loading' : ''}`}
                onClick={handleTestConnection}
                disabled={!apiKey.trim() || isConnecting}
              >
                {isConnecting && <div className="loading-spinner"></div>}
                <span>{isConnecting ? 'Testing...' : 'Test Connection'}</span>
              </button>
              <button 
                className="btn btn-success"
                onClick={handleSaveSettings}
                disabled={connectionStatus !== 'connected'}
              >
                <span>Save Settings</span>
              </button>
            </div>

            {connectionStatus !== 'connected' && (
              <div className="glass-card" style={{ 
                background: 'rgba(248, 250, 252, 0.8)',
                backdropFilter: 'none',
              }}>
                <p className="font-medium" style={{ marginBottom: '16px' }}>
                  Connect your ConvertKit account to enable survey response segmentation
                </p>
                <div className="grid gap-sm">
                  <div className="glass-card" style={{ padding: '12px' }}>
                    <div className="font-medium">✓ Automatic subscriber lookup</div>
                    <div className="text-sm text-gray-600">Find subscribers by email address</div>
                  </div>
                  <div className="glass-card" style={{ padding: '12px' }}>
                    <div className="font-medium">✓ Custom field updates</div>
                    <div className="text-sm text-gray-600">Map survey answers to ConvertKit fields</div>
                  </div>
                  <div className="glass-card" style={{ padding: '12px' }}>
                    <div className="font-medium">✓ Real-time segmentation</div>
                    <div className="text-sm text-gray-600">Instant subscriber categorization</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConvertKitSetupPage;