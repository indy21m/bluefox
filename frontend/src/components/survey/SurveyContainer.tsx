import { useState, useEffect } from 'react';
import type { Survey, Question, Answer, SurveyResponse, SurveySession, SurveyTheme } from '../../types';
import { defaultThemes } from '../../types/theme';
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
  
  // If we have flow data, find the start node's first connection
  if (survey.flowData?.edges && survey.flowData.edges.length > 0) {
    const startEdge = survey.flowData.edges.find(edge => edge.source === 'start');
    if (startEdge && startEdge.target !== 'end') {
      startQuestionId = startEdge.target;
    }
  }
  
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

  // Theme state
  const [theme, setTheme] = useState<SurveyTheme | null>(null);

  // Load theme when survey changes
  useEffect(() => {
    if (survey.themeId) {
      // Try to load saved theme
      const savedTheme = localStorage.getItem(`bluefox_theme_${survey.themeId}`);
      if (savedTheme) {
        try {
          const parsedTheme = JSON.parse(savedTheme);
          setTheme(parsedTheme);
          return;
        } catch (error) {
          console.error('Failed to load survey theme:', error);
        }
      }
      
      // Fallback to survey-specific theme storage
      const surveyTheme = localStorage.getItem(`bluefox_theme_${survey.id}`);
      if (surveyTheme) {
        try {
          const parsedTheme = JSON.parse(surveyTheme);
          setTheme(parsedTheme);
          return;
        } catch (error) {
          console.error('Failed to load survey theme:', error);
        }
      }
    }
    
    // Default to plain theme
    setTheme({
      id: 'default',
      name: 'Plain',
      isCustom: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...defaultThemes.plain,
    } as SurveyTheme);
  }, [survey.themeId, survey.id]);

  const getCurrentQuestion = (): Question | null => {
    return survey.questions.find(q => q.id === session.currentQuestionId) || null;
  };

  const getNextQuestionId = (currentQuestion: Question, answer: Answer): string | null => {
    // First, check if we have flow data with edges
    if (survey.flowData?.edges && survey.flowData.edges.length > 0) {
      // Find edges from current question
      const outgoingEdges = survey.flowData.edges.filter(edge => edge.source === currentQuestion.id);
      
      if (outgoingEdges.length > 0) {
        // Check edges with conditions first
        for (const edge of outgoingEdges) {
          if (edge.data?.conditions && edge.data.conditions.length > 0) {
            const conditions = edge.data.conditions;
            const operator = edge.data.operator || 'AND';
            
            let conditionsMet = false;
            if (operator === 'AND') {
              // All conditions must be met
              conditionsMet = conditions.every(condition => 
                evaluateEnhancedCondition(condition, answer)
              );
            } else {
              // At least one condition must be met
              conditionsMet = conditions.some(condition => 
                evaluateEnhancedCondition(condition, answer)
              );
            }
            
            if (conditionsMet) {
              return edge.target === 'end' ? null : edge.target;
            }
          }
        }
        
        // If no conditions matched, use the default edge (one without conditions)
        const defaultEdge = outgoingEdges.find(edge => !edge.data?.conditions || edge.data.conditions.length === 0);
        if (defaultEdge) {
          return defaultEdge.target === 'end' ? null : defaultEdge.target;
        }
      }
    }
    
    // Fallback to old conditional logic
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

  const evaluateEnhancedCondition = (
    condition: any, // Using any for the enhanced Condition type
    answer: Answer
  ): boolean => {
    const answerValue = answer.value;
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        if (typeof answerValue === 'boolean' && conditionValue !== undefined) {
          return answerValue === (conditionValue === true || conditionValue === 'true');
        }
        return answerValue === conditionValue;
        
      case 'not_equals':
        if (typeof answerValue === 'boolean' && conditionValue !== undefined) {
          return answerValue !== (conditionValue === true || conditionValue === 'true');
        }
        return answerValue !== conditionValue;
        
      case 'contains':
        return answerValue.toString().toLowerCase().includes(conditionValue.toString().toLowerCase());
        
      case 'greater_than':
        return Number(answerValue) > Number(conditionValue);
        
      case 'less_than':
        return Number(answerValue) < Number(conditionValue);
        
      case 'in':
        if (Array.isArray(conditionValue)) {
          return conditionValue.includes(answerValue);
        }
        return answerValue === conditionValue;
        
      case 'not_in':
        if (Array.isArray(conditionValue)) {
          return !conditionValue.includes(answerValue);
        }
        return answerValue !== conditionValue;
        
      case 'is_empty':
        return !answerValue || answerValue === '';
        
      case 'is_not_empty':
        return !!answerValue && answerValue !== '';
        
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
    // Find the path that led to current question
    const answeredQuestions = session.answers.map(a => a.questionId);
    const currentIndex = answeredQuestions.indexOf(session.currentQuestionId);
    
    if (currentIndex > 0) {
      // Go back to the previous answered question
      const previousQuestionId = answeredQuestions[currentIndex - 1];
      const previousQuestionIndex = survey.questions.findIndex(q => q.id === previousQuestionId);
      
      // Remove the answer for the current question
      const updatedAnswers = session.answers.filter(a => a.questionId !== session.currentQuestionId);
      
      setSession({
        ...session,
        currentQuestionId: previousQuestionId,
        answers: updatedAnswers
      });
      setCurrentQuestionIndex(previousQuestionIndex);
    } else if (currentQuestionIndex > 0) {
      // Fallback to order-based navigation
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
      theme={theme}
    />
  );
};

export default SurveyContainer;