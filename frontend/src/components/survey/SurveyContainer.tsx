import { useState } from 'react';
import type { Survey, Question, Answer, SurveyResponse, SurveySession } from '../../types';
import SingleQuestionScreen from './SingleQuestionScreen';
import SurveyComplete from './SurveyComplete';

interface SurveyContainerProps {
  survey: Survey;
  onComplete: (response: SurveyResponse) => void;
  onExit?: () => void;
  initialEmail?: string | null;
}

const SurveyContainer: React.FC<SurveyContainerProps> = ({
  survey,
  onComplete,
  onExit,
  initialEmail
}) => {
  // Handle empty surveys
  if (!survey.questions || survey.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ padding: '20px' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
          <h2 className="h2" style={{ marginBottom: '16px' }}>Survey Not Ready</h2>
          <p>This survey doesn't have any questions yet. Please add questions in the editor first.</p>
          {onExit && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '20px' }}
              onClick={onExit}
            >
              Return to Editor
            </button>
          )}
        </div>
      </div>
    );
  }

  const sortedQuestions = [...survey.questions].sort((a, b) => a.order - b.order);
  const firstQuestionId = sortedQuestions[0]?.id || '';

  // Initialize answers array with email if provided
  const initialAnswers: Answer[] = [];
  let startQuestionId = survey.startQuestionId || firstQuestionId;
  
  // If we have an initial email and there's an email question, auto-answer it
  if (initialEmail && initialEmail.includes('@')) {
    const emailQuestion = sortedQuestions.find(q => q.type === 'email');
    if (emailQuestion) {
      initialAnswers.push({
        questionId: emailQuestion.id,
        value: initialEmail
      });
      
      // If the first question is an email question, skip to the next one
      if (emailQuestion.id === startQuestionId) {
        const emailQuestionIndex = sortedQuestions.findIndex(q => q.id === emailQuestion.id);
        if (emailQuestionIndex < sortedQuestions.length - 1) {
          startQuestionId = sortedQuestions[emailQuestionIndex + 1].id;
        }
      }
    }
  }

  const [session, setSession] = useState<SurveySession>({
    surveyId: survey.id,
    currentQuestionId: startQuestionId,
    answers: initialAnswers,
    startedAt: new Date(),
    isComplete: false,
    respondentEmail: initialEmail || undefined
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    sortedQuestions.findIndex(q => q.id === startQuestionId)
  );

  const getCurrentQuestion = (): Question | null => {
    return survey.questions.find(q => q.id === session.currentQuestionId) || null;
  };

  const getNextQuestionId = (currentQuestion: Question, answer: Answer): string | null => {
    // Check for conditional logic
    if (currentQuestion.conditionalLogic && currentQuestion.conditionalLogic.length > 0) {
      for (const logic of currentQuestion.conditionalLogic) {
        if (evaluateCondition(logic.condition, answer.value, logic.value)) {
          return logic.nextQuestionId;
        }
      }
    }

    // Default: get next question by order
    const sortedQuestions = [...survey.questions].sort((a, b) => a.order - b.order);
    const currentIndex = sortedQuestions.findIndex(q => q.id === currentQuestion.id);
    
    if (currentIndex < sortedQuestions.length - 1) {
      return sortedQuestions[currentIndex + 1].id;
    }

    return null; // End of survey
  };

  const evaluateCondition = (
    condition: string,
    answerValue: string | number | boolean,
    targetValue: string | number
  ): boolean => {
    switch (condition) {
      case 'equals':
        // Handle boolean comparison
        if (typeof answerValue === 'boolean') {
          return answerValue.toString() === targetValue.toString();
        }
        return answerValue === targetValue;
      case 'not_equals':
        if (typeof answerValue === 'boolean') {
          return answerValue.toString() !== targetValue.toString();
        }
        return answerValue !== targetValue;
      case 'contains':
        return answerValue.toString().toLowerCase().includes(targetValue.toString().toLowerCase());
      case 'greater_than':
        return Number(answerValue) > Number(targetValue);
      case 'less_than':
        return Number(answerValue) < Number(targetValue);
      default:
        return false;
    }
  };

  const handleAnswer = (answer: Answer) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    // Update session with the new answer
    const updatedAnswers = [...session.answers];
    const existingAnswerIndex = updatedAnswers.findIndex(a => a.questionId === answer.questionId);
    
    if (existingAnswerIndex >= 0) {
      updatedAnswers[existingAnswerIndex] = answer;
    } else {
      updatedAnswers.push(answer);
    }

    // Determine next question
    const nextQuestionId = getNextQuestionId(currentQuestion, answer);

    if (nextQuestionId) {
      // Continue to next question
      const nextQuestionIndex = survey.questions.findIndex(q => q.id === nextQuestionId);
      setSession({
        ...session,
        currentQuestionId: nextQuestionId,
        answers: updatedAnswers
      });
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      // Survey complete
      const completedSession: SurveySession = {
        ...session,
        answers: updatedAnswers,
        isComplete: true
      };

      const response: SurveyResponse = {
        id: `response_${Date.now()}`,
        surveyId: survey.id,
        respondentEmail: session.respondentEmail,
        answers: updatedAnswers,
        startedAt: session.startedAt,
        completedAt: new Date(),
        isComplete: true
      };

      setSession(completedSession);
      onComplete(response);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      const sortedQuestions = [...survey.questions].sort((a, b) => a.order - b.order);
      const previousQuestion = sortedQuestions[currentQuestionIndex - 1];
      
      setSession({
        ...session,
        currentQuestionId: previousQuestion.id
      });
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = getCurrentQuestion();

  if (session.isComplete) {
    return (
      <SurveyComplete
        survey={survey}
        response={session}
        onRestart={() => {
          setSession({
            surveyId: survey.id,
            currentQuestionId: survey.startQuestionId,
            answers: [],
            startedAt: new Date(),
            isComplete: false
          });
          setCurrentQuestionIndex(0);
        }}
        onExit={onExit}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
          <h2 className="h2" style={{ marginBottom: '16px' }}>Survey Error</h2>
          <p>Unable to load survey question.</p>
        </div>
      </div>
    );
  }

  return (
    <SingleQuestionScreen
      question={currentQuestion}
      currentQuestionIndex={currentQuestionIndex}
      totalQuestions={survey.questions.length}
      onAnswer={handleAnswer}
      autoAdvanceDelay={survey.settings.autoAdvanceDelay || 750}
      showProgressBar={survey.settings.showProgressBar}
      allowBackNavigation={survey.settings.allowBackNavigation}
      onBack={survey.settings.allowBackNavigation ? handleBack : undefined}
    />
  );
};

export default SurveyContainer;