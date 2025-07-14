import type { VercelRequest, VercelResponse } from '@vercel/node';

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

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // Get all surveys
    res.status(200).json({
      success: true,
      data: mockSurveys
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}