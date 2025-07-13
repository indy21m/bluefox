import { useEffect, useState } from 'react';
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
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (survey.settings.redirectUrl) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = survey.settings.redirectUrl!;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [survey.settings.redirectUrl]);

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
              <p className="text-lg">
                Thank you! Your responses help us understand our audience better.
              </p>
              {survey.settings.redirectUrl && (
                <p className="text-sm text-gray-600" style={{ marginTop: '20px' }}>
                  Redirecting in {countdown} seconds...
                </p>
              )}
            </div>

            <div style={{ 
              marginTop: '30px', 
              padding: '15px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
              borderRadius: 'var(--radius-lg)' 
            }}>
              <p style={{ color: '#ffffff', fontSize: '14px', margin: 0, textAlign: 'center' }}>
                🦊 Powered by <strong style={{ color: '#ffffff' }}>BlueFox</strong> - Intelligent Survey Platform
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default SurveyComplete;