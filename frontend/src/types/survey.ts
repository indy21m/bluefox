// Core survey question types
export type QuestionType = 'multiple_choice' | 'text' | 'email' | 'number' | 'boolean' | 'scale';

// Answer option for multiple choice questions
export interface AnswerOption {
  id: string;
  text: string;
  value: string;
  convertKitFieldValue?: string; // Value to map to ConvertKit custom field
}

// Conditional logic for question flow
export interface ConditionalLogic {
  id: string;
  questionId: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
  nextQuestionId: string | null; // null means end survey
}

// Individual survey question
export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: AnswerOption[]; // For multiple choice questions
  placeholder?: string; // For text/email/number inputs
  minValue?: number; // For scale/number questions
  maxValue?: number; // For scale/number questions
  convertKitField?: string; // ConvertKit custom field to map this question to
  conditionalLogic?: ConditionalLogic[];
  order: number;
}

// User's answer to a question
export interface Answer {
  questionId: string;
  value: string | number | boolean;
  selectedOptionId?: string; // For multiple choice questions
}

// Complete survey definition
export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  startQuestionId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  completions: number;
  settings: SurveySettings;
}

// Survey configuration settings
export interface SurveySettings {
  autoAdvanceDelay: number; // milliseconds
  showProgressBar: boolean;
  allowBackNavigation: boolean;
  requireEmailCapture: boolean;
  successMessage: string;
  redirectUrl?: string;
  convertKitFormId?: string;
}

// Survey response from a user
export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentEmail?: string;
  answers: Answer[];
  startedAt: Date;
  completedAt?: Date;
  isComplete: boolean;
  currentQuestionId?: string;
}

// Survey statistics
export interface SurveyStats {
  totalViews: number;
  totalCompletions: number;
  completionRate: number;
  averageTimeToComplete: number; // in seconds
  questionStats: QuestionStats[];
}

export interface QuestionStats {
  questionId: string;
  totalAnswers: number;
  answerBreakdown: { [key: string]: number };
  averageValue?: number; // For numeric questions
}