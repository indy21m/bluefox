import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header, Button, GlassCard, Input } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useConvertKit } from '../contexts/ConvertKitContext';

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
      const response = await fetch('http://localhost:3001/api/convertkit/test-connection', {
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
        const fieldsResponse = await fetch('http://localhost:3001/api/convertkit/custom-fields', {
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
      <div className="min-h-screen w-full flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Header 
        rightContent={
          <div className="flex items-center gap-md">
            <span className="text-sm text-gray-600">
              Welcome, {user?.name || user?.email}
            </span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        }
      />
      
      <main className="container" style={{ paddingTop: '40px', width: '100%' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h1 className="h1">ConvertKit Integration</h1>
            <Link to="/admin">
              <Button variant="secondary">← Back to Dashboard</Button>
            </Link>
          </div>
          <p className="text-lg text-gray-600">
            Configure your ConvertKit API connection and field mappings
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '16px' }}>ConvertKit Configuration</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">ConvertKit API Key</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your ConvertKit API key..."
                style={{ marginBottom: '12px' }}
              />
              <p className="text-sm text-gray-600">
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
              <Button 
                variant="primary" 
                onClick={handleTestConnection}
                loading={isConnecting}
                disabled={!apiKey.trim()}
              >
                {isConnecting ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button 
                variant="success" 
                onClick={handleSaveSettings}
                disabled={connectionStatus !== 'connected'}
              >
                Save Settings
              </Button>
            </div>

            {connectionStatus !== 'connected' && (
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'var(--gray-50)', 
                borderRadius: '8px',
                border: '1px solid var(--gray-200)' 
              }}>
                <p className="font-medium" style={{ marginBottom: '16px' }}>
                  Connect your ConvertKit account to enable survey response segmentation
                </p>
                <div className="grid gap-sm">
                  <div style={{ padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '6px', backgroundColor: 'white' }}>
                    <div className="font-medium">✓ Automatic subscriber lookup</div>
                    <div className="text-sm text-gray-600">Find subscribers by email address</div>
                  </div>
                  <div style={{ padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '6px', backgroundColor: 'white' }}>
                    <div className="font-medium">✓ Custom field updates</div>
                    <div className="text-sm text-gray-600">Map survey answers to ConvertKit fields</div>
                  </div>
                  <div style={{ padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '6px', backgroundColor: 'white' }}>
                    <div className="font-medium">✓ Real-time segmentation</div>
                    <div className="text-sm text-gray-600">Instant subscriber categorization</div>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default ConvertKitSetupPage;