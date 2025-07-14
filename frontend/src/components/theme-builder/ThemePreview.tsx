import { motion } from 'framer-motion';
import type { SurveyTheme, Survey, Question } from '../../types';

interface ThemePreviewProps {
  theme: SurveyTheme;
  mode: 'desktop' | 'tablet' | 'mobile';
  survey?: Survey;
}

const ThemePreview = ({ theme, mode, survey }: ThemePreviewProps) => {
  const previewWidth = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  }[mode];

  // Get the first question from the survey, or use a default
  const previewQuestion: Question = survey && survey.questions.length > 0 
    ? survey.questions[0]
    : {
        id: 'preview',
        title: 'How satisfied are you with our service?',
        subtitle: 'Your feedback helps us improve and serve you better.',
        type: 'multiple_choice',
        required: true,
        options: [
          { id: '1', text: 'Very Satisfied', value: 'very_satisfied' },
          { id: '2', text: 'Satisfied', value: 'satisfied' },
          { id: '3', text: 'Neutral', value: 'neutral' },
          { id: '4', text: 'Dissatisfied', value: 'dissatisfied' }
        ],
        order: 0
      };

  const getBoxShadow = () => {
    switch (theme.style.boxShadow) {
      case 'none':
        return 'none';
      case 'subtle':
        return '0 2px 4px rgba(0, 0, 0, 0.06)';
      case 'medium':
        return '0 4px 12px rgba(0, 0, 0, 0.1)';
      case 'strong':
        return '0 8px 24px rgba(0, 0, 0, 0.15)';
      default:
        return 'none';
    }
  };

  const getTransitionDuration = () => {
    switch (theme.style.transitionSpeed) {
      case 'instant':
        return '0ms';
      case 'fast':
        return '150ms';
      case 'normal':
        return '300ms';
      case 'slow':
        return '500ms';
      default:
        return '300ms';
    }
  };

  const getButtonAnimation = () => {
    switch (theme.style.submitButtonAnimation) {
      case 'pulse':
        return {
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        };
      case 'shake':
        return {
          animation: 'shake 0.5s ease-in-out infinite',
        };
      case 'bounce':
        return {
          animation: 'bounce 1s ease-in-out infinite',
        };
      default:
        return {};
    }
  };

  const progress = 60; // Mock progress for preview

  return (
    <div
      style={{
        width: previewWidth,
        maxWidth: '100%',
        margin: '0 auto',
        transition: `width ${getTransitionDuration()} ease`,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: theme.colors.background,
      }}
    >
      <div style={{ width: '100%', maxWidth: '600px' }}>
        {/* Progress Bar - conditionally rendered */}
        {survey?.settings?.showProgressBar && (
          <div style={{ marginBottom: '30px' }}>
            <div
              style={{
                height: '8px',
                backgroundColor: theme.colors.borderColor,
                borderRadius: '4px',
                overflow: 'hidden',
                opacity: 0.6
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: theme.colors.primaryAccent,
                  transition: `width ${getTransitionDuration()} ease`,
                }}
              />
            </div>
          </div>
        )}
        {/* Survey Widget */}
        <div
          className="glass-card"
          style={{
            backgroundColor: theme.colors.background === '#1F2937' 
              ? 'rgba(31, 41, 55, 0.95)' 
              : 'rgba(255, 255, 255, 0.98)',
            borderRadius: `${theme.structure.widgetBorderRadius}px`,
            border: `${theme.structure.widgetBorderWidth}px solid ${theme.colors.borderColor}`,
            padding: '32px',
            boxShadow: getBoxShadow(),
            fontFamily: theme.typography.fontFamily,
            lineHeight: theme.typography.lineHeight,
            color: theme.colors.textOnBackground,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            {/* Headline */}
            <h2
              style={{
                fontSize: `${theme.typography.fontSize.headline}px`,
                fontWeight: 700,
                marginBottom: '16px',
                color: theme.colors.textOnBackground,
              }}
            >
              {previewQuestion.title}
            </h2>

            {/* Description */}
            {previewQuestion.subtitle && (
              <p
                style={{
                  fontSize: `${theme.typography.fontSize.description}px`,
                  color: theme.colors.textOnBackground,
                  opacity: 0.8,
                }}
              >
                {previewQuestion.subtitle}
              </p>
            )}
          </div>

          <div className="fade-in">
            {/* Question Content */}
          {previewQuestion.type === 'multiple_choice' && previewQuestion.options && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: mode === 'mobile' ? '1fr' : 'repeat(2, 1fr)',
                gap: `${theme.structure.gapBetweenButtons}px`,
                marginBottom: '32px',
              }}
            >
              {previewQuestion.options.map((option, index) => (
                <button
                  key={option.id}
                  style={{
                    padding: '16px 24px',
                    fontSize: `${theme.typography.fontSize.answerOption}px`,
                    fontWeight: 500,
                    backgroundColor: index === 0 
                      ? theme.colors.buttonColor 
                      : theme.colors.background === '#1F2937' 
                        ? 'rgba(55, 65, 81, 0.8)' 
                        : 'white',
                    color: index === 0 ? theme.colors.textOnButtons : theme.colors.textOnBackground,
                    border: `2px solid ${index === 0 ? theme.colors.buttonColor : theme.colors.borderColor}`,
                    borderRadius: `${theme.structure.buttonBorderRadius}px`,
                    cursor: 'pointer',
                    transition: `all ${getTransitionDuration()} ease`,
                  transform: index === 0 ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (index !== 0) {
                    e.currentTarget.style.backgroundColor = theme.colors.buttonColor;
                    e.currentTarget.style.color = theme.colors.textOnButtons;
                    e.currentTarget.style.borderColor = theme.colors.buttonColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== 0) {
                    e.currentTarget.style.backgroundColor = theme.colors.background === '#1F2937' 
                      ? 'rgba(55, 65, 81, 0.8)' 
                      : 'white';
                    e.currentTarget.style.color = theme.colors.textOnBackground;
                    e.currentTarget.style.borderColor = theme.colors.borderColor;
                  }
                }}
              >
                {option.text}
              </button>
            ))}
            </div>
          )}

          {/* Text Input Questions */}
          {(previewQuestion.type === 'text' || previewQuestion.type === 'email') && (
            <div style={{ marginBottom: '32px' }}>
              <input
                type={previewQuestion.type === 'email' ? 'email' : 'text'}
                placeholder={previewQuestion.type === 'email' ? 'Your email address' : 'Type your answer here...'}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: `${theme.typography.fontSize.formField}px`,
                  border: `1px solid ${theme.colors.borderColor}`,
                  borderRadius: `${theme.structure.buttonBorderRadius}px`,
                  backgroundColor: theme.colors.background === '#1F2937' 
                    ? 'rgba(55, 65, 81, 0.8)' 
                    : 'white',
                  color: theme.colors.textOnBackground,
                  transition: `all ${getTransitionDuration()} ease`,
                }}
              />
            </div>
          )}

          {/* Scale Question */}
          {previewQuestion.type === 'scale' && (
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: '700', 
                color: theme.colors.buttonColor,
                marginBottom: '16px'
              }}>
                {previewQuestion.maxValue ? Math.ceil(previewQuestion.maxValue / 2) : 5}
              </div>
              <div style={{
                height: '12px',
                backgroundColor: theme.colors.borderColor,
                borderRadius: '6px',
                position: 'relative',
                margin: '0 auto',
                width: '80%',
                opacity: 0.4
              }}>
                <div style={{
                  position: 'absolute',
                  left: '40%',
                  top: '-6px',
                  width: '24px',
                  height: '24px',
                  backgroundColor: theme.colors.buttonColor,
                  borderRadius: '50%',
                  border: '3px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </div>
            </div>
          )}

          {/* Email Capture (if required by survey settings) */}
          {survey?.settings?.requireEmailCapture && previewQuestion.type !== 'email' && (
            <div style={{ marginBottom: '32px' }}>
              <input
                type="email"
                placeholder="Your email address"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: `${theme.typography.fontSize.formField}px`,
                  border: `1px solid ${theme.colors.borderColor}`,
                  borderRadius: `${theme.structure.buttonBorderRadius}px`,
                  backgroundColor: theme.colors.background === '#1F2937' 
                    ? 'rgba(55, 65, 81, 0.8)' 
                    : 'white',
                  color: theme.colors.textOnBackground,
                  transition: `all ${getTransitionDuration()} ease`,
                }}
              />
            </div>
          )}
          </div>

          {/* Back Button - conditionally rendered */}
          {survey?.settings?.allowBackNavigation && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <button
                className="btn btn-secondary"
                style={{
                  fontSize: '14px',
                  padding: '8px 16px',
                  opacity: 0.7
                }}
                disabled
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS */}
      {theme.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: theme.customCSS }} />
      )}

      {/* Animations */}
      <style>{`
        .glass-card {
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
        }
        
        .btn {
          border: none;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .btn-secondary {
          background: rgba(0, 0, 0, 0.1);
          color: #6b7280;
        }

        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-2px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(2px);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
};

export default ThemePreview;