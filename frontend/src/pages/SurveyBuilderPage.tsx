import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header, Button, GlassCard } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { Survey, Question } from '../types';

const SurveyBuilderPage = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [demoQuestionCount, setDemoQuestionCount] = useState(7);

  useEffect(() => {
    // Load demo survey question count from localStorage
    const savedSurvey = localStorage.getItem('bluefox_survey_demo');
    if (savedSurvey) {
      try {
        const parsedSurvey = JSON.parse(savedSurvey);
        setDemoQuestionCount(parsedSurvey.questions?.length || 7);
      } catch (error) {
        setDemoQuestionCount(7); // fallback to original count
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleCreateSurvey = () => {
    // For now, show an alert that this feature is coming soon
    showToast('Survey builder coming soon! This will open a visual drag-and-drop interface to create surveys.', 'info');
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
            <h1 className="h1">Survey Management</h1>
            <div className="flex gap-md">
              <Link to="/admin">
                <Button variant="secondary">← Back to Dashboard</Button>
              </Link>
              <Button variant="primary" onClick={handleCreateSurvey}>
                Create New Survey
              </Button>
            </div>
          </div>
          <p className="text-lg text-gray-600">
            Create, edit, and manage your survey campaigns
          </p>
        </div>

        <div className="grid grid-responsive gap-lg" style={{ width: '100%' }}>
          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Demo Survey</h3>
            <p style={{ marginBottom: '20px' }}>
              A sample survey with conditional logic that demonstrates the platform capabilities.
            </p>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="text-sm">Status:</span>
                <span className="text-sm font-bold text-success">Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="text-sm">Questions:</span>
                <span className="text-sm font-bold">{demoQuestionCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-sm">Responses:</span>
                <span className="text-sm font-bold">0</span>
              </div>
            </div>
            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
              <Link to="/survey/demo">
                <Button variant="primary" size="sm">Preview</Button>
              </Link>
              <Link to="/admin/surveys/edit/demo">
                <Button variant="secondary" size="sm">
                  Edit
                </Button>
              </Link>
              <Button variant="secondary" size="sm" onClick={() => showToast('Analytics coming soon!', 'info')}>
                Analytics
              </Button>
            </div>
          </GlassCard>

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
    </div>
  );
};

export default SurveyBuilderPage;