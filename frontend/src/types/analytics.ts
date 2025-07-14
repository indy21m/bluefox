export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Record<string, any>;
  completedAt: Date;
  startedAt: Date;
  duration: number; // in seconds
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    city?: string;
  };
  source?: string; // UTM source or referrer
}

export interface SurveyAnalytics {
  surveyId: string;
  title: string;
  totalViews: number;
  totalStarts: number;
  totalCompletions: number;
  completionRate: number;
  averageDuration: number;
  dropOffPoints: Array<{
    questionId: string;
    questionTitle: string;
    dropOffRate: number;
    position: number;
  }>;
  responsesByDay: Array<{
    date: string;
    views: number;
    completions: number;
  }>;
  questionAnalytics: Array<{
    questionId: string;
    questionTitle: string;
    type: string;
    totalResponses: number;
    averageTime: number;
    answerDistribution: Record<string, number>;
  }>;
}

export interface ConversionFunnel {
  steps: Array<{
    name: string;
    count: number;
    percentage: number;
    dropOff: number;
  }>;
}

export interface ABTest {
  id: string;
  name: string;
  surveyId: string;
  status: 'active' | 'completed' | 'paused';
  variants: Array<{
    id: string;
    name: string;
    traffic: number; // percentage
    conversions: number;
    conversionRate: number;
  }>;
  startDate: Date;
  endDate?: Date;
  significanceLevel: number;
  winner?: string;
}

export interface RealTimeMetrics {
  activeRespondents: number;
  responsesLast24Hours: number;
  responsesThisHour: number;
  topPerformingSurveys: Array<{
    surveyId: string;
    title: string;
    completionRate: number;
    responses: number;
  }>;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  dateRange: {
    start: Date;
    end: Date;
  };
  surveys: string[];
  includeMetadata: boolean;
}