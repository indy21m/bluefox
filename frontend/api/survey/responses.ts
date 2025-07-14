import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { surveyId, answers, metadata } = req.body;

    if (!surveyId || !answers) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: surveyId and answers'
      });
    }

    console.log('Survey response received:', {
      surveyId,
      answersCount: answers.length,
      metadata
    });

    // Generate a unique response ID
    const responseId = `resp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // In a real app, you would:
    // 1. Save to database
    // 2. Update ConvertKit if email provided
    // 3. Track analytics

    res.status(200).json({
      success: true,
      message: 'Survey response saved successfully',
      data: {
        responseId,
        surveyId,
        savedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Failed to save survey response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save survey response',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}