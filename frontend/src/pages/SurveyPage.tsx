import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SurveyContainer } from '../components/survey';
import type { SurveyResponse, Survey } from '../types';
import { demoSurvey } from '../data/demoSurvey';

const SurveyPage = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);

  useEffect(() => {
    if (surveyId === 'demo') {
      // Try to load saved survey from localStorage first
      const savedSurvey = localStorage.getItem(`bluefox_survey_${surveyId}`);
      if (savedSurvey) {
        try {
          const parsedSurvey = JSON.parse(savedSurvey);
          setSurvey(parsedSurvey);
        } catch (error) {
          // If parsing fails, use demo survey
          setSurvey(demoSurvey);
        }
      } else {
        // No saved survey, use demo survey
        setSurvey(demoSurvey);
      }
    }
  }, [surveyId]);

  const handleSurveyComplete = (response: SurveyResponse) => {
    console.log('Survey completed:', response);
    // In a real app, this would send the response to the backend
    // which would then update ConvertKit via the API
  };

  const handleExit = () => {
    navigate('/');
  };

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
          <h2 className="h2" style={{ marginBottom: '16px' }}>Survey Not Found</h2>
          <p>The survey "{surveyId}" could not be found.</p>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '20px' }}
            onClick={handleExit}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <SurveyContainer
      survey={survey}
      onComplete={handleSurveyComplete}
      onExit={handleExit}
    />
  );
};

export default SurveyPage;