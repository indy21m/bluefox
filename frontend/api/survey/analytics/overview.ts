import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Generate mock analytics data
  const analytics = {
    totalSurveys: 3,
    totalViews: 1250,
    totalResponses: 487,
    averageCompletionRate: 74.3,
    surveyStats: [
      {
        surveyId: 'survey-1',
        views: 450,
        responses: 187,
        completionRate: 78.5
      },
      {
        surveyId: 'survey-2',
        views: 520,
        responses: 201,
        completionRate: 72.3
      },
      {
        surveyId: 'survey-3',
        views: 280,
        responses: 99,
        completionRate: 68.4
      }
    ]
  };

  res.status(200).json(analytics);
}