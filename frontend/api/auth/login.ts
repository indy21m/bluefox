import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Demo credentials check
    if (email === 'admin@bluefox.com' && password === 'bluefox123') {
      const user = {
        id: 'admin_1',
        email: email,
        name: 'BlueFox Admin',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
        lastLoginAt: new Date()
      };

      const token = `token_${Date.now()}`;

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}