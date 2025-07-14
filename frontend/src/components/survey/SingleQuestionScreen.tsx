import { useState, useEffect } from 'react';
import type { Question, AnswerOption, Answer, SurveyTheme } from '../../types';
import { Input, GlassCard, ProgressBar, Button } from '../common';

interface SingleQuestionScreenProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: Answer) => void;
  autoAdvanceDelay?: number;
  showProgressBar?: boolean;
  allowBackNavigation?: boolean;
  onBack?: () => void;
  theme?: SurveyTheme | null;
}

const SingleQuestionScreen: React.FC<SingleQuestionScreenProps> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  onAnswer,
  autoAdvanceDelay = 500,
  showProgressBar = true,
  allowBackNavigation = false,
  onBack,
  theme
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | boolean>('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Theme helper functions
  const getTransitionDuration = () => {
    if (!theme) return '300ms';
    switch (theme.style.transitionSpeed) {
      case 'instant': return '0ms';
      case 'fast': return '150ms';
      case 'normal': return '300ms';
      case 'slow': return '500ms';
      default: return '300ms';
    }
  };

  const getBoxShadow = () => {
    if (!theme) return '0 4px 12px rgba(0, 0, 0, 0.1)';
    switch (theme.style.boxShadow) {
      case 'none': return 'none';
      case 'subtle': return '0 2px 4px rgba(0, 0, 0, 0.06)';
      case 'medium': return '0 4px 12px rgba(0, 0, 0, 0.1)';
      case 'strong': return '0 8px 24px rgba(0, 0, 0, 0.15)';
      default: return '0 4px 12px rgba(0, 0, 0, 0.1)';
    }
  };

  useEffect(() => {
    // Reset state when question changes
    setSelectedAnswer('');
    setIsAnswered(false);
    setIsAdvancing(false);
  }, [question.id]);

  const handleAnswer = (value: string | number | boolean, optionId?: string) => {
    if (isAnswered) return; // Prevent double-clicking

    setSelectedAnswer(value);
    setIsAnswered(true);
    setIsAdvancing(true);

    const answer: Answer = {
      questionId: question.id,
      value,
      selectedOptionId: optionId
    };

    // Auto-advance after delay
    setTimeout(() => {
      onAnswer(answer);
    }, autoAdvanceDelay);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnswer.toString().trim()) {
      handleAnswer(selectedAnswer);
    }
  };

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div 
      className="min-h-screen flex items-center justify-center" 
      style={{ 
        padding: '20px',
        backgroundColor: theme?.colors.background || '#FFFFFF',
        fontFamily: theme?.typography.fontFamily || 'Inter, system-ui, sans-serif',
        lineHeight: theme?.typography.lineHeight || 1.6,
        color: theme?.colors.textOnBackground || '#1A1A1A',
      }}
    >
      <div style={{ 
        width: '100%', 
        maxWidth: theme?.structure.formMaxWidth ? `${theme.structure.formMaxWidth}px` : '600px' 
      }}>
        {showProgressBar && (
          <div style={{ marginBottom: '30px' }}>
            <div
              style={{
                height: '8px',
                backgroundColor: theme?.colors.borderColor || '#E5E7EB',
                borderRadius: '4px',
                overflow: 'hidden',
                opacity: 0.6
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: theme?.colors.primaryAccent || '#6366F1',
                  transition: `width ${getTransitionDuration()} ease`,
                }}
              />
            </div>
          </div>
        )}

        <div
          style={{
            backgroundColor: theme?.colors.background === '#1F2937' 
              ? 'rgba(31, 41, 55, 0.95)' 
              : 'rgba(255, 255, 255, 0.98)',
            borderRadius: `${theme?.structure.widgetBorderRadius || 16}px`,
            border: `${theme?.structure.widgetBorderWidth || 1}px solid ${theme?.colors.borderColor || '#E5E7EB'}`,
            padding: '32px',
            boxShadow: getBoxShadow(),
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 
              style={{ 
                marginBottom: '16px',
                fontSize: `${theme?.typography.fontSize.headline || 28}px`,
                fontWeight: 700,
                color: theme?.colors.textOnBackground || '#1A1A1A',
              }}
            >
              {question.title}
            </h2>
            {question.description && (
              <p 
                style={{
                  fontSize: `${theme?.typography.fontSize.description || 16}px`,
                  color: theme?.colors.textOnBackground || '#1A1A1A',
                  opacity: 0.8,
                }}
              >
                {question.description}
              </p>
            )}
          </div>

          <div className="fade-in">
            {question.type === 'multiple_choice' && question.options && (
              <div style={{ 
                display: 'grid',
                gap: `${theme?.structure.gapBetweenButtons || 12}px`,
              }}>
                {question.options.map((option: AnswerOption, index: number) => (
                  <button
                    key={option.id}
                    style={{
                      padding: '20px',
                      fontSize: `${theme?.typography.fontSize.answerOption || 16}px`,
                      fontWeight: 'medium',
                      backgroundColor: isAnswered && selectedAnswer === option.value
                        ? theme?.colors.buttonColor || '#6366F1'
                        : theme?.colors.background === '#1F2937' 
                          ? 'rgba(55, 65, 81, 0.8)' 
                          : 'rgba(255, 255, 255, 0.9)',
                      color: isAnswered && selectedAnswer === option.value
                        ? theme?.colors.textOnButtons || '#FFFFFF'
                        : theme?.colors.textOnBackground || '#1A1A1A',
                      border: `1px solid ${theme?.colors.borderColor || '#E5E7EB'}`,
                      borderRadius: `${theme?.structure.buttonBorderRadius || 8}px`,
                      textAlign: 'left',
                      cursor: isAnswered ? 'default' : 'pointer',
                      transition: `all ${getTransitionDuration()} ease`,
                      opacity: isAnswered ? 0.7 : 1,
                      transform: isAnswered && selectedAnswer === option.value ? 'scale(1.02)' : 'scale(1)',
                      backdropFilter: 'blur(10px)',
                    }}
                    onClick={() => handleAnswer(option.value, option.id)}
                    disabled={isAnswered}
                  >
                    <span style={{ fontSize: '18px', fontWeight: 'medium' }}>{option.text}</span>
                  </button>
                ))}
              </div>
            )}

            {question.type === 'text' && (
              <form onSubmit={handleTextSubmit}>
                <Input
                  type="text"
                  value={selectedAnswer as string}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder={question.placeholder || 'Type your answer...'}
                  disabled={isAnswered}
                  style={{ fontSize: '18px', padding: '16px 20px' }}
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!selectedAnswer.toString().trim() || isAnswered}
                  loading={isAdvancing}
                  style={{ width: '100%', marginTop: '20px', fontSize: '16px', padding: '16px' }}
                >
                  {isAdvancing ? 'Submitting...' : 'Continue'}
                </Button>
              </form>
            )}

            {question.type === 'email' && (
              <form onSubmit={handleTextSubmit}>
                <Input
                  type="email"
                  value={selectedAnswer as string}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder={question.placeholder || 'Enter your email address...'}
                  disabled={isAnswered}
                  style={{ fontSize: '18px', padding: '16px 20px' }}
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!selectedAnswer.toString().trim() || isAnswered}
                  loading={isAdvancing}
                  style={{ width: '100%', marginTop: '20px', fontSize: '16px', padding: '16px' }}
                >
                  {isAdvancing ? 'Submitting...' : 'Continue'}
                </Button>
              </form>
            )}

            {question.type === 'number' && (
              <form onSubmit={handleTextSubmit}>
                <Input
                  type="number"
                  value={selectedAnswer as string}
                  onChange={(e) => setSelectedAnswer(Number(e.target.value))}
                  placeholder={question.placeholder || 'Enter a number...'}
                  min={question.minValue}
                  max={question.maxValue}
                  disabled={isAnswered}
                  style={{ fontSize: '18px', padding: '16px 20px' }}
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={selectedAnswer === '' || isAnswered}
                  loading={isAdvancing}
                  style={{ width: '100%', marginTop: '20px', fontSize: '16px', padding: '16px' }}
                >
                  {isAdvancing ? 'Submitting...' : 'Continue'}
                </Button>
              </form>
            )}

            {question.type === 'boolean' && (
              <div className="grid grid-cols-2 gap-lg">
                <button
                  className={`glass-card ${isAnswered && selectedAnswer === true ? 'glass-card-dark' : ''}`}
                  style={{
                    padding: '30px',
                    textAlign: 'center',
                    border: 'none',
                    cursor: isAnswered ? 'default' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: isAnswered ? 0.7 : 1,
                    transform: isAnswered && selectedAnswer === true ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onClick={() => handleAnswer(true)}
                  disabled={isAnswered}
                >
                  <span className="text-xl font-medium">✓ Yes</span>
                </button>
                <button
                  className={`glass-card ${isAnswered && selectedAnswer === false ? 'glass-card-dark' : ''}`}
                  style={{
                    padding: '30px',
                    textAlign: 'center',
                    border: 'none',
                    cursor: isAnswered ? 'default' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: isAnswered ? 0.7 : 1,
                    transform: isAnswered && selectedAnswer === false ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onClick={() => handleAnswer(false)}
                  disabled={isAnswered}
                >
                  <span className="text-xl font-medium">✗ No</span>
                </button>
              </div>
            )}

            {question.type === 'scale' && (
              <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '20px 0' }}>
                {/* Value display */}
                <div style={{ 
                  textAlign: 'center',
                  fontSize: '56px',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  marginBottom: '40px'
                }}>
                  {selectedAnswer || question.minValue || 1}
                </div>
                
                {/* Slider container */}
                <div style={{ position: 'relative', padding: '20px 0' }}>
                  {/* Track */}
                  <div style={{ 
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    borderRadius: '6px',
                    transform: 'translateY(-50%)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    {/* Track fill */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${((Number(selectedAnswer) || question.minValue || 1) - (question.minValue || 1)) / ((question.maxValue || 10) - (question.minValue || 1)) * 100}%`,
                      backgroundColor: 'var(--primary)',
                      borderRadius: '6px',
                      transition: 'width 0.2s ease',
                      boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
                    }} />
                  </div>
                  
                  {/* Actual range input */}
                  <input
                    type="range"
                    min={question.minValue || 1}
                    max={question.maxValue || 10}
                    value={typeof selectedAnswer === 'number' ? selectedAnswer : (question.minValue || 1)}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setSelectedAnswer(value);
                    }}
                    onMouseUp={() => {
                      if (!isAnswered && selectedAnswer) {
                        handleAnswer(selectedAnswer);
                      }
                    }}
                    onTouchEnd={() => {
                      if (!isAnswered && selectedAnswer) {
                        handleAnswer(selectedAnswer);
                      }
                    }}
                    disabled={isAnswered}
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '40px',
                      background: 'transparent',
                      outline: 'none',
                      cursor: isAnswered ? 'default' : 'pointer',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      zIndex: 10
                    }}
                    className="scale-slider"
                  />
                </div>
                
                {/* Continue button for first interaction */}
                {!isAnswered && selectedAnswer === (question.minValue || 1) && (
                  <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <Button
                      variant="primary"
                      onClick={() => handleAnswer(selectedAnswer)}
                      style={{ minWidth: '200px' }}
                    >
                      Continue with {selectedAnswer}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {allowBackNavigation && onBack && currentQuestionIndex > 0 && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <Button
                variant="secondary"
                onClick={onBack}
                disabled={isAdvancing}
                size="sm"
              >
                ← Back
              </Button>
            </div>
          )}

          {isAdvancing && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p className="text-sm text-gray-600">
                Moving to next question...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SingleQuestionScreen;