import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header, GlassCard, ProgressBar } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToastCompat';
import { useConvertKit } from '../contexts/ConvertKitContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import type { Survey } from '../types';
import type { SurveyAnalytics, RealTimeMetrics, ConversionFunnel, ABTest, ExportOptions } from '../types/analytics';
import { ABTestPanel } from '../components/analytics';
import { API_ENDPOINTS } from '../config/api';

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

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const AnalyticsPage = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { connectionStatus, customFields } = useConvertKit();
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseTimeline, setResponseTimeline] = useState<Array<{ date: string; count: number }>>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [topDevices, setTopDevices] = useState<Array<{ name: string; count: number }>>([]);
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    loadAnalytics();
    loadSurveys();
    loadRealTimeMetrics();
    loadConversionFunnel();
    loadDeviceData();
    loadABTests();
    
    // Set up real-time updates
    const interval = setInterval(loadRealTimeMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Reload data when time range changes
    loadAnalytics();
    calculateGlobalTimeline();
  }, [selectedTimeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.survey.analytics.overview);
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

  const loadRealTimeMetrics = async () => {
    try {
      // In a real app, this would be an API call
      // For now, generate realistic demo data
      const mockMetrics: RealTimeMetrics = {
        activeRespondents: Math.floor(Math.random() * 15) + 1,
        responsesLast24Hours: Math.floor(Math.random() * 50) + 10,
        responsesThisHour: Math.floor(Math.random() * 8) + 1,
        topPerformingSurveys: surveys.slice(0, 3).map(survey => ({
          surveyId: survey.id,
          title: survey.title,
          completionRate: Math.random() * 40 + 60, // 60-100%
          responses: Math.floor(Math.random() * 100) + 20
        }))
      };
      setRealTimeMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading real-time metrics:', error);
    }
  };

  const loadConversionFunnel = () => {
    // Generate mock conversion funnel data
    const mockFunnel: ConversionFunnel = {
      steps: [
        { name: 'Survey Viewed', count: 1000, percentage: 100, dropOff: 0 },
        { name: 'Survey Started', count: 750, percentage: 75, dropOff: 25 },
        { name: 'First Question', count: 650, percentage: 65, dropOff: 10 },
        { name: 'Halfway Point', count: 480, percentage: 48, dropOff: 17 },
        { name: 'Survey Completed', count: 320, percentage: 32, dropOff: 16 }
      ]
    };
    setConversionFunnel(mockFunnel);
  };

  const loadDeviceData = () => {
    const devices = [
      { name: 'Desktop', count: 45 },
      { name: 'Mobile', count: 38 },
      { name: 'Tablet', count: 17 }
    ];
    setTopDevices(devices);
  };

  const loadABTests = () => {
    // Generate mock A/B test data
    const mockTests: ABTest[] = [
      {
        id: 'ab-test-1',
        name: 'Welcome Message Optimization',
        surveyId: surveys[0]?.id || 'survey-1',
        status: 'active',
        variants: [
          { id: 'variant-a', name: 'Original', traffic: 50, conversions: 45, conversionRate: 12.5 },
          { id: 'variant-b', name: 'Friendly Tone', traffic: 50, conversions: 52, conversionRate: 14.4 }
        ],
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        significanceLevel: 0.95,
        winner: 'variant-b'
      },
      {
        id: 'ab-test-2',
        name: 'Question Order Test',
        surveyId: surveys[1]?.id || 'survey-2',
        status: 'completed',
        variants: [
          { id: 'variant-a', name: 'Sequential', traffic: 60, conversions: 78, conversionRate: 18.2 },
          { id: 'variant-b', name: 'Randomized', traffic: 40, conversions: 41, conversionRate: 15.1 }
        ],
        startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        significanceLevel: 0.99,
        winner: 'variant-a'
      }
    ];
    setAbTests(mockTests);
  };

  const calculateGlobalTimeline = () => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    const timeline = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      timeline.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 15) + 5 // More realistic numbers
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

  const handleExportData = async (options: ExportOptions) => {
    try {
      // In a real app, this would call an API endpoint
      const data = {
        analytics,
        responseTimeline,
        surveys: surveys.filter(s => options.surveys.includes(s.id)),
        dateRange: options.dateRange,
        generatedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bluefox-analytics-${new Date().toISOString().split('T')[0]}.${options.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Analytics data exported successfully!', 'success');
      setShowExportModal(false);
    } catch (error) {
      showToast('Export failed. Please try again.', 'error');
    }
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
              <button className="btn btn-primary" onClick={() => setShowExportModal(true)}>
                <span>📊 Export Data</span>
              </button>
            </div>
          </div>
          <p className="text-lg text-gray-600">
            View survey performance and completion rates
          </p>
        </div>

        {/* Real-time Metrics */}
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
                {loading ? '...' : realTimeMetrics?.activeRespondents || 0}
              </div>
              <div className="text-sm text-gray-600">Active Respondents</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px' }}>
                <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', marginRight: '6px', animation: 'pulse 2s infinite' }}></div>
                <span style={{ fontSize: '11px', color: '#10b981' }}>Live</span>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div className="h2 text-gray-700" style={{ marginBottom: '8px' }}>
                {loading ? '...' : realTimeMetrics?.responsesLast24Hours || 0}
              </div>
              <div className="text-sm text-gray-600">Responses (24h)</div>
              <div className="text-xs text-gray-500" style={{ marginTop: '4px' }}>
                +{realTimeMetrics?.responsesThisHour || 0} this hour
              </div>
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

        {/* Time Range Selector */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="h2">Detailed Analytics</h2>
          <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '4px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: selectedTimeRange === range ? 'var(--primary)' : 'transparent',
                  color: selectedTimeRange === range ? 'white' : 'var(--gray-600)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg" style={{ width: '100%', marginBottom: '40px' }}>
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
                            <Link to={`/surveys/${stat.surveyId}/analytics`}>
                              <span className="text-primary cursor-pointer hover:underline">View →</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
            
            <Link to="/surveys">
              <button className="btn btn-secondary">
                <span>Manage Surveys</span>
              </button>
            </Link>
          </GlassCard>

          {/* Response Timeline */}
          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '20px' }}>Response Timeline ({selectedTimeRange})</h3>
            
            <div style={{ marginBottom: '20px' }}>
              {responseTimeline.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div className="h4 text-gray-500" style={{ marginBottom: '12px' }}>📊</div>
                  <div className="text-lg text-gray-600" style={{ marginBottom: '8px' }}>No Responses Yet</div>
                  <div className="text-sm text-gray-500">
                    Start collecting survey responses to see insights here
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={responseTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'var(--gray-600)', fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return selectedTimeRange === '7d' 
                          ? date.toLocaleDateString('en', { weekday: 'short' })
                          : date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
                      }}
                    />
                    <YAxis tick={{ fill: 'var(--gray-600)', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid var(--gray-200)',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="var(--primary)" 
                      strokeWidth={3}
                      dot={{ fill: 'var(--primary)', r: 5 }}
                      activeDot={{ r: 7, fill: 'var(--primary)' }}
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
              <Link to="/surveys">
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

        {/* Conversion Funnel & Device Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg" style={{ width: '100%', marginBottom: '40px' }}>
          {/* Conversion Funnel */}
          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '20px' }}>Conversion Funnel</h3>
            
            {conversionFunnel ? (
              <div style={{ marginBottom: '20px' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conversionFunnel.steps} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis type="number" tick={{ fill: 'var(--gray-600)', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: 'var(--gray-600)', fontSize: 12 }} width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid var(--gray-200)',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [
                        `${value} (${conversionFunnel.steps.find(s => s.count === value)?.percentage.toFixed(1)}%)`,
                        'Count'
                      ]}
                    />
                    <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                
                <div style={{ marginTop: '16px' }}>
                  <div className="text-sm text-gray-600" style={{ marginBottom: '8px' }}>Drop-off Analysis</div>
                  {conversionFunnel.steps.slice(1).map((step, index) => (
                    <div key={step.name} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '4px 0',
                      borderBottom: index < conversionFunnel.steps.length - 2 ? '1px solid var(--gray-100)' : 'none'
                    }}>
                      <span className="text-sm">{step.name}</span>
                      <span className="text-sm text-red-500">-{step.dropOff}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="text-gray-500">Loading funnel data...</div>
              </div>
            )}
          </GlassCard>

          {/* Device Analytics */}
          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '20px' }}>Device Analytics</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={topDevices}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {topDevices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid var(--gray-200)',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [`${value}%`, 'Usage']}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div style={{ marginTop: '16px' }}>
                {topDevices.map((device, index) => (
                  <div key={device.name} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: index < topDevices.length - 1 ? '1px solid var(--gray-100)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        background: COLORS[index % COLORS.length] 
                      }}></div>
                      <span className="text-sm font-medium">{device.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{device.count}%</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Top Performing Surveys */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--gray-200)' }}>
              <h4 className="text-lg font-semibold" style={{ marginBottom: '12px' }}>Top Performing Surveys</h4>
              {realTimeMetrics?.topPerformingSurveys.map((survey, index) => (
                <div key={survey.surveyId} style={{ 
                  padding: '8px 0',
                  borderBottom: index < (realTimeMetrics?.topPerformingSurveys.length || 0) - 1 ? '1px solid var(--gray-100)' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="text-sm font-medium">{survey.title}</div>
                      <div className="text-xs text-gray-500">{survey.responses} responses</div>
                    </div>
                    <div className="text-sm text-success font-medium">
                      {survey.completionRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-sm text-gray-500">No data available</div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* A/B Testing Section */}
        <div className="grid grid-cols-1" style={{ width: '100%', marginBottom: '40px' }}>
          <ABTestPanel 
            tests={abTests}
            onCreateTest={() => showToast('A/B test creation coming soon!', 'info')}
          />
        </div>

        {/* ConvertKit Integration remains the same */}
        <div className="grid grid-cols-1" style={{ width: '100%' }}>
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

        {/* Export Modal */}
        {showExportModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '400px',
              maxWidth: '90vw'
            }}>
              <h3 className="h3" style={{ marginBottom: '16px' }}>Export Analytics Data</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label className="text-sm font-medium text-gray-700" style={{ display: 'block', marginBottom: '8px' }}>
                  Format
                </label>
                <select style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '6px'
                }}>
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="text-sm font-medium text-gray-700" style={{ display: 'block', marginBottom: '8px' }}>
                  Date Range
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="date"
                    defaultValue={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '6px'
                    }}
                  />
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '6px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowExportModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleExportData({
                    format: 'json',
                    dateRange: {
                      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      end: new Date()
                    },
                    surveys: surveys.map(s => s.id),
                    includeMetadata: true
                  })}
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsPage;