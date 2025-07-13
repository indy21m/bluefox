import { useState, useEffect } from 'react';
import type { Question, AnswerOption, Answer } from '../../types';
import { Button, Input, GlassCard, ProgressBar } from '../common';

interface SingleQuestionScreenProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: Answer) => void;
  autoAdvanceDelay?: number;
  showProgressBar?: boolean;
  allowBackNavigation?: boolean;
  onBack?: () => void;
}

const SingleQuestionScreen: React.FC<SingleQuestionScreenProps> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  onAnswer,
  autoAdvanceDelay = 500,
  showProgressBar = true,
  allowBackNavigation = false,
  onBack
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | boolean>('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center" style={{ padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        {showProgressBar && (
          <div style={{ marginBottom: '30px' }}>
            <ProgressBar 
              value={progress} 
              large 
              showPercentage={false}
            />
          </div>
        )}

        <GlassCard>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 className="h2" style={{ marginBottom: '16px' }}>
              {question.title}
            </h2>
            {question.description && (
              <p className="text-lg text-gray-600">
                {question.description}
              </p>
            )}
          </div>

          <div className="fade-in">
            {question.type === 'multiple_choice' && question.options && (
              <div className="grid gap-md">
                {question.options.map((option: AnswerOption) => (
                  <button
                    key={option.id}
                    className={`glass-card ${isAnswered && selectedAnswer === option.value ? 'glass-card-dark' : ''}`}
                    style={{
                      padding: '20px',
                      textAlign: 'left',
                      border: 'none',
                      cursor: isAnswered ? 'default' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: isAnswered ? 0.7 : 1,
                      transform: isAnswered && selectedAnswer === option.value ? 'scale(1.02)' : 'scale(1)'
                    }}
                    onClick={() => handleAnswer(option.value, option.id)}
                    disabled={isAnswered}
                  >
                    <span className="text-lg font-medium">{option.text}</span>
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
                    value={selectedAnswer || question.minValue || 1}
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
        </GlassCard>
      </div>
    </div>
  );
};

export default SingleQuestionScreen;