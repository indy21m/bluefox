import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { FileText, Plus, Palette, Download, BarChart, Edit, Copy, Trash2 } from 'lucide-react';
import type { Survey } from '../types';

const SurveyBuilderPage = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSurveyTitle, setNewSurveyTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = () => {
    const allSurveys: Survey[] = [];
    
    // Load all surveys from localStorage
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

    // Sort surveys by creation date (newest first)
    allSurveys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setSurveys(allSurveys);
  };

  const handleLogout = () => {
    logout();
  };

  const handleCreateSurvey = () => {
    setShowCreateModal(true);
  };

  const handleCreateSurveySubmit = async () => {
    if (!newSurveyTitle.trim()) {
      showToast('Please enter a survey title', 'error');
      return;
    }

    setIsCreating(true);
    
    try {
      // Generate unique survey ID
      const surveyId = 'survey_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Create new survey object
      const newSurvey: Survey = {
        id: surveyId,
        title: newSurveyTitle.trim(),
        description: '',
        questions: [],
        startQuestionId: '',
        settings: {
          showProgressBar: true,
          requireEmailCapture: false,
          allowBackNavigation: true,
          autoAdvanceDelay: 750,
          successMessage: 'Thank you for completing our survey!',
          redirectUrl: ''
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        completions: 0
      };

      // Save to localStorage
      localStorage.setItem(`bluefox_survey_${surveyId}`, JSON.stringify(newSurvey));
      
      // Show success message
      showToast('Survey created successfully!', 'success');
      
      // Navigate to edit page
      navigate(`/surveys/edit/${surveyId}`);
    } catch (error) {
      showToast('Failed to create survey', 'error');
    } finally {
      setIsCreating(false);
      setShowCreateModal(false);
      setNewSurveyTitle('');
    }
  };

  const handleDuplicateSurvey = (survey: Survey) => {
    const newId = 'survey_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const duplicatedSurvey: Survey = {
      ...survey,
      id: newId,
      title: `${survey.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      completions: 0,
      isActive: false
    };

    localStorage.setItem(`bluefox_survey_${newId}`, JSON.stringify(duplicatedSurvey));
    showToast('Survey duplicated successfully!', 'success');
    loadSurveys();
  };

  const handleDeleteSurvey = (surveyId: string) => {
    if (window.confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
      localStorage.removeItem(`bluefox_survey_${surveyId}`);
      showToast('Survey deleted successfully!', 'success');
      loadSurveys();
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
      
      <main className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={{ marginBottom: '40px' }}>
          <Link to="/">
            <button className="btn btn-secondary">
              <span>← Back to Dashboard</span>
            </button>
          </Link>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h1 className="h1">Surveys</h1>
          <p className="text-lg text-gray-600">
            Create and manage your survey campaigns
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="flex gap-md" style={{ marginBottom: '40px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary"
            onClick={handleCreateSurvey}
          >
            <Plus size={20} />
            <span>Create New Survey</span>
          </button>
          
          <Link to="/themes">
            <button className="btn btn-secondary">
              <Palette size={20} />
              <span>Survey Themes</span>
            </button>
          </Link>
          
          <button 
            className="btn btn-secondary"
            onClick={() => showToast('Import/Export feature coming soon!', 'info')}
          >
            <Download size={20} />
            <span>Import/Export Surveys</span>
          </button>
        </div>

        {/* Surveys Grid */}
        {surveys.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'var(--gray-100)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <FileText size={40} color="var(--gray-400)" />
            </div>
            <h3 className="h3" style={{ marginBottom: '12px' }}>No surveys yet</h3>
            <p className="text-gray-600" style={{ marginBottom: '24px' }}>
              Create your first survey to start collecting responses
            </p>
            <button className="btn btn-primary" onClick={handleCreateSurvey}>
              <span>Create Your First Survey</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {surveys.map((survey) => (
              <div 
                key={survey.id}
                className="glass-card survey-card"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 className="h3" style={{ margin: 0 }}>{survey.title}</h3>
                    <span className={`level-badge ${survey.isActive ? '' : 'wk-lesson'}`} style={{
                      background: survey.isActive ? 'var(--success)' : 'var(--gray-300)',
                      color: survey.isActive ? 'white' : 'var(--gray-700)',
                    }}>
                      {survey.isActive ? 'Active' : 'Draft'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600" style={{ 
                    marginBottom: '16px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    minHeight: '42px',
                  }}>
                    {survey.description || 'No description'}
                  </p>

                  <div className="progress">
                    <div className="progress-header">
                      <span>Questions</span>
                      <span>{survey.questions.length}</span>
                    </div>
                    <div className="progress-header">
                      <span>Responses</span>
                      <span>{survey.completions || 0}</span>
                    </div>
                    <div className="progress-header">
                      <span>Created</span>
                      <span>{formatDate(survey.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="cta" style={{ 
                  display: 'flex', 
                  gap: '8px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--gray-200)',
                }}>
                  <Link 
                    to={`/surveys/edit/${survey.id}`} 
                    className="btn btn-primary" 
                    style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </Link>
                  <Link 
                    to={`/surveys/${survey.id}/analytics`} 
                    className="btn btn-secondary" 
                    style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <BarChart size={16} />
                    <span>Analytics</span>
                  </Link>
                  <button 
                    className="btn btn-secondary btn-round"
                    onClick={() => handleDuplicateSurvey(survey)}
                    title="Duplicate Survey"
                  >
                    <Copy size={16} />
                  </button>
                  <button 
                    className="btn btn-secondary btn-round"
                    onClick={() => handleDeleteSurvey(survey.id)}
                    title="Delete Survey"
                    style={{ color: 'var(--error)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Survey Modal */}
      <div id="createSurveyModal" className={`modal ${showCreateModal ? 'active' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Create New Survey</h2>
            <button 
              className="modal-close" 
              onClick={() => {
                setShowCreateModal(false);
                setNewSurveyTitle('');
              }}
            >
              ×
            </button>
          </div>
          
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="surveyTitle">Survey Title</label>
              <input
                id="surveyTitle"
                type="text"
                className="form-input"
                value={newSurveyTitle}
                onChange={(e) => setNewSurveyTitle(e.target.value)}
                placeholder="Enter survey title..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateSurveySubmit();
                  }
                }}
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setShowCreateModal(false);
                setNewSurveyTitle('');
              }}
            >
              Cancel
            </button>
            <button 
              className={`btn btn-primary ${isCreating ? 'loading' : ''}`}
              onClick={handleCreateSurveySubmit}
              disabled={isCreating}
            >
              {isCreating && <div className="loading-spinner"></div>}
              <span>{isCreating ? 'Creating...' : 'Create Survey'}</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .survey-card {
          transition: all 0.2s ease;
        }
        .survey-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default SurveyBuilderPage;