import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header, GlassCard, ProgressBar } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useConvertKit } from '../contexts/ConvertKitContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Survey } from '../types';

interface GlobalAnalytics {
  totalSurveys: number;
  totalResponses: number;
  totalViews: number;
  averageCompletionRate: number;
  surveyStats: Array<{
    surveyId: string;
    responses: number;
    views: number;
    completionRate: number;
  }>;
}

const AnalyticsPage = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { connectionStatus, customFields } = useConvertKit();
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseTimeline, setResponseTimeline] = useState<Array<{ date: string; count: number }>>([]);

  useEffect(() => {
    loadAnalytics();
    loadSurveys();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/survey/analytics/overview');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
        
        // Calculate response timeline across all surveys
        calculateGlobalTimeline();
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSurveys = () => {
    const allSurveys: Survey[] = [];
    const surveyKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('bluefox_survey_')
    );
    
    surveyKeys.forEach(key => {
      try {
        const survey = JSON.parse(localStorage.getItem(key) || '');
        allSurveys.push(survey);
      } catch (error) {
        console.error('Failed to load survey:', key);
      }
    });

    setSurveys(allSurveys);
  };

  const calculateGlobalTimeline = () => {
    // This would ideally come from the backend
    // For now, just show a placeholder
    const timeline = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      timeline.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10) // Placeholder data
      });
    }
    setResponseTimeline(timeline);
  };

  const handleLogout = () => {
    logout();
  };

  const getSurveyName = (surveyId: string) => {
    const survey = surveys.find(s => s.id === surveyId);
    return survey?.title || surveyId;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen w-full">
      <Header 
        rightContent={
          <div className="flex items-center gap-md">
            <span className="text-sm text-gray-600">
              Welcome, {user?.name || user?.email}
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        }
      />
      
      <main className="container" style={{ paddingTop: '40px', width: '100%' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h1 className="h1">Analytics Dashboard</h1>
            <div className="flex gap-md">
              <Link to="/">
                <button className="btn btn-secondary">
                  <span>← Back to Dashboard</span>
                </button>
              </Link>
              <button className="btn btn-primary" onClick={() => showToast('Export functionality coming soon!', 'info')}>
                <span>Export Data</span>
              </button>
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
              <div className="h2 text-primary" style={{ marginBottom: '8px' }}>
                {loading ? '...' : surveys.length}
              </div>
              <div className="text-sm text-gray-600">Total Surveys</div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div className="h2 text-success" style={{ marginBottom: '8px' }}>
                {loading ? '...' : analytics?.totalViews || 0}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div className="h2 text-gray-700" style={{ marginBottom: '8px' }}>
                {loading ? '...' : analytics?.totalResponses || 0}
              </div>
              <div className="text-sm text-gray-600">Total Responses</div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div className="h2 text-gray-700" style={{ marginBottom: '8px' }}>
                {loading ? '...' : `${(analytics?.averageCompletionRate || 0).toFixed(1)}%`}
              </div>
              <div className="text-sm text-gray-600">Avg Completion Rate</div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg" style={{ width: '100%' }}>
          {/* Survey Performance */}
          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '20px' }}>Survey Performance</h3>
            
            <div style={{ marginBottom: '20px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  Loading survey data...
                </div>
              ) : analytics?.surveyStats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
                  No survey data available yet
                </div>
              ) : (
                analytics?.surveyStats
                  .sort((a, b) => b.completionRate - a.completionRate)
                  .slice(0, 5)
                  .map((stat) => {
                    const survey = surveys.find(s => s.id === stat.surveyId);
                    return (
                      <div key={stat.surveyId} style={{ 
                        padding: '16px', 
                        border: '1px solid var(--gray-200)', 
                        borderRadius: '8px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div className="font-medium">{survey?.title || stat.surveyId}</div>
                          <div className="text-sm text-success">
                            {survey?.isActive ? 'Active' : 'Draft'}
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span className="text-sm">Completion Rate</span>
                            <span className="text-sm font-medium">{stat.completionRate.toFixed(1)}%</span>
                          </div>
                          <ProgressBar value={stat.completionRate} />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-md text-sm">
                          <div>
                            <span className="text-gray-600">Views: </span>
                            <span className="font-medium">{stat.views}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Responses: </span>
                            <span className="font-medium">{stat.responses}</span>
                          </div>
                          <div>
                            <Link to={`/admin/surveys/${stat.surveyId}/analytics`}>
                              <span className="text-primary cursor-pointer hover:underline">View →</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
            
            <Link to="/admin/surveys">
              <button className="btn btn-secondary">
                <span>Manage Surveys</span>
              </button>
            </Link>
          </GlassCard>

          {/* Response Timeline */}
          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '20px' }}>Response Timeline</h3>
            
            <div style={{ marginBottom: '20px' }}>
              {analytics?.totalResponses === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div className="h4 text-gray-500" style={{ marginBottom: '12px' }}>📊</div>
                  <div className="text-lg text-gray-600" style={{ marginBottom: '8px' }}>No Responses Yet</div>
                  <div className="text-sm text-gray-500">
                    Start collecting survey responses to see insights here
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={responseTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'var(--gray-600)', fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fill: 'var(--gray-600)', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid var(--gray-200)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="var(--primary)" 
                      strokeWidth={2}
                      dot={{ fill: 'var(--primary)', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <div className="grid gap-md">
              {surveys.length > 0 && (
                <Link to={`/survey/${surveys[0].slug || surveys[0].id}`}>
                  <button className="btn btn-primary" style={{ width: '100%' }}>
                    <span>Test a Survey</span>
                  </button>
                </Link>
              )}
              <Link to="/admin/surveys">
                <button className="btn btn-secondary" style={{ width: '100%' }}>
                  <span>Create New Survey</span>
                </button>
              </Link>
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
                  <span className={`status-indicator ${analytics && analytics.totalResponses > 0 ? 'connected' : 'disconnected'}`}></span>
                  <span className="font-medium">Subscriber Updates</span>
                </div>
                <div className="text-sm opacity-80">
                  {analytics?.totalResponses || 0} responses processed
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <Link to="/admin/convertkit">
                <button className="btn btn-success">
                  <span>Setup ConvertKit Integration</span>
                </button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;