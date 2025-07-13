import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header, Button, GlassCard, ProgressBar } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import type { Survey, Question } from '../types';

interface SurveyAnalytics {
  surveyId: string;
  totalViews: number;
  totalResponses: number;
  completionRate: number;
  averageCompletionTime: number;
  questionAnalytics: QuestionAnalytics[];
  responseTimeline: Array<{
    date: string;
    count: number;
  }>;
  recentResponses: Array<{
    id: string;
    respondentEmail: string;
    completedAt: string;
  }>;
}

interface QuestionAnalytics {
  questionId: string;
  questionTitle?: string;
  type?: string;
  totalAnswers: number;
  answerDistribution: Record<string, number>;
  averageValue?: number;
}

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

const SurveyAnalyticsPage = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (surveyId) {
      loadAnalytics();
      loadSurvey();
    }
  }, [surveyId]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/survey/${surveyId}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        showToast('Failed to load analytics', 'error');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      showToast('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSurvey = () => {
    const savedSurvey = localStorage.getItem(`bluefox_survey_${surveyId}`);
    if (savedSurvey) {
      try {
        const parsedSurvey = JSON.parse(savedSurvey);
        setSurvey(parsedSurvey);
      } catch (error) {
        console.error('Error loading survey:', error);
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exportToCSV = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/survey/${surveyId}/responses`);
      if (response.ok) {
        const data = await response.json();
        // Convert to CSV format
        const csv = convertResponsesToCSV(data.responses);
        
        // Download file
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${survey?.title || 'survey'}_responses_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        showToast('Data exported successfully!', 'success');
      }
    } catch (error) {
      showToast('Failed to export data', 'error');
    }
  };

  const convertResponsesToCSV = (responses: any[]) => {
    if (responses.length === 0) return '';
    
    // Headers
    const headers = ['Response ID', 'Email', 'Completed At'];
    if (responses[0].answers) {
      responses[0].answers.forEach((answer: any) => {
        const question = survey?.questions.find(q => q.id === answer.questionId);
        headers.push(question?.title || answer.questionId);
      });
    }
    
    // Rows
    const rows = responses.map(response => {
      const row = [response.id, response.respondentEmail, new Date(response.completedAt).toLocaleString()];
      response.answers.forEach((answer: any) => {
        row.push(answer.value);
      });
      return row;
    });
    
    // Combine
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h3">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h3">No analytics data available</div>
          <Link to="/admin/surveys">
            <Button variant="primary" style={{ marginTop: '20px' }}>
              Back to Surveys
            </Button>
          </Link>
        </div>
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
            <div>
              <h1 className="h1">{survey.title} Analytics</h1>
              <p className="text-lg text-gray-600">
                Survey performance and response insights
              </p>
            </div>
            <div className="flex gap-md">
              <Link to={`/admin/surveys/edit/${surveyId}`}>
                <Button variant="secondary">← Back to Editor</Button>
              </Link>
              <Button variant="primary" onClick={exportToCSV}>
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg" style={{ marginBottom: '40px' }}>
          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div className="h2 text-primary" style={{ marginBottom: '8px' }}>
                {analytics.totalViews}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div className="h2 text-success" style={{ marginBottom: '8px' }}>
                {analytics.totalResponses}
              </div>
              <div className="text-sm text-gray-600">Total Responses</div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div className="h2 text-gray-700" style={{ marginBottom: '8px' }}>
                {analytics.completionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div className="h2 text-gray-700" style={{ marginBottom: '8px' }}>
                {formatTime(analytics.averageCompletionTime)}
              </div>
              <div className="text-sm text-gray-600">Avg. Completion Time</div>
            </div>
          </GlassCard>
        </div>

        {/* Response Timeline */}
        <GlassCard style={{ marginBottom: '40px' }}>
          <h3 className="h3" style={{ marginBottom: '20px' }}>Response Timeline (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.responseTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'var(--gray-600)' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fill: 'var(--gray-600)' }} />
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
                strokeWidth={3}
                dot={{ fill: 'var(--primary)', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Question Analytics */}
        <div style={{ marginBottom: '40px' }}>
          <h3 className="h3" style={{ marginBottom: '20px' }}>Question Analytics</h3>
          <div className="grid gap-lg">
            {survey.questions.map((question, index) => {
              const qa = analytics.questionAnalytics.find(q => q.questionId === question.id);
              if (!qa) return null;

              // Prepare data for charts
              const chartData = Object.entries(qa.answerDistribution).map(([key, value]) => {
                // For multiple choice, use option text instead of ID
                let label = key;
                if (question.type === 'multiple_choice' && question.options) {
                  const option = question.options.find(o => o.id === key || o.value === key);
                  label = option?.text || key;
                }
                return { name: label, value };
              });

              return (
                <GlassCard key={question.id}>
                  <h4 className="h4" style={{ marginBottom: '16px' }}>
                    {index + 1}. {question.title}
                  </h4>
                  
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <span className="text-sm text-gray-600">Type: </span>
                      <span className="text-sm font-medium">{question.type.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Responses: </span>
                      <span className="text-sm font-medium">{qa.totalAnswers}</span>
                    </div>
                    {qa.averageValue !== undefined && (
                      <div>
                        <span className="text-sm text-gray-600">Average: </span>
                        <span className="text-sm font-medium">{qa.averageValue.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Charts based on question type */}
                  {question.type === 'multiple_choice' && chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  {(question.type === 'scale' || question.type === 'number') && chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis dataKey="name" tick={{ fill: 'var(--gray-600)' }} />
                        <YAxis tick={{ fill: 'var(--gray-600)' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid var(--gray-200)',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" fill="var(--primary)" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {question.type === 'boolean' && chartData.length > 0 && (
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                      {chartData.map((item, index) => (
                        <div key={index} style={{ textAlign: 'center' }}>
                          <div className="h2" style={{ color: COLORS[index] }}>
                            {((item.value / qa.totalAnswers) * 100).toFixed(0)}%
                          </div>
                          <div className="text-sm text-gray-600">{item.name}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(question.type === 'text' || question.type === 'email') && (
                    <div style={{ 
                      padding: '20px', 
                      backgroundColor: 'var(--gray-50)', 
                      borderRadius: '8px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      <div className="text-sm text-gray-600">Sample responses:</div>
                      {Object.keys(qa.answerDistribution).slice(0, 5).map((answer, i) => (
                        <div key={i} style={{ marginTop: '8px' }}>
                          <span className="text-sm">• {answer}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Recent Responses */}
        <GlassCard>
          <h3 className="h3" style={{ marginBottom: '20px' }}>Recent Responses</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Completed At</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentResponses.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)' }}>
                      No responses yet
                    </td>
                  </tr>
                ) : (
                  analytics.recentResponses.map((response) => (
                    <tr key={response.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={{ padding: '12px' }}>{response.respondentEmail}</td>
                      <td style={{ padding: '12px' }}>
                        {new Date(response.completedAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => showToast('Response details coming soon!', 'info')}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};

export default SurveyAnalyticsPage;