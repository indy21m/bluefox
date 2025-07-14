import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ConvertKitCustomField {
  id: number;
  name: string;
  key: string;
  label: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = req.body.apiKey || process.env.CONVERTKIT_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'ConvertKit API key not configured'
      });
    }

    // Test the connection by fetching account info
    console.log('Testing ConvertKit connection...');
    
    const testUrl = 'https://api.kit.com/v4/account';
    
    const response = await fetch(testUrl, {
      headers: {
        'X-Kit-Api-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'BlueFox/1.0'
      }
    });
    
    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorBody = await response.text();
        errorDetails = ` - ${errorBody}`;
      } catch (e) {
        // Ignore if we can't read the error body
      }
      throw new Error(`ConvertKit API error: ${response.status} ${response.statusText}${errorDetails}`);
    }

    const data = await response.json() as { custom_fields?: ConvertKitCustomField[] };
    
    res.status(200).json({
      success: true,
      message: 'ConvertKit connection successful',
      data: {
        customFieldsCount: data.custom_fields?.length || 0,
        apiKeyValid: true
      }
    });
  } catch (error) {
    console.error('ConvertKit connection test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect to ConvertKit',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}