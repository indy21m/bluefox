// Export all types from a central location

export * from './survey';
export * from './convertkit';
export * from './auth';
export * from './api';
export * from './theme';
export * from './analytics';

// Common utility types
export type UUID = string;
export type Timestamp = Date;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

// UI state types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
}

// Survey taking flow state
export interface SurveySession {
  surveyId: string;
  currentQuestionId: string;
  answers: import('./survey').Answer[];
  startedAt: Date;
  respondentEmail?: string;
  isComplete: boolean;
}

// Admin dashboard state
export interface DashboardState {
  surveys: import('./survey').Survey[];
  selectedSurvey?: import('./survey').Survey;
  isCreating: boolean;
  isEditing: boolean;
  convertKitSettings: import('./convertkit').ConvertKitSettings;
}