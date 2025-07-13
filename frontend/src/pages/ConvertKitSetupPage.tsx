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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg" style={{ width: '100%' }}>
          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '16px' }}>API Configuration</h3>
            
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

            <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
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
          </GlassCard>

          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Connection Status</h3>
            
            {connectionStatus === 'connected' ? (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>API Status:</span>
                    <span className="font-bold text-success">✅ Connected</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Custom Fields:</span>
                    <span className="font-bold">{customFields.length}</span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <h4 className="font-semibold" style={{ marginBottom: '8px' }}>Available Custom Fields:</h4>
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {customFields.length > 0 ? (
                      customFields.map((field: any) => (
                        <div key={field.id} style={{ 
                          padding: '8px', 
                          borderBottom: '1px solid var(--gray-200)', 
                          fontSize: '14px' 
                        }}>
                          <div className="font-medium">{field.label || field.name}</div>
                          <div className="text-gray-600 text-xs">
                            Key: {field.key} • ID: {field.id}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600">No custom fields found</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ marginBottom: '20px' }}>
                  Connect your ConvertKit account to start segmenting subscribers based on survey responses.
                </p>
                <div className="grid gap-sm">
                  <div style={{ padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px' }}>
                    <div className="font-medium">✓ Automatic subscriber lookup</div>
                    <div className="text-sm text-gray-600">Find subscribers by email address</div>
                  </div>
                  <div style={{ padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px' }}>
                    <div className="font-medium">✓ Custom field updates</div>
                    <div className="text-sm text-gray-600">Map survey answers to ConvertKit fields</div>
                  </div>
                  <div style={{ padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px' }}>
                    <div className="font-medium">✓ Real-time segmentation</div>
                    <div className="text-sm text-gray-600">Instant subscriber categorization</div>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>

          {connectionStatus === 'connected' && (
            <GlassCard dark style={{ gridColumn: '1 / -1' }}>
              <h3 className="h3" style={{ marginBottom: '16px' }}>Field Mapping</h3>
              <p style={{ marginBottom: '20px' }}>
                Configure how survey answers map to ConvertKit custom fields.
              </p>
              <div className="grid gap-md">
                <div style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                  <div className="font-medium" style={{ marginBottom: '8px' }}>Survey Question → ConvertKit Field</div>
                  <div className="text-sm opacity-80">
                    "What's your role?" → role_field<br/>
                    "Company size?" → company_size<br/>
                    "Monthly budget?" → budget_range
                  </div>
                </div>
                <Link to="/admin/surveys/edit/demo">
                  <Button variant="secondary">
                    Configure Field Mapping
                  </Button>
                </Link>
              </div>
            </GlassCard>
          )}
        </div>
      </main>
    </div>
  );
};

export default ConvertKitSetupPage;