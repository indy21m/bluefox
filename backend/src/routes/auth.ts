import express from 'express';

const router = express.Router();

// Simple demo authentication
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Demo credentials check
    if (email === 'admin@bluefox.com' && password === 'password') {
      const user = {
        id: 'admin_1',
        email: email,
        name: 'BlueFox Admin',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
        lastLoginAt: new Date()
      };

      const token = `token_${Date.now()}`;

      res.json({
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
});

// Verify token
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;

    if (!token || !token.startsWith('token_')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // In a real app, you'd verify the JWT token here
    res.json({
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
});

export { router as authRouter };