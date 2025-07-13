import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

interface SurveyResponseData {
  surveyId: string;
  respondentEmail?: string;
  answers: Array<{
    questionId: string;
    value: any;
    selectedOptionId?: string;
  }>;
  fieldMappings?: Record<string, string>;
  optionMappings?: Record<string, Record<string, string>>;
  apiKey?: string;
}

interface StoredResponse {
  id: string;
  surveyId: string;
  respondentEmail: string;
  answers: SurveyResponseData['answers'];
  completedAt: Date;
  completionTimeSeconds?: number;
}

interface SurveyAnalytics {
  surveyId: string;
  totalViews: number;
  totalResponses: number;
  completionRate: number;
  averageCompletionTime: number;
  questionAnalytics: QuestionAnalytics[];
  responseTimeline: Array<{
    date: string;
    count: number;
  }>;
  recentResponses: StoredResponse[];
}

interface QuestionAnalytics {
  questionId: string;
  questionTitle?: string;
  type?: string;
  totalAnswers: number;
  answerDistribution: Record<string, number>;
  averageValue?: number;
}

// In-memory storage for MVP (replace with database in production)
const surveyResponses = new Map<string, StoredResponse[]>();
const surveyViews = new Map<string, number>();

// Submit survey response and update ConvertKit
router.post('/responses', async (req: Request, res: Response) => {
  try {
    const { surveyId, respondentEmail, answers, fieldMappings, optionMappings, apiKey } = req.body as SurveyResponseData;

    if (!surveyId || !answers || answers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Survey ID and answers are required' 
      });
    }

    // If no email provided, try to find it in answers
    let email = respondentEmail;
    if (!email) {
      const emailAnswer = answers.find(a => a.questionId && a.value && a.value.includes('@'));
      if (emailAnswer) {
        email = emailAnswer.value;
      }
    }

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email address is required to submit response' 
      });
    }

    // Store the response
    const responseId = `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const storedResponse: StoredResponse = {
      id: responseId,
      surveyId,
      respondentEmail: email,
      answers,
      completedAt: new Date(),
      completionTimeSeconds: req.body.completionTimeSeconds
    };

    // Initialize survey responses array if needed
    if (!surveyResponses.has(surveyId)) {
      surveyResponses.set(surveyId, []);
    }
    surveyResponses.get(surveyId)!.push(storedResponse);

    // Check if API key was provided
    if (!apiKey) {
      console.error('ConvertKit API key not provided');
      // Still save the response even if we can't update ConvertKit
      return res.json({ 
        success: true, 
        message: 'Response saved (ConvertKit not configured)',
        email,
        responseId 
      });
    }

    // Find subscriber in ConvertKit
    const searchUrl = `https://api.kit.com/v4/subscribers?email_address=${encodeURIComponent(email)}`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'X-Kit-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!searchResponse.ok) {
      console.error('Failed to search for subscriber:', await searchResponse.text());
      return res.json({ 
        success: true, 
        message: 'Response saved (subscriber not found)',
        email 
      });
    }

    const searchData = await searchResponse.json() as { subscribers?: any[] };
    const subscribers = searchData.subscribers || [];
    
    if (subscribers.length === 0) {
      // Subscriber not found - you might want to create them here
      return res.json({ 
        success: true, 
        message: 'Response saved (subscriber not in ConvertKit)',
        email 
      });
    }

    const subscriber = subscribers[0];
    const subscriberId = subscriber.id;

    // Build field updates from field mappings
    const fieldsToUpdate: Record<string, any> = {};
    
    if (fieldMappings) {
      // fieldMappings should be an object mapping questionId to field key
      for (const answer of answers) {
        const fieldKey = fieldMappings[answer.questionId];
        if (fieldKey) {
          let fieldValue = answer.value;
          
          // Check if this question has option mappings (for multiple choice)
          if (optionMappings && optionMappings[answer.questionId]) {
            const mappedValue = optionMappings[answer.questionId][answer.value];
            if (mappedValue) {
              fieldValue = mappedValue;
            }
          }
          
          fieldsToUpdate[fieldKey] = fieldValue;
        }
      }
    }

    // Only update if we have fields to update
    if (Object.keys(fieldsToUpdate).length > 0) {
      const updateUrl = `https://api.kit.com/v4/subscribers/${subscriberId}`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'X-Kit-Api-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: fieldsToUpdate
        })
      });

      if (!updateResponse.ok) {
        console.error('Failed to update subscriber:', await updateResponse.text());
        return res.json({ 
          success: true, 
          message: 'Response saved (ConvertKit update failed)',
          email 
        });
      }

      return res.json({ 
        success: true, 
        message: 'Response saved and ConvertKit updated',
        email,
        updatedFields: Object.keys(fieldsToUpdate).length
      });
    }

    return res.json({ 
      success: true, 
      message: 'Response saved (no fields to update)',
      email 
    });

  } catch (error) {
    console.error('Error processing survey response:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process survey response' 
    });
  }
});

// Track survey views
router.post('/:surveyId/view', (req: Request, res: Response) => {
  const { surveyId } = req.params;
  
  const currentViews = surveyViews.get(surveyId) || 0;
  surveyViews.set(surveyId, currentViews + 1);
  
  res.json({ success: true, views: currentViews + 1 });
});

// Get analytics for a specific survey
router.get('/:surveyId/analytics', (req: Request, res: Response) => {
  const { surveyId } = req.params;
  
  const responses = surveyResponses.get(surveyId) || [];
  const views = surveyViews.get(surveyId) || 0;
  
  // Calculate question analytics
  const questionAnalyticsMap = new Map<string, QuestionAnalytics>();
  
  responses.forEach(response => {
    response.answers.forEach(answer => {
      if (!questionAnalyticsMap.has(answer.questionId)) {
        questionAnalyticsMap.set(answer.questionId, {
          questionId: answer.questionId,
          totalAnswers: 0,
          answerDistribution: {}
        });
      }
      
      const qa = questionAnalyticsMap.get(answer.questionId)!;
      qa.totalAnswers++;
      
      // Handle different answer types
      const answerKey = answer.selectedOptionId || String(answer.value);
      qa.answerDistribution[answerKey] = (qa.answerDistribution[answerKey] || 0) + 1;
      
      // Calculate average for numeric values
      if (typeof answer.value === 'number') {
        if (!qa.averageValue) {
          qa.averageValue = 0;
        }
        qa.averageValue = ((qa.averageValue * (qa.totalAnswers - 1)) + answer.value) / qa.totalAnswers;
      }
    });
  });
  
  // Calculate response timeline (last 7 days)
  const timeline: Array<{ date: string; count: number }> = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const count = responses.filter(r => {
      const responseDate = new Date(r.completedAt).toISOString().split('T')[0];
      return responseDate === dateStr;
    }).length;
    
    timeline.push({ date: dateStr, count });
  }
  
  // Calculate average completion time
  const completionTimes = responses
    .filter(r => r.completionTimeSeconds)
    .map(r => r.completionTimeSeconds!);
  const averageCompletionTime = completionTimes.length > 0
    ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
    : 0;
  
  const analytics: SurveyAnalytics = {
    surveyId,
    totalViews: views,
    totalResponses: responses.length,
    completionRate: views > 0 ? (responses.length / views) * 100 : 0,
    averageCompletionTime,
    questionAnalytics: Array.from(questionAnalyticsMap.values()),
    responseTimeline: timeline,
    recentResponses: responses.slice(-10).reverse() // Last 10 responses
  };
  
  res.json(analytics);
});

// Get all responses for a survey (for export)
router.get('/:surveyId/responses', (req: Request, res: Response) => {
  const { surveyId } = req.params;
  const responses = surveyResponses.get(surveyId) || [];
  
  res.json({
    surveyId,
    totalResponses: responses.length,
    responses
  });
});

// Get global analytics overview
router.get('/analytics/overview', (req: Request, res: Response) => {
  let totalResponses = 0;
  let totalViews = 0;
  const surveyStats: Array<{
    surveyId: string;
    responses: number;
    views: number;
    completionRate: number;
  }> = [];
  
  // Aggregate data from all surveys
  surveyResponses.forEach((responses, surveyId) => {
    const views = surveyViews.get(surveyId) || 0;
    totalResponses += responses.length;
    totalViews += views;
    
    surveyStats.push({
      surveyId,
      responses: responses.length,
      views,
      completionRate: views > 0 ? (responses.length / views) * 100 : 0
    });
  });
  
  res.json({
    totalSurveys: surveyStats.length,
    totalResponses,
    totalViews,
    averageCompletionRate: surveyStats.length > 0
      ? surveyStats.reduce((sum, s) => sum + s.completionRate, 0) / surveyStats.length
      : 0,
    surveyStats
  });
});

export default router;