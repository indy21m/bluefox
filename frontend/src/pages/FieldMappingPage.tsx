import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header, Button, GlassCard } from '../components/common';
import { FieldMappingCard } from '../components/admin';
import { useAuth } from '../contexts/AuthContext';
import { useConvertKit } from '../contexts/ConvertKitContext';
import { useToast } from '../contexts/ToastContext';
import type { Survey, Question } from '../types';
import { demoSurvey } from '../data/demoSurvey';

const FieldMappingPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const { user, logout } = useAuth();
  const { connectionStatus, customFields } = useConvertKit();
  const { showToast } = useToast();
  const [survey, setSurvey] = useState<Survey>(demoSurvey);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // In a real app, load survey from API based on surveyId
    if (surveyId === 'demo') {
      setSurvey(demoSurvey);
    }
  }, [surveyId]);

  const handleLogout = () => {
    logout();
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    }));
  };

  const handleSaveMapping = async () => {
    setIsSaving(true);
    try {
      // In a real app, save field mappings to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      showToast('Field mappings saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save field mappings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getMappingProgress = () => {
    const mappableQuestions = survey.questions.filter(q => q.type !== 'text' || q.required);
    const mappedQuestions = mappableQuestions.filter(q => q.convertKitField);
    return {
      mapped: mappedQuestions.length,
      total: mappableQuestions.length,
      percentage: mappableQuestions.length > 0 ? Math.round((mappedQuestions.length / mappableQuestions.length) * 100) : 0
    };
  };

  const progress = getMappingProgress();

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
            <h1 className="h1">ConvertKit Field Mapping</h1>
            <div className="flex gap-md">
              <Link to="/admin/convertkit">
                <Button variant="secondary">← Back to ConvertKit Setup</Button>
              </Link>
              <Button 
                variant="primary" 
                onClick={handleSaveMapping}
                loading={isSaving}
                disabled={connectionStatus !== 'connected'}
              >
                {isSaving ? 'Saving...' : 'Save Mappings'}
              </Button>
            </div>
          </div>
          <p className="text-lg text-gray-600">
            Map survey questions to ConvertKit custom fields for automatic subscriber segmentation
          </p>
        </div>

        {/* Connection Status & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg" style={{ width: '100%', marginBottom: '32px' }}>
          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Connection Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span className={`status-indicator ${connectionStatus === 'connected' ? 'connected' : 'disconnected'}`}></span>
              <div>
                <div className="font-medium">
                  {connectionStatus === 'connected' ? 'Connected to ConvertKit' : 'Not Connected'}
                </div>
                {connectionStatus === 'connected' && (
                  <div className="text-sm text-gray-600">
                    {customFields.length} custom fields available
                  </div>
                )}
              </div>
            </div>
            {connectionStatus !== 'connected' && (
              <Link to="/admin/convertkit">
                <Button variant="primary" size="sm">
                  Setup ConvertKit Connection
                </Button>
              </Link>
            )}
          </GlassCard>

          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Mapping Progress</h3>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Questions Mapped:</span>
                <span className="font-bold">{progress.mapped}/{progress.total}</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: 'var(--gray-200)', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progress.percentage}%`,
                  height: '100%',
                  backgroundColor: progress.percentage === 100 ? 'var(--success)' : 'var(--primary-blue)',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <div className="text-sm text-gray-600" style={{ marginTop: '4px' }}>
                {progress.percentage}% complete
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Survey Info */}
        <GlassCard style={{ marginBottom: '32px' }}>
          <h3 className="h3" style={{ marginBottom: '16px' }}>Survey: {survey.title}</h3>
          <p style={{ marginBottom: '16px' }}>{survey.description}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
            <div style={{ textAlign: 'center' }}>
              <div className="h4 text-primary">{survey.questions.length}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="h4 text-gray-700">{progress.mapped}</div>
              <div className="text-sm text-gray-600">Mapped Questions</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="h4 text-gray-700">{customFields.length}</div>
              <div className="text-sm text-gray-600">Available Fields</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className={`h4 ${progress.percentage === 100 ? 'text-success' : 'text-warning'}`}>
                {progress.percentage}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
        </GlassCard>

        {/* Field Mapping Cards */}
        <div>
          <h2 className="h2" style={{ marginBottom: '24px' }}>Question Field Mappings</h2>
          {survey.questions
            .sort((a, b) => a.order - b.order)
            .map((question) => (
              <FieldMappingCard
                key={question.id}
                question={question}
                onUpdateQuestion={handleUpdateQuestion}
              />
            ))}
        </div>

        {/* Help Section */}
        <GlassCard dark style={{ marginTop: '40px' }}>
          <h3 className="h3" style={{ marginBottom: '16px' }}>How Field Mapping Works</h3>
          <div className="grid gap-md">
            <div style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}>
              <div className="font-medium" style={{ marginBottom: '8px' }}>📋 Multiple Choice Questions</div>
              <div className="text-sm opacity-80">
                Map each answer option to a specific field value. When users select an option, 
                that value will be stored in the ConvertKit custom field.
              </div>
            </div>
            <div style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}>
              <div className="font-medium" style={{ marginBottom: '8px' }}>📝 Text & Input Questions</div>
              <div className="text-sm opacity-80">
                User's input will be stored directly in the ConvertKit custom field. 
                Great for collecting names, job titles, or other custom information.
              </div>
            </div>
            <div style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}>
              <div className="font-medium" style={{ marginBottom: '8px' }}>⚡ Automatic Updates</div>
              <div className="text-sm opacity-80">
                When a user completes the survey, their ConvertKit subscriber record 
                will be automatically updated with their responses.
              </div>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};

export default FieldMappingPage;