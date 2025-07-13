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
              label={`Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
              large 
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
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>{question.minValue || 1}</span>
                  <span>{question.maxValue || 10}</span>
                </div>
                <div className="grid gap-sm" style={{ gridTemplateColumns: `repeat(${(question.maxValue || 10) - (question.minValue || 1) + 1}, 1fr)` }}>
                  {Array.from(
                    { length: (question.maxValue || 10) - (question.minValue || 1) + 1 },
                    (_, i) => (question.minValue || 1) + i
                  ).map((value) => (
                    <button
                      key={value}
                      className={`glass-card ${isAnswered && selectedAnswer === value ? 'glass-card-dark' : ''}`}
                      style={{
                        padding: '20px 10px',
                        textAlign: 'center',
                        border: 'none',
                        cursor: isAnswered ? 'default' : 'pointer',
                        transition: 'all 0.3s ease',
                        opacity: isAnswered ? 0.7 : 1,
                        transform: isAnswered && selectedAnswer === value ? 'scale(1.1)' : 'scale(1)'
                      }}
                      onClick={() => handleAnswer(value)}
                      disabled={isAnswered}
                    >
                      <span className="font-bold text-lg">{value}</span>
                    </button>
                  ))}
                </div>
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