import { Link } from 'react-router-dom';
import { Header, Button, GlassCard, ProgressBar } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useConvertKit } from '../contexts/ConvertKitContext';

const AnalyticsPage = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { connectionStatus, customFields } = useConvertKit();

  const handleLogout = () => {
    logout();
  };

  // Mock data for demonstration
  const mockStats = {
    totalSurveys: 1,
    activeSurveys: 1,
    totalResponses: 0,
    completionRate: 0,
    avgCompletionTime: '0:00',
    topPerformingSurvey: 'Demo Survey'
  };

  const mockSurveyData = [
    {
      name: 'Demo Survey',
      responses: 0,
      completionRate: 0,
      avgTime: '0:00',
      status: 'Active'
    }
  ];

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
            <h1 className="h1">Analytics Dashboard</h1>
            <div className="flex gap-md">
              <Link to="/admin">
                <Button variant="secondary">← Back to Dashboard</Button>
              </Link>
              <Button variant="primary" onClick={() => showToast('Export functionality coming soon!', 'info')}>
                Export Data
              </Button>
            </div>
          </div>
          <p className="text-lg text-gray-600">
            View survey performance and completion rates
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg" style={{ width: '100%', marginBottom: '40px' }}>
          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div className="h2 text-primary" style={{ marginBottom: '8px' }}>{mockStats.totalSurveys}</div>
              <div className="text-sm text-gray-600">Total Surveys</div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div className="h2 text-success" style={{ marginBottom: '8px' }}>{mockStats.activeSurveys}</div>
              <div className="text-sm text-gray-600">Active Surveys</div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div className="h2 text-gray-700" style={{ marginBottom: '8px' }}>{mockStats.totalResponses}</div>
              <div className="text-sm text-gray-600">Total Responses</div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div className="h2 text-gray-700" style={{ marginBottom: '8px' }}>{mockStats.completionRate}%</div>
              <div className="text-sm text-gray-600">Avg Completion Rate</div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg" style={{ width: '100%' }}>
          {/* Survey Performance */}
          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '20px' }}>Survey Performance</h3>
            
            <div style={{ marginBottom: '20px' }}>
              {mockSurveyData.map((survey, index) => (
                <div key={index} style={{ 
                  padding: '16px', 
                  border: '1px solid var(--gray-200)', 
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div className="font-medium">{survey.name}</div>
                    <div className={`text-sm ${survey.status === 'Active' ? 'text-success' : 'text-gray-500'}`}>
                      {survey.status}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="text-sm">Completion Rate</span>
                      <span className="text-sm font-medium">{survey.completionRate}%</span>
                    </div>
                    <ProgressBar value={survey.completionRate} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-md text-sm">
                    <div>
                      <span className="text-gray-600">Responses: </span>
                      <span className="font-medium">{survey.responses}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Time: </span>
                      <span className="font-medium">{survey.avgTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="secondary" onClick={() => showToast('Detailed analytics coming soon!', 'info')}>
              View Detailed Analytics
            </Button>
          </GlassCard>

          {/* Response Insights */}
          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '20px' }}>Response Insights</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="h4 text-gray-500" style={{ marginBottom: '12px' }}>📊</div>
                <div className="text-lg text-gray-600" style={{ marginBottom: '8px' }}>No Responses Yet</div>
                <div className="text-sm text-gray-500">
                  Start collecting survey responses to see insights here
                </div>
              </div>
            </div>
            
            <div className="grid gap-md">
              <Link to="/survey/demo">
                <Button variant="primary" style={{ width: '100%' }}>
                  Test Demo Survey
                </Button>
              </Link>
              <Button 
                variant="secondary" 
                onClick={() => showToast('Share survey functionality coming soon!', 'info')}
                style={{ width: '100%' }}
              >
                Share Survey Link
              </Button>
            </div>
          </GlassCard>

          {/* ConvertKit Integration */}
          <GlassCard dark style={{ gridColumn: '1 / -1' }}>
            <h3 className="h3" style={{ marginBottom: '16px' }}>ConvertKit Integration Status</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={`status-indicator ${connectionStatus === 'connected' ? 'connected' : 'disconnected'}`}></span>
                  <span className="font-medium">API Connection</span>
                </div>
                <div className="text-sm opacity-80">
                  {connectionStatus === 'connected' ? 'Connected to ConvertKit' : 'Not connected to ConvertKit'}
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={`status-indicator ${connectionStatus === 'connected' && customFields.length > 0 ? 'connected' : 'disconnected'}`}></span>
                  <span className="font-medium">Field Mapping</span>
                </div>
                <div className="text-sm opacity-80">
                  {connectionStatus === 'connected' ? `${customFields.length} fields available` : 'No fields mapped'}
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="status-indicator disconnected"></span>
                  <span className="font-medium">Subscriber Updates</span>
                </div>
                <div className="text-sm opacity-80">0 subscribers updated</div>
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <Link to="/admin/convertkit">
                <Button variant="success">Setup ConvertKit Integration</Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;