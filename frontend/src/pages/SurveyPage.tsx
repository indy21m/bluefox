import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SurveyContainer } from '../components/survey';
import type { SurveyResponse, Survey } from '../types';
import { demoSurvey } from '../data/demoSurvey';
import { useConvertKit } from '../contexts/ConvertKitContext';

const SurveyPage = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const { apiKey } = useConvertKit();
  
  // Extract email from URL parameters
  const emailFromUrl = searchParams.get('email') || searchParams.get('subscriber_email') || null;

  useEffect(() => {
    if (surveyId) {
      // First, check if it's a direct ID match
      const savedSurvey = localStorage.getItem(`bluefox_survey_${surveyId}`);
      if (savedSurvey) {
        try {
          const parsedSurvey = JSON.parse(savedSurvey);
          setSurvey(parsedSurvey);
          return;
        } catch (error) {
          if (surveyId === 'demo') {
            setSurvey(demoSurvey);
            return;
          }
        }
      }
      
      // If not found by ID, search all surveys for a slug match
      const allKeys = Object.keys(localStorage).filter(key => key.startsWith('bluefox_survey_'));
      for (const key of allKeys) {
        try {
          const surveyData = localStorage.getItem(key);
          if (surveyData) {
            const parsedSurvey = JSON.parse(surveyData);
            if (parsedSurvey.slug === surveyId) {
              setSurvey(parsedSurvey);
              return;
            }
          }
        } catch (error) {
          console.error('Error parsing survey:', key, error);
        }
      }
      
      // Special handling for demo
      if (surveyId === 'demo') {
        setSurvey(demoSurvey);
      } else {
        setSurvey(null);
      }
    }
  }, [surveyId]);

  const handleSurveyComplete = async (response: SurveyResponse) => {
    console.log('Survey completed:', response);
    
    if (!survey) return;
    
    // Build field mappings and option mappings from survey questions
    const fieldMappings: Record<string, string> = {};
    const optionMappings: Record<string, Record<string, string>> = {};
    
    survey.questions.forEach(question => {
      if (question.convertKitField) {
        fieldMappings[question.id] = question.convertKitField;
        
        // For multiple choice questions, include the option value mappings
        if (question.type === 'multiple_choice' && question.options) {
          optionMappings[question.id] = {};
          question.options.forEach(option => {
            if (option.convertKitFieldValue) {
              optionMappings[question.id][option.value] = option.convertKitFieldValue;
            }
          });
        }
      }
    });
    
    try {
      // Send response to backend
      const apiResponse = await fetch('http://localhost:3001/api/survey/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyId: response.surveyId,
          respondentEmail: response.respondentEmail || emailFromUrl,
          answers: response.answers,
          fieldMappings,
          optionMappings,
          apiKey
        }),
      });
      
      const result = await apiResponse.json();
      
      if (result.success) {
        console.log('Survey response submitted successfully:', result);
      } else {
        console.error('Failed to submit survey response:', result);
      }
    } catch (error) {
      console.error('Error submitting survey response:', error);
    }
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
      initialEmail={emailFromUrl}
    />
  );
};

export default SurveyPage;