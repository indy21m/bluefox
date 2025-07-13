import type { Survey, SurveySession } from '../../types';
import { Button, GlassCard } from '../common';

interface SurveyCompleteProps {
  survey: Survey;
  response: SurveySession;
  onRestart?: () => void;
  onExit?: () => void;
}

const SurveyComplete: React.FC<SurveyCompleteProps> = ({
  survey,
  response,
  onRestart,
  onExit
}) => {
  const completionTime = response.startedAt ? 
    Math.round((new Date().getTime() - response.startedAt.getTime()) / 1000) : 0;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleRedirect = () => {
    if (survey.settings.redirectUrl) {
      window.location.href = survey.settings.redirectUrl;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <GlassCard>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
              🎉
            </div>
            
            <h2 className="h2" style={{ marginBottom: '16px' }}>
              Survey Complete!
            </h2>
            
            <div style={{ marginBottom: '30px' }}>
              <p className="text-lg" style={{ marginBottom: '10px' }}>
                {survey.settings.successMessage || 'Thank you for completing our survey!'}
              </p>
              <p className="text-sm text-gray-600">
                Completion time: {formatTime(completionTime)}
              </p>
            </div>

            <div style={{ 
              backgroundColor: 'var(--gray-50)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '20px',
              marginBottom: '30px'
            }}>
              <h4 style={{ marginBottom: '15px', color: 'var(--gray-700)' }}>
                Your Responses
              </h4>
              <div style={{ textAlign: 'left' }}>
                {response.answers.map((answer, index) => {
                  const question = survey.questions.find(q => q.id === answer.questionId);
                  return (
                    <div key={answer.questionId} style={{ marginBottom: '10px' }}>
                      <div className="text-sm font-medium text-gray-600">
                        {index + 1}. {question?.title || 'Unknown Question'}
                      </div>
                      <div className="text-base font-medium">
                        {answer.value.toString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-md justify-center" style={{ flexWrap: 'wrap' }}>
              {survey.settings.redirectUrl && (
                <Button variant="primary" onClick={handleRedirect}>
                  Continue to Website
                </Button>
              )}
              
              {onRestart && (
                <Button variant="secondary" onClick={onRestart}>
                  Take Survey Again
                </Button>
              )}
              
              {onExit && (
                <Button variant="secondary" onClick={onExit}>
                  Return to Home
                </Button>
              )}
            </div>

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: 'var(--primary-gradient)', borderRadius: 'var(--radius-lg)' }}>
              <p className="text-white text-sm">
                🦊 Powered by <strong>BlueFox</strong> - Intelligent Survey Platform
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default SurveyComplete;