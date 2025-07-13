import { useParams, useNavigate } from 'react-router-dom';
import { SurveyContainer } from '../components/survey';
import type { SurveyResponse } from '../types';
import { demoSurvey } from '../data/demoSurvey';

const SurveyPage = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();

  const handleSurveyComplete = (response: SurveyResponse) => {
    console.log('Survey completed:', response);
    // In a real app, this would send the response to the backend
    // which would then update ConvertKit via the API
  };

  const handleExit = () => {
    navigate('/');
  };

  // For demo purposes, we'll use the demo survey for any surveyId
  // In a real app, you'd fetch the survey data based on the surveyId
  const survey = demoSurvey;

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