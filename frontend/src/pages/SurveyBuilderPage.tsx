import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header, Button, GlassCard, Input } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { Survey, Question } from '../types';

const SurveyBuilderPage = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [demoQuestionCount, setDemoQuestionCount] = useState(7);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSurveyTitle, setNewSurveyTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = () => {
    const allSurveys: Survey[] = [];
    
    // Load demo survey
    const savedDemoSurvey = localStorage.getItem('bluefox_survey_demo');
    if (savedDemoSurvey) {
      try {
        const parsedSurvey = JSON.parse(savedDemoSurvey);
        setDemoQuestionCount(parsedSurvey.questions?.length || 7);
        allSurveys.push(parsedSurvey);
      } catch (error) {
        setDemoQuestionCount(7);
      }
    }

    // Load all other surveys from localStorage
    const surveyKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('bluefox_survey_') && key !== 'bluefox_survey_demo'
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
      
      // Close modal and reset form
      setShowCreateModal(false);
      setNewSurveyTitle('');
      
      // Reload surveys
      loadSurveys();
      
      // Navigate to survey editor
      navigate(`/admin/surveys/edit/${surveyId}`);
      
    } catch (error) {
      showToast('Failed to create survey', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewSurveyTitle('');
  };

  return (
    <div className="min-h-screen w-full">
      <Header 
        showSearch 
        searchPlaceholder="Search surveys..." 
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
            <h1 className="h1" style={{ color: 'white' }}>Survey Management</h1>
            <div className="flex gap-md">
              <Link to="/admin">
                <Button variant="secondary">← Back to Dashboard</Button>
              </Link>
              <Button variant="primary" onClick={handleCreateSurvey}>
                Create New Survey
              </Button>
            </div>
          </div>
          <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Create, edit, and manage your survey campaigns
          </p>
        </div>

        <div className="grid grid-responsive gap-lg" style={{ width: '100%' }}>
          {/* Survey List - excluding demo */}
          {surveys.filter(survey => survey.id !== 'demo').map((survey) => (
            <GlassCard key={survey.id}>
              <h3 className="h3" style={{ marginBottom: '16px' }}>
                {survey.title}
                {survey.id === 'demo' && <span className="text-sm font-normal text-gray-600"> (Demo)</span>}
              </h3>
              <p style={{ marginBottom: '20px' }}>
                {survey.description || 'No description added yet'}
              </p>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="text-sm">Status:</span>
                  <span className="text-sm font-bold text-success">
                    {survey.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="text-sm">Questions:</span>
                  <span className="text-sm font-bold">{survey.questions.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-sm">Responses:</span>
                  <span className="text-sm font-bold">0</span>
                </div>
              </div>
              <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                <Link to={`/survey/${survey.slug || survey.id}`}>
                  <Button variant="primary" size="sm">Preview</Button>
                </Link>
                <Link to={`/admin/surveys/edit/${survey.id}`}>
                  <Button variant="secondary" size="sm">
                    Edit
                  </Button>
                </Link>
                <Link to={`/admin/surveys/${survey.id}/analytics`}>
                  <Button variant="secondary" size="sm">
                    Analytics
                  </Button>
                </Link>
              </div>
            </GlassCard>
          ))}

          {/* Show message if no surveys */}
          {surveys.length === 0 && (
            <GlassCard>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h3 className="h3" style={{ marginBottom: '16px' }}>No Surveys Yet</h3>
                <p style={{ marginBottom: '20px' }}>
                  Create your first survey to get started with BlueFox
                </p>
                <Button variant="primary" onClick={handleCreateSurvey}>
                  Create Your First Survey
                </Button>
              </div>
            </GlassCard>
          )}

          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Quick Actions</h3>
            <div className="grid gap-md">
              <Button 
                variant="primary" 
                onClick={handleCreateSurvey}
                style={{ justifyContent: 'flex-start' }}
              >
                📝 Create Survey from Template
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => showToast('Import functionality coming soon!', 'info')}
                style={{ justifyContent: 'flex-start' }}
              >
                📤 Import Survey
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => showToast('Duplicate functionality coming soon!', 'info')}
                style={{ justifyContent: 'flex-start' }}
              >
                📋 Duplicate Existing Survey
              </Button>
            </div>
          </GlassCard>

          <GlassCard dark>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Survey Templates</h3>
            <p style={{ marginBottom: '20px' }}>
              Start with pre-built templates for common use cases.
            </p>
            <div className="grid gap-sm">
              <div style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                <div className="font-medium">Lead Qualification</div>
                <div className="text-sm opacity-80">Qualify leads by role, company size, and budget</div>
              </div>
              <div style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                <div className="font-medium">Customer Segmentation</div>
                <div className="text-sm opacity-80">Segment customers by preferences and behavior</div>
              </div>
              <div style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                <div className="font-medium">Product Feedback</div>
                <div className="text-sm opacity-80">Collect detailed product usage feedback</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Create Survey Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 className="h3" style={{ marginBottom: '20px' }}>Create New Survey</h3>
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">Survey Title</label>
              <Input
                type="text"
                value={newSurveyTitle}
                onChange={(e) => setNewSurveyTitle(e.target.value)}
                placeholder="Enter survey title..."
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSurveySubmit()}
                style={{ fontSize: '16px' }}
              />
            </div>
            <div className="flex gap-md" style={{ justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleCreateSurveySubmit}
                loading={isCreating}
                disabled={!newSurveyTitle.trim()}
              >
                {isCreating ? 'Creating...' : 'Create Survey'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyBuilderPage;