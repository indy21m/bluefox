import express from 'express';

const router = express.Router();

// Mock survey data for now
const mockSurveys = [
  {
    id: 'demo',
    title: 'BlueFox Demo Survey',
    description: 'Experience our intelligent survey platform',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    completions: 42
  }
];

// Get all surveys
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: mockSurveys
  });
});

// Get survey by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const survey = mockSurveys.find(s => s.id === id);
  
  if (!survey) {
    return res.status(404).json({
      success: false,
      error: 'Survey not found'
    });
  }

  res.json({
    success: true,
    data: survey
  });
});

// Submit survey response
router.post('/:id/responses', async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, respondentEmail } = req.body;

    console.log(`Survey ${id} completed by ${respondentEmail || 'anonymous'}`);
    console.log('Answers:', answers);

    // In a real application, you would:
    // 1. Save the survey response to a database
    // 2. Process the answers according to the survey's field mappings
    // 3. Call the ConvertKit API to update the subscriber

    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Survey response recorded',
      data: {
        surveyId: id,
        responseId: `response_${Date.now()}`,
        answersCount: answers?.length || 0,
        submittedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to submit survey response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit survey response',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as surveysRouter };