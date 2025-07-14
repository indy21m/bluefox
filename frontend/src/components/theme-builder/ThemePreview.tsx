import { motion } from 'framer-motion';
import type { SurveyTheme } from '../../types';

interface ThemePreviewProps {
  theme: SurveyTheme;
  mode: 'desktop' | 'tablet' | 'mobile';
}

const ThemePreview = ({ theme, mode }: ThemePreviewProps) => {
  const previewWidth = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  }[mode];

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

  return (
    <div
      style={{
        width: previewWidth,
        maxWidth: '100%',
        margin: '0 auto',
        transition: `width ${getTransitionDuration()} ease`,
      }}
    >
      <div
        style={{
          maxWidth: `${theme.structure.formMaxWidth}px`,
          margin: '0 auto',
          padding: '40px 20px',
          fontFamily: theme.typography.fontFamily,
          lineHeight: theme.typography.lineHeight,
          color: theme.colors.textOnBackground,
        }}
      >
        {/* Survey Widget */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: `${theme.structure.widgetBorderRadius}px`,
            border: `${theme.structure.widgetBorderWidth}px solid ${theme.colors.borderColor}`,
            padding: '32px',
            boxShadow: getBoxShadow(),
          }}
        >
          {/* Headline */}
          <h1
            style={{
              fontSize: `${theme.typography.fontSize.headline}px`,
              fontWeight: 700,
              marginBottom: '16px',
              color: theme.colors.textOnBackground,
            }}
          >
            How satisfied are you with our service?
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: `${theme.typography.fontSize.description}px`,
              marginBottom: '32px',
              opacity: 0.8,
              color: theme.colors.textOnBackground,
            }}
          >
            Your feedback helps us improve and serve you better. Please take a moment to rate your experience.
          </p>

          {/* Multiple Choice Options */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mode === 'mobile' ? '1fr' : 'repeat(2, 1fr)',
              gap: `${theme.structure.gapBetweenButtons}px`,
              marginBottom: '32px',
            }}
          >
            {['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'].map((option, index) => (
              <button
                key={option}
                style={{
                  padding: '16px 24px',
                  fontSize: `${theme.typography.fontSize.answerOption}px`,
                  fontWeight: 500,
                  backgroundColor: index === 0 ? theme.colors.buttonColor : 'white',
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
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = theme.colors.textOnBackground;
                    e.currentTarget.style.borderColor = theme.colors.borderColor;
                  }
                }}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Form Fields */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${theme.structure.gapBetweenFormFields}px`,
              marginBottom: '32px',
            }}
          >
            <input
              type="email"
              placeholder="Your email address"
              style={{
                padding: '12px 16px',
                fontSize: `${theme.typography.fontSize.formField}px`,
                border: `1px solid ${theme.colors.borderColor}`,
                borderRadius: `${theme.structure.buttonBorderRadius}px`,
                backgroundColor: 'white',
                color: theme.colors.textOnBackground,
                transition: `all ${getTransitionDuration()} ease`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primaryAccent;
                e.currentTarget.style.outline = `2px solid ${theme.colors.primaryAccent}40`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.borderColor;
                e.currentTarget.style.outline = 'none';
              }}
            />

            <textarea
              placeholder="Any additional comments? (Optional)"
              rows={3}
              style={{
                padding: '12px 16px',
                fontSize: `${theme.typography.fontSize.formField}px`,
                border: `1px solid ${theme.colors.borderColor}`,
                borderRadius: `${theme.structure.buttonBorderRadius}px`,
                backgroundColor: 'white',
                color: theme.colors.textOnBackground,
                resize: 'vertical',
                fontFamily: theme.typography.fontFamily,
                transition: `all ${getTransitionDuration()} ease`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primaryAccent;
                e.currentTarget.style.outline = `2px solid ${theme.colors.primaryAccent}40`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.borderColor;
                e.currentTarget.style.outline = 'none';
              }}
            />
          </div>

          {/* Submit Button */}
          <motion.button
            style={{
              width: '100%',
              padding: '16px 32px',
              fontSize: `${theme.typography.fontSize.submitButton}px`,
              fontWeight: 600,
              backgroundColor: theme.colors.buttonColor,
              color: theme.colors.textOnButtons,
              border: 'none',
              borderRadius: `${theme.structure.buttonBorderRadius}px`,
              cursor: 'pointer',
              transition: `all ${getTransitionDuration()} ease`,
              ...getButtonAnimation(),
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Submit Feedback
          </motion.button>

          {/* Success/Error Messages Preview */}
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <div
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: `${theme.colors.successColor}20`,
                color: theme.colors.successColor,
                borderRadius: `${theme.structure.buttonBorderRadius}px`,
                fontSize: '14px',
                textAlign: 'center',
              }}
            >
              ✓ Success message
            </div>
            <div
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: `${theme.colors.errorColor}20`,
                color: theme.colors.errorColor,
                borderRadius: `${theme.structure.buttonBorderRadius}px`,
                fontSize: '14px',
                textAlign: 'center',
              }}
            >
              ✗ Error message
            </div>
          </div>
        </div>

        {/* Progress Bar Preview */}
        <div style={{ marginTop: '24px' }}>
          <div
            style={{
              height: '8px',
              backgroundColor: theme.colors.borderColor,
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '60%',
                height: '100%',
                backgroundColor: theme.colors.primaryAccent,
                transition: `width ${getTransitionDuration()} ease`,
              }}
            />
          </div>
          <p
            style={{
              marginTop: '8px',
              fontSize: '14px',
              color: theme.colors.textOnBackground,
              opacity: 0.6,
              textAlign: 'center',
            }}
          >
            Question 3 of 5
          </p>
        </div>
      </div>

      {/* Custom CSS */}
      {theme.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: theme.customCSS }} />
      )}

      {/* Animations */}
      <style>{`
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