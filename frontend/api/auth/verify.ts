import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token || !token.startsWith('token_')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // In a real app, you'd verify the JWT token here
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        valid: true
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Token verification failed'
    });
  }
}